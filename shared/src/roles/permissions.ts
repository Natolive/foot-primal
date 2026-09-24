// Un droit par action protégée de l'API ; nouvelle action = nouveau droit ici, avec son libellé.
export const PERMISSIONS = [
  'profile.read',
  'roles.read',
  'roles.update',
  'users.read',
  'users.update',
  'users.update_role',
  'users.update_permissions',
  'events.read',
  'events.participate',
  'planning.create_event',
  'planning.update_event',
  'planning.delete_event',
] as const
export type Permission = (typeof PERMISSIONS)[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'profile.read': 'Voir son profil',
  'roles.read': 'Voir les rôles et leurs droits',
  'roles.update': 'Modifier les droits des rôles',
  'users.read': 'Voir les utilisateurs',
  'users.update': 'Modifier le nom et l’email des utilisateurs',
  'users.update_role': 'Changer le rôle des utilisateurs',
  'users.update_permissions': 'Ajouter des droits aux utilisateurs',
  'events.read': 'Voir les créneaux et les inscrits',
  'events.participate': 'Répondre au sondage des créneaux',
  'planning.create_event': 'Créer des créneaux',
  'planning.update_event': 'Modifier les créneaux',
  'planning.delete_event': 'Supprimer les créneaux',
}

// Catégorie = préfixe du droit (`roles.manage` → `roles`) : un nouveau préfixe oblige à lui donner un libellé.
export type PermissionCategory = Permission extends `${infer C}.${string}` ? C : never

export const PERMISSION_CATEGORY_LABELS: Record<PermissionCategory, string> = {
  profile: 'Profil',
  roles: 'Rôles et droits',
  users: 'Utilisateurs',
  events: 'Créneaux',
  planning: 'Organisation des créneaux',
}

export const PERMISSION_CATEGORIES = (Object.keys(PERMISSION_CATEGORY_LABELS) as PermissionCategory[]).map((category) => ({
  category,
  label: PERMISSION_CATEGORY_LABELS[category],
  permissions: PERMISSIONS.filter((p) => p.startsWith(`${category}.`)),
}))

export const ROLES = ['user', 'admin', 'super_admin'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = { user: 'Utilisateur', admin: 'Admin', super_admin: 'Super admin' }

// Catégories réservées par défaut au super admin : la main sur les comptes, les droits et l'organisation des créneaux.
const ADMIN_CATEGORIES: readonly PermissionCategory[] = ['roles', 'users', 'planning']
const isAdmin = (p: Permission) => ADMIN_CATEGORIES.some((c) => p.startsWith(`${c}.`))

// Droits par défaut, tant qu'un admin ne les a pas modifiés : user a tout sauf l'administration,
// admin y ajoute l'organisation des créneaux, super_admin a tout.
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: PERMISSIONS.filter((p) => !isAdmin(p)),
  admin: PERMISSIONS.filter((p) => !isAdmin(p) || p.startsWith('planning.')),
  super_admin: PERMISSIONS,
}
