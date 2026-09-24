import { PERMISSIONS } from '@primal/shared';
import { RolesService } from '@src/roles/application/roles.service.js';
import { SuperAdminLockedError } from '@src/roles/domain/errors.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';

describe('RolesService', () => {
  let roles: RolesService;

  beforeEach(() => {
    roles = new RolesService(new InMemoryRolePermissionRepository());
  });

  it('gives user everything but administration, admin the events on top, super_admin everything', async () => {
    expect(await roles.permissionsOf('user')).toEqual(['profile.read', 'profile.complete_onboarding', 'events.read', 'events.participate']);
    expect(await roles.permissionsOf('super_admin')).toEqual([...PERMISSIONS]);
    expect(await roles.permissionsOf('admin')).toEqual([
      'profile.read',
      'profile.complete_onboarding',
      'events.read',
      'events.participate',
      'planning.create_event',
      'planning.update_event',
      'planning.delete_event',
    ]);
  });

  it('applies the permissions saved by an admin', async () => {
    await roles.update('user', ['roles.update']);
    expect(await roles.permissionsOf('user')).toEqual(['roles.update']);
    await roles.update('user', []);
    expect(await roles.permissionsOf('user')).toEqual([]);
  });

  it('never lets super_admin lose a permission', async () => {
    await expect(roles.update('super_admin', [])).rejects.toBeInstanceOf(SuperAdminLockedError);
    expect((await roles.findAll()).find((r) => r.role === 'super_admin')).toMatchObject({ editable: false });
  });
});
