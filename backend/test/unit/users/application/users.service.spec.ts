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

  it('marks the guided tour as shown once and keeps the first date', async () => {
    const lea = await users.create(person('lea@solem.fr'));
    await users.completeOnboarding(lea.id);
    const first = (await users.findById(lea.id)).onboardedAt;
    expect(first).toBeInstanceOf(Date);
    await users.completeOnboarding(lea.id);
    expect((await users.findById(lea.id)).onboardedAt).toBe(first);
  });

  it('updates the profile, role and extra permissions of someone else, one at a time', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@solem.fr'), role: 'super_admin' }));
    const lea = await users.create(person('lea@solem.fr'));
    await users.updateProfile(admin, lea.id, { email: 'lea.d@solem.fr', firstName: 'Léa', lastName: 'Durand' });
    await users.updateRole(admin, lea.id, { role: 'super_admin' });
    expect(await users.updatePermissions(admin, lea.id, { extraPermissions: ['roles.update'] })).toMatchObject({
      email: 'lea.d@solem.fr',
      lastName: 'Durand',
      role: 'super_admin',
      extraPermissions: ['roles.update'],
    });
  });

  it('refuses an email already used by another account', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@solem.fr'), role: 'super_admin' }));
    const lea = await users.create(person('lea@solem.fr'));
    await expect(users.updateProfile(admin, lea.id, { ...person('admin@solem.fr') })).rejects.toBeInstanceOf(
      EmailAlreadyUsedError,
    );
  });

  it('lets an admin edit their own profile but not their own access', async () => {
    const admin = toPublicUser(await users.create({ ...person('admin@solem.fr'), role: 'super_admin' }));
    await users.updateProfile(admin, admin.id, { ...person('admin@solem.fr'), firstName: 'Max' });
    await expect(users.updateRole(admin, admin.id, { role: 'user' })).rejects.toBeInstanceOf(OwnAccessLockedError);
    await expect(users.updatePermissions(admin, admin.id, { extraPermissions: [] })).rejects.toBeInstanceOf(
      OwnAccessLockedError,
    );
  });

  it('keeps super_admin in the hands of super admins', async () => {
    const manager = toPublicUser(await users.create(person('manager@solem.fr')));
    const lea = await users.create(person('lea@solem.fr'));
    const boss = await users.create({ ...person('boss@solem.fr'), role: 'super_admin' });
    await expect(users.updateRole(manager, lea.id, { role: 'super_admin' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await expect(users.updateRole(manager, boss.id, { role: 'user' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await expect(users.updateProfile(manager, boss.id, person('boss@solem.fr'))).rejects.toBeInstanceOf(
      SuperAdminOnlyError,
    );
    expect(await users.updatePermissions(manager, lea.id, { extraPermissions: ['users.read'] })).toMatchObject({
      extraPermissions: ['users.read'],
    });
  });

  it('deletes someone else, never oneself, and a super admin only by a super admin', async () => {
    const manager = toPublicUser(await users.create(person('manager@solem.fr')));
    const lea = await users.create(person('lea@solem.fr'));
    const boss = await users.create({ ...person('boss@solem.fr'), role: 'super_admin' });
    await expect(users.deleteUser(manager, manager.id)).rejects.toBeInstanceOf(OwnAccessLockedError);
    await expect(users.deleteUser(manager, boss.id)).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await users.deleteUser(manager, lea.id);
    expect((await users.findAll()).map((u) => u.email)).toEqual(['manager@solem.fr', 'boss@solem.fr']);
  });
});
