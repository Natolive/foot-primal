import { z } from 'zod'
import { emailField, newPasswordField } from '../common/fields.ts'

export const signupSchema = z.object({
  lastName: z.string('Saisis ton nom.').trim().min(1, 'Saisis ton nom.').max(100),
  firstName: z.string('Saisis ton prénom.').trim().min(1, 'Saisis ton prénom.').max(100),
  email: emailField,
  password: newPasswordField,
})
export type SignupDto = z.infer<typeof signupSchema>
