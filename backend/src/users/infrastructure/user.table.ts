import { ROLES, type Permission } from '@footix/shared';
import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ROLES);

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: role().notNull().default('user'),
  // Droits accordés en plus de ceux du rôle ; texte et non enum, comme dans role_permissions.
  extraPermissions: text('extra_permissions').array().$type<Permission[]>().notNull().default(sql`'{}'`),
  // Visite guidée affichée ; null tant qu'elle ne l'a pas été.
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  // Email confirmé par le lien reçu à l'inscription ; null tant que ce n'est pas fait (connexion refusée).
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  // Hash du jeton du lien de confirmation ; null une fois l'email confirmé.
  emailVerificationTokenHash: text('email_verification_token_hash').unique(),
  emailVerificationExpiresAt: timestamp('email_verification_expires_at', { withTimezone: true }),
  // Lien « mot de passe oublié » en cours ; null sinon.
  passwordResetTokenHash: text('password_reset_token_hash').unique(),
  passwordResetExpiresAt: timestamp('password_reset_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
