import { api, type Page } from '@/lib/api'
import type { OwnProduct, OwnProductSummary, ProductInput, ProductStatus } from '@/types/product'

// A table page holds at most 100 rows: the backend's largest page.
const table = (status: ProductStatus | '') => ({ query: { status, page_size: 100 } })

// ── The seller's own products. Another shop's product behaves as if it did not exist.

export const getMyProducts = (status: ProductStatus | '') => api<Page<OwnProductSummary>>('/products/mine', table(status))

/** With `publish_blockers`: what still stops it going on sale. */
export const getMyProduct = (id: string) => api<OwnProduct>(`/products/mine/${id}`)

/** Creates a draft. It goes on sale only when published. */
export const createProduct = (json: ProductInput) => api<OwnProduct>('/products', { method: 'POST', json })

export const updateProduct = ({ id, ...json }: ProductInput & { id: string }) =>
  api<OwnProduct>(`/products/mine/${id}`, { method: 'PATCH', json })

/** Only a draft that was never published can be deleted; anything else is archived instead. */
export const deleteProduct = (id: string) => api(`/products/mine/${id}`, { method: 'DELETE' })

/** `publish` puts it on sale (it must be complete); `archive` takes it off. */
export const moveProduct = ({ id, step }: { id: string; step: 'publish' | 'archive' }) =>
  api<OwnProduct>(`/products/mine/${id}/${step}`, { method: 'POST' })

/** JPEG or PNG, up to 5 MB; a product holds at most 8. */
export function addProductImage({ id, file }: { id: string; file: File }) {
  const form = new FormData()
  form.set('file', file)
  return api<OwnProduct>(`/products/mine/${id}/images`, { method: 'POST', form })
}

export const removeProductImage = ({ id, imageId }: { id: string; imageId: string }) =>
  api<OwnProduct>(`/products/mine/${id}/images/${imageId}`, { method: 'DELETE' })

/** Every image of the product exactly once; the first becomes the main picture. */
export const orderProductImages = ({ id, image_ids }: { id: string; image_ids: string[] }) =>
  api<OwnProduct>(`/products/mine/${id}/images/order`, { method: 'PUT', json: { image_ids } })

// ── Staff moderation: every shop's products, in any status.

export const getAllProducts = (status: ProductStatus | '') => api<Page<OwnProductSummary>>('/products/moderation', table(status))

/** `hide` removes it for buyers at once and stops its seller publishing it; `restore` undoes that. */
export const moderateProduct = ({ id, step }: { id: string; step: 'hide' | 'restore' }) =>
  api(`/products/moderation/${id}/${step}`, { method: 'POST' })
