import { api, type Page } from '@/lib/api'
import type { Delivery, OrderItem, SellerOrderStatus } from '@/types/order'

/** A shop's part of a paid order, as its seller sees it in a list. */
export interface SellerOrderSummary {
  id: string
  order_number: string
  status: SellerOrderStatus
  subtotal: string
  /** What the seller earns from this order, after MUHUZE's commission. */
  seller_amount: string
  recipient_name: string
  created_at: string
}

export interface SellerOrder extends SellerOrderSummary {
  commission_rate: string
  commission_amount: string
  delivery: Delivery & { note: string | null }
  items: OrderItem[]
}

/** The steps a seller takes, in order: accept (or reject), ship, deliver. */
export type SellerOrderAction = 'accept' | 'reject' | 'ship' | 'deliver'

// A table page holds at most 100 rows: the backend's largest page.
export const getSellerOrders = () =>
  api<Page<SellerOrderSummary>>('/seller-orders/mine', { query: { page_size: 100 } })

export const getSellerOrder = (id: string) => api<SellerOrder>(`/seller-orders/mine/${id}`)

/** `reason` is required for a rejection; the buyer sees it. */
export const moveSellerOrder = ({ id, action, reason }: { id: string; action: SellerOrderAction; reason?: string }) =>
  api(`/seller-orders/mine/${id}/${action}`, { method: 'POST', json: reason ? { reason } : undefined })
