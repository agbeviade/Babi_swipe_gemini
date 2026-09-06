# CLAUDE_CODE_AUDIT.md — BABI SWIPE IMMO

Audit du prototype Gemini (Phase 0), confronté au **Cahier des charges Master (v. finale monétisation)** et au **package d'architecture Master** (33 documents).

- Prototype audité : archive `babi-swipe-immo (1).zip` — 29 fichiers TS/TSX, ~7 000 lignes.
- Baseline vérifiée localement : `npm install` OK, `tsc --noEmit` OK, `vite build` OK (bundle unique **726 kB** / 207 kB gzip, aucun code splitting).
- Statut global : **prototype UI validé visuellement, mais aucune brique de production**. Aucune authentification, aucune RLS, aucun paiement réel, aucune donnée serveur autoritaire.

---

## 1. Architecture actuelle

SPA React monolithique côté navigateur, sans backend.

```text
index.html → src/main.tsx → src/App.tsx (473 l., état global useState)
   ├── components/ (16 composants, tout le rendu)
   ├── services/   (9 services, exécutés dans le navigateur)
   ├── data/mockData.ts (514 l., données de démonstration)
   └── supabase/schema.sql (182 l., non appliqué / optionnel)
```

- `App.tsx` est le seul orchestrateur : il détient properties, préférences, swipes, favoris, alertes, visites, signalements, solde de coins, et passe ~30 callbacks aux vues.
- Persistance réelle = `localStorage` (`storageService`, 443 l.).
- `supabaseService` (397 l.) est un **miroir best-effort** : il écrit d'abord en local, puis « essaie » Supabase et avale les erreurs (`console.warn`) — le local reste la source de vérité.
- Aucun routage (navigation par `activeTab` en state), aucun rendu serveur, aucune couche API.

## 2. Stack actuelle

| Domaine | Prototype | Cible Master |
|---|---|---|
| Framework | Vite 6 + React 19 (SPA) | Next.js App Router (RSC + Server Actions + Route Handlers) |
| Langage | TS 5.8, `strict` **absent** du tsconfig | TS strict, `any` proscrit |
| UI | Tailwind 4, lucide-react, `motion` | Tailwind + shadcn/ui + Framer Motion |
| Data | localStorage + Supabase optionnel côté client | Supabase/PostgreSQL/PostGIS serveur autoritaire |
| Auth | **aucune** | Supabase Auth (téléphone + OTP), 7 rôles |
| Validation | aucune (aucun Zod, aucun react-hook-form) | Zod + React Hook Form |
| Paiement | simulation locale | provider Mobile Money + webhook signé |
| Tests | **aucun** (`npm run lint` = `tsc --noEmit`) | unit / integration / e2e / sécurité |
| Observabilité | aucune | Sentry + PostHog |
| Dépendances mortes | `@google/genai`, `express`, `dotenv`, `esbuild`, `tsx` non utilisés dans `src/` | — |

## 3. Écrans existants (à préserver visuellement)

Onglets (`MobileTabBar`) : **Swipe · Carte · Favoris · Alertes · Propriétaire · Admin**, plus `Navbar` (solde coins, IA, filtres, badge Priority).

| Écran | Fichier | Rôle |
|---|---|---|
| Swipe | `SwipeView.tsx` (390 l.) | carte immersive, drag/animations, like/pass/undo/super |
| Carte | `MapView.tsx` (244 l.) | pins + aperçu (rendu maison, pas de fournisseur de carte) |
| Favoris | `FavoritesView.tsx` (221 l.) | liste + comparateur |
| Alertes | `AlertsView.tsx` (230 l.) | recherches sauvegardées locales |
| Propriétaire | `OwnerView.tsx` (527 l.) | dashboard, création d'annonce, boost, leads, visites |
| Admin | `AdminView.tsx` (205 l.) | modération annonces, signalements, vérification annonceur |
| Fiche bien | `PropertyDetailModal.tsx` (678 l.) | galerie, Babi Budget, Babi Score, contact, visite, signalement |
| Onboarding | `OnboardingModal.tsx` (406 l.) | louer/acheter → localisation → budget |
| Babi AI | `BabiAiModal.tsx` (180 l.) | saisie langage naturel |
| Filtres | `FilterModal.tsx` (297 l.) | transaction, type, budget, communes, rayon, vérifié |
| Coins | `CoinsModal.tsx` (270 l.) | packs, Mobile Money, Priority |
| Comparateur | `ComparatorModal.tsx` (197 l.) | comparaison de biens |
| PWA / offline | `PWAInstallButton.tsx`, `OfflineIndicator.tsx`, `usePWAInstall.ts` | install prompt, bandeau hors-ligne |

Direction visuelle : fond `#0F1115`, accent orange `#FF5A2D`, cartes arrondies, animations d'entrée. **À conserver intégralement.**

## 4. Composants existants

16 composants, tous « client », fortement couplés à `App.tsx` par props ; aucune bibliothèque de composants (`ui/`) ; styles Tailwind inline ; pas de Storybook ; pas de séparation présentation/données (chaque vue reçoit les entités complètes, y compris le téléphone de l'annonceur).

## 5. Services existants

| Service | Contenu | Verdict |
|---|---|---|
| `storageService` | CRUD localStorage + seed `INITIAL_PROPERTIES` + solde coins + ledger local | à reléguer en cache/mocks |
| `supabaseService` | mêmes méthodes, écriture Supabase best-effort, erreurs silencieuses | à réécrire (services serveur) |
| `supabaseClient` | client navigateur unique (`VITE_*`) | à scinder en browser/server/service-role |
| `paymentService` | packs coins + `confirmPayment()` qui passe la commande à `success` après 1,5 s | à supprimer, remplacer par provider + webhook |
| `babiScoreService` | score 0–100, poids codés en dur, pas de version | à porter côté serveur, versionné et pondéré par config |
| `budgetService` | coût d'entrée, **valeurs par défaut inventées** | à corriger (voir §11 et §14) |
| `geoService` | Haversine côté client + `getCurrentPosition` avec repli silencieux sur Cocody | à remplacer par PostGIS serveur |
| `babiAiService` | parseur regex FR (budget, revenu, type, pièces, communes, équipements) | bonne base de fallback, mais pas d'IA réelle |
| `usePWAInstall` | capture `beforeinstallprompt` | conservable |

## 6. Données mockées

`src/data/mockData.ts` (514 l.) contient les biens de démonstration, **injectés dans `localStorage` au premier lancement** puis traités comme données applicatives (lecture, modification, modération, boost). Elles ne sont pas isolées dans `src/mocks/`, et rien n'empêche leur présence en production. Les images pointent vers des URLs externes.

## 7. Logique métier existante

Toute la logique est cliente et non autoritaire :

- **Filtrage/tri** : `useMemo` dans `App.tsx` sur le tableau complet des biens (transaction, type, commune, budget, « vérifié » ≈ `verifications.length >= 2`), tri par boost puis Babi Score.
- **Swipe** : exclusion des `swipedIds` en mémoire/localStorage ; undo local.
- **Budget** : `calculateDetailedEntryCost(loyer, caution=2, avance=2, fraisAgence=loyer, fraisDossier=25000)`.
- **Score** : addition de bonus fixes (transaction 15, type 20, budget 25, distance 20, chambres 10, équipements 10, vérifié 5), plancher 15, plafond 100.
- **Distance** : Haversine navigateur.
- **Modération admin** : `handleModerateProperty` ne gère en réalité que `delete` ; `approve`/`reject` sont sans effet.
- **Vérification** : `handleVerifyAdvertiser` attribue d'un clic les 4 badges, sans dossier ni preuve.
- **Coins/Boost/Priority** : `addCoins` / `deductCoins(30|50)` en localStorage.

## 8. Intégration Supabase existante

- `schema.sql` : 11 tables (`profiles`, `properties`, `swipes`, `favorites`, `visits`, `alerts`, `reports`, `crm_leads`, `coin_transactions`), PostGIS activé, colonne `geom` générée + index GiST, fonction `get_properties_nearby(lat,lng,radius)`.
- **Aucune policy RLS, aucun `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` dans le fichier.**
- `get_properties_nearby` n'est **jamais appelée** par le code.
- `properties.advertiser`, `entry_cost`, `images` sont des JSONB (dénormalisés) ; `swipes.user_id`, `favorites.user_id`, `alerts.user_id` sont des `TEXT` libres, sans FK vers `auth.users`.
- `profiles.coin_balance` par défaut **250** et modifiable directement par le client.
- Tables absentes vs architecture Master : `property_images`, `advertisers`, `advertiser_verifications`, `cities/communes/neighborhoods`, `property_features(_values)`, `contacts`, `reviews`, `saved_searches`, `notifications`, `risk_events`, `user_locations`, `user_anchor_points`, `subscriptions`, `audit_logs`, `coin_wallets`, `coin_ledger`, `offers`, `purchases`, `entitlements`, `boosts`, `payment_transactions`, `payment_events`, `idempotency_keys`.

## 9. Problèmes de sécurité

| # | Problème | Gravité | Détail |
|---|---|---|---|
| S1 | Aucune authentification | Critique | aucun écran de connexion, aucune session ; `user_id` vaut `'anon_user'` quand Supabase est configuré sans session (`supabaseService.recordSwipe`, `toggleFavorite`, `saveAlert`) : les données de tous les visiteurs se mélangent sur une même ligne logique. |
| S2 | Aucune RLS | Critique | avec la clé anon publique, n'importe qui peut `insert/update/delete` sur `properties`, lire `visits` (nom + téléphone des visiteurs), `crm_leads`, `reports`. |
| S3 | Onglet Admin public | Critique | `MobileTabBar` expose « Admin » à tout visiteur ; suppression d'annonce, résolution de signalement et attribution de badges sans contrôle. |
| S4 | Rôle non vérifié | Critique | clé `babi_user_role` en localStorage, jamais validée côté serveur. |
| S5 | Solde de coins client | Critique | `babi_coin_balance` en localStorage : édition triviale via la console ; `profiles.coin_balance` modifiable via l'API anon. |
| S6 | Paiement simulé | Critique | `MobileMoneyService.confirmPayment()` force `status='success'` après `setTimeout(1500)` ; aucun provider, aucun webhook, aucune signature. |
| S7 | Badges de vérification arbitraires | Élevé | attribution en un clic, sans dossier ni expiration ; viole l'invariant #10. |
| S8 | Données personnelles exposées | Élevé | téléphone/WhatsApp de l'annonceur embarqués dans chaque objet `Property` livré au client ; téléphone du visiteur stocké en clair dans `visits`. |
| S9 | Erreurs silencieuses | Élevé | 15 `catch { console.warn }` dans `supabaseService` : une écriture serveur qui échoue est invisible pour l'utilisateur, l'UI affiche un succès. |
| S10 | Aucun rate limiting / anti-abus | Élevé | signalements, visites, alertes, achats illimités. |
| S11 | Aucune validation d'entrée | Élevé | ni Zod, ni contraintes ; `updateProperty` envoie un objet `any` directement à Supabase. |
| S12 | Aucun upload sécurisé | Moyen | pas de Supabase Storage : les images sont des URLs saisies/externes, sans contrôle MIME ni taille. |
| S13 | Pas de journal d'audit | Moyen | aucune trace des actions admin. |
| S14 | Géoloc : repli silencieux | Moyen | en cas de refus/erreur, `getCurrentPosition` renvoie Cocody avec `isFallback` non exploité en UI → distances affichées comme réelles. |

## 10. Problèmes de données

- Source de vérité = navigateur ; deux appareils = deux réalités ; vider le cache = perte totale.
- Chargement intégral du catalogue (`select('*')` sans pagination ni filtre), filtrage et tri en mémoire → non scalable.
- Mapping DB↔TS manuel et partiel (`updateProperty` ne convertit que `areaSqm`, les autres clés camelCase partent telles quelles vers Postgres → colonnes inexistantes).
- Dénormalisation JSONB (`advertiser`, `entry_cost`, `images`) : impossible d'appliquer une RLS fine, de vérifier un annonceur ou de gérer les médias.
- Aucune notion de `publication_status` (`draft/pending/published/suspended/rented/sold`) : `isAvailable` booléen seulement.
- Statuts de visite du type TS (`demandee|confirmee|refusee|autre_creneau|effectuee|annulee`) ≠ enum SQL (`pending|confirmed|cancelled|completed`) ≠ workflow Master (`requested|accepted|confirmed|completed|cancelled|no_show`).
- Référentiel géographique inexistant : communes en chaînes libres, dupliquées entre `mockData`, `FilterModal` et `babiAiService`.

## 11. Problèmes de paiement / monétisation

- Aucun provider Mobile Money (Wave/Orange/MTN/Moov) : uniquement des libellés et des couleurs.
- `processMobileMoneyPayment()` enchaîne `initiatePayment` → `confirmPayment` côté client → coins crédités par `App.handleCoinPurchase`. Le frontend est donc l'autorité financière — interdiction explicite du prompt et de l'invariant #9.
- Pas d'idempotence réelle : `externalRef` est généré côté client à partir de `Date.now()`.
- Pas de `wallets` / `coin_ledger` / `entitlements` / `payment_orders` serveur ; `coin_transactions` existe en SQL mais n'est jamais alimentée.
- Boost : `deductCoins(50)` puis `isBoosted=true` sans passage par la modération (viole « un boost ne contourne pas la modération »).
- BABI Priority : booléen en mémoire, perdu au rechargement, sans durée ni entitlement.

## 12. Problèmes d'authentification

Aucune inscription, connexion, déconnexion, récupération de compte, session, protection de route ni rôle. Les 7 rôles du cahier des charges (`visitor → super_admin`) n'existent nulle part. Supabase Auth n'est appelé que via `auth.getUser()` (toujours `null` en pratique).

## 13. Écarts avec l'architecture Master

| Invariant Master | État prototype |
|---|---|
| 3. Données réelles issues de la base | ✗ mockData en localStorage |
| 4. Position précise jamais exposée | ~ position en `localStorage`, pas de minimisation |
| 5. Autorisation serveur + RLS obligatoires | ✗ inexistant |
| 6. Opérations sensibles validées serveur | ✗ tout est client |
| 7. L'IA ne peut rien inventer | ✓ (parseur regex, ne crée pas de bien) |
| 8. Risk Engine = signal interne | ✗ champ `fraudRiskScore` non calculé |
| 9. Paiement serveur/webhook idempotent | ✗ simulation client |
| 10. Badges seulement si vérification valide | ✗ attribution arbitraire |
| 11. Contenu sponsorisé identifiable | ~ badge « Boosté » présent, sans règle |
| 12. MVP d'abord | ~ toutes les fonctions sont esquissées, aucune n'est complète |

Écarts structurels : pas de Next.js, pas de découpage `app/features/lib/services/schemas`, pas de `supabase/migrations`, pas de `tests/`, pas de `.github/workflows`, pas d'ADR.

## 14. Écarts avec le cahier des charges

| Exigence CdC | État |
|---|---|
| §6 recherche géospatiale serveur (ST_DWithin/ST_Distance, pagination) | ✗ Haversine client, fonction SQL inutilisée |
| §6.3 multi-points d'ancrage (Maison/Travail/Université) | ✗ absent (seulement détecté par le parseur IA) |
| §7 filtres meublé, pièces, disponibilité, distance max | ~ partiels |
| §10 « coût d'entrée calculé uniquement sur les frais réellement renseignés » | ✗ **frais d'agence = 1 loyer et frais de dossier = 25 000 FCFA inventés par défaut** ; aucun affichage « Non renseigné » |
| §11 Babi Score versionné, poids configurables, forces/faiblesses | ✗ poids en dur, pas de version, pas de faiblesses |
| §12 Babi AI (extraction → filtres → base réelle) | ~ extraction regex uniquement, pas de provider IA, pas de validation Zod |
| §13 carte avec clustering | ✗ rendu maison sans fournisseur ni clustering |
| §15 Risk Engine (prix anormal, photos dupliquées, téléphone réutilisé…) | ✗ absent |
| §16 collections, recherches sauvegardées serveur, alertes | ~ alertes locales uniquement, aucune notification déclenchée |
| §17 workflow visites + avis vérifiés | ~ visites locales, avis inexistants |
| §18 statuts de publication + prévisualisation | ✗ |
| §19 espace agence, équipe, CRM | ~ leads mockés |
| §20 administration (utilisateurs, vérifications, audit, rôles) | ~ écran maquette |
| §22 stack Next.js/Zod/RHF/Storage | ✗ |
| §23 RLS, moindre privilège, rate limiting, journalisation | ✗ |
| §25 PWA : **aucun service worker** (manifest présent, pas d'offline, pas de cache) | ✗ |
| §26 notifications (préférences, désabonnement) | ✗ bannière in-app éphémère |
| §33 critères d'acceptation MVP | 3/12 satisfaits (swipe, install partielle, recherche sans compte) |
| §35 monétisation (coins serveur, offres, anti-abus, analytics) | ✗ |

## 15. Stratégie de migration (résumé — détail dans `MIGRATION_PLAN.md`)

Approche **strangler** : nouveau projet Next.js App Router, dans lequel les composants Gemini sont **portés tels quels** (JSX + classes Tailwind conservés, `'use client'` ajouté), puis débranchés de `localStorage` vers des services serveur, écran par écran. Le design est figé comme contrat : capture de référence avant/après pour chaque écran migré. `mockData` est déplacé dans `src/mocks/` derrière les **mêmes interfaces** que les services de production, afin que la bascule se fasse par injection et non par réécriture d'UI.

Ordre : fondation → base de données + RLS → auth → découverte (search/swipe/favoris/fiche) → annonceur/modération → budget/score → visites/notifications → monétisation → admin/CRM → durcissement.

## 16. Risques

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| R1 | Dérive visuelle pendant le portage React→Next | Élevé | portage littéral du JSX, captures avant/après par écran, revue PO à chaque phase |
| R2 | Fluidité du swipe dégradée par les appels serveur | Élevé | pagination par curseur + préchargement de N cartes + swipe optimiste avec réconciliation |
| R3 | RLS ajoutée tardivement → refonte des requêtes | Élevé | RLS en phase 2, avant toute feature |
| R4 | Provider de paiement non choisi | Élevé | interface `PaymentProvider` + adaptateur sandbox ; intégration réelle isolée en fin de phase 7 |
| R5 | Données de démo prises pour des données réelles | Élevé | `src/mocks/` séparé + garde-fou runtime interdisant les mocks hors `development` |
| R6 | Coût d'entrée faux (frais inventés) déjà visible dans l'UI | Élevé | champs de frais nullables + rendu « Non renseigné » explicite, à valider par le PO |
| R7 | Réseau lent Abidjan | Moyen | budget de performance, images WebP/AVIF, code splitting (aujourd'hui : 1 bundle de 726 kB) |
| R8 | Pas de seed géographique officiel (communes/quartiers) | Moyen | référentiel initial à valider par le PO |
| R9 | Migration des utilisateurs existants | Faible | aucune donnée de production à migrer (localStorage) |
| R10 | TypeScript non strict → erreurs masquées à l'activation de `strict` | Moyen | activer `strict` dès la fondation, corriger au fil du portage |

## 17. Ordre d'implémentation recommandé

0. Audit + plan (ce document).
1. Fondation Next.js/TS strict/Tailwind/shadcn/Framer Motion/PWA/CI + `.env.example`.
2. Base de données : migrations, référentiel géographique, PostGIS, index, **RLS**, seed dev.
3. Auth Supabase (téléphone + OTP), profils, rôles, protection des routes.
4. Découverte : recherche serveur, PostGIS, feed curseur, swipe persistant, favoris, fiche bien, Babi Budget corrigé.
5. Annonceur : création/édition/statuts, Storage sécurisé, modération admin, audit.
6. Confiance : vérifications, signalements, risk events, avis éligibles.
7. Intelligence : Babi Score v1 versionné, Babi AI (criteria → Zod → search).
8. Contacts, visites, notifications, recherches sauvegardées.
9. Monétisation : wallets, ledger, offres, commandes, webhook, entitlements, boosts, abonnements.
10. Admin/Agence/CRM puis durcissement (sécurité, perf, a11y, E2E, offline, observabilité).

---

*Aucune modification fonctionnelle n'a été apportée au prototype pendant cet audit.*
