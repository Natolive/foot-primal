// Un droit par action protégée de l'API ; nouvelle action = nouveau droit ici, avec son libellé.
export const PERMISSIONS = [
  'profile.read',
  'profile.complete_onboarding',
  'roles.read',
  'roles.update',
  'users.read',
  'users.update',
  'users.update_role',
  'users.update_permissions',
  'users.delete',
  'events.read',
  'events.participate',
  'events.invite_guest',
  'planning.create_event',
  'planning.update_event',
  'planning.delete_event',
  'email_domains.read',
  'email_domains.create',
  'email_domains.delete',
] as const
export type Permission = (typeof PERMISSIONS)[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'profile.read': 'Voir son profil',
  'profile.complete_onboarding': 'Terminer la visite guidée',
  'roles.read': 'Voir les rôles et leurs droits',
  'roles.update': 'Modifier les droits des rôles',
  'users.read': 'Voir les utilisateurs',
  'users.update': 'Modifier le nom et l’email des utilisateurs',
  'users.update_role': 'Changer le rôle des utilisateurs',
  'users.update_permissions': 'Ajouter des droits aux utilisateurs',
  'users.delete': 'Supprimer des utilisateurs',
  'events.read': 'Voir les créneaux et les inscrits',
  'events.participate': 'Répondre au sondage des créneaux',
  'events.invite_guest': 'Ramener des invités sans compte',
  'planning.create_event': 'Créer des créneaux',
  'planning.update_event': 'Modifier les créneaux',
  'planning.delete_event': 'Supprimer les créneaux',
  'email_domains.read': 'Voir les domaines email autorisés',
  'email_domains.create': 'Autoriser un domaine email',
  'email_domains.delete': 'Retirer un domaine email',
}

// Catégorie = préfixe du droit (`roles.manage` → `roles`) : un nouveau préfixe oblige à lui donner un libellé.
export type PermissionCategory = Permission extends `${infer C}.${string}` ? C : never

export const PERMISSION_CATEGORY_LABELS: Record<PermissionCategory, string> = {
  profile: 'Profil',
  roles: 'Rôles et droits',
  users: 'Utilisateurs',
  events: 'Créneaux',
  planning: 'Organisation des créneaux',
  email_domains: 'Domaines email autorisés',
}

export const PERMISSION_CATEGORIES = (Object.keys(PERMISSION_CATEGORY_LABELS) as PermissionCategory[]).map((category) => ({
  category,
  label: PERMISSION_CATEGORY_LABELS[category],
  permissions: PERMISSIONS.filter((p) => p.startsWith(`${category}.`)),
}))

export const ROLES = ['user', 'admin', 'super_admin'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = { user: 'Utilisateur', admin: 'Admin', super_admin: 'Super admin' }

// Catégories réservées par défaut au super admin : la main sur les comptes, les droits, l'organisation des créneaux
// et les domaines email autorisés à s'inscrire.
const ADMIN_CATEGORIES: readonly PermissionCategory[] = ['roles', 'users', 'planning', 'email_domains']
const isAdmin = (p: Permission) => ADMIN_CATEGORIES.some((c) => p.startsWith(`${c}.`))

// Droits par défaut, tant qu'un admin ne les a pas modifiés : user a tout sauf l'administration,
// admin y ajoute l'organisation des créneaux, super_admin a tout.
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: PERMISSIONS.filter((p) => !isAdmin(p)),
  admin: PERMISSIONS.filter((p) => !isAdmin(p) || p.startsWith('planning.')),
  super_admin: PERMISSIONS,
}
