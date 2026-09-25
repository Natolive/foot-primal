import { z } from 'zod'
import { accountSchema } from '../auth/signup.dto.ts'
import { newPasswordField } from '../common/fields.ts'

// Ce que la personne modifie elle-même : son nom, pas son email (celui confirmé à l'inscription) ni son rôle.
export const updateProfileSchema = accountSchema.pick({ lastName: true, firstName: true })
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>

// Le mot de passe actuel est redemandé : une session restée ouverte ne suffit pas pour changer d'accès.
export const changePasswordSchema = z.object({
  currentPassword: z.string('Saisis ton mot de passe actuel.').min(1, 'Saisis ton mot de passe actuel.'),
  password: newPasswordField,
})
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
