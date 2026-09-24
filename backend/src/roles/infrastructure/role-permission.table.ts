import { boolean, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import type { Permission } from '@primal/shared';
import { role } from '../../users/infrastructure/user.table.js';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    role: role().notNull(),
    // Texte et non enum : ajouter un droit dans le code ne demande pas de migration.
    permission: text().$type<Permission>().notNull(),
    granted: boolean().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.role, t.permission)],
);
