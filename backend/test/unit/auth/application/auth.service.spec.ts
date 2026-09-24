import { AuthService, SESSION_TTL } from '@src/auth/application/auth.service.js';
import {
  InvalidCredentialsError,
  MissingPermissionError,
  SessionExpiredError,
} from '@src/auth/domain/errors.js';
import { EmailDomainsService } from '@src/email-domains/application/email-domains.service.js';
import { EmailDomainNotAllowedError } from '@src/email-domains/domain/errors.js';
import { RolesService } from '@src/roles/application/roles.service.js';
import { UsersService } from '@src/users/application/users.service.js';
import { EmailAlreadyUsedError } from '@src/users/domain/errors.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';
import { FakePasswordHasher } from '@test/fakes/fake-password-hasher.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';
import { InMemorySessionRepository } from '@test/fakes/in-memory-session.repository.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

describe('AuthService', () => {
  const dto = { lastName: 'Dupont', firstName: 'Léa', email: 'lea@solem.fr', password: '12345678' };
  const credentials = { email: dto.email, password: dto.password };
  let users: InMemoryUserRepository;
  let sessions: InMemorySessionRepository;
  let auth: AuthService;

  beforeEach(async () => {
    const emailDomains = new EmailDomainsService(new InMemoryEmailDomainRepository());
    await emailDomains.allow({ domain: 'solem.fr' });
    users = new InMemoryUserRepository();
    sessions = new InMemorySessionRepository();
    auth = new AuthService(
      new UsersService(users),
      new FakePasswordHasher(),
      sessions,
      new RolesService(new InMemoryRolePermissionRepository()),
      emailDomains,
    );
  });

  describe('signup', () => {
    it('stores the hashed password and never returns it', async () => {
      const user = await auth.signup(dto);
      expect(user).not.toHaveProperty('passwordHash');
      expect(users.rows[0].passwordHash).toBe('hashed:12345678');
    });

    it('rejects an email already used', async () => {
      await auth.signup(dto);
      await expect(auth.signup(dto)).rejects.toBeInstanceOf(EmailAlreadyUsedError);
    });

    it('rejects an email outside the allowed domains', async () => {
      await expect(auth.signup({ ...dto, email: 'lea@gmail.com' })).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
      expect(users.rows).toHaveLength(0);
    });
  });

  describe('login', () => {
    beforeEach(() => auth.signup(dto));

    it('opens a session whose token authenticates the user', async () => {
      const session = await auth.login(credentials);
      expect(sessions.rows[0].tokenHash).not.toBe(session.token);
      expect(await auth.authenticate(session.token)).toMatchObject({ email: dto.email });
    });

    it('lasts longer with remember', async () => {
      const short = await auth.login(credentials);
      const long = await auth.login({ ...credentials, remember: true });
      expect(long.expiresAt.getTime() - short.expiresAt.getTime()).toBeGreaterThan(
        SESSION_TTL.remember - SESSION_TTL.short - 1000,
      );
    });

    it('gives the same error for a wrong password and an unknown email', async () => {
      await expect(auth.login({ ...credentials, password: 'wrong-password' })).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
      await expect(auth.login({ ...credentials, email: 'nobody@solem.fr' })).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('rejects the token after logout', async () => {
      const { token } = await auth.login(credentials);
      await auth.logout(token);
      await expect(auth.authenticate(token)).rejects.toBeInstanceOf(SessionExpiredError);
      await expect(auth.authenticate(undefined)).rejects.toBeInstanceOf(SessionExpiredError);
    });
  });

  describe('authorize', () => {
    it('checks the effective permissions of the role', async () => {
      const user = await auth.signup(dto);
      expect(user).toMatchObject({ role: 'user', permissions: ['profile.read', 'profile.complete_onboarding', 'events.read', 'events.participate'] });
      expect(() => auth.authorize(user, 'profile.read')).not.toThrow();
      expect(() => auth.authorize(user, 'roles.update')).toThrow(MissingPermissionError);
    });

    it('adds the extra permissions of the person to those of the role', async () => {
      await auth.signup(dto);
      users.rows[0].extraPermissions = ['users.read'];
      const { token } = await auth.login(credentials);
      expect((await auth.authenticate(token)).permissions).toEqual(['profile.read', 'profile.complete_onboarding', 'users.read', 'events.read', 'events.participate']);
    });
  });
});
