import type { Mail } from '../../domain/mailer.js';
import { html } from '../html.js';
import { ics } from '../ics.js';
import { appUrl, button, layout, note, paragraph } from './layout.js';

// ponytail: pas de durée en base, un match dure 1 h dans le calendrier ; colonne `ends_at` si ça varie.
const DURATION = 60 * 60 * 1000;

const when = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(d);

export const eventRegistrationMail = (
  to: { email: string; firstName: string },
  event: { id: string; title: string; description: string | null; location: string; startsAt: Date; paymentUrl: string | null },
): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: `Inscription confirmée : ${event.title}`,
  html: layout({
    title: 'Ta place est réservée',
    preheader: `${event.title}, ${when(event.startsAt)} à ${event.location}.`,
    content: html`${paragraph(`Salut ${to.firstName}, tu es inscrit à « ${event.title} » le ${when(event.startsAt)} à ${event.location}.`)}
${event.paymentUrl ? button('Payer ma place', event.paymentUrl) : button('Voir les créneaux', appUrl('/'))}
${note('Ajoute le match à ton agenda avec le fichier joint. Un empêchement ? Réponds « je ne viens pas » sur Footix pour libérer ta place.')}`,
  }),
  attachments: [
    {
      name: 'match.ics',
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
      content: ics({
        uid: `${event.id}@footix`,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        endsAt: new Date(event.startsAt.getTime() + DURATION),
        url: appUrl('/'),
      }),
    },
  ],
});
