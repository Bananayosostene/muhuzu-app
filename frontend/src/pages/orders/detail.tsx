import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { OrderStatus } from '@/components/shared/OrderStatus'
import { ProductImage } from '@/components/shared/ProductGrid'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatPrice } from '@/lib/format'
import NotFound from '@/pages/not-found'
import { cancelOrder, confirmReceipt, getMyOrder, getPayment, submitPayment } from '@/services/orders'
import { PaymentPanel } from './_components/PaymentPanel'

export default function OrderDetail() {
  const id = useParams().id ?? ''
  const client = useQueryClient()
  const { data: order, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getMyOrder(id),
    retry: false,
    // Staff confirm payments by hand, so keep looking while the order waits for one.
    refetchInterval: (query) => (query.state.data?.status === 'awaiting_payment' ? 15_000 : false),
  })
  const unpaid = order?.status === 'awaiting_payment'
  const { data: payment } = useQuery({
    queryKey: ['order', id, 'payment'],
    queryFn: () => getPayment(id),
    enabled: unpaid,
    refetchInterval: (query) => (query.state.data?.attempts.at(0)?.status === 'awaiting_verification' ? 15_000 : false),
  })

  // Any change to the order or its payment refreshes both, and the orders list.
  const done = (message: string) => () => {
    toast.success(message)
    void client.invalidateQueries({ queryKey: ['order', id] })
    void client.invalidateQueries({ queryKey: ['orders'] })
  }
  const failed = (error: Error) => toast.error(error.message)
  const pay = useMutation({ mutationFn: submitPayment, onSuccess: done('Payment sent for confirmation'), onError: failed })
  const cancel = useMutation({ mutationFn: cancelOrder, onSuccess: done('Order cancelled'), onError: failed })
  const receive = useMutation({ mutationFn: confirmReceipt, onSuccess: done('Thank you for confirming'), onError: failed })

  if (isError) return <NotFound />
  if (!order) return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8"><Skeleton className="h-96 rounded-2xl" /></main>

  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 content-start gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">Ordered {formatDate(order.created_at)} · Total {formatPrice(order.total_amount)}</p>
        </div>
        <OrderStatus status={order.status} />
      </div>

      {unpaid && payment && (
        <PaymentPanel payment={payment} pending={pay.isPending} onSubmit={(request) => pay.mutate({ ...request, orderId: id })} />
      )}

      {order.seller_orders.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Your order comes from {order.seller_orders.length} shops. Each one prepares and delivers its own part, so they can arrive separately; confirm each when you receive it.
        </p>
      )}
      {order.seller_orders.map((part) => (
        <section key={part.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading font-semibold">{part.seller_name} <span className="font-sans text-sm font-normal text-muted-foreground">· {formatPrice(part.subtotal)}</span></h2>
            <OrderStatus status={part.status} />
          </div>
          {part.status_reason && <p className="mt-2 text-sm text-muted-foreground">Reason: {part.status_reason}</p>}
          <ul className="mt-4 space-y-3">
            {part.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ProductImage src={item.image_url} className="size-14 shrink-0 rounded-lg" />
                <p className="min-w-0 flex-1 text-sm"><span className="line-clamp-1">{item.product_name}</span><span className="text-muted-foreground">{item.quantity} × {formatPrice(item.unit_price)}</span></p>
                <p className="text-sm font-medium">{formatPrice(item.line_total)}</p>
              </li>
            ))}
          </ul>
          {(part.status === 'shipped' || part.status === 'delivered') && (
            <Button className="mt-4" disabled={receive.isPending} onClick={() => receive.mutate({ orderId: id, sellerOrderId: part.id })}>
              I received this
            </Button>
          )}
        </section>
      ))}

      <section className="rounded-2xl border bg-card p-5 text-sm">
        <h2 className="mb-2 font-heading font-semibold">Delivery</h2>
        <p>{order.delivery.recipient_name} · {order.delivery.recipient_phone}</p>
        <p className="text-muted-foreground">{[order.delivery.address, order.delivery.sector, order.delivery.district, order.delivery.province].filter(Boolean).join(', ')}</p>
        {order.delivery.note && <p className="mt-2 text-muted-foreground">Note: {order.delivery.note}</p>}
      </section>

      {unpaid && (
        <Button variant="outline" className="justify-self-start text-destructive" disabled={cancel.isPending} onClick={() => cancel.mutate(id)}>
          Cancel this order
        </Button>
      )}
    </main>
  )
}
