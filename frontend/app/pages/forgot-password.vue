<script setup lang="ts">
import { forgotPasswordSchema, type ForgotPasswordDto } from '@primal/shared'
import type { FormFieldConfig } from '~/types/form'

// Template à racine unique : requis par la transition de page.
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Mot de passe oublié · Primal' })

const state = ref<ForgotPasswordDto>({ email: '' })
const fields: FormFieldConfig<ForgotPasswordDto>[] = [
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'prenom.nom@solem.fr', icon: 'i-lucide-mail' },
]

const toast = useToast()
const { forgotPassword } = useAuth()
// Email auquel le lien a été envoyé (s'il a un compte).
const sentTo = ref<string>()

async function send(data: ForgotPasswordDto) {
  try {
    await forgotPassword(data)
  } catch (e) {
    toast.add({ title: 'Envoi du lien impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: 'Lien envoyé', description: 'Regarde tes mails.', color: 'success', icon: 'i-lucide-check' })
  sentTo.value = data.email
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Mot de passe oublié</h1>
    <template v-if="sentTo">
      <p class="text-muted mt-3">
        Si un compte existe pour <span class="text-highlighted font-medium">{{ sentTo }}</span>, tu viens de recevoir un lien
        valable 1 heure pour choisir un nouveau mot de passe. Rien reçu ? Regarde dans les spams.
      </p>
      <UButton label="Renvoyer un lien" variant="soft" icon="i-lucide-rotate-ccw" class="mt-8" @click="sentTo = undefined" />
    </template>
    <template v-else>
      <p class="text-muted mt-3">Saisis ton email, on t'envoie un lien pour choisir un nouveau mot de passe.</p>
      <FormBuilder v-model:state="state" :schema="forgotPasswordSchema" :fields="fields" :submit="send" submit-label="Envoyer le lien" class="mt-10" />
    </template>

    <p class="text-muted mt-8 text-sm">
      Ça te revient ?
      <ULink to="/login" class="text-primary font-medium">Se connecter</ULink>
    </p>
  </div>
</template>
