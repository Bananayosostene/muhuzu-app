import { api, type Page } from '@/lib/api'
import type { AttributeInput, Category, CategoryInput, CategorySummary } from '@/types/category'

/** A shop's active categories, for buyers. Fails with 404 when the shop is not open. */
export const getShopCategories = (sellerId: string) =>
  api<Page<CategorySummary>>(`/sellers/${sellerId}/categories`, { query: { page_size: 100 } })

// ── The seller's own categories. Another shop's category behaves as if it did not exist.

export const getMyCategories = () => api<Page<CategorySummary>>('/categories/mine', { query: { page_size: 100 } })

/** One category with all its attributes and options. */
export const getCategory = (id: string) => api<Category>(`/categories/${id}`)

export const createCategory = (json: CategoryInput) => api<Category>('/categories', { method: 'POST', json })

export const updateCategory = ({ id, ...json }: Partial<CategoryInput> & { id: string; is_active?: boolean }) =>
  api<Category>(`/categories/${id}`, { method: 'PATCH', json })

/** Refused while the category still has products: switch it off instead. */
export const deleteCategory = (id: string) => api(`/categories/${id}`, { method: 'DELETE' })

export const addAttribute = ({ categoryId, ...json }: AttributeInput & { categoryId: string }) =>
  api(`/categories/${categoryId}/attributes`, { method: 'POST', json })

/** Refused once products have values for it: switch it off instead. */
export const deleteAttribute = ({ categoryId, id }: { categoryId: string; id: string }) =>
  api(`/categories/${categoryId}/attributes/${id}`, { method: 'DELETE' })

export const setAttributeActive = ({ categoryId, id, is_active }: { categoryId: string; id: string; is_active: boolean }) =>
  api(`/categories/${categoryId}/attributes/${id}`, { method: 'PATCH', json: { is_active } })
