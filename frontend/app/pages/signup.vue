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
const { login } = useAuth()

async function signup(data: SignupDto) {
  try {
    await api('/auth/signup', { method: 'POST', body: data })
    await login({ email: data.email, password: data.password })
  } catch (e) {
    toast.add({
      title: 'Création du compte impossible',
      description: apiErrorMessage(e),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }
  toast.add({ title: 'Compte créé', description: 'Bienvenue sur Primal.', color: 'success', icon: 'i-lucide-check' })
  await navigateTo('/')
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Créer un compte</h1>
    <p class="text-muted mt-3">Crée ton compte pour réserver ta place sur les prochains créneaux.</p>

    <FormBuilder v-model:state="state" :schema="signupSchema" :fields="fields" :submit="signup" submit-label="Créer mon compte" class="mt-10" />

    <p class="text-muted mt-8 text-sm">
      Déjà un compte ?
      <ULink to="/login" class="text-primary font-medium">Se connecter</ULink>
    </p>
  </div>
</template>
