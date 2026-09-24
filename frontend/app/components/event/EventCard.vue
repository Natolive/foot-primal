<script setup lang="ts">
import type { EventDto, Permission } from '@primal/shared'

// Un créneau : infos, places restantes, réponses au sondage, et les boutons pour répondre.
const props = defineProps<{ event: EventDto }>()
const emit = defineEmits<{ updated: [event: EventDto], edit: [], delete: [] }>()

const api = useApi()
const toast = useToast()
const { user } = useAuth()
const can = (p: Permission) => !!user.value?.permissions.includes(p)

const when = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    .format(new Date(props.event.startsAt)),
)
const taken = computed(() => props.event.participants.length)
const coming = computed(() => props.event.participants.some((p) => p.id === user.value?.id))
const declined = computed(() => props.event.declined.some((p) => p.id === user.value?.id))
const full = computed(() => taken.value >= props.event.maxParticipants)

async function answer(attending: boolean) {
  let updated: EventDto
  try {
    updated = await api<EventDto>(`/events/${props.event.id}/participation`, { method: 'PUT', body: { attending } })
  } catch (e) {
    toast.add({ title: 'Réponse impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('updated', updated)
  toast.add({
    title: attending ? 'Tu viens, c’est noté' : 'Tu ne viens pas, c’est noté',
    description: attending ? `Rendez-vous ${when.value}, ${updated.location}.` : `Ta réponse à « ${updated.title} » est enregistrée.`,
    color: 'success',
    icon: 'i-lucide-check',
  })
}
</script>

<template>
  <UCard :ui="{ root: 'row-span-6 grid grid-rows-subgrid gap-y-0 p-4 sm:p-6', body: 'contents' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-primary text-sm font-semibold first-letter:uppercase">{{ when }}</p>
        <h2 class="font-display text-highlighted mt-1 text-3xl font-bold uppercase leading-none break-words">{{ event.title }}</h2>
        <p class="text-muted mt-2 flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-map-pin" class="shrink-0" />{{ event.location }}
        </p>
      </div>
      <div class="flex shrink-0">
        <UButton v-if="can('planning.update_event')" icon="i-lucide-pencil" color="neutral" variant="ghost" :aria-label="`Modifier ${event.title}`" @click="emit('edit')" />
        <UButton v-if="can('planning.delete_event')" icon="i-lucide-trash-2" color="error" variant="ghost" :aria-label="`Supprimer ${event.title}`" @click="emit('delete')" />
      </div>
    </div>

    <p class="text-default whitespace-pre-line text-sm" :class="{ 'pt-5': event.description }">{{ event.description }}</p>

    <div class="pt-5">
      <div class="mb-2 flex justify-between text-sm">
        <span class="text-highlighted font-medium">{{ taken }} / {{ event.maxParticipants }} viennent</span>
        <UBadge v-if="full" color="error" variant="subtle">Complet</UBadge>
        <span v-else class="text-muted">{{ event.maxParticipants - taken }} place{{ event.maxParticipants - taken > 1 ? 's' : '' }} libre{{ event.maxParticipants - taken > 1 ? 's' : '' }}</span>
      </div>
      <UProgress :model-value="taken" :max="event.maxParticipants" :color="full ? 'error' : 'primary'" size="sm" />
    </div>

    <div v-if="taken" class="flex flex-wrap content-start gap-1.5 pt-5">
      <UBadge
        v-for="p in event.participants"
        :key="p.id"
        :color="p.id === user?.id ? 'primary' : 'neutral'"
        variant="subtle"
      >
        {{ p.firstName }} {{ p.lastName }}
      </UBadge>
    </div>
    <p v-else class="text-dimmed pt-5 text-sm">Personne pour l'instant, lance-toi.</p>

    <p class="text-muted text-sm" :class="{ 'pt-3': event.declined.length }">
      <template v-if="event.declined.length">
        <span class="font-medium">Ne viennent pas :</span>
        {{ event.declined.map((p) => `${p.firstName} ${p.lastName}`).join(', ') }}
      </template>
    </p>

    <div class="space-y-2 self-end pt-5">
      <UButton
        v-if="event.paymentUrl"
        :to="event.paymentUrl"
        target="_blank"
        rel="noopener noreferrer"
        color="neutral"
        variant="soft"
        icon="i-lucide-credit-card"
        trailing-icon="i-lucide-external-link"
        size="lg"
        block
      >
        Payer ma place
      </UButton>
      <div v-if="can('events.participate')" class="grid grid-cols-2 gap-2">
        <UButton
          :variant="coming ? 'solid' : 'outline'"
          :icon="coming ? 'i-lucide-circle-check' : 'i-lucide-user-plus'"
          :disabled="!coming && full"
          :aria-pressed="coming"
          size="lg"
          loading-auto
          class="justify-center font-semibold"
          @click="answer(true)"
        >
          Je viens
        </UButton>
        <UButton
          color="neutral"
          :variant="declined ? 'solid' : 'outline'"
          :icon="declined ? 'i-lucide-circle-x' : 'i-lucide-user-x'"
          :aria-pressed="declined"
          size="lg"
          loading-auto
          class="justify-center font-semibold"
          @click="answer(false)"
        >
          Je ne viens pas
        </UButton>
      </div>
    </div>
  </UCard>
</template>
