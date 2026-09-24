import type { Permission, Role } from '@primal/shared';

// Droit accordé ou retiré à un rôle par un admin ; sans ligne, le droit par défaut s'applique.
export interface RolePermission {
  id: string;
  role: Role;
  permission: Permission;
  granted: boolean;
  createdAt: Date;
}

export type NewRolePermission = Omit<RolePermission, 'id' | 'createdAt'>;
