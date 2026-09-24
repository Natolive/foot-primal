import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const emailDomains = pgTable('email_domains', {
  id: uuid().primaryKey().defaultRandom(),
  domain: text().notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
