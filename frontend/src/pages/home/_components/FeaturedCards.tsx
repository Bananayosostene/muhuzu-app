import { Link } from 'react-router'
import { ProductImage } from '@/components/shared/ProductGrid'
import type { ProductSummary } from '@/types/product'

/** The newest products as tall picture cards, in a row that scrolls sideways. */
export function FeaturedCards({ products }: { products: ProductSummary[] }) {
  if (!products.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="reveal -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="relative h-96 w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-muted shadow-sm transition hover:shadow-xl hover:shadow-primary/10"
          >
            <ProductImage src={product.main_image_url} className="size-full" />
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 to-transparent" />
            <h2 className="absolute inset-x-0 top-0 line-clamp-3 p-4 font-heading text-2xl leading-tight font-extrabold text-balance text-white">
              {product.name}
            </h2>
          </Link>
        ))}
      </div>
    </section>
  )
}
