import type { ChangePasswordDto, ForgotPasswordDto, LoginDto, ResetPasswordDto, UpdateAvailabilityDto, UpdateProfileDto, UserDto, VerifyEmailDto } from '@footix/shared'

export const useAuth = () => {
  // undefined : session pas encore vérifiée ; null : pas connecté.
  const user = useState<UserDto | null | undefined>('auth:user', () => undefined)
  const api = useApi()

  async function fetchUser() {
    user.value = await api<UserDto>('/auth/me').catch(() => null)
  }

  async function login(credentials: LoginDto) {
    user.value = await api<UserDto>('/auth/login', { method: 'POST', body: credentials })
  }

  // Confirme l'email (lien de l'inscription) et connecte.
  async function verifyEmail(dto: VerifyEmailDto) {
    user.value = await api<UserDto>('/auth/verify-email', { method: 'POST', body: dto })
  }

  // Envoie le lien « mot de passe oublié » (même réponse que le compte existe ou non).
  async function forgotPassword(dto: ForgotPasswordDto) {
    await api('/auth/forgot-password', { method: 'POST', body: dto })
  }

  // Nouveau mot de passe depuis le lien reçu, puis connecte.
  async function resetPassword(dto: ResetPasswordDto) {
    user.value = await api<UserDto>('/auth/reset-password', { method: 'POST', body: dto })
  }

  async function updateProfile(dto: UpdateProfileDto) {
    user.value = await api<UserDto>('/auth/me', { method: 'PATCH', body: dto })
  }

  async function updateAvailability(dto: UpdateAvailabilityDto) {
    user.value = await api<UserDto>('/auth/me/availability', { method: 'PUT', body: dto })
  }

  // Garde cette session, déconnecte les autres.
  async function changePassword(dto: ChangePasswordDto) {
    await api('/auth/me/password', { method: 'POST', body: dto })
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, fetchUser, login, verifyEmail, forgotPassword, resetPassword, updateProfile, updateAvailability, changePassword, logout }
}
