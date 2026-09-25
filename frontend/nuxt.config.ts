// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Appli interne derrière une connexion : pas de SEO, et l'API (cookie de session) n'est appelée que depuis le navigateur.
  ssr: false,
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#15803d' }],
    },
  },
  modules: ['@nuxt/ui'],
  // Vert et blanc uniquement : pas de mode sombre.
  ui: { colorMode: false },
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [
      { name: 'Unbounded', provider: 'google', weights: [500, 700] },
      { name: 'Geist', provider: 'google', weights: [400, 500, 600] },
    ],
  },
  runtimeConfig: {
    public: { apiUrl: '' },
  },
  // Prod : l'API passe par le front (/api), un seul domaine derrière le reverse proxy du serveur.
  $production: {
    routeRules: { '/api/**': { proxy: 'http://backend:3000/**' } },
  },
})
