import { OrderStatus } from '@/components/shared/OrderStatus'
import { ProductImage } from '@/components/shared/ProductGrid'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { StaffOrder } from '@/services/staff-orders'

/** A whole order for staff: who it goes to, and each shop's part with its money split. `order` is undefined while it loads. */
export function StaffOrderDialog({ order, open, onClose }: { order?: StaffOrder; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order ? `Order ${order.order_number}` : 'Order'}</DialogTitle>
          <DialogDescription>
            {order?.status === 'awaiting_payment'
              ? 'Not paid yet. Its sellers will see it once the payment is confirmed on the Payments page.'
              : 'Each shop handles its own part.'}
          </DialogDescription>
        </DialogHeader>
        {!order && <Skeleton className="h-64 rounded-xl" />}
        {order && (
          <div className="grid gap-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <OrderStatus status={order.status} />
              <p className="font-heading text-lg font-bold">{formatPrice(order.total_amount)}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="font-medium">{order.delivery.recipient_name} · {order.delivery.recipient_phone}</p>
              <p className="text-muted-foreground">{[order.delivery.address, order.delivery.sector, order.delivery.district, order.delivery.province].filter(Boolean).join(', ')}</p>
              {order.delivery.note && <p className="mt-1 text-muted-foreground">Note: {order.delivery.note}</p>}
            </div>
            {order.seller_orders.map((part) => (
              <section key={part.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{part.seller_name}</h3>
                  <OrderStatus status={part.status} />
                </div>
                {part.status_reason && <p className="mt-1 text-muted-foreground">Reason: {part.status_reason}</p>}
                <ul className="mt-3 space-y-2">
                  {part.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <ProductImage src={item.image_url} className="size-10 shrink-0 rounded-lg" />
                      <p className="min-w-0 flex-1 truncate">{item.product_name} <span className="text-muted-foreground">· {item.quantity} × {formatPrice(item.unit_price)}</span></p>
                      <p>{formatPrice(item.line_total)}</p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 border-t pt-3">
                  <dt className="text-muted-foreground">Shop's items</dt><dd>{formatPrice(part.subtotal)}</dd>
                  <dt className="text-muted-foreground">Muhuze commission ({Number(part.commission_rate)}%)</dt><dd>{formatPrice(part.commission_amount)}</dd>
                  <dt className="text-muted-foreground">Owed to the shop</dt><dd className="font-medium">{formatPrice(part.seller_amount)}</dd>
                </dl>
              </section>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
