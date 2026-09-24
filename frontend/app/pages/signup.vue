<script setup lang="ts">
import { PASSWORD_MIN, signupSchema, type SignupDto } from '@primal/shared'
import type { FormFieldConfig } from '~/types/form'

// Template à racine unique : requis par la transition de page.
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Créer un compte · Primal' })

const state = ref<SignupDto>({ lastName: '', firstName: '', email: '', password: '' })
const fields: FormFieldConfig<SignupDto>[] = [
  { name: 'lastName', label: 'Nom', autocomplete: 'family-name', half: true },
  { name: 'firstName', label: 'Prénom', autocomplete: 'given-name', half: true },
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'prenom.nom@solem.fr', icon: 'i-lucide-mail' },
  { name: 'password', label: 'Mot de passe', type: 'password', autocomplete: 'new-password', help: `${PASSWORD_MIN} caractères minimum.` },
]

const toast = useToast()
const api = useApi()
// Email auquel le lien de confirmation a été envoyé.
const sentTo = ref<string>()

async function signup(data: SignupDto) {
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
      <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Vérifie tes mails</h1>
      <p class="text-muted mt-3">
        On t'a envoyé un lien à <span class="text-highlighted font-medium">{{ sentTo }}</span> : ouvre-le pour activer ton compte.
        Rien reçu ? Regarde dans les spams, ou réinscris-toi pour recevoir un nouveau lien.
      </p>
      <UButton label="Recommencer l'inscription" variant="soft" icon="i-lucide-rotate-ccw" class="mt-8" @click="sentTo = undefined" />
    </div>
    <div v-else>
      <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Créer un compte</h1>
      <p class="text-muted mt-3">Crée ton compte pour réserver ta place sur les prochains créneaux.</p>

      <FormBuilder v-model:state="state" :schema="signupSchema" :fields="fields" :submit="signup" submit-label="Créer mon compte" class="mt-10" />

      <p class="text-muted mt-8 text-sm">
        Déjà un compte ?
        <ULink to="/login" class="text-primary font-medium">Se connecter</ULink>
      </p>
    </div>
  </div>
</template>
