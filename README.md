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
backend/    NestJS
  src/<domaine>/       auth, users, roles, events ; architecture hexagonale :
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
  app/layouts/           default (navbar), auth (bandeau de marque sur grand écran + formulaire)
  app/pages/             index (créneaux), login, signup, users (administration), roles (droits des rôles)
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
