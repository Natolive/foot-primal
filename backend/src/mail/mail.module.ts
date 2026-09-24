import { Module } from '@nestjs/common';
import { Mailer } from './domain/mailer.js';
import { BrevoMailer } from './infrastructure/brevo-mailer.js';
import { MailpitMailer } from './infrastructure/mailpit-mailer.js';

// Nouveau mail = un template dans `application/templates/`, envoyé avec `mailer.send(...)`.
// Mailpit en dev (MAILPIT_URL), Brevo sinon (sans clé, en CI : email loggé).
@Module({
  providers: [{ provide: Mailer, useClass: process.env.MAILPIT_URL ? MailpitMailer : BrevoMailer }],
  exports: [Mailer],
})
export class MailModule {}
