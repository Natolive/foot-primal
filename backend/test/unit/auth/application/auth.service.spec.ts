import { updateAvailabilitySchema, type SignupDto } from '@footix/shared';
import { AuthService, SESSION_TTL } from '@src/auth/application/auth.service.js';
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidResetLinkError,
  InvalidVerificationLinkError,
  MissingPermissionError,
  SessionExpiredError,
  VerificationPasswordMismatchError,
  WrongCurrentPasswordError,
} from '@src/auth/domain/errors.js';
import { EmailDomainsService } from '@src/email-domains/application/email-domains.service.js';
import { EmailDomainNotAllowedError } from '@src/email-domains/domain/errors.js';
import { RolesService } from '@src/roles/application/roles.service.js';
import { UsersService } from '@src/users/application/users.service.js';
import { EmailAlreadyUsedError } from '@src/users/domain/errors.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';
import { FakeMailer } from '@test/fakes/fake-mailer.js';
import { FakePasswordHasher } from '@test/fakes/fake-password-hasher.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';
import { InMemorySessionRepository } from '@test/fakes/in-memory-session.repository.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

describe('AuthService', () => {
  const dto: SignupDto = { lastName: 'Dupont', firstName: 'Léa', email: 'lea@solem.fr', password: '12345678', availableDays: ['thursday'] };
  const credentials = { email: dto.email, password: dto.password };
  let users: InMemoryUserRepository;
  let sessions: InMemorySessionRepository;
  let mailer: FakeMailer;
  let auth: AuthService;
  // Ouvre le dernier lien envoyé, avec le mot de passe saisi sur la page de confirmation.
  const confirm = (password = dto.password, token = mailer.lastToken()) => auth.verifyEmail({ token, password });

  beforeEach(async () => {
    const emailDomains = new EmailDomainsService(new InMemoryEmailDomainRepository());
    await emailDomains.allow({ domain: 'solem.fr' });
    users = new InMemoryUserRepository();
    sessions = new InMemorySessionRepository();
    mailer = new FakeMailer();
    auth = new AuthService(
      new UsersService(users),
      new FakePasswordHasher(),
      sessions,
      new RolesService(new InMemoryRolePermissionRepository()),
      emailDomains,
      mailer,
    );
  });

  describe('signup', () => {
    it('stores the hashed password and never returns it', async () => {
      const user = await auth.signup(dto);
      expect(user).not.toHaveProperty('passwordHash');
      expect(users.rows[0].passwordHash).toBe('hashed:12345678');
    });

    it('saves the available days given at signup', async () => {
      expect((await auth.signup(dto)).availableDays).toEqual(['thursday']);
    });

    it('rejects an email already confirmed', async () => {
      await auth.signup(dto);
      await confirm();
      await expect(auth.signup(dto)).rejects.toBeInstanceOf(EmailAlreadyUsedError);
    });

    it('replaces an unconfirmed account and sends a new link that alone is valid', async () => {
      await auth.signup(dto);
      const oldToken = mailer.lastToken();
      await auth.signup({ ...dto, password: 'new-password' });
      expect(users.rows).toHaveLength(1);
      expect(users.rows[0].passwordHash).toBe('hashed:new-password');
      await expect(confirm('new-password', oldToken)).rejects.toBeInstanceOf(InvalidVerificationLinkError);
      await confirm('new-password');
      expect(users.rows[0].emailVerifiedAt).toBeInstanceOf(Date);
    });

    it('rejects an email outside the allowed domains', async () => {
      await expect(auth.signup({ ...dto, email: 'lea@gmail.com' })).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
      expect(users.rows).toHaveLength(0);
    });
  });

  describe('verifyEmail', () => {
    it('sends a link whose token is stored hashed and works once', async () => {
      await auth.signup(dto);
      const token = mailer.lastToken();
      expect(mailer.sent).toEqual([expect.objectContaining({ to: { email: dto.email, name: dto.firstName } })]);
      expect(mailer.sent[0].html).toContain(`/verify-email?token=${token}`);
      expect(users.rows[0].emailVerificationTokenHash).not.toBe(token);
      await expect(auth.login(credentials)).rejects.toBeInstanceOf(EmailNotVerifiedError);

      const session = await confirm();
      expect(await auth.authenticate(session.token)).toMatchObject({ email: dto.email });
      await expect(auth.login(credentials)).resolves.toMatchObject({ user: { email: dto.email } });
      await expect(confirm()).rejects.toBeInstanceOf(InvalidVerificationLinkError);
    });

    it('never confirms the password of someone else who signed up with the same email', async () => {
      await auth.signup(dto);
      await auth.signup({ ...dto, password: 'attacker-password' });
      // Léa ouvre le lien reçu (celui de la 2e inscription) avec son mot de passe : refusé, le lien reste valable.
      await expect(confirm()).rejects.toBeInstanceOf(VerificationPasswordMismatchError);
      expect(users.rows[0].emailVerifiedAt).toBeNull();
      // Elle se réinscrit : son mot de passe reprend la main.
      await auth.signup(dto);
      await confirm();
      await expect(auth.login({ ...credentials, password: 'attacker-password' })).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('rejects an expired link', async () => {
      await auth.signup(dto);
      users.rows[0].emailVerificationExpiresAt = new Date(Date.now() - 1);
      await expect(confirm()).rejects.toBeInstanceOf(InvalidVerificationLinkError);
      expect(users.rows[0].emailVerifiedAt).toBeNull();
    });
  });

  describe('password reset', () => {
    it('sends nothing for an unknown email', async () => {
      await auth.forgotPassword('nobody@solem.fr');
      expect(mailer.sent).toHaveLength(0);
    });

    it('changes the password once, logs out everywhere and logs in', async () => {
      await auth.signup(dto);
      await confirm();
      const old = await auth.login(credentials);
      await auth.forgotPassword(dto.email);
      const token = mailer.lastToken();
      expect(mailer.sent.at(-1)!.html).toContain(`/reset-password?token=${token}`);

      const session = await auth.resetPassword({ token, password: 'new-password' });
      await expect(auth.authenticate(old.token)).rejects.toBeInstanceOf(SessionExpiredError);
      expect(await auth.authenticate(session.token)).toMatchObject({ email: dto.email });
      await expect(auth.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
      await auth.login({ ...credentials, password: 'new-password' });
      await expect(auth.resetPassword({ token, password: 'other-password' })).rejects.toBeInstanceOf(
        InvalidResetLinkError,
      );
    });

    it('confirms the email of an unconfirmed account', async () => {
      await auth.signup(dto);
      await auth.forgotPassword(dto.email);
      await auth.resetPassword({ token: mailer.lastToken(), password: 'new-password' });
      expect(users.rows[0]).toMatchObject({ emailVerifiedAt: expect.any(Date), emailVerificationTokenHash: null });
    });

    it('rejects an expired link', async () => {
      await auth.signup(dto);
      await auth.forgotPassword(dto.email);
      users.rows[0].passwordResetExpiresAt = new Date(Date.now() - 1);
      await expect(auth.resetPassword({ token: mailer.lastToken(), password: 'new-password' })).rejects.toBeInstanceOf(
        InvalidResetLinkError,
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await auth.signup(dto);
      await confirm();
    });

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

  describe('profile', () => {
    const loggedIn = async () => {
      await auth.signup(dto);
      await confirm();
      return auth.login(credentials);
    };

    it('changes the name, never the email', async () => {
      const { user } = await loggedIn();
      expect(await auth.updateProfile(user, { firstName: 'Léna', lastName: 'Martin' })).toMatchObject({ firstName: 'Léna', lastName: 'Martin', email: dto.email });
    });

    it('saves the available days, in week order and without duplicates', async () => {
      const { user } = await loggedIn();
      const availableDays = updateAvailabilitySchema.parse({ availableDays: ['friday', 'monday', 'friday'] }).availableDays;
      expect((await auth.updateAvailability(user, { availableDays })).availableDays).toEqual(['monday', 'friday']);
    });

    it('asks for the current password, then logs out the other sessions only', async () => {
      const here = await loggedIn();
      const elsewhere = await auth.login(credentials);
      await expect(auth.changePassword(here.user, here.token, { currentPassword: 'wrong', password: 'new-password' })).rejects.toBeInstanceOf(WrongCurrentPasswordError);
      await auth.changePassword(here.user, here.token, { currentPassword: dto.password, password: 'new-password' });
      await expect(auth.authenticate(here.token)).resolves.toMatchObject({ email: dto.email });
      await expect(auth.authenticate(elsewhere.token)).rejects.toBeInstanceOf(SessionExpiredError);
      await expect(auth.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
      await auth.login({ ...credentials, password: 'new-password' });
    });
  });

  describe('authorize', () => {
    it('checks the effective permissions of the role', async () => {
      const user = await auth.signup(dto);
      expect(user).toMatchObject({ role: 'user', permissions: ['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'events.read', 'events.participate', 'events.invite_guest'] });
      expect(() => auth.authorize(user, 'profile.read')).not.toThrow();
      expect(() => auth.authorize(user, 'roles.update')).toThrow(MissingPermissionError);
    });

    it('adds the extra permissions of the person to those of the role', async () => {
      await auth.signup(dto);
      await confirm();
      users.rows[0].extraPermissions = ['users.read'];
      const { token } = await auth.login(credentials);
      expect((await auth.authenticate(token)).permissions).toEqual(['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'users.read', 'events.read', 'events.participate', 'events.invite_guest']);
    });
  });
});
