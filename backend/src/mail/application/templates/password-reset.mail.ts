import type { Mail } from '../../domain/mailer.js';
import { html } from '../html.js';
import { appUrl, button, layout } from './layout.js';

export const passwordResetMail = (to: { email: string; firstName: string }, token: string): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: 'Choisis un nouveau mot de passe Primal',
  html: layout(
    'Mot de passe oublié',
    html`<p>Salut ${to.firstName},</p>
<p>Choisis un nouveau mot de passe pour te reconnecter à Primal.</p>
<p style="margin:24px 0">${button('Choisir un mot de passe', appUrl(`/reset-password?token=${token}`))}</p>
<p style="color:#71717a;font-size:14px">Le lien est valable 1 heure. Tu n'as rien demandé ? Ignore ce message, ton mot de passe ne change pas.</p>`,
  ),
});
