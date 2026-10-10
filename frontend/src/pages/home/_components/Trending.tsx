import { ProductGrid } from '@/components/shared/ProductGrid'
import type { ProductSummary } from '@/types/product'

/** More of the newest listings, after the ones shown as tall cards. */
export function Trending({ products }: { products?: ProductSummary[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <ProductGrid products={products} empty="New listings will show up here." />
    </section>
  )
}
