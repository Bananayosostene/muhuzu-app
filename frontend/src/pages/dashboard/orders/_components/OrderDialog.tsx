import { ProductImage } from '@/components/shared/ProductGrid'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { SellerOrder } from '@/services/seller-orders'

/** What to send, where to deliver it, and what the shop earns. `order` is undefined while it loads. */
export function OrderDialog({ order, open, onClose }: { order?: SellerOrder; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{order ? `Order ${order.order_number}` : 'Order'}</DialogTitle>
          <DialogDescription>Deliver these items to the address below.</DialogDescription>
        </DialogHeader>
        {!order && <Skeleton className="h-48 rounded-xl" />}
        {order && (
          <div className="grid gap-4 text-sm">
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <ProductImage src={item.image_url} className="size-12 shrink-0 rounded-lg" />
                  <p className="min-w-0 flex-1"><span className="line-clamp-1">{item.product_name}</span><span className="text-muted-foreground">{item.quantity} × {formatPrice(item.unit_price)}</span></p>
                  <p className="font-medium">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border p-3">
              <p className="font-medium">{order.delivery.recipient_name} · {order.delivery.recipient_phone}</p>
              <p className="text-muted-foreground">{[order.delivery.address, order.delivery.sector, order.delivery.district, order.delivery.province].filter(Boolean).join(', ')}</p>
              {order.delivery.note && <p className="mt-1 text-muted-foreground">Note: {order.delivery.note}</p>}
            </div>
            <dl className="grid grid-cols-[1fr_auto] gap-y-1">
              <dt className="text-muted-foreground">Items total</dt><dd>{formatPrice(order.subtotal)}</dd>
              <dt className="text-muted-foreground">Muhuze commission ({order.commission_rate}%)</dt><dd>−{formatPrice(order.commission_amount)}</dd>
              <dt className="font-medium">You earn</dt><dd className="font-medium text-primary">{formatPrice(order.seller_amount)}</dd>
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
