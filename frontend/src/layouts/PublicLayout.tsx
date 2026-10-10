import { Outlet } from 'react-router'
import { useCart } from '@/hooks/use-cart'
import { useSession } from '@/hooks/use-session'
import { useWishlist } from '@/hooks/use-wishlist'
import { dashboardPermissions } from '@/lib/dashboard-access'
import { Footer } from './_components/Footer'
import { Header } from './_components/Header'

export default function PublicLayout() {
  const { user, can, signOut } = useSession()
  const { ids } = useWishlist()
  const cart = useCart()

  return (
    <div className="flex min-h-svh flex-col">
      <Header
        user={user ?? undefined}
        showDashboard={dashboardPermissions.some(can)}
        wishlistCount={ids.length}
        cartCount={Object.values(cart.quantities).reduce((sum, quantity) => sum + quantity, 0)}
        onSignOut={signOut}
      />
      <Outlet />
      <Footer />
    </div>
  )
}
