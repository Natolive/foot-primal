// Schémas partagés front/back : la même règle valide le formulaire et le body de l'API.
// Source TypeScript chargée telle quelle (type stripping de Node côté back, Vite côté front) :
// imports relatifs avec l'extension .ts, et uniquement de la syntaxe effaçable (pas d'enum, pas de namespace).
export * from './common/fields.ts'
export * from './auth/login.dto.ts'
export * from './auth/signup.dto.ts'
export * from './users/user.dto.ts'
export * from './roles/permissions.ts'
export * from './roles/role.dto.ts'
export * from './users/managed-user.dto.ts'
export * from './events/event.dto.ts'
