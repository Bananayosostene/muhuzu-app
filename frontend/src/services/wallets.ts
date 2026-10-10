import { api, type Page } from '@/lib/api'

// Everything here is read-only: balances change only when a payment is confirmed or an order moves.
// Money is a decimal string in RWF.

/** What MUHUZE owes a shop. Not money the seller already holds: that only happens through a withdrawal. */
export interface Wallet {
  /** Paid sales the buyer has not confirmed receiving yet; cannot be withdrawn. */
  pending_balance: string
  /** Sales the buyer confirmed; can be withdrawn. */
  available_balance: string
  /** Everything earned so far, less what was reversed. */
  total_earned: string
  total_withdrawn: string
}

export const movementKinds = {
  earning: 'Sale paid',
  settlement: 'Buyer confirmed receipt',
  reversal: 'Sale undone',
  withdrawal: 'Withdrawal requested',
  withdrawal_release: 'Withdrawal returned',
  withdrawal_complete: 'Withdrawal paid out',
}

/** One line of the wallet's ledger. The changes are signed; `*_after` is the balance once applied. */
export interface Movement {
  id: string
  kind: keyof typeof movementKinds
  pending_change: string
  available_change: string
  pending_after: string
  available_after: string
  created_at: string
}

// A table page holds at most 100 rows: the backend's largest page.
const table = { page_size: 100 }

// ── The seller's own wallet. A shop with no sales yet gets zeros, not an error.

export const getMyWallet = () => api<Wallet>('/wallet/mine')

export const getMyMovements = () => api<Page<Movement>>('/wallet/mine/transactions', { query: table })

// ── Staff.

/** Any seller's balances. */
export const getSellerWallet = (sellerId: string) => api<Wallet>(`/wallets/${sellerId}`)

/** One shop's part of one paid order: what the buyer paid and how it is split. */
export interface RevenueRecord {
  id: string
  seller_id: string
  gross_amount: string
  commission_rate: string
  /** MUHUZE's income from the sale. */
  commission_amount: string
  /** What MUHUZE owes the seller for it. */
  seller_amount: string
  /** Set if the sale was undone. */
  reversed_at: string | null
  created_at: string
}

/** Totals over sales that were not reversed. Subscription income is not included. */
export interface RevenueSummary {
  sales: number
  gross_amount: string
  commission_amount: string
  seller_amount: string
}

export const getRevenue = () => api<Page<RevenueRecord>>('/revenue', { query: table })

export const getRevenueSummary = () => api<RevenueSummary>('/revenue/summary')
