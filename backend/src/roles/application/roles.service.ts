import { Injectable } from '@nestjs/common';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLES, type Permission, type Role, type RoleDto } from '@footix/shared';
import { SuperAdminLockedError } from '../domain/errors.js';
import { RolePermissionRepository } from '../domain/role-permission.repository.js';

@Injectable()
export class RolesService {
  constructor(private readonly repository: RolePermissionRepository) {}

  // ponytail: une requête par route protégée, mettre en cache si ça pèse.
  async permissionsOf(role: Role): Promise<Permission[]> {
    // Le super admin garde tout : personne ne peut perdre l'accès à la gestion des droits.
    if (role === 'super_admin') return [...PERMISSIONS];
    const saved = new Map((await this.repository.findByRole(role)).map((r) => [r.permission, r.granted]));
    return PERMISSIONS.filter((p) => saved.get(p) ?? DEFAULT_ROLE_PERMISSIONS[role].includes(p));
  }

  async findAll(): Promise<RoleDto[]> {
    return Promise.all(ROLES.map((role) => this.toDto(role)));
  }

  async update(role: Role, permissions: Permission[]): Promise<RoleDto> {
    if (role === 'super_admin') throw new SuperAdminLockedError();
    await this.repository.replaceForRole(
      role,
      PERMISSIONS.map((permission) => ({ role, permission, granted: permissions.includes(permission) })),
    );
    return this.toDto(role);
  }

  private async toDto(role: Role): Promise<RoleDto> {
    return { role, permissions: await this.permissionsOf(role), editable: role !== 'super_admin' };
  }
}
