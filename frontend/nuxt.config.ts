// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Appli interne derrière une connexion : pas de SEO, et l'API (cookie de session) n'est appelée que depuis le navigateur.
  ssr: false,
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: { link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }] },
  },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [
      { name: 'Big Shoulders', provider: 'google', weights: [700, 900] },
      { name: 'Archivo', provider: 'google', weights: [400, 500, 600] },
    ],
  },
  runtimeConfig: {
    public: { apiUrl: '' },
  },
})
