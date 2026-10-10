import { api, type Page } from '@/lib/api'
import type { Order, OrderRequest, OrderSummary, PaymentInstructions, PaymentRequest } from '@/types/order'

// The buyer's side: every path reaches only the caller's own orders.

export const createOrder = (json: OrderRequest) => api<Order>('/orders', { method: 'POST', json })

export const getMyOrders = (page: number) => api<Page<OrderSummary>>('/orders/mine', { query: { page } })

export const getMyOrder = (id: string) => api<Order>(`/orders/mine/${id}`)

export const cancelOrder = (id: string) => api<Order>(`/orders/mine/${id}/cancel`, { method: 'POST', json: {} })

export const confirmReceipt = ({ orderId, sellerOrderId }: { orderId: string; sellerOrderId: string }) =>
  api<Order>(`/orders/mine/${orderId}/seller-orders/${sellerOrderId}/confirm-receipt`, { method: 'POST' })

/** How to pay, and what has been submitted so far. */
export const getPayment = (orderId: string) => api<PaymentInstructions>(`/orders/mine/${orderId}/payment`)

/** "I have paid": staff still have to confirm it before the order is released. */
export const submitPayment = ({ orderId, ...json }: PaymentRequest & { orderId: string }) =>
  api(`/orders/mine/${orderId}/payment`, { method: 'POST', json })
