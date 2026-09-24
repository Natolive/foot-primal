# Front — règles

- Composant Nuxt UI (`U*`) d'abord, icônes `i-lucide-*`.
- Composants rangés par dossier, fichier préfixé par le dossier (`form/FormBuilder.vue`).
- Template de page à racine unique, sans commentaire HTML à côté (sinon la transition de page casse).
- Formulaire = `FormBuilder` + schéma `@primal/shared`, jamais de `validate` à la main.
- Couleurs via les tokens de `main.css` et les couleurs sémantiques Nuxt UI, jamais d'hexadécimal en composant.
- Titres en `font-display` (Big Shoulders) majuscules, texte en Archivo.
- Mode clair et sombre, responsive dès 360 px.
- Animation uniquement en réponse à une action, désactivée sous `prefers-reduced-motion`.
- Textes en français, tutoiement, bouton = verbe d'action repris dans le toast.
- SPA (`ssr: false`) : pas de code qui suppose un rendu serveur.
- Appels API via `useApi()` (cookie de session inclus), erreur affichée avec `apiErrorMessage(e)` dans un toast.
- Utilisateur connecté via `useAuth()` (`user`, `login`, `logout`, `verifyEmail`, `forgotPassword`, `resetPassword`), jamais d'appel direct à `/auth/*`.
- Pages privées par défaut (middleware `auth.global.ts`) ; `definePageMeta({ guest: true })` pour les pages visiteurs.
- Visite guidée : étapes dans `useOnboardingTour`, élément ciblé par un attribut `data-tour="<nom>"` (jamais une classe CSS).
- Page réservée : `definePageMeta({ permission: '<droit>' })` ; action masquée si `!user.permissions.includes('<droit>')`.
