import { api, type Page } from '@/lib/api'
import type { Order, OrderStatus, OrderSummary } from '@/types/order'

/** Any order in full: each shop's part also shows how its money is split. */
export interface StaffOrder extends Order {
  seller_orders: (Order['seller_orders'][number] & {
    commission_rate: string
    /** MUHUZE's share. */
    commission_amount: string
    /** The shop's share. */
    seller_amount: string
  })[]
}

/** Every order, whatever its status. A table page holds at most 100 rows: the backend's largest page. */
export const getAllOrders = (status: OrderStatus | '') =>
  api<Page<OrderSummary>>('/orders', { query: { status, page_size: 100 } })

export const getStaffOrder = (id: string) => api<StaffOrder>(`/orders/${id}`)
