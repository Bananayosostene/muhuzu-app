import { useQuery } from '@tanstack/react-query'
import { ReceiptText } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { OrderStatus } from '@/components/shared/OrderStatus'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatPrice } from '@/lib/format'
import { getMyOrders } from '@/services/orders'

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data } = useQuery({ queryKey: ['orders', page], queryFn: () => getMyOrders(page) })

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 animate-rise font-heading text-3xl font-bold">My orders</h1>
      {!data && <Skeleton className="h-64 rounded-2xl" />}
      {data?.total === 0 && (
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed py-20 text-muted-foreground">
          <ReceiptText className="size-10" />
          <p>You have not ordered anything yet.</p>
          <Link to="/products" className={buttonVariants({ className: 'rounded-full' })}>Browse listings</Link>
        </div>
      )}
      {data && data.total > 0 && (
        <ul className="stagger divide-y rounded-2xl border bg-card">
          {data.items.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition hover:bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <OrderStatus status={order.status} />
                <p className="font-heading font-bold text-primary">{formatPrice(order.total_amount)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && data.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Button variant="outline" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>Previous</Button>
          Page {data.page} of {data.total_pages}
          <Button variant="outline" disabled={page >= data.total_pages} onClick={() => setParams({ page: String(page + 1) })}>Next</Button>
        </div>
      )}
    </main>
  )
}
