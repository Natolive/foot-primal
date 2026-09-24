<script setup lang="ts">
import { loginSchema, type LoginDto } from '@primal/shared'
import type { FormFieldConfig } from '~/types/form'

// Template à racine unique : requis par la transition de page.
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Connexion · Primal' })

const state = ref<LoginDto>({ email: '', password: '', remember: true })
const fields: FormFieldConfig<LoginDto>[] = [
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'prenom.nom@entreprise.fr', icon: 'i-lucide-mail' },
  { name: 'password', label: 'Mot de passe', type: 'password', autocomplete: 'current-password' },
  { name: 'remember', label: 'Rester connecté', type: 'checkbox' },
]

const toast = useToast()
const { login } = useAuth()

async function onLogin(data: LoginDto) {
  try {
    await login(data)
  } catch (e) {
    toast.add({ title: 'Connexion impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  await navigateTo('/')
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Connexion</h1>
    <p class="text-muted mt-3">Connecte-toi pour voir les prochains créneaux et réserver ta place.</p>

    <FormBuilder v-model:state="state" :schema="loginSchema" :fields="fields" :submit="onLogin" submit-label="Se connecter" class="mt-10">
      <template #hint-password>
        <ULink to="#" class="text-primary text-sm font-medium">Mot de passe oublié ?</ULink>
      </template>
    </FormBuilder>

    <p class="text-muted mt-8 text-sm">
      Pas encore de compte ?
      <ULink to="/signup" class="text-primary font-medium">Créer un compte</ULink>
    </p>
  </div>
</template>
