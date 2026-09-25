<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import {
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLES,
  updateUserPermissionsSchema,
  updateUserRoleSchema,
  updateUserSchema,
  type ManagedUserDto,
  type Permission,
  type UpdateUserDto,
  type UpdateUserPermissionsDto,
  type UpdateUserRoleDto,
} from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

definePageMeta({ permission: 'users.read' })
useHead({ title: 'Utilisateurs · Footix' })

const api = useApi()
const toast = useToast()
const { user: me, fetchUser } = useAuth()
const can = (p: Permission) => !!me.value?.permissions.includes(p)
const isSuperAdmin = computed(() => me.value?.role === 'super_admin')

const { data: users } = await useAsyncData('users', () => api<ManagedUserDto[]>('/users'), { default: () => [] })

const columns: TableColumn<ManagedUserDto>[] = [
  { id: 'name', header: 'Nom' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'emailVerified', header: 'Email confirmé' },
  { accessorKey: 'role', header: 'Rôle' },
  { accessorKey: 'extraPermissions', header: 'Droits en plus' },
  { id: 'actions' },
]

// Mêmes règles que l'API : seul un super admin touche à un super admin, et son propre accès ne se modifie pas.
const manageable = (u: ManagedUserDto) => isSuperAdmin.value || u.role !== 'super_admin'
const sections = (u: ManagedUserDto) => ({
  profile: manageable(u) && can('users.update'),
  role: manageable(u) && u.id !== me.value?.id && can('users.update_role'),
  permissions: manageable(u) && u.id !== me.value?.id && can('users.update_permissions'),
})
const canEdit = (u: ManagedUserDto) => Object.values(sections(u)).some(Boolean)
const canDelete = (u: ManagedUserDto) => manageable(u) && u.id !== me.value?.id && can('users.delete')

const profileFields: FormFieldConfig<UpdateUserDto>[] = [
  { name: 'lastName', label: 'Nom', half: true },
  { name: 'firstName', label: 'Prénom', half: true },
  { name: 'email', label: 'Email', type: 'email', icon: 'i-lucide-mail' },
]
const roleFields: FormFieldConfig<UpdateUserRoleDto>[] = [
  {
    name: 'role',
    label: 'Rôle',
    type: 'select',
    options: ROLES.filter((r) => isSuperAdmin.value || r !== 'super_admin').map((value) => ({ value, label: ROLE_LABELS[value] })),
  },
]
const permissionFields: FormFieldConfig<UpdateUserPermissionsDto>[] = [
  {
    name: 'extraPermissions',
    label: 'Droits en plus du rôle',
    type: 'checkbox-group',
    groups: permissionGroups,
    help: 'Les droits du rôle restent acquis, coche seulement ce qui s’ajoute.',
  },
]

const editing = ref<ManagedUserDto>()
const profile = ref<UpdateUserDto>({ lastName: '', firstName: '', email: '' })
const role = ref<UpdateUserRoleDto>({ role: 'user' })
const permissions = ref<UpdateUserPermissionsDto>({ extraPermissions: [] })

function edit(u: ManagedUserDto) {
  editing.value = u
  profile.value = { lastName: u.lastName, firstName: u.firstName, email: u.email }
  role.value = { role: u.role }
  permissions.value = { extraPermissions: [...u.extraPermissions] }
}

// Chaque partie s'enregistre seule, derrière son propre droit.
async function save(path: string, method: 'PATCH' | 'PUT', body: object, title: string) {
  const target = editing.value!
  let updated: ManagedUserDto
  try {
    updated = await api<ManagedUserDto>(`/users/${target.id}${path}`, { method, body })
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  users.value = users.value.map((u) => (u.id === updated.id ? updated : u))
  editing.value = updated
  if (updated.id === me.value?.id) await fetchUser()
  toast.add({ title, description: `${updated.firstName} ${updated.lastName} est à jour.`, color: 'success', icon: 'i-lucide-check' })
}

const deleting = ref<ManagedUserDto>()

async function confirmDelete() {
  const target = deleting.value!
  try {
    await api(`/users/${target.id}`, { method: 'DELETE' })
  } catch (e) {
    toast.add({ title: 'Suppression impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  users.value = users.value.filter((u) => u.id !== target.id)
  deleting.value = undefined
  toast.add({ title: 'Utilisateur supprimé', description: `${target.firstName} ${target.lastName} n’a plus de compte.`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Utilisateurs</h1>
    <p class="text-muted mt-3">Modifie une personne, change son rôle ou ajoute-lui des droits.</p>

    <UTable :data="users" :columns="columns" class="bg-default border-default mt-10 rounded-lg border">
      <template #name-cell="{ row }">
        <span class="text-highlighted font-medium">{{ row.original.firstName }} {{ row.original.lastName }}</span>
      </template>
      <template #emailVerified-cell="{ row }">
        <UBadge v-if="row.original.emailVerified" color="success" variant="subtle" icon="i-lucide-check">Confirmé</UBadge>
        <UBadge v-else color="warning" variant="subtle" icon="i-lucide-clock">En attente</UBadge>
      </template>
      <template #role-cell="{ row }">
        <UBadge :color="row.original.role === 'super_admin' ? 'primary' : 'neutral'" variant="subtle">
          {{ ROLE_LABELS[row.original.role] }}
        </UBadge>
      </template>
      <template #extraPermissions-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge v-for="p in row.original.extraPermissions" :key="p" color="neutral" variant="outline">
            {{ PERMISSION_LABELS[p] }}
          </UBadge>
          <span v-if="!row.original.extraPermissions.length" class="text-muted">Aucun</span>
        </div>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton
            v-if="canEdit(row.original)"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            :aria-label="`Modifier ${row.original.firstName} ${row.original.lastName}`"
            @click="edit(row.original)"
          />
          <UButton
            v-if="canDelete(row.original)"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            :aria-label="`Supprimer ${row.original.firstName} ${row.original.lastName}`"
            @click="deleting = row.original"
          />
        </div>
      </template>
    </UTable>

    <UModal
      :open="!!editing"
      :title="`${editing?.firstName} ${editing?.lastName}`"
      description="Chaque partie s’enregistre séparément."
      @update:open="(open) => !open && (editing = undefined)"
    >
      <template #body>
        <div v-if="editing" class="divide-default space-y-8 divide-y">
          <section v-if="sections(editing).profile" class="pb-8">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Infos</h2>
            <FormBuilder
              v-model:state="profile"
              :schema="updateUserSchema"
              :fields="profileFields"
              :submit="(data) => save('', 'PATCH', data, 'Infos enregistrées')"
              submit-label="Enregistrer les infos"
            />
          </section>
          <section v-if="sections(editing).role" class="pb-8">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Rôle</h2>
            <FormBuilder
              v-model:state="role"
              :schema="updateUserRoleSchema"
              :fields="roleFields"
              :submit="(data) => save('/role', 'PUT', data, 'Rôle enregistré')"
              submit-label="Enregistrer le rôle"
            />
          </section>
          <section v-if="sections(editing).permissions" class="pb-8 last:pb-0">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Droits en plus</h2>
            <FormBuilder
              v-model:state="permissions"
              :schema="updateUserPermissionsSchema"
              :fields="permissionFields"
              :submit="(data) => save('/permissions', 'PUT', data, 'Droits enregistrés')"
              submit-label="Enregistrer les droits"
            />
          </section>
        </div>
      </template>
    </UModal>

    <UModal
      :open="!!deleting"
      title="Supprimer l’utilisateur ?"
      :description="`${deleting?.firstName} ${deleting?.lastName} perd son compte, ses réponses aux sondages et ses invités. Ses places se libèrent.`"
      @update:open="(open) => !open && (deleting = undefined)"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="deleting = undefined">Annuler</UButton>
          <UButton color="error" icon="i-lucide-trash-2" loading-auto @click="confirmDelete">Supprimer l’utilisateur</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
