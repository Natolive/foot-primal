<script setup lang="ts">
import { PASSWORD_MIN, resetPasswordSchema, type ResetPasswordDto } from '@primal/shared'
import type { FormFieldConfig } from '~/types/form'

// Page ouverte depuis le lien « mot de passe oublié » (`?token=…`) ; template à racine unique (transition de page).
definePageMeta({ layout: 'auth', guest: true })
useHead({ title: 'Nouveau mot de passe · Primal' })

const route = useRoute()
const state = ref<ResetPasswordDto>({ token: String(route.query.token ?? ''), password: '', remember: true })
const fields: FormFieldConfig<ResetPasswordDto>[] = [
  { name: 'password', label: 'Nouveau mot de passe', type: 'password', autocomplete: 'new-password', help: `${PASSWORD_MIN} caractères minimum.` },
  { name: 'remember', label: 'Rester connecté', type: 'checkbox' },
]

const toast = useToast()
const { resetPassword } = useAuth()

async function save(data: ResetPasswordDto) {
  try {
    await resetPassword(data)
  } catch (e) {
    toast.add({ title: 'Changement du mot de passe impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: 'Mot de passe changé', description: 'Tes autres sessions sont déconnectées.', color: 'success', icon: 'i-lucide-check' })
  await navigateTo('/')
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-5xl font-black uppercase leading-none">Nouveau mot de passe</h1>
    <p class="text-muted mt-3">Choisis ton nouveau mot de passe, tu seras connecté dans la foulée.</p>

    <FormBuilder v-model:state="state" :schema="resetPasswordSchema" :fields="fields" :submit="save" submit-label="Changer le mot de passe" class="mt-10" />

    <p class="text-muted mt-8 text-sm">
      Lien expiré ?
      <ULink to="/forgot-password" class="text-primary font-medium">Redemander un lien</ULink>
    </p>
  </div>
</template>
