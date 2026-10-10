import { api, type Page } from '@/lib/api'

// A table page holds at most 100 rows: the backend's largest page.
const all = { query: { page_size: 100 } }

export interface Role {
  id: string
  name: string
  description: string | null
  /** `buyer`, `seller` and `admin` cannot be renamed or deleted. */
  is_system: boolean
}

/** Permissions are defined by the backend's code. Admins assign them to roles; they cannot create new ones. */
export interface Permission {
  code: string
  name: string
  description: string
  /** What it is about, e.g. `product`; used to group the list. */
  resource: string
}

export const getRoles = () => api<Page<Role>>('/roles', all)

/** The whole catalog, by code. */
export const getPermissions = () => api<Page<Permission>>('/permissions', all)

export const getRolePermissions = (roleId: string) => api<Page<Permission>>(`/roles/${roleId}/permissions`, all)

export const deleteRole = (id: string) => api(`/roles/${id}`, { method: 'DELETE' })

export interface RoleChanges {
  /** Absent for a new role. */
  id?: string
  /** Sent only when it may change: a system role keeps its name. */
  name?: string
  description: string | null
  /** Permission codes to add to the role, and to take away. */
  add: string[]
  remove: string[]
}

/** Creates or updates the role, then applies each permission change. Adding or removing one is safe to repeat. */
export async function saveRole({ id, name, description, add, remove }: RoleChanges) {
  const role = id
    ? await api<Role>(`/roles/${id}`, { method: 'PATCH', json: { ...(name && { name }), description } })
    : await api<Role>('/roles', { method: 'POST', json: { name, description } })
  const path = (code: string) => `/roles/${role.id}/permissions/${code}`
  await Promise.all([
    ...add.map((code) => api(path(code), { method: 'PUT' })),
    ...remove.map((code) => api(path(code), { method: 'DELETE' })),
  ])
}
