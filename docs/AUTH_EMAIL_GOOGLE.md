# Authentification : e-mail + mot de passe (OTP par e-mail) et Google

L'authentification par SMS est abandonnée. Le code applique désormais :

- inscription et connexion par **e-mail + mot de passe** (Supabase Auth) ;
- **vérification par code à 6 chiffres** envoyé par e-mail (`signInWithOtp` / `verifyOtp`) ;
- **Google OAuth** (`signInWithOAuth`), retour sur `/auth/callback`.

Trois réglages doivent être faits dans le tableau de bord Supabase ; sans eux, le code
affiche une erreur explicite mais aucun e-mail ne part et Google est refusé.

## 1. SMTP Resend (l'e-mail part par Resend)

Authentication → Emails → SMTP Settings → Enable custom SMTP :

| Champ | Valeur |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` (SSL) ou `587` |
| Username | `resend` |
| Password | la clé API Resend (`re_…`) |
| Sender email | une adresse d'un domaine vérifié dans Resend |
| Sender name | `BABI SWIPE IMMO` |

Tant qu'aucun domaine n'est vérifié dans Resend, seul l'envoi vers l'adresse du
propriétaire du compte Resend fonctionne.

Rate limit : Authentication → Rate Limits → « Emails sent per hour » à ajuster.

## 2. Le code à 6 chiffres dans les modèles d'e-mail

Par défaut les modèles Supabase n'envoient qu'un lien. Ajouter `{{ .Token }}` dans
Authentication → Emails → Templates, pour **Confirm signup** et **Magic Link** :

```html
<p>Votre code de vérification BABI SWIPE IMMO : <strong>{{ .Token }}</strong></p>
<p>Ou cliquez : <a href="{{ .ConfirmationURL }}">confirmer mon adresse</a></p>
```

## 3. Google OAuth

1. Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web).
2. Authorized redirect URI : `https://<ref>.supabase.co/auth/v1/callback`.
3. Supabase → Authentication → Providers → Google : coller Client ID et Client Secret.
4. Supabase → Authentication → URL Configuration :
   - Site URL : `https://babiswipevercel.vercel.app`
   - Redirect URLs : `https://babiswipevercel.vercel.app/auth/callback`,
     `http://localhost:3000/auth/callback`

## Variables d'environnement

- `NEXT_PUBLIC_APP_URL` : origine utilisée pour construire `emailRedirectTo` et le
  retour OAuth (à définir sur Vercel, sinon l'en-tête `x-forwarded-host` est utilisé).
- `RESEND_API_KEY` : secret serveur, uniquement pour les envois applicatifs hors
  Supabase Auth. Les e-mails d'authentification passent par le SMTP ci-dessus.

## Limites connues

- Le rate limit OTP est en mémoire : à remplacer par un stockage partagé avant la
  montée en charge (plusieurs instances Vercel = plusieurs compteurs).
- La réinitialisation de mot de passe n'est pas encore branchée.
