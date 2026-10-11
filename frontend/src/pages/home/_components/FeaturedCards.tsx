import Autoplay from 'embla-carousel-autoplay'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { Link } from 'react-router'
import { ProductImage } from '@/components/shared/ProductGrid'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import type { ProductSummary } from '@/types/product'

// Moves one card every few seconds, pausing while the pointer is over the row.
// People who asked their device for less motion get the arrows only.
// The row can also be moved by hand: a finger swipe on a phone, a mouse drag, or a sideways scroll
// (trackpad, or Shift + mouse wheel). A plain up-and-down wheel still scrolls the page.
const plugins = [
  WheelGesturesPlugin(),
  ...(matchMedia('(prefers-reduced-motion: reduce)').matches ? [] : [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]),
]

// A tall tab in the primary colour with a thin chevron. Each sits just outside the row with its straight side against
// the nearest card and its rounded side facing out: "previous" at the top left, "next" at the bottom right.
// The trailing ! makes these win over the carousel's own size, shape and position.
const arrow = 'h-20! w-9! border-0 bg-primary! text-primary-foreground! shadow-md hover:bg-primary/90! hover:shadow-lg [&_svg]:size-7! [&_svg]:stroke-[1.25]'

/**
 * The newest products as tall picture cards in an endless row: after the last card comes the first again,
 * so it only ever moves forward (1 2 3 4 5, then 2 3 4 5 6, ... then 4 5 6 7 1).
 */
export function FeaturedCards({ products }: { products: ProductSummary[] }) {
  if (!products.length) return null

  // The side padding leaves room for the arrow tabs outside the cards.
  return (
    <section className="mx-auto max-w-7xl px-10 py-10">
      <Carousel opts={{ loop: true, align: 'start' }} plugins={plugins} className="reveal">
        <CarouselContent className="-ml-3">
          {products.map((product) => (
            <CarouselItem key={product.id} className="basis-1/2 pl-3 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Link
                to={`/products/${product.id}`}
                className="relative block h-96 overflow-hidden rounded-2xl bg-muted shadow-sm transition hover:shadow-xl hover:shadow-primary/10"
              >
                <ProductImage src={product.main_image_url} className="size-full" />
                <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 to-transparent" />
                <h2 className="absolute inset-x-0 top-0 line-clamp-3 p-4 font-heading text-2xl leading-tight font-extrabold text-balance text-white">
                  {product.name}
                </h2>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={`top-0! right-full! bottom-auto! left-auto! my-0! rounded-l-xl! rounded-r-none! ${arrow}`} />
        <CarouselNext className={`top-auto! right-auto! bottom-0! left-full! my-0! rounded-l-none! rounded-r-xl! ${arrow}`} />
      </Carousel>
    </section>
  )
}
