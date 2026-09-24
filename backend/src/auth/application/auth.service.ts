import { Injectable } from '@nestjs/common';
import {
  PERMISSIONS,
  type LoginDto,
  type Permission,
  type ResetPasswordDto,
  type SignupDto,
  type VerifyEmailDto,
} from '@primal/shared';
import { createHash, randomBytes } from 'node:crypto';
import { emailVerificationMail } from '../../mail/application/templates/email-verification.mail.js';
import { passwordResetMail } from '../../mail/application/templates/password-reset.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { EmailDomainsService } from '../../email-domains/application/email-domains.service.js';
import { RolesService } from '../../roles/application/roles.service.js';
import { UsersService } from '../../users/application/users.service.js';
import { EmailAlreadyUsedError } from '../../users/domain/errors.js';
import { toPublicUser, type PublicUser, type User } from '../../users/domain/user.entity.js';
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidResetLinkError,
  InvalidVerificationLinkError,
  MissingPermissionError,
  SessionExpiredError,
  VerificationPasswordMismatchError,
} from '../domain/errors.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { SessionRepository } from '../domain/session.repository.js';

const HOUR = 60 * 60 * 1000;
export const SESSION_TTL = { short: 12 * HOUR, remember: 30 * 24 * HOUR };
export const EMAIL_VERIFICATION_TTL = 48 * HOUR;
export const PASSWORD_RESET_TTL = HOUR;

// Utilisateur renvoyé au front, avec ses droits effectifs : ceux du rôle plus ceux ajoutés à la personne.
export type AuthenticatedUser = PublicUser & { onboarded: boolean; permissions: Permission[] };

export interface OpenedSession {
  token: string;
  expiresAt: Date;
  remember: boolean;
  user: AuthenticatedUser;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  private dummyHash?: Promise<string>;

  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionRepository,
    private readonly roles: RolesService,
    private readonly emailDomains: EmailDomainsService,
    private readonly mailer: Mailer,
  ) {}

  // Compte inactif tant que l'email n'est pas confirmé par le lien envoyé.
  // Se réinscrire avec un email pas encore confirmé remplace le compte et renvoie un lien (email perdu, faute de frappe) :
  // sans risque, car confirmer demande aussi le mot de passe de la dernière inscription (voir verifyEmail).
  async signup({ password, ...dto }: SignupDto): Promise<AuthenticatedUser> {
    await this.emailDomains.assertAllowed(dto.email);
    const existing = await this.users.findByEmail(dto.email);
    if (existing?.emailVerifiedAt) throw new EmailAlreadyUsedError();

    const token = randomBytes(32).toString('base64url');
    const data = {
      ...dto,
      passwordHash: await this.hasher.hash(password),
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL),
    };
    const user = existing ? await this.users.update(existing.id, data) : await this.users.create(data);
    await this.mailer.send(emailVerificationMail(user, token));
    return this.withPermissions(user);
  }

  // Lien (preuve de la boîte mail) + mot de passe (preuve d'être l'auteur de l'inscription) : un tiers qui s'inscrit
  // avec l'email d'un collègue ne récupère jamais le compte, même si le collègue ouvre le lien. Connecte dans la foulée.
  async verifyEmail({ token, password, remember = false }: VerifyEmailDto): Promise<OpenedSession> {
    const found = await this.users.findByVerificationTokenHash(hashToken(token));
    if (!found || found.emailVerificationExpiresAt! <= new Date()) throw new InvalidVerificationLinkError();
    // Mauvais mot de passe : le lien reste valable, pour réessayer.
    if (!(await this.hasher.verify(password, found.passwordHash))) throw new VerificationPasswordMismatchError();
    const user = await this.users.update(found.id, {
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    });
    return this.openSession(user, remember);
  }

  // Même réponse que le compte existe ou non. Un nouveau lien remplace le précédent.
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;
    const token = randomBytes(32).toString('base64url');
    await this.users.update(user.id, {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL),
    });
    await this.mailer.send(passwordResetMail(user, token));
  }

  // Le lien prouve la boîte mail : il confirme aussi l'email d'un compte pas encore confirmé.
  // Déconnecte partout (mot de passe peut-être compromis), puis connecte ici.
  async resetPassword({ token, password, remember = false }: ResetPasswordDto): Promise<OpenedSession> {
    const found = await this.users.findByPasswordResetTokenHash(hashToken(token));
    if (!found || found.passwordResetExpiresAt! <= new Date()) throw new InvalidResetLinkError();
    const user = await this.users.update(found.id, {
      passwordHash: await this.hasher.hash(password),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      emailVerifiedAt: found.emailVerifiedAt ?? new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    });
    await this.sessions.deleteByUserId(user.id);
    return this.openSession(user, remember);
  }

  async login({ email, password, remember = false }: LoginDto): Promise<OpenedSession> {
    const user = await this.users.findByEmail(email);
    // Email inconnu : on vérifie quand même un hash pour que le temps de réponse ne trahisse pas l'existence du compte.
    this.dummyHash ??= this.hasher.hash(randomBytes(16).toString('hex'));
    const valid = await this.hasher.verify(password, user?.passwordHash ?? (await this.dummyHash));
    if (!user || !valid) throw new InvalidCredentialsError();
    if (!user.emailVerifiedAt) throw new EmailNotVerifiedError();
    return this.openSession(user, remember);
  }

  private async openSession(user: User, remember: boolean): Promise<OpenedSession> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + (remember ? SESSION_TTL.remember : SESSION_TTL.short));
    await this.sessions.create({ userId: user.id, tokenHash: hashToken(token), expiresAt });
    return { token, expiresAt, remember, user: await this.withPermissions(user) };
  }

  // ponytail: les sessions expirées restent en base, ajouter un nettoyage planifié si la table grossit.
  async authenticate(token: string | undefined): Promise<AuthenticatedUser> {
    const session = token && (await this.sessions.findValidByTokenHash(hashToken(token), new Date()));
    if (!session) throw new SessionExpiredError();
    return this.withPermissions(await this.users.findById(session.userId));
  }

  authorize(user: AuthenticatedUser, permission: Permission): void {
    if (!user.permissions.includes(permission)) throw new MissingPermissionError();
  }

  completeOnboarding(user: AuthenticatedUser): Promise<void> {
    return this.users.completeOnboarding(user.id);
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.sessions.deleteByTokenHash(hashToken(token));
  }

  private async withPermissions(user: User): Promise<AuthenticatedUser> {
    const fromRole = await this.roles.permissionsOf(user.role);
    const permissions = PERMISSIONS.filter((p) => fromRole.includes(p) || user.extraPermissions.includes(p));
    return { ...toPublicUser(user), onboarded: user.onboardedAt !== null, permissions };
  }
}
