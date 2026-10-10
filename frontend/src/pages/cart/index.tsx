import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { ProductImage } from '@/components/shared/ProductGrid'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MAX_QUANTITY, useCart } from '@/hooks/use-cart'
import { useProductsByIds } from '@/hooks/use-products'
import { formatPrice } from '@/lib/format'

export default function Cart() {
  const { ids, quantities, toggle, setQuantity } = useCart()
  // Products that left the sale since they were added simply do not come back.
  const items = useProductsByIds(ids)
  // An estimate from today's prices: the backend works out the real total when the order is placed.
  const estimate = items?.reduce((sum, product) => sum + Number(product.price) * (quantities[product.id] ?? 1), 0)

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-6 animate-rise font-heading text-3xl font-bold">My cart</h1>
      {!items && <Skeleton className="h-64 rounded-2xl" />}
      {items?.length === 0 && (
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed py-20 text-muted-foreground">
          <ShoppingCart className="size-10" />
          <p>Your cart is empty.</p>
          <Link to="/products" className={buttonVariants({ className: 'rounded-full' })}>Browse listings</Link>
        </div>
      )}
      {items && items.length > 0 && (
        <>
          <ul className="stagger divide-y rounded-2xl border bg-card">
            {items.map((product) => {
              const quantity = quantities[product.id] ?? 1
              return (
                <li key={product.id} className="flex flex-wrap items-center gap-4 p-4">
                  <ProductImage src={product.main_image_url} className="size-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${product.id}`} className="line-clamp-1 font-medium hover:text-primary">{product.name}</Link>
                    <p className="text-xs text-muted-foreground">Sold by {product.shop.name}</p>
                    <p className="mt-1 font-heading font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon-sm" aria-label={`One less ${product.name}`} disabled={quantity <= 1} onClick={() => setQuantity(product.id, quantity - 1)}>
                      <Minus />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums" aria-label="Quantity">{quantity}</span>
                    <Button variant="outline" size="icon-sm" aria-label={`One more ${product.name}`} disabled={quantity >= MAX_QUANTITY} onClick={() => setQuantity(product.id, quantity + 1)}>
                      <Plus />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${product.name}`} onClick={() => toggle(product.id)}>
                    <Trash2 />
                  </Button>
                </li>
              )
            })}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
            <div>
              <p className="text-muted-foreground">
                Estimated total <span className="ml-2 font-heading text-2xl font-extrabold text-foreground">{formatPrice(estimate ?? 0)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Confirmed when you place the order. Delivery is arranged with each seller.</p>
            </div>
            <Link to="/checkout" className={buttonVariants({ size: 'lg', className: 'h-12 rounded-full px-8 text-base' })}>
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
