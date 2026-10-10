import { ProductImage } from '@/components/shared/ProductGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { ProductSummary } from '@/types/product'

interface Props {
  /** Undefined while loading. */
  items?: ProductSummary[]
  /** Product id to how many are being ordered. */
  quantities: Record<string, number>
}

/** What is about to be ordered. */
export function OrderSummary({ items, quantities }: Props) {
  if (!items) return <Skeleton className="h-64 rounded-2xl" />

  return (
    <aside className="self-start rounded-2xl border bg-card p-6 lg:sticky lg:top-40">
      <h2 className="font-heading text-lg font-semibold">Your order</h2>
      <ul className="mt-4 space-y-3">
        {items.map((product) => (
          <li key={product.id} className="flex items-center gap-3">
            <ProductImage src={product.main_image_url} className="size-12 shrink-0 rounded-lg" />
            <p className="flex-1 text-sm"><span className="line-clamp-2">{product.name}</span><span className="text-muted-foreground">{quantities[product.id] ?? 1} × {formatPrice(product.price)}</span></p>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
        The total to pay is confirmed once the order is placed. You then pay Muhuze with mobile money or a bank transfer, outside the app.
      </p>
    </aside>
  )
}
