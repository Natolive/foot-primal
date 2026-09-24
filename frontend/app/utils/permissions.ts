import { PERMISSION_CATEGORIES, PERMISSION_LABELS } from '@primal/shared'

// Droits groupés par catégorie, au format des champs `checkbox-group` de FormBuilder.
export const permissionGroups = PERMISSION_CATEGORIES.map(({ label, permissions }) => ({
  label,
  items: permissions.map((value) => ({ value, label: PERMISSION_LABELS[value] })),
}))
