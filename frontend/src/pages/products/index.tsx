import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/use-products'
import { getShopCategories } from '@/services/categories'

export default function Products() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const seller_id = params.get('seller_id') ?? ''
  const category_id = params.get('category_id') ?? ''
  const sortParam = params.get('sort')
  const sort = sortParam === 'price' || sortParam === '-price' ? sortParam : undefined
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data } = useProducts({ q, seller_id, category_id, sort, page })
  // Categories belong to a shop, so they are offered once one shop is being browsed.
  const { data: categories } = useQuery({
    queryKey: ['shop-categories', seller_id],
    queryFn: () => getShopCategories(seller_id),
    enabled: seller_id !== '',
    retry: false,
  })

  const heading = q ? `Results for "${q}"` : seller_id ? 'Listings from this shop' : 'Explore the marketplace'
  /** Changes one filter and goes back to the first page; an empty value removes it. */
  const set = (name: string, value: string) => setParams((current) => {
    if (value) current.set(name, value)
    else current.delete(name)
    if (name !== 'page') current.delete('page')
    return current
  })

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="mb-6 animate-rise">
        <h1 className="font-heading text-3xl font-bold">{heading}</h1>
        <p className="text-muted-foreground">{data ? `${data.total} listings` : 'Loading listings...'}</p>
      </div>
      {categories && categories.items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ id: '', name: 'Everything' }, ...categories.items].map((category) => (
            <Button
              key={category.id}
              variant={category.id === category_id ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => set('category_id', category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}
      <ProductGrid key={`${q}-${seller_id}-${category_id}-${sort}-${page}`} products={data?.items} empty="No listings match your search." />
      {data && data.total_pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Button variant="outline" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</Button>
          Page {data.page} of {data.total_pages}
          <Button variant="outline" disabled={page >= data.total_pages} onClick={() => set('page', String(page + 1))}>Next</Button>
        </div>
      )}
    </main>
  )
}
