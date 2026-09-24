// $fetch vers l'API, cookie de session inclus.
export const useApi = () => {
  const { public: { apiUrl } } = useRuntimeConfig()
  return $fetch.create({ baseURL: apiUrl, credentials: 'include' })
}

// Message renvoyé par l'API (erreur métier ou validation), sinon message générique.
export const apiErrorMessage = (e: unknown) =>
  (e as { data?: { message?: string } }).data?.message ?? 'Le serveur ne répond pas, réessaie dans un instant.'
