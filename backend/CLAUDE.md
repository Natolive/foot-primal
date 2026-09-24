# Back — règles

- Hexagonal : `src/<domaine>/{domain,application,infrastructure}/` + `<domaine>.module.ts`, transverse dans `src/common/`.
- `domain/` : entités, ports (classes abstraites) et erreurs métier, sans import Nest ni Drizzle.
- Repository = port qui étend `BaseRepository` + adaptateur qui étend `DrizzleRepository`, liés dans le module (`{ provide: Port, useClass: Adapter }`).
- Service CRUD = étend `BaseService` ; les services lèvent des erreurs métier (`NotFoundError`, `ConflictError`), jamais d'exception HTTP.
- Controllers dans `infrastructure/http/`, body validé par `ZodValidationPipe` avec un schéma `@primal/shared`.
- Route protégée = `@Authorize('<catégorie>.<action>')`, vérifié par le guard global `SessionGuard` (401 sans session, 403 sans droit) ; sans décorateur, la route est publique ; `@CurrentUser()` donne la personne connectée.
- Table Drizzle dans `<domaine>/infrastructure/*.table.ts`, déclarée dans `common/infrastructure/database/schema.ts`.
- Après un changement de table : `docker compose exec backend npm run db:generate -- --name <nom>` (migrations appliquées au démarrage).
- Imports relatifs en `.js` (ESM).
- Tests hors de `src/`, dans `test/` : jamais de `*.spec.ts` à côté du code.
- `test/unit/` reproduit l'arborescence de `src/` (`src/auth/application/auth.service.ts` → `test/unit/auth/application/auth.service.spec.ts`).
- `test/e2e/*.e2e-spec.ts` : parcours HTTP complet (supertest) sur la vraie base, données créées avec un email unique et supprimées en `afterAll`.
- `test/fakes/` : adaptateurs en mémoire partagés (`InMemoryRepository`, `InMemoryXxxRepository`, `FakePasswordHasher`), à réutiliser plutôt que des mocks.
- Service testé en l'instanciant à la main avec des fakes, sans `Test.createTestingModule`.
- Nouveau repository = son `InMemoryXxxRepository` dans `test/fakes/`, qui étend `InMemoryRepository`.
- Imports des tests via les alias `@src/*` et `@test/*`, réservés aux tests.
- Lancer : `docker compose exec backend npm test` (unitaires), `docker compose exec backend npm run test:e2e` (e2e).
