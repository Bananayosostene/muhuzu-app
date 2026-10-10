import { ChevronRight, PackageSearch } from 'lucide-react'
import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { ProductSummary } from '@/types/product'

const grid = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
const PANEL_SIZE = 4
const titles = ['Fresh picks', 'More to explore', 'Keep browsing', 'You may also like']

/** Listings as panels of four pictures. Pass `undefined` while loading. */
export function ProductGrid({ products, empty }: { products?: ProductSummary[]; empty: string }) {
  if (!products) {
    return (
      <div className={grid}>
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-4/5 rounded-2xl" />)}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed py-20 text-muted-foreground">
        <PackageSearch className="size-10" />
        <p>{empty}</p>
      </div>
    )
  }

  const panels = Array.from({ length: Math.ceil(products.length / PANEL_SIZE) }, (_, index) =>
    products.slice(index * PANEL_SIZE, (index + 1) * PANEL_SIZE))

  return (
    <div className={`${grid} stagger`}>
      {panels.map((items, index) => (
        <section key={items[0].id} className="rounded-2xl border bg-card p-4">
          <Link to="/products" className="mb-3 flex items-center justify-between gap-2 hover:text-primary">
            <h3 className="font-heading text-lg leading-tight font-bold">{titles[index % titles.length]}</h3>
            <ChevronRight className="size-5 shrink-0" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            {items.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group min-w-0">
                <ProductImage src={product.main_image_url} className="aspect-square w-full rounded-xl" />
                <p className="mt-1.5 truncate text-sm group-hover:text-primary">{product.name}</p>
                <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** A product picture, or a plain block for a product that has none. */
export function ProductImage({ src, className }: { src: string | null; className: string }) {
  if (!src) return <div className={`bg-muted ${className}`} />
  return <img src={src} alt="" width={320} height={320} loading="lazy" className={`bg-muted object-cover ${className}`} />
}
