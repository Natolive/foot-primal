<script setup lang="ts">
import { WEEKDAY_LABELS, type DayAvailabilityDto } from '@footix/shared'

definePageMeta({ permission: 'planning.read_availability' })
useHead({ title: 'Dispos · Footix' })

const api = useApi()
const { data: days } = await useAsyncData('availability', () => api<DayAvailabilityDto[]>('/users/availability'), { default: () => [] })
const players = (n: number) => `${n} joueur${n > 1 ? 's' : ''}`

// Les 3 jours où le plus de monde peut jouer ; à égalité, l'ordre de la semaine.
const top = computed(() => days.value.filter((d) => d.people.length).toSorted((a, b) => b.people.length - a.people.length).slice(0, 3))

// Jour dont on affiche la liste des joueurs.
const detail = ref<DayAvailabilityDto>()
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Dispos</h1>
    <p class="text-muted mt-3">Qui peut jouer chaque jour, d'après les profils : choisis le jour du prochain créneau.</p>

    <section v-if="top.length" aria-label="Jours les plus complets" class="mt-10 grid gap-4 sm:grid-cols-3">
      <div
        v-for="(day, i) in top"
        :key="day.day"
        class="rounded-lg p-5"
        :class="i === 0 ? 'bg-primary text-white' : 'bg-elevated'"
      >
        <p class="text-sm font-medium" :class="i === 0 ? 'opacity-80' : 'text-muted'">
          {{ i === 0 ? 'Jour le plus complet' : `${i + 1}e jour` }}
        </p>
        <p class="font-display mt-2 text-2xl font-bold tracking-tight" :class="{ 'text-highlighted': i !== 0 }">{{ WEEKDAY_LABELS[day.day] }}</p>
        <p class="mt-1 text-sm" :class="i === 0 ? 'opacity-80' : 'text-muted'">{{ players(day.people.length) }} dispo{{ day.people.length > 1 ? 's' : '' }}</p>
      </div>
    </section>
    <UEmpty
      v-else
      icon="i-lucide-calendar-check"
      title="Personne n'a encore donné ses dispos"
      description="Chacun coche ses jours dans « Mon profil »."
      class="mt-10"
    />

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="day in days" :key="day.day">
        <h2 class="font-display text-highlighted text-lg font-bold tracking-tight">{{ WEEKDAY_LABELS[day.day] }}</h2>
        <p class="text-highlighted mt-2 text-3xl font-semibold">{{ day.people.length }}</p>
        <p class="text-muted text-sm">{{ day.people.length > 1 ? 'joueurs dispo' : 'joueur dispo' }}</p>
        <UButton
          :disabled="!day.people.length"
          icon="i-lucide-users"
          color="neutral"
          variant="soft"
          block
          class="mt-4"
          @click="detail = day"
        >
          Voir les joueurs
        </UButton>
      </UCard>
    </div>

    <UModal
      :open="!!detail"
      :title="detail ? WEEKDAY_LABELS[detail.day] : ''"
      :description="detail ? `${players(detail.people.length)} dispo${detail.people.length > 1 ? 's' : ''}.` : ''"
      @update:open="(open) => !open && (detail = undefined)"
    >
      <template #body>
        <ul class="space-y-2 text-sm">
          <li v-for="p in detail?.people" :key="p.id" class="flex items-center gap-2">
            <UAvatar :alt="`${p.firstName} ${p.lastName}`" size="2xs" />
            {{ p.firstName }} {{ p.lastName }}
          </li>
        </ul>
      </template>
    </UModal>
  </div>
</template>
