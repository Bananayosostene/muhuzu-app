import { api, ApiError, type Page } from '@/lib/api'

/** The commission charged to sellers who have no plan. `rate` is a percentage as a decimal string, e.g. "10.00". */
export interface DefaultRate {
  id: string
  rate: string
  effective_from: string
  note: string | null
  /** True for the rate in force right now. */
  is_current: boolean
}

/** `null` until staff set one; no order can be placed before that. */
export async function getDefaultRate(): Promise<DefaultRate | null> {
  try {
    return await api<DefaultRate>('/commission-rates/default')
  } catch (error) {
    // The backend answers 422 "MUHUZE has not set its commission rate yet".
    if (error instanceof ApiError && error.status === 422) return null
    throw error
  }
}

/** Every rate ever set, newest first. */
export const getRateHistory = () => api<Page<DefaultRate>>('/commission-rates/default/history', { query: { page_size: 100 } })

/** Takes effect now. Setting a rate adds a row: it never edits an earlier one, nor orders already placed. */
export const setDefaultRate = (json: { rate: string; note?: string }) =>
  api('/commission-rates/default', { method: 'POST', json })
