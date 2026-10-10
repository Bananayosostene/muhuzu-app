import { api, type Page } from '@/lib/api'

// Money and rates are decimal strings: "10000.00" RWF, "7.50" percent.
// A table page holds at most 100 rows: the backend's largest page.
const all = { page_size: 100 }

/** A plan a seller can subscribe to: a price for a number of days, and the commission charged meanwhile. */
export interface Plan {
  id: string
  code: string
  name: string
  description: string | null
  price: string
  duration_days: number
  commission_rate: string
  /** A retired plan is no longer offered; subscriptions already made keep running. */
  status: 'active' | 'retired'
}

export interface PlanInput {
  name: string
  description: string | null
  price: string
  duration_days: number
  commission_rate: string
}

/**
 * `plan_name`, `price`, `duration_days` and `commission_rate` are what was agreed when it was requested;
 * they do not follow later edits to the plan.
 */
export interface Subscription {
  id: string
  seller_id: string
  plan_name: string
  price: string
  duration_days: number
  commission_rate: string
  /** There is no "expired": an `active` one applies only between its dates, see `is_applicable`. */
  status: 'pending' | 'active' | 'rejected' | 'cancelled'
  starts_at: string | null
  ends_at: string | null
  /** True only for the subscription in force right now. */
  is_applicable: boolean
  /** Why it was rejected or cancelled; shown to the seller. */
  status_reason: string | null
}

/** The commission a seller is charged now, and why. */
export interface Terms {
  /** Null when the seller has no plan and MUHUZE has not set a default rate. */
  commission_rate: string | null
  source: 'subscription' | 'default' | 'not_set'
  /** The subscription in force, when the rate comes from one. */
  subscription: Subscription | null
  /** Activated renewals that have not started yet. */
  upcoming: Subscription[]
  /** A plan request waiting for staff. */
  pending_request: Subscription | null
}

// ── Anyone: the plans on offer, cheapest first.
export const getOfferedPlans = () => api<Page<Plan>>('/seller-plans', { query: all })

// ── The seller.
export const getMyTerms = () => api<Terms>('/seller-subscriptions/mine/terms')

/** The request stays pending until staff confirm the payment made outside the app. */
export const requestPlan = (plan_id: string) => api('/seller-subscriptions/mine', { method: 'POST', json: { plan_id } })

export const withdrawRequest = (id: string) => api(`/seller-subscriptions/mine/${id}/withdraw`, { method: 'POST' })

// ── Staff: plans.
export const getAllPlans = () => api<Page<Plan>>('/seller-plans/manage', { query: all })

/** The code is the plan's permanent key: it can never be changed. */
export const createPlan = (json: PlanInput & { code: string }) => api('/seller-plans', { method: 'POST', json })

/** Editing a plan never changes a subscription that already exists. */
export const updatePlan = ({ id, ...json }: PlanInput & { id: string }) => api(`/seller-plans/${id}`, { method: 'PATCH', json })

export const movePlan = ({ id, step }: { id: string; step: 'retire' | 'reactivate' }) =>
  api(`/seller-plans/${id}/${step}`, { method: 'POST' })

/** Refused once a seller has subscribed to it: retire it instead. */
export const deletePlan = (id: string) => api(`/seller-plans/${id}`, { method: 'DELETE' })

// ── Staff: subscriptions.
export const getSubscriptions = () => api<Page<Subscription>>('/seller-subscriptions', { query: all })

interface Decision {
  id: string
  /** `activate` a pending request once its payment arrived; `reject` it; `cancel` a running or scheduled one. */
  step: 'activate' | 'reject' | 'cancel'
  /** Required to reject or cancel; the seller sees it. */
  reason?: string
  /** Optional, when activating: the transaction that paid for the plan. */
  payment_reference?: string
}

export const decideSubscription = ({ id, step, ...json }: Decision) =>
  api(`/seller-subscriptions/${id}/${step}`, { method: 'POST', json })
