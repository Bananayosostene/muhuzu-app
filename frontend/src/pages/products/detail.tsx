import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { CartButton } from '@/components/shared/CartButton'
import { WishlistButton } from '@/components/shared/WishlistButton'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import NotFound from '@/pages/not-found'
import { getProduct } from '@/services/products'
import type { ProductAttribute } from '@/types/product'
import { Gallery } from './_components/Gallery'
import { SellerCard } from './_components/SellerCard'

/** A value as text: "256 GB", "Black", "NFC, 5G", "Yes". */
function text({ value, unit }: ProductAttribute) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map((option) => option.value).join(', ')
  if (value !== null && typeof value === 'object') return value.value
  return unit ? `${value} ${unit}` : String(value)
}

export default function ProductDetail() {
  const id = useParams().id ?? ''
  const { data: product, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    retry: false,
  })

  if (isError) return <NotFound />
  if (!product) {
    return (
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </main>
    )
  }

  const details = product.attributes.filter((attribute) => attribute.value !== null)

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 md:grid-cols-2">
      <div className="relative animate-rise self-start">
        <Gallery key={product.id} images={product.images} alt={product.name} />
        <WishlistButton id={product.id} className="absolute top-4 right-4 size-11" />
      </div>
      <div className="flex animate-rise flex-col gap-5 [animation-delay:120ms]">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{product.name}</h1>
        <p className="font-heading text-3xl font-extrabold text-primary">{formatPrice(product.price)}</p>
        {product.description && <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{product.description}</p>}
        {details.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl border bg-card p-4 text-sm">
            {details.map((attribute) => (
              <div key={attribute.code} className="contents">
                <dt className="text-muted-foreground">{attribute.name}</dt>
                <dd className="font-medium">{text(attribute)}</dd>
              </div>
            ))}
          </dl>
        )}
        <SellerCard shop={product.shop} />
        <CartButton id={product.id} className="h-12 text-base shadow-lg shadow-primary/30" />
      </div>
    </main>
  )
}
