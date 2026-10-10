import { api, type Page } from '@/lib/api'
import type { Product, ProductFilters, ProductSummary } from '@/types/product'

/** Products on sale across every open shop. */
export const getProducts = (query: ProductFilters = {}) =>
  api<Page<ProductSummary>>('/products', { query })

/** Fails with 404 "Product not found" when the product is not on sale right now. */
export const getProduct = (id: string) => api<Product>(`/products/${id}`)
