import { z } from 'zod'

// Jeton du lien reçu par email à l'inscription, et mot de passe choisi à ce moment-là :
// sans lui, ouvrir le lien confirmerait le mot de passe de n'importe qui s'étant inscrit avec cet email.
export const verifyEmailSchema = z.object({
  token: z.string('Ouvre le lien reçu par email.').min(1, 'Ouvre le lien reçu par email.').max(100),
  password: z.string('Saisis ton mot de passe.').min(1, 'Saisis ton mot de passe.'),
  remember: z.boolean().optional(),
})
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>
