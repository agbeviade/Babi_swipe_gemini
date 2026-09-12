# MIGRATION_PLAN.md — BABI SWIPE IMMO

Plan de migration du prototype Gemini vers une application Next.js de production, conforme au cahier des charges Master et au package d'architecture Master.

Référence de l'état actuel : `CLAUDE_CODE_AUDIT.md`.

---

## 1. CURRENT STATE

- SPA React/Vite mono-fichier d'état (`App.tsx`), 16 composants clients, 9 services navigateur.
- Source de vérité : `localStorage`, alimenté par `mockData.ts`.
- Supabase optionnel, appelé depuis le navigateur, **sans RLS** ; fonction PostGIS présente mais inutilisée.
- Aucune authentification, aucun rôle vérifié, onglet Admin ouvert à tous.
- Paiement Mobile Money simulé côté client ; solde de coins dans `localStorage`.
- Coût d'entrée calculé avec des frais **inventés** par défaut (agence = 1 loyer, dossier = 25 000 FCFA).
- Babi Score à poids codés en dur, non versionné ; Babi AI = parseur regex.
- PWA : manifest seul, **pas de service worker** ; build en un bundle de 726 kB.
- Aucun test, aucune validation Zod, TypeScript non strict, aucune observabilité.
- **Le design, lui, est validé et doit être préservé.**

## 2. TARGET STATE

- Next.js App Router (Server Components par défaut, Client Components pour swipe/animations/carte/formulaires), TypeScript strict, Tailwind + shadcn/ui + Framer Motion, PWA complète.
- Modular monolith : `app/` · `features/` · `services/` · `lib/` · `schemas/` · `types/`, migrations dans `supabase/`.
- Supabase = source de vérité : PostgreSQL + PostGIS, schéma normalisé (annonceurs, images, référentiel géographique, contacts, visites, avis, notifications, risk events, wallets/ledger/entitlements, audit).
- RLS active sur toutes les tables sensibles ; trois clients Supabase strictement séparés (browser / server authentifié / service-role serveur uniquement).
- Auth Supabase téléphone + OTP, 7 rôles vérifiés côté serveur.
- Toute opération sensible (coins, paiement, modération, vérification, boost) validée serveur, idempotente et journalisée.
- Paiement : provider Mobile Money via interface abstraite, confirmation par webhook signé, entitlements accordés une seule fois.
- Données affichées réelles ou explicitement marquées « estimation » / « Non renseigné ».
- Observabilité Sentry + PostHog, CI GitHub, déploiement Vercel (dev / preview / production).
- **UX identique à celle validée par le PO.**

## 3. PRINCIPES DE MIGRATION

1. **Portage littéral d'abord.** Chaque composant Gemini est copié tel quel dans le nouveau projet (JSX, classes Tailwind, animations), avec `'use client'` si nécessaire. Aucune réécriture visuelle.
2. **Débranchement progressif.** Les composants ne consomment plus `storageService` mais des services applicatifs (`features/*/services`) dont la **signature est identique** pour l'implémentation mock et l'implémentation Supabase.
3. **Mocks isolés.** `src/mocks/` ; garde-fou runtime : toute résolution vers un mock hors `NODE_ENV=development` lève une erreur.
4. **Sécurité d'abord.** RLS et autorisation serveur livrées avant les fonctionnalités qui en dépendent.
5. **Preuve visuelle.** Capture avant/après de chaque écran migré, jointe à la PR ; toute divergence est signalée au PO au lieu d'être décidée unilatéralement.
6. **Checkpoint obligatoire** en fin de phase : lint, typecheck, tests, build, responsive, permissions, documentation.
7. **Commits atomiques** de type `feat(scope): …`, une PR par phase (ou par lot cohérent).

## 4. PLAN PAR PHASES

L'estimation est donnée en **sessions de travail** (une session ≈ un lot livrable et vérifié), pas en jours-homme.

### Phase 1 — Fondation (1 session)
Bootstrap Next.js App Router + TS strict, Tailwind 4 + shadcn/ui + Framer Motion, thème repris du prototype (`#0F1115`, `#FF5A2D`, typographies, rayons), structure `app/features/lib/services/schemas/types`, clients Supabase (browser/server/service-role), `.env.example`, ESLint/Prettier, Vitest + Playwright, GitHub Actions (lint/typecheck/test/build), manifest + service worker, shell PWA, Sentry/PostHog derrière feature flags.
**Sortie :** build et pipeline reproductibles, application vide mais déployable.

### Phase 2 — Base de données et sécurité (1–2 sessions)
Migrations `supabase/migrations` : profils/rôles, annonceurs, biens + statuts de publication, images, référentiel `cities/communes/neighborhoods`, features normalisées, favoris, swipes, contacts, visites, avis, recherches sauvegardées, notifications, signalements, risk events, audit, wallets/ledger/offres/commandes/entitlements/boosts/idempotency. PostGIS + index GiST + index composites. **Policies RLS pour chaque table** + tests de sécurité (accès croisés, IDOR). Politiques Supabase Storage (`property-images` public en lecture contrôlée, `verification-documents` privé, `avatars`). Seed de développement.
**Sortie :** les tests d'isolation utilisateur/annonceur/agence/admin passent.

### Phase 3 — Authentification (1 session)
Supabase Auth téléphone + OTP (email en secours), inscription/connexion/déconnexion/récupération, session serveur, middleware de protection des routes, rôles vérifiés côté serveur, rate limiting sur OTP et login, écran de connexion dans le style Gemini, navigation anonyme préservée (§33 du CdC).
**Sortie :** un visiteur peut utiliser l'app sans compte ; un compte donne accès aux données persistantes ; l'onglet Admin est inaccessible sans rôle admin.

### Phase 4 — Découverte (2 sessions) — *écrans Gemini portés*
Recherche serveur (transaction, ville/commune/quartier, budget, type, chambres, équipements, disponibilité, distance, vérifié), pagination par curseur, `ST_DWithin`/`ST_Distance`, élargissement de rayon **annoncé à l'utilisateur**, feed de classement (préférences, proximité, fraîcheur, vérification, historique), swipe persistant + déduplication + undo limité + préchargement, favoris persistants, fiche bien, Babi Budget **corrigé** (frais nullables, « Non renseigné », distinction connu/estimé), onboarding branché sur les préférences serveur, carte.
**Sortie :** parcours candidat MVP sur données réelles, fluide sur mobile en réseau lent.

### Phase 5 — Annonceur et modération (1–2 sessions)
Création/édition d'annonce (Zod + RHF), upload d'images sécurisé (MIME, taille, noms sûrs, URLs signées), machine à états `draft → pending → published → suspended → rented → sold`, prévisualisation, dashboard propriétaire (vues, likes, contacts, visites), back-office admin (utilisateurs, annonces, signalements), journal d'audit.
**Sortie :** publier → modérer → découvrir de bout en bout.

### Phase 6 — Confiance (1 session)
Vérifications (`not_started → pending → under_review → verified → rejected → expired`) pour téléphone/identité/annonceur/agence/annonce, badges dérivés uniquement de vérifications valides et non expirées, signalements avec workflow, Risk Engine v1 (prix anormal, photos dupliquées, téléphone réutilisé, volume, incohérences) produisant des **signaux internes**, jamais un verdict public.

### Phase 7 — Intelligence (1 session)
Babi Score v1 serveur : poids en configuration, retour `{score, version, reasons, strengths, weaknesses}`. Babi AI : provider → critères structurés → validation Zod → service de recherche → base réelle ; le parseur regex actuel devient le fallback hors-ligne/quota ; critères modifiables par l'utilisateur.

### Phase 8 — Contacts, visites, notifications (1 session)
Contact (WhatsApp/téléphone/message) sans exposition inutile des coordonnées, visites `requested → accepted → confirmed → completed → cancelled → no_show`, recherches sauvegardées + alertes, notifications + préférences + désabonnement, avis liés à une interaction éligible.

### Phase 9 — Monétisation (1–2 sessions)
Catalogue d'offres serveur, wallets + `coin_ledger` immuable, commandes `pending → success | failed | cancelled | refunded`, clés d'idempotence, webhook signé et rejouable sans effet, entitlements (Priority, boost, mise en avant), boosts soumis à modération, abonnements pro, analytics de conversion, anti-abus (limites, détection de doublons, journalisation).
**Sortie :** un boost payé est accordé **exactement une fois** après confirmation serveur.

### Phase 10 — Agence/CRM puis durcissement (1–2 sessions)
Équipes, agents, leads, pipeline CRM, statistiques pro, avec isolation stricte par tenant. Puis revue de sécurité (XSS, IDOR, escalade, upload, webhook spoofing, manipulation de coins), performance (Core Web Vitals, images, code splitting, cache), accessibilité (WCAG raisonnable, focus, cibles tactiles, reduced motion), E2E des trois parcours du prompt (candidat, propriétaire, achat de coins), offline/PWA, observabilité.

**Total indicatif : 11 à 15 sessions**, hors attentes externes (choix et contractualisation du provider de paiement, comptes Supabase/Vercel/Sentry/PostHog, référentiel géographique officiel).

## 5. LIVRABLES DOCUMENTAIRES

`README.md`, `CLAUDE_CODE_AUDIT.md`, `MIGRATION_PLAN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `API.md`, `ENVIRONMENT.md`, `TESTING.md`, plus les ADR pour chaque choix technique réversible.

## 6. RISKS

| # | Risque | Mitigation |
|---|---|---|
| R1 | Dérive visuelle lors du portage | portage littéral, captures avant/après, validation PO par écran |
| R2 | Swipe moins fluide avec des données serveur | curseur + préchargement + optimistic UI |
| R3 | RLS tardive | livrée en phase 2, avant toute feature |
| R4 | Provider de paiement inconnu | interface + adaptateur sandbox, intégration réelle isolée |
| R5 | Mocks utilisés en production | `src/mocks/` + garde-fou runtime |
| R6 | Coût d'entrée aujourd'hui faux | frais nullables + « Non renseigné » (décision PO requise) |
| R7 | Réseau lent | budget perf, images modernes, code splitting |
| R8 | Référentiel communes/quartiers absent | seed à valider par le PO |
| R9 | `strict: true` révèle des erreurs latentes | activé dès la phase 1 |
| R10 | Périmètre très large | livraison par phases, chacune déployable |

## 7. BLOCKERS / À DÉCIDER

Aucun de ces points ne bloque les phases 1 à 3 ; ils bloquent en revanche les phases indiquées.

| # | Décision attendue | Bloque |
|---|---|---|
| B1 | **Dépôt Git** : organisation/nom du repo GitHub où pousser le projet (aucun repo n'existe aujourd'hui, le prototype est une archive) | phase 1 |
| B2 | **Projet Supabase** (URL + clés dev/preview/prod) et compte Vercel | phases 1–2 |
| B3 | **Provider Mobile Money** (Wave / Orange / MTN / Moov, ou agrégateur type CinetPay/PayDunya) + contrat sandbox | phase 9 |
| B4 | **Provider IA** (Gemini via `@google/genai` déjà en dépendance, ou autre) + budget | phase 7 |
| B5 | **Barème Babi Budget** : caution et avance par défaut, traitement des frais d'agence/dossier inconnus → confirmation que « Non renseigné » remplace les valeurs actuellement inventées | phase 4 |
| B6 | **Poids Babi Score v1** | phase 7 |
| B7 | **Référentiel géographique** officiel (communes/quartiers d'Abidjan) | phase 2 |
| B8 | **Checklists et durées de validité des vérifications** | phase 6 |
| B9 | **Prix définitifs** coins/boosts/Priority/abonnements | phase 9 |
| B10 | **Politique de rétention/RGPD-équivalent** et mentions légales | phase 10 |
| B11 | **Seuils de rate limiting** | phases 3 et 9 |
| B12 | **Fournisseur de carte** (MapLibre/Mapbox/Google) pour le mode Carte | phase 4 |

## 8. PROCHAINE ÉTAPE PROPOSÉE

Sur validation du PO : démarrer les **phases 1 à 3** (fondation, base de données + RLS, authentification), qui ne dépendent d'aucune décision produit bloquante hormis B1/B2, et livrer les écrans Gemini portés à l'identique sur le squelette Next.js.
