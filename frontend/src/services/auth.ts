import { api, ApiError, getRefreshToken, hasRefreshToken, setTokens } from '@/lib/api'
import type { User } from '@/types/user'

type Account = Pick<User, 'id' | 'email' | 'full_name'>
type Access = Pick<User, 'roles' | 'permissions'>

interface Credentials {
  email: string
  password: string
}

/** The signed-in user, or `null` for a visitor. */
export async function getMe(): Promise<User | null> {
  if (!hasRefreshToken()) return null
  try {
    const [account, access] = await Promise.all([api<Account>('/auth/me'), api<Access>('/authorization/me')])
    return { ...account, ...access }
  } catch (error) {
    // The session ended (expired, or closed from another device): treat as a visitor.
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function login(json: Credentials) {
  setTokens(await api('/auth/login', { method: 'POST', json }))
}

export async function logout() {
  const refresh_token = getRefreshToken()
  setTokens(null)
  if (refresh_token) await api('/auth/logout', { method: 'POST', json: { refresh_token } })
}

export const register = (json: Credentials & { full_name: string; phone?: string }) =>
  api('/auth/register', { method: 'POST', json })

export const requestCode = (email: string) =>
  api('/auth/email/verification/request', { method: 'POST', json: { email } })

export const confirmEmail = (json: { email: string; code: string }) =>
  api('/auth/email/verification/confirm', { method: 'POST', json })

export const forgotPassword = (email: string) =>
  api('/auth/password/forgot', { method: 'POST', json: { email } })

export const resetPassword = (json: { token: string; new_password: string }) =>
  api('/auth/password/reset', { method: 'POST', json })
