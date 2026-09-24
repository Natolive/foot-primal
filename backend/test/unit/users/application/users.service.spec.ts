import { UsersService } from '@src/users/application/users.service.js';
import { EmailAlreadyUsedError, OwnAccessLockedError, SuperAdminOnlyError } from '@src/users/domain/errors.js';
import { toPublicUser } from '@src/users/domain/user.entity.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

describe('UsersService', () => {
  const person = (email: string) => ({ email, firstName: 'Léa', lastName: 'Dupont', passwordHash: 'x' });
  let users: UsersService;

  beforeEach(() => {
    users = new UsersService(new InMemoryUserRepository());
  });

  it('updates the profile, role and extra permissions of someone else, one at a time', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@boite.fr'), role: 'super_admin' }));
    const lea = await users.create(person('lea@boite.fr'));
    await users.updateProfile(admin, lea.id, { email: 'lea.d@boite.fr', firstName: 'Léa', lastName: 'Durand' });
    await users.updateRole(admin, lea.id, { role: 'super_admin' });
    expect(await users.updatePermissions(admin, lea.id, { extraPermissions: ['roles.update'] })).toMatchObject({
      email: 'lea.d@boite.fr',
      lastName: 'Durand',
      role: 'super_admin',
      extraPermissions: ['roles.update'],
    });
  });

  it('refuses an email already used by another account', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@boite.fr'), role: 'super_admin' }));
    const lea = await users.create(person('lea@boite.fr'));
    await expect(users.updateProfile(admin, lea.id, { ...person('admin@boite.fr') })).rejects.toBeInstanceOf(
      EmailAlreadyUsedError,
    );
  });

  it('lets an admin edit their own profile but not their own access', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@boite.fr'), role: 'super_admin' }));
    await users.updateProfile(admin, admin.id, { ...person('admin@boite.fr'), firstName: 'Max' });
    await expect(users.updateRole(admin, admin.id, { role: 'user' })).rejects.toBeInstanceOf(OwnAccessLockedError);
    await expect(users.updatePermissions(admin, admin.id, { extraPermissions: [] })).rejects.toBeInstanceOf(
      OwnAccessLockedError,
    );
  });

  it('keeps super_admin in the hands of super admins', async () => {
    const manager = toPublicUser(await users.create(person('manager@boite.fr')));
    const lea = await users.create(person('lea@boite.fr'));
    const boss = await users.create({ ...person('boss@boite.fr'), role: 'super_admin' });
    await expect(users.updateRole(manager, lea.id, { role: 'super_admin' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await expect(users.updateRole(manager, boss.id, { role: 'user' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await expect(users.updateProfile(manager, boss.id, person('boss@boite.fr'))).rejects.toBeInstanceOf(
      SuperAdminOnlyError,
    );
    expect(await users.updatePermissions(manager, lea.id, { extraPermissions: ['users.read'] })).toMatchObject({
      extraPermissions: ['users.read'],
    });
  });
});
