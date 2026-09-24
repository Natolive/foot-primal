// Pages privées par défaut ; `definePageMeta({ guest: true })` pour les pages réservées aux visiteurs (login, signup).
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()
  if (user.value === undefined) await fetchUser()

  if (!user.value && !to.meta.guest) return navigateTo('/login')
  if (user.value && to.meta.guest) return navigateTo('/')
  if (to.meta.permission && !user.value?.permissions.includes(to.meta.permission)) return navigateTo('/')
})
