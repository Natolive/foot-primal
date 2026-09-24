import type { Permission } from '@footix/shared'

// Sous-pages de /settings (menu de la barre et onglets), chacune derrière son droit de lecture.
export const settingsLinks = [
  { to: '/settings/users', label: 'Utilisateurs', icon: 'i-lucide-users', permission: 'users.read' },
  { to: '/settings/roles', label: 'Droits', icon: 'i-lucide-shield', permission: 'roles.read' },
  { to: '/settings/email-domains', label: 'Domaines', icon: 'i-lucide-at-sign', permission: 'email_domains.read' },
] satisfies { to: string, label: string, icon: string, permission: Permission }[]

export const allowedSettingsLinks = (permissions: readonly Permission[] = []) =>
  settingsLinks.filter((l) => permissions.includes(l.permission)).map(({ permission: _, ...l }) => l)
