import type { Permission } from '@footix/shared'

declare module '#app' {
  interface PageMeta {
    /** Page réservée aux visiteurs non connectés. */
    guest?: boolean
    /** Droit requis pour ouvrir la page, sinon retour à l'accueil. */
    permission?: Permission
  }
}

export {}
