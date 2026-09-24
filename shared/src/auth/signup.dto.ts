import { z } from 'zod'
import { emailField, PASSWORD_MIN } from '../common/fields.ts'

export const signupSchema = z.object({
  lastName: z.string('Saisis ton nom.').trim().min(1, 'Saisis ton nom.').max(100),
  firstName: z.string('Saisis ton prénom.').trim().min(1, 'Saisis ton prénom.').max(100),
  email: emailField,
  password: z.string('Choisis un mot de passe.').min(PASSWORD_MIN, `Choisis un mot de passe d'au moins ${PASSWORD_MIN} caractères.`).max(128),
})
export type SignupDto = z.infer<typeof signupSchema>
