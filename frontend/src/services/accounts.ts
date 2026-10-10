import { api, type Page } from '@/lib/api'

/** One person on MUHUZE, whatever they do there, as staff see them in the list. */
export interface Account {
  id: string
  email: string
  full_name: string
  status: 'active' | 'suspended' | 'deactivated'
  created_at: string
  /** Names of the roles the account holds, sorted. */
  roles: string[]
}

interface Filters {
  /** Searches the full name and the email. */
  q: string
  /** Only accounts holding this role. */
  role_id: string
}

/** Newest first. A table page holds at most 100 rows: the backend's largest page. */
export const getAccounts = (filters: Filters) => api<Page<Account>>('/accounts', { query: { ...filters, page_size: 100 } })

interface RoleChanges {
  accountId: string
  /** Role ids to give, and to take away. */
  add: string[]
  remove: string[]
}

/** Giving a role already held, or taking one not held, is safe to repeat. */
export async function setAccountRoles({ accountId, add, remove }: RoleChanges) {
  const path = (roleId: string) => `/accounts/${accountId}/roles/${roleId}`
  await Promise.all([
    ...add.map((roleId) => api(path(roleId), { method: 'PUT' })),
    ...remove.map((roleId) => api(path(roleId), { method: 'DELETE' })),
  ])
}
