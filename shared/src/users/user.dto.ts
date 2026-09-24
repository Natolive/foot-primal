import type { Permission, Role } from '../roles/permissions.ts'

// Utilisateur tel que renvoyé par l'API (jamais le hash du mot de passe), avec ses droits effectifs.
export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  permissions: Permission[]
}
