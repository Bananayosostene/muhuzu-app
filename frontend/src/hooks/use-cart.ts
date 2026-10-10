import { useSyncExternalStore } from 'react'

// The backend has no cart: it lives on this device as product id -> quantity, and checkout sends it whole.
const KEY = 'cart-items'
/** The backend accepts 1 to 999 of a product per order. */
export const MAX_QUANTITY = 999

const listeners = new Set<() => void>()
const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
let items: Record<string, number> = {}
if (saved && typeof saved === 'object') {
  for (const [id, quantity] of Object.entries(saved)) if (typeof quantity === 'number') items[id] = quantity
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function set(next: Record<string, number>) {
  items = next
  localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((listener) => listener())
}

/** Adds one of the product, or takes it out when it is already there. */
function toggle(id: string) {
  const { [id]: present, ...rest } = items
  set(present ? rest : { ...items, [id]: 1 })
}

const setQuantity = (id: string, quantity: number) =>
  set({ ...items, [id]: Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity) || 1)) })

const clear = () => set({})

export function useCart() {
  const quantities = useSyncExternalStore(subscribe, () => items)
  return { quantities, ids: Object.keys(quantities), toggle, setQuantity, clear }
}
