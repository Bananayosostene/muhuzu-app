import { api, ApiError, type Page } from '@/lib/api'
import type { DocumentType, Seller, SellerApplication, SellerStatus, SellerSummary } from '@/types/seller'

// ── The caller's own application. An account has at most one, forever.

/** `null` when the caller has never applied. */
export async function getMySeller(): Promise<Seller | null> {
  try {
    return await api<Seller>('/sellers/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export const applyAsSeller = (json: SellerApplication) => api<Seller>('/sellers/me', { method: 'POST', json })

/** Allowed only while the application is a draft or was rejected. */
export const updateMySeller = (json: SellerApplication) => api<Seller>('/sellers/me', { method: 'PATCH', json })

/** JPEG, PNG or PDF, up to 5 MB. Uploading again replaces the file. */
export function uploadMyDocument({ type, file }: { type: DocumentType; file: File }) {
  const form = new FormData()
  form.set('file', file)
  return api<Seller>(`/sellers/me/documents/${type}`, { method: 'PUT', form })
}

export const removeMyDocument = (type: DocumentType) =>
  api<Seller>(`/sellers/me/documents/${type}`, { method: 'DELETE' })

export const getMyDocumentUrl = (type: DocumentType) =>
  api<{ url: string }>(`/sellers/me/documents/${type}/url`)

/** `submit` sends the application for review; `deactivate` and `reactivate` close and reopen an approved shop. */
export const moveMySeller = (step: 'submit' | 'deactivate' | 'reactivate') =>
  api<Seller>(`/sellers/me/${step}`, { method: 'POST' })

// ── Staff.

// A table page holds at most 100 rows: the backend's largest page.
export const getSellers = (status: SellerStatus | '') =>
  api<Page<SellerSummary>>('/sellers', { query: { status, page_size: 100 } })

export const getSeller = (id: string) => api<Seller>(`/sellers/${id}`)

export const getDocumentUrl = ({ id, type }: { id: string; type: DocumentType }) =>
  api<{ url: string }>(`/sellers/${id}/documents/${type}/url`)

/** Rejecting and suspending need a reason (5 to 500 characters) that the seller sees. */
export const reviewSeller = ({ id, step, reason }: { id: string; step: 'approve' | 'reject' | 'suspend' | 'reinstate'; reason?: string }) =>
  api<Seller>(`/sellers/${id}/${step}`, { method: 'POST', json: reason ? { reason } : undefined })
