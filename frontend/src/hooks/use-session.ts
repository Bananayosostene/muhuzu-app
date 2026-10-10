import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, logout } from '@/services/auth'

export function useSession() {
  const client = useQueryClient()
  const { data: user, isPending } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    // Permissions are read live by the backend, so pick up an admin's change when the tab is used again.
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  })
  const can = (permission: string) => user?.permissions.includes(permission) ?? false

  /** Call after signing in so the whole app sees the new user. */
  const reload = () => client.invalidateQueries({ queryKey: ['me'] })

  async function signOut() {
    await logout()
    client.setQueryData(['me'], null)
    // Nothing fetched for the previous user may be shown to the next one.
    client.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' })
  }

  return { user, isPending, can, reload, signOut }
}
