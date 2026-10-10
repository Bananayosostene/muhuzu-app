import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/hooks/use-session'

/** Pages inside need a signed-in user; a visitor is sent to sign in and brought back afterwards. */
export default function RequireAuth() {
  const { user, isPending } = useSession()
  const { pathname, search } = useLocation()

  if (isPending) return null
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
  return <Outlet />
}
