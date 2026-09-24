import { z } from 'zod'
import { PERMISSIONS, type Permission, type Role } from './permissions.ts'

// Rôle et ses droits effectifs ; le super admin a toujours tout et n'est pas modifiable.
export interface RoleDto {
  role: Role
  permissions: Permission[]
  editable: boolean
}

export const updateRoleSchema = z.object({
  permissions: z.array(z.enum(PERMISSIONS, 'Coche uniquement des droits de la liste.')),
})
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>
