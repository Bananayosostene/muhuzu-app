import { useSession } from '@/hooks/use-session'
import MyProducts from './mine'
import ProductModeration from './moderation'

/** Staff who moderate see every shop's listings; a seller works on their own. */
export default function DashboardProducts() {
  const { can } = useSession()
  return can('product.moderate') ? <ProductModeration /> : <MyProducts />
}
