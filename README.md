# Primal

Appli pour s'inscrire aux créneaux de foot proposés par la boîte.

```bash
docker compose up --build
```

- http://foot-primal.localhost — front Nuxt 4 (Nuxt UI)
- http://api.foot-primal.localhost — API NestJS
- http://traefik.foot-primal.localhost — dashboard Traefik
- PostgreSQL : `localhost:5432`, base/utilisateur/mot de passe `primal` (dev)

## Structure

Espace de travail npm (un seul `package-lock.json` à la racine) :

```
shared/     @primal/shared : schémas Zod + types (DTO) partagés front/back
  src/common/   champs réutilisables (email, règles mot de passe)
  src/auth/     login.dto.ts, signup.dto.ts
  src/roles/    permissions.ts (droits, rôles, défauts), role.dto.ts
  src/users/    user.dto.ts, managed-user.dto.ts
  src/events/   event.dto.ts (créneau, réponse au sondage)
  src/email-domains/ email-domain.dto.ts (domaine autorisé à créer un compte)
backend/    NestJS
  src/<domaine>/       auth, users, roles, events, email-domains ; architecture hexagonale :
    domain/              entités, ports (classes abstraites), erreurs métier
    application/         services (cas d'usage)
    infrastructure/      adaptateurs : Drizzle, HTTP (controllers), etc.
  src/common/          BaseRepository, BaseService, DrizzleRepository, DatabaseModule,
                       DomainErrorFilter (erreur métier → HTTP), ZodValidationPipe
  drizzle/             migrations SQL (appliquées au démarrage)
frontend/   Nuxt 4
  app/components/brand/  logo, élément graphique
  app/components/event/  EventCard (créneau, places, réponses au sondage)
  app/components/form/   FormBuilder (formulaire généré depuis une liste de champs + schéma)
  app/composables/       useApi, useAuth, useOnboardingTour (visite guidée driver.js)
  app/layouts/           default (navbar), auth (bandeau de marque sur grand écran + formulaire)
  app/pages/             index (créneaux), login, signup,
                         settings/ : users (administration), roles (droits des rôles),
                         email-domains (domaines autorisés à créer un compte)
  app/utils/             permissionGroups (droits groupés par catégorie)
  app/types/
```

Ajouter un DTO : créer `shared/src/<domaine>/<nom>.dto.ts` et l'exporter dans `shared/src/index.ts`
(imports relatifs avec l'extension `.ts`, pas d'`enum`).

Hot reload actif. Après ajout d'une dépendance : `docker compose up --build -V`.
Tests back : `docker compose exec backend npm test` (unitaires), `docker compose exec backend npm run test:e2e` (e2e, vraie base).

## Créneaux

- Un organisateur crée un créneau : titre, date et heure, lieu, nombre de places, lien de paiement et infos facultatifs.
- Chacun répond au sondage « je viens » / « je ne viens pas » jusqu'au début du match ; seuls les « je viens » prennent une place.
- Rôles : `user` répond aux sondages, `admin` organise aussi les créneaux (catégorie de droits `planning`), `super_admin` a tout.
  Premier super admin : `UPDATE users SET role = 'super_admin' WHERE email = '…'`.

## Visite guidée

- Après l'inscription, la personne est connectée et arrive sur les créneaux, où une visite guidée (driver.js) montre
  un créneau, le sondage et le lien de paiement.
- Elle s'affiche une seule fois par compte : `POST /auth/me/onboarding` (droit `profile.complete_onboarding`) remplit
  `users.onboarded_at` dès l'affichage, renvoyé dans `UserDto.onboarded`.
- Le temps de la visite, un créneau d'exemple non cliquable est affiché en tête de liste, même sans vrai créneau.
- Revoir la visite : `UPDATE users SET onboarded_at = NULL WHERE email = '…'`.

## Production

URL : https://foot.benit.ooo, API sous https://foot.benit.ooo/api (relayée par le front).
HTTPS assuré par Caddy sur le serveur (`/etc/caddy/Caddyfile` : `foot.benit.ooo { reverse_proxy 127.0.0.1:3001 }`).

À chaque push sur `main`, `.github/workflows/prod.yml` lance les tests, publie l'image sur
`ghcr.io/natolive/foot-primal` (tags `latest` et commit), copie `docker-compose.prod.yml` sur le serveur puis y fait
`docker compose pull && up -d`. Le serveur ne contient que `~/foot-primal/{docker-compose.prod.yml,.env}` : ni code, ni build.
Migrations appliquées au démarrage de l'API, base et API non exposées.

Mise en place, une fois :

1. Serveur : Docker installé, `mkdir ~/foot-primal` et y créer `.env` depuis `.env.example`.
2. Clé SSH de la CI : `ssh-keygen -t ed25519 -f primal-ci -N ''`, ajouter `primal-ci.pub`
   à `~/.ssh/authorized_keys` du serveur.
3. GitHub → Settings → Environments → `production`, secrets :
   `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (contenu de `primal-ci`), `SSH_KNOWN_HOSTS` (sortie de `ssh-keyscan <hôte>`).
4. Premier push sur `main`, puis créer son compte et passer super admin :
   `docker compose -f docker-compose.prod.yml exec db psql -U primal -c "UPDATE users SET role = 'super_admin' WHERE email = '…'"`.

Revenir à une version : sur le serveur, `IMAGE_TAG=<commit> docker compose -f docker-compose.prod.yml up -d`.
