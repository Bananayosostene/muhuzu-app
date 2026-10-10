// Money is always a decimal string in RWF, e.g. "850000.00". Totals come from the backend, never from the cart.

export interface Delivery {
  recipient_name: string
  /** E.164, e.g. +250788123456. */
  recipient_phone: string
  province: string
  district: string
  sector: string
  address?: string
}

export interface OrderRequest {
  items: { product_id: string; quantity: number }[]
  delivery: Delivery
  note?: string
}

export type OrderStatus = 'awaiting_payment' | 'in_progress' | 'completed' | 'cancelled'

export type SellerOrderStatus =
  | 'awaiting_payment' | 'pending' | 'accepted' | 'shipped' | 'delivered' | 'completed' | 'rejected' | 'cancelled'

export interface OrderSummary {
  id: string
  order_number: string
  status: OrderStatus
  total_amount: string
  created_at: string
}

/** What was bought, as it was at checkout; the live product may have changed since. */
export interface OrderItem {
  id: string
  product_name: string
  unit_price: string
  quantity: number
  line_total: string
  image_url: string | null
}

/** One shop's part of an order, with its own status. */
interface SellerOrderPart {
  id: string
  seller_name: string
  status: SellerOrderStatus
  status_reason: string | null
  subtotal: string
  items: OrderItem[]
}

export interface Order extends OrderSummary {
  delivery: Delivery & { note: string | null }
  seller_orders: SellerOrderPart[]
}

/** One of MUHUZE's receiving accounts, shown to a buyer who has to pay. */
export interface PaymentDestination {
  id: string
  provider: string
  account_reference: string
  registered_name: string
  instructions: string | null
}

export interface PaymentAttempt {
  id: string
  status: 'awaiting_verification' | 'paid' | 'rejected'
  reference: string
  rejection_reason: string | null
  created_at: string
}

export interface PaymentInstructions {
  amount: string
  /** True only when a payment can be submitted now. */
  can_pay: boolean
  pay_to: PaymentDestination[]
  /** Newest first. */
  attempts: PaymentAttempt[]
}

export interface PaymentRequest {
  destination_id: string
  /** The transaction id from the payment confirmation message. */
  reference: string
  payer_phone: string
}
