import { api, type Page } from '@/lib/api'

/** A payment a buyer says they made, as staff see it. */
export interface StaffPayment {
  id: string
  order_number: string
  status: 'awaiting_verification' | 'paid' | 'rejected'
  amount: string
  /** The transaction id the buyer copied from their confirmation message. */
  reference: string
  destination_provider: string
  destination_account_reference: string
  payer_name: string | null
  payer_phone: string | null
  rejection_reason: string | null
  created_at: string
}

// Longest-waiting first. A table page holds at most 100 rows: the backend's largest page.
export const getPayments = () => api<Page<StaffPayment>>('/payments', { query: { page_size: 100 } })

/** The money arrived: marks the payment paid and releases the order to its sellers. */
export const approvePayment = (id: string) => api(`/payments/${id}/approve`, { method: 'POST' })

/** The money did not arrive; the buyer sees the reason and may submit again. */
export const rejectPayment = ({ id, reason }: { id: string; reason: string }) =>
  api(`/payments/${id}/reject`, { method: 'POST', json: { reason } })

// ── MUHUZE's own receiving accounts: where buyers send the money. They are data, never written in code.

export const paymentMethods = { mobile_money: 'Mobile money', merchant_code: 'Merchant code', bank_transfer: 'Bank transfer' }
export type PaymentMethod = keyof typeof paymentMethods

export interface DestinationInput {
  method: PaymentMethod
  /** The network or bank, as buyers know it. */
  provider: string
  /** The phone number, merchant code or account number to pay. */
  account_reference: string
  /** The name buyers see when they pay, to check they have the right account. */
  registered_name: string
  instructions: string | null
}

export interface Destination extends DestinationInput {
  id: string
  /** Only active accounts are shown to buyers. */
  is_active: boolean
  /** Shown first. At most one. */
  is_default: boolean
}

export const getDestinations = () => api<Page<Destination>>('/payment-destinations', { query: { page_size: 100 } })

export const createDestination = (json: DestinationInput) => api('/payment-destinations', { method: 'POST', json })

export const updateDestination = ({ id, ...json }: DestinationInput & { id: string }) =>
  api(`/payment-destinations/${id}`, { method: 'PATCH', json })

/** Refused once a payment has used the account: deactivate it instead. */
export const deleteDestination = (id: string) => api(`/payment-destinations/${id}`, { method: 'DELETE' })

export const moveDestination = ({ id, step }: { id: string; step: 'activate' | 'deactivate' | 'set-default' }) =>
  api(`/payment-destinations/${id}/${step}`, { method: 'POST' })
