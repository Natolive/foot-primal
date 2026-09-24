<script setup lang="ts">
import { ROLE_LABELS, type Permission } from '@primal/shared'
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, logout } = useAuth()
const toast = useToast()

async function onLogout() {
  try {
    await logout()
  } catch (e) {
    toast.add({ title: 'Déconnexion impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  await navigateTo('/login')
}

// Liens affichés selon les droits ; sans droit, le lien n'apparaît pas.
const links = computed(() =>
  ([
    { to: '/', label: 'Créneaux', icon: 'i-lucide-calendar-days' },
    { to: '/users', label: 'Utilisateurs', icon: 'i-lucide-users', permission: 'users.read' },
    { to: '/roles', label: 'Droits', icon: 'i-lucide-shield', permission: 'roles.read' },
  ] satisfies { to: string, label: string, icon: string, permission?: Permission }[])
    .filter((l) => !('permission' in l) || user.value?.permissions.includes(l.permission)),
)

const fullName = computed(() => `${user.value?.firstName ?? ''} ${user.value?.lastName ?? ''}`.trim())

const menu = computed<DropdownMenuItem[][]>(() => [
  [{ type: 'label', label: fullName.value, description: user.value?.email }],
  [{ label: 'Se déconnecter', icon: 'i-lucide-log-out', color: 'error', onSelect: onLogout }],
])
</script>

<template>
  <div class="min-h-dvh">
    <header class="navbar bg-ink text-chalk sticky top-0 z-40">
      <div class="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <NuxtLink to="/" class="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="Accueil">
          <BrandLogo class="w-24 sm:w-32" />
        </NuxtLink>

        <nav aria-label="Navigation principale" class="flex flex-1 items-center gap-1 sm:justify-center">
          <UButton
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :icon="link.icon"
            :aria-label="link.label"
            :exact="link.to === '/'"
            color="neutral"
            variant="ghost"
            class="hover:text-chalk font-medium hover:bg-white/10"
            active-class="text-chalk bg-white/10"
            inactive-class="text-chalk/70"
          >
            <span class="hidden sm:inline">{{ link.label }}</span>
          </UButton>
        </nav>

        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-down"
            class="text-chalk shrink-0 gap-2 px-1.5 hover:bg-white/10 sm:px-2"
            :aria-label="`Compte de ${fullName}`"
          >
            <UAvatar :alt="fullName" size="sm" class="bg-primary text-white" :ui="{ fallback: 'text-white font-semibold' }" />
            <span class="hidden text-left leading-tight md:block">
              <span class="block text-sm font-semibold">{{ user?.firstName }}</span>
              <span v-if="user" class="text-chalk/60 block text-xs">{{ ROLE_LABELS[user.role] }}</span>
            </span>
          </UButton>
        </UDropdownMenu>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Fil aux couleurs du « A » du logo, sous la barre. */
.navbar {
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-blue), var(--color-brand-teal)) 1;
}
</style>
