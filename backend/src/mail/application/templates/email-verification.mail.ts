import type { Mail } from '../../domain/mailer.js';
import { html } from '../html.js';
import { appUrl, button, layout } from './layout.js';

export const emailVerificationMail = (to: { email: string; firstName: string }, token: string): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: 'Confirme ton email pour rejoindre Primal',
  html: layout(
    'Confirme ton email',
    html`<p>Salut ${to.firstName},</p>
<p>Confirme ton email pour activer ton compte et réserver ta place sur les prochains créneaux.</p>
<p style="margin:24px 0">${button('Confirmer mon email', appUrl(`/verify-email?token=${token}`))}</p>
<p style="color:#71717a;font-size:14px">Le lien est valable 48 heures. Tu n'as pas créé de compte sur Primal ? Ignore ce message.</p>`,
  ),
});
