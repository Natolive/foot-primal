import { z } from 'zod'

export interface ParticipantDto {
  id: string
  firstName: string
  lastName: string
}

// Créneau tel que renvoyé par l'API, avec les réponses au sondage (visibles par tous).
export interface EventDto {
  id: string
  title: string
  description: string | null
  location: string
  startsAt: string
  maxParticipants: number
  paymentUrl: string | null
  // Ceux qui viennent, seuls à prendre une place.
  participants: ParticipantDto[]
  // Ceux qui ont répondu « je ne viens pas ».
  declined: ParticipantDto[]
}

// Champ facultatif : vide, absent ou null devient null en base.
const optional = <T extends z.ZodType<string>>(schema: T) =>
  z.union([z.literal(''), schema]).nullish().transform((v) => v || null)

export const eventSchema = z.object({
  title: z.string('Donne un titre au créneau.').trim().min(1, 'Donne un titre au créneau, par exemple « Foot du jeudi ».').max(100, 'Raccourcis le titre à 100 caractères.'),
  location: z.string('Indique le lieu.').trim().min(1, 'Indique le lieu, par exemple « Urban Soccer Lyon ».').max(200, 'Raccourcis le lieu à 200 caractères.'),
  // Date envoyée en ISO par le front (le champ datetime-local est converti dans le fuseau du navigateur).
  startsAt: z.coerce.date('Choisis la date et l’heure du match.').refine((d) => d > new Date(), 'Choisis une date à venir.'),
  maxParticipants: z.coerce
    .number('Indique le nombre de places.')
    .int('Indique un nombre de places entier.')
    .min(2, 'Prévois au moins 2 places.')
    .max(100, 'Limite à 100 places.'),
  // http(s) uniquement : le lien est affiché tel quel, pas de `javascript:`.
  paymentUrl: optional(z.url({ protocol: /^https?$/, error: 'Colle un lien complet qui commence par https://.' })),
  description: optional(z.string().trim().max(1000, 'Raccourcis la description à 1000 caractères.')),
})
export type EventInput = z.input<typeof eventSchema>
export type SaveEventDto = z.infer<typeof eventSchema>

// Réponse au sondage de la personne connectée : elle peut changer d'avis tant que le match n'a pas commencé.
export const answerEventSchema = z.object({
  attending: z.boolean('Réponds « je viens » ou « je ne viens pas ».'),
})
export type AnswerEventDto = z.infer<typeof answerEventSchema>
