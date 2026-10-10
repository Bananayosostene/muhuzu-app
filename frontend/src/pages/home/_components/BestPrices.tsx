import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { ProductImage } from '@/components/shared/ProductGrid'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import type { ProductSummary } from '@/types/product'

/** The lowest-priced products as round pictures in a row, with arrows to move through it. */
export function BestPrices({ products }: { products: ProductSummary[] }) {
  const row = useRef<HTMLUListElement>(null)
  const move = (direction: 1 | -1) =>
    row.current?.scrollBy({ left: direction * row.current.clientWidth * 0.8, behavior: 'smooth' })

  if (!products.length) return null

  return (
    <section className="reveal bg-muted py-10">
      <h2 className="mb-6 text-center text-xs tracking-[0.2em] text-muted-foreground uppercase">Best prices on Muhuze</h2>
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4">
        <Button variant="ghost" size="icon-lg" aria-label="Previous products" className="hidden shrink-0 rounded-full sm:inline-flex" onClick={() => move(-1)}>
          <ArrowLeft />
        </Button>
        <ul ref={row} className="flex flex-1 snap-x gap-6 overflow-x-auto [scrollbar-width:none]">
          {products.map((product) => (
            <li key={product.id} className="w-36 shrink-0 snap-start text-center md:w-44">
              <Link to={`/products/${product.id}`} className="group block">
                <ProductImage src={product.main_image_url} className="aspect-square w-full rounded-full shadow-sm" />
                <p className="mt-4 truncate text-sm font-medium group-hover:text-primary">{product.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="icon-lg" aria-label="Next products" className="hidden shrink-0 rounded-full sm:inline-flex" onClick={() => move(1)}>
          <ArrowRight />
        </Button>
      </div>
    </section>
  )
}
