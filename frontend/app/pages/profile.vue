<script setup lang="ts">
import {
  changePasswordSchema,
  PASSWORD_MIN,
  updateAvailabilitySchema,
  updateProfileSchema,
  type ChangePasswordDto,
  type Permission,
  type UpdateAvailabilityDto,
  type UpdateProfileDto,
} from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

definePageMeta({ permission: 'profile.read' })
useHead({ title: 'Mon profil · Footix' })

const { user, updateProfile, updateAvailability, changePassword } = useAuth()
const toast = useToast()
const can = (p: Permission) => !!user.value?.permissions.includes(p)

const profile = ref<UpdateProfileDto>({ lastName: user.value?.lastName ?? '', firstName: user.value?.firstName ?? '' })
const profileFields = computed<FormFieldConfig<UpdateProfileDto>[]>(() => [
  { name: 'lastName', label: 'Nom', autocomplete: 'family-name', half: true, disabled: !can('profile.update') },
  { name: 'firstName', label: 'Prénom', autocomplete: 'given-name', half: true, disabled: !can('profile.update') },
])

async function saveProfile(data: UpdateProfileDto) {
  try {
    await updateProfile(data)
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: 'Profil enregistré', description: 'Ton nom est à jour sur les créneaux.', color: 'success', icon: 'i-lucide-check' })
}

const availability = ref<UpdateAvailabilityDto>({ availableDays: [...(user.value?.availableDays ?? [])] })
const availabilityFields = computed<FormFieldConfig<UpdateAvailabilityDto>[]>(() => [
  {
    name: 'availableDays',
    label: 'Jours où tu peux jouer',
    type: 'checkbox-group',
    groups: weekdayGroups,
    disabled: !can('profile.update_availability'),
  },
])

async function saveAvailability(data: UpdateAvailabilityDto) {
  try {
    await updateAvailability(data)
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: 'Dispos enregistrées', description: 'Les organisateurs en tiennent compte pour choisir les créneaux.', color: 'success', icon: 'i-lucide-check' })
}

const emptyPassword = (): ChangePasswordDto => ({ currentPassword: '', password: '' })
const password = ref(emptyPassword())
const passwordFields: FormFieldConfig<ChangePasswordDto>[] = [
  { name: 'currentPassword', label: 'Mot de passe actuel', type: 'password', autocomplete: 'current-password' },
  { name: 'password', label: 'Nouveau mot de passe', type: 'password', autocomplete: 'new-password', help: `${PASSWORD_MIN} caractères minimum.` },
]

async function savePassword(data: ChangePasswordDto) {
  try {
    await changePassword(data)
  } catch (e) {
    toast.add({ title: 'Changement du mot de passe impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  password.value = emptyPassword()
  toast.add({ title: 'Mot de passe changé', description: 'Tes autres sessions sont déconnectées.', color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Mon profil</h1>
    <p class="text-muted mt-3">
      Connecté avec <span class="text-highlighted font-medium">{{ user?.email }}</span>. L'email ne se change pas.
    </p>

    <UCard class="mt-10">
      <h2 class="font-display text-highlighted mb-6 text-xl font-bold tracking-tight">Ton nom</h2>
      <FormBuilder
        v-model:state="profile"
        :schema="updateProfileSchema"
        :fields="profileFields"
        :submit="saveProfile"
        :readonly="!can('profile.update')"
        submit-label="Enregistrer le profil"
      />
    </UCard>

    <UCard data-tour="availability" class="mt-6">
      <h2 class="font-display text-highlighted text-xl font-bold tracking-tight">Tes dispos</h2>
      <p class="text-muted mt-1 mb-6 text-sm">Les organisateurs s'en servent pour choisir les jours des créneaux.</p>
      <FormBuilder
        v-model:state="availability"
        :schema="updateAvailabilitySchema"
        :fields="availabilityFields"
        :submit="saveAvailability"
        :readonly="!can('profile.update_availability')"
        submit-label="Enregistrer mes dispos"
      />
    </UCard>

    <UCard v-if="can('profile.change_password')" class="mt-6">
      <h2 class="font-display text-highlighted mb-6 text-xl font-bold tracking-tight">Mot de passe</h2>
      <FormBuilder
        v-model:state="password"
        :schema="changePasswordSchema"
        :fields="passwordFields"
        :submit="savePassword"
        submit-label="Changer le mot de passe"
      />
    </UCard>
  </div>
</template>
