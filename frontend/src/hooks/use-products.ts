import { useQueries, useQuery } from '@tanstack/react-query'
import { getProduct, getProducts } from '@/services/products'
import type { ProductFilters } from '@/types/product'

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({ queryKey: ['products', filters], queryFn: () => getProducts(filters) })

/** The saved products (cart, wishlist) that are still on sale; `undefined` while loading. */
export function useProductsByIds(ids: string[]) {
  const results = useQueries({
    queries: ids.map((id) => ({ queryKey: ['product', id], queryFn: () => getProduct(id), retry: false })),
  })
  if (results.some((result) => result.isPending)) return undefined
  return results.flatMap((result) => result.data ?? [])
}
