<script setup lang="ts">
import { accountSchema, PASSWORD_MIN, updateAvailabilitySchema, type AccountDto, type SignupInput, type UpdateAvailabilityDto } from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

// Template à racine unique : requis par la transition de page.
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Créer un compte · Footix' })

// Deux étapes : le compte, puis les dispos (facultatives), envoyés ensemble à la fin.
const step = ref<1 | 2>(1)
const account = ref<AccountDto>({ lastName: '', firstName: '', email: '', password: '' })
const availability = ref<UpdateAvailabilityDto>({ availableDays: [] })
const fields: FormFieldConfig<AccountDto>[] = [
  { name: 'firstName', label: 'Prénom', autocomplete: 'given-name', half: true },
  { name: 'lastName', label: 'Nom', autocomplete: 'family-name', half: true },
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'prenom.nom@solem.fr', icon: 'i-lucide-mail' },
  { name: 'password', label: 'Mot de passe', type: 'password', autocomplete: 'new-password', help: `${PASSWORD_MIN} caractères minimum.` },
]
const availabilityFields: FormFieldConfig<UpdateAvailabilityDto>[] = [
  { name: 'availableDays', label: 'Jours où tu peux jouer', type: 'checkbox-group', groups: weekdayGroups, help: 'Facultatif, modifiable ensuite dans « Mon profil ».' },
]

const toast = useToast()
const api = useApi()
// Email auquel le lien de confirmation a été envoyé.
const sentTo = ref<string>()

async function signup({ availableDays }: UpdateAvailabilityDto) {
  const data: SignupInput = { ...account.value, availableDays }
  try {
    await api('/auth/signup', { method: 'POST', body: data })
  } catch (e) {
    toast.add({
      title: 'Création du compte impossible',
      description: apiErrorMessage(e),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }
  toast.add({ title: 'Compte créé', description: 'Confirme ton email pour te connecter.', color: 'success', icon: 'i-lucide-check' })
  sentTo.value = data.email
}
</script>

<template>
  <div>
    <div v-if="sentTo">
      <h1 class="font-display text-highlighted text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl">Vérifie tes mails</h1>
      <p class="text-muted mt-3">
        On t'a envoyé un lien à <span class="text-highlighted font-medium">{{ sentTo }}</span> : ouvre-le pour activer ton compte.
        Rien reçu ? Regarde dans les spams, ou réinscris-toi pour recevoir un nouveau lien.
      </p>
      <UButton label="Recommencer l'inscription" variant="soft" icon="i-lucide-rotate-ccw" class="mt-8" @click="sentTo = undefined; step = 1" />
    </div>
    <div v-else-if="step === 2">
      <p class="text-muted text-sm font-medium">Étape 2 sur 2</p>
      <h1 class="font-display text-highlighted mt-2 text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl">Tes dispos</h1>
      <p class="text-muted mt-3">Coche les jours où tu peux jouer : les organisateurs s'en servent pour choisir les créneaux.</p>

      <FormBuilder
        v-model:state="availability"
        :schema="updateAvailabilitySchema"
        :fields="availabilityFields"
        :submit="signup"
        submit-label="Créer mon compte"
        class="mt-10"
      />
      <UButton label="Retour" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="mt-4" @click="step = 1" />
    </div>
    <div v-else>
      <p class="text-muted text-sm font-medium">Étape 1 sur 2</p>
      <h1 class="font-display text-highlighted mt-2 text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl">Créer un compte</h1>
      <p class="text-muted mt-3">Crée ton compte pour réserver ta place sur les prochains créneaux.</p>

      <FormBuilder v-model:state="account" :schema="accountSchema" :fields="fields" :submit="async () => (step = 2)" submit-label="Continuer" class="mt-10" />

      <p class="text-muted mt-8 text-sm">
        Déjà un compte ?
        <ULink to="/login" class="text-primary font-medium">Se connecter</ULink>
      </p>
    </div>
  </div>
</template>
