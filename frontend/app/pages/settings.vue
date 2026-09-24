<script setup lang="ts">
const { user } = useAuth()
const route = useRoute()
const links = computed(() => allowedSettingsLinks(user.value?.permissions))

// /settings seul : première sous-page accessible, ou l'accueil sans aucun droit de paramétrage.
watch(
  () => route.path,
  (path) => {
    if (path === '/settings') navigateTo(links.value[0]?.to ?? '/', { replace: true })
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <UNavigationMenu :items="links" highlight class="border-default mb-10 border-b" />
    <NuxtPage />
  </div>
</template>
