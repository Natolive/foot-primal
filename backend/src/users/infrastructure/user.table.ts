import { ROLES, type Permission } from '@primal/shared';
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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
