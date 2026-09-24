import { Injectable } from '@nestjs/common';
import { PERMISSIONS, type LoginDto, type Permission, type SignupDto } from '@primal/shared';
import { createHash, randomBytes } from 'node:crypto';
import { RolesService } from '../../roles/application/roles.service.js';
import { UsersService } from '../../users/application/users.service.js';
import { EmailAlreadyUsedError } from '../../users/domain/errors.js';
import { toPublicUser, type PublicUser, type User } from '../../users/domain/user.entity.js';
import {
  InvalidCredentialsError,
  MissingPermissionError,
  SessionExpiredError,
} from '../domain/errors.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { SessionRepository } from '../domain/session.repository.js';

const HOUR = 60 * 60 * 1000;
export const SESSION_TTL = { short: 12 * HOUR, remember: 30 * 24 * HOUR };

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
  ) {}

  async signup({ password, ...dto }: SignupDto): Promise<AuthenticatedUser> {
    if (await this.users.findByEmail(dto.email)) throw new EmailAlreadyUsedError();
    const user = await this.users.create({ ...dto, passwordHash: await this.hasher.hash(password) });
    return this.withPermissions(user);
  }

  async login({ email, password, remember = false }: LoginDto): Promise<OpenedSession> {
    const user = await this.users.findByEmail(email);
    // Email inconnu : on vérifie quand même un hash pour que le temps de réponse ne trahisse pas l'existence du compte.
    this.dummyHash ??= this.hasher.hash(randomBytes(16).toString('hex'));
    const valid = await this.hasher.verify(password, user?.passwordHash ?? (await this.dummyHash));
    if (!user || !valid) throw new InvalidCredentialsError();

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
