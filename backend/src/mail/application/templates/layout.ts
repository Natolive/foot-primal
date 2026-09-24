import { html, type SafeHtml } from '../html.js';

// Adresse du front, pour les liens des emails.
export const appUrl = (path: string) => `${process.env.APP_URL}${path}`;

// Bouton d'action : lien stylé en ligne, seul style que les clients mail respectent partout.
export const button = (label: string, href: string) =>
  html`<a href="${href}" style="display:inline-block;padding:12px 20px;background:#0f1b3d;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:6px">${label}</a>`;

// Cadre commun à tous les emails : un template ne fournit que son contenu.
export const layout = (title: string, content: SafeHtml): string =>
  html`<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 24px;font-size:24px;text-transform:uppercase">${title}</h1>
        ${content}
      </td></tr>
    </table>
    <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#71717a;text-align:center">
      Primal · <a href="${appUrl('/')}" style="color:#71717a">${appUrl('/')}</a>
    </p>
  </body>
</html>`.value;
