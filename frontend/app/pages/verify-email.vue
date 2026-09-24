<script setup lang="ts">
import { verifyEmailSchema, type VerifyEmailDto } from '@primal/shared'
import type { FormFieldConfig } from '~/types/form'

// Page ouverte depuis le lien de l'email d'inscription (`?token=…`) ; template à racine unique (transition de page).
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Confirmer ton email · Primal' })

const route = useRoute()
const state = ref<VerifyEmailDto>({ token: String(route.query.token ?? ''), password: '', remember: true })
const fields: FormFieldConfig<VerifyEmailDto>[] = [
  { name: 'password', label: 'Mot de passe', type: 'password', autocomplete: 'current-password', help: "Celui choisi à l'inscription." },
  { name: 'remember', label: 'Rester connecté', type: 'checkbox' },
]

const toast = useToast()
const { verifyEmail } = useAuth()

async function confirm(data: VerifyEmailDto) {
  try {
    await verifyEmail(data)
  } catch (e) {
    toast.add({ title: 'Confirmation impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: 'Email confirmé', description: 'Bienvenue sur Primal.', color: 'success', icon: 'i-lucide-check' })
  await navigateTo('/')
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Confirmer ton email</h1>
    <p class="text-muted mt-3">Saisis ton mot de passe pour activer ton compte.</p>

    <FormBuilder v-model:state="state" :schema="verifyEmailSchema" :fields="fields" :submit="confirm" submit-label="Confirmer mon email" class="mt-10" />

    <p class="text-muted mt-8 text-sm">
      Mot de passe oublié ?
      <ULink to="/forgot-password" class="text-primary font-medium">Choisis-en un nouveau</ULink>
      · Lien expiré ?
      <ULink to="/signup" class="text-primary font-medium">Recommencer l'inscription</ULink>
    </p>
  </div>
</template>
