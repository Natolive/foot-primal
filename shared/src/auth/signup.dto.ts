import { z } from 'zod'
import { emailField, newPasswordField } from '../common/fields.ts'
import { updateAvailabilitySchema } from '../users/availability.dto.ts'

// Première étape de l'inscription : qui on est.
export const accountSchema = z.object({
  lastName: z.string('Saisis ton nom.').trim().min(1, 'Saisis ton nom.').max(100),
  firstName: z.string('Saisis ton prénom.').trim().min(1, 'Saisis ton prénom.').max(100),
  email: emailField,
  password: newPasswordField,
})
export type AccountDto = z.infer<typeof accountSchema>

// Deuxième étape : ses dispos, facultatives (modifiables ensuite dans « Mon profil »).
export const signupSchema = accountSchema.extend({
  availableDays: updateAvailabilitySchema.shape.availableDays.default([]),
})
export type SignupInput = z.input<typeof signupSchema>
export type SignupDto = z.infer<typeof signupSchema>
