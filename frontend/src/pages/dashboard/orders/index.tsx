import { useSession } from '@/hooks/use-session'
import AllOrders from './all'
import MyOrders from './mine'

/** Staff who may read orders see every one; a seller sees their own shop's paid orders. */
export default function DashboardOrders() {
  const { can } = useSession()
  return can('order.read') ? <AllOrders /> : <MyOrders />
}
