import { z } from 'zod'

export const PASSWORD_MIN = 8

export const emailField = z
  .email('Saisis une adresse email valide, par exemple prenom.nom@entreprise.fr.')
  .toLowerCase()

