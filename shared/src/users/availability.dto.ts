import { z } from 'zod'

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

// Jours où la personne peut jouer, en général : les organisateurs s'en servent pour choisir les créneaux.
// Rangés dans l'ordre de la semaine, sans doublon.
export const updateAvailabilitySchema = z.object({
  availableDays: z
    .array(z.enum(WEEKDAYS, 'Coche uniquement des jours de la semaine.'))
    .transform((days) => WEEKDAYS.filter((d) => days.includes(d))),
})
export type UpdateAvailabilityDto = z.infer<typeof updateAvailabilitySchema>

// Qui est dispo chaque jour, du lundi au dimanche.
export interface DayAvailabilityDto {
  day: Weekday
  people: { id: string, firstName: string, lastName: string }[]
}
