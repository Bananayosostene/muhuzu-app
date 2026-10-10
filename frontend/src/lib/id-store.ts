import { useSyncExternalStore } from 'react'

/** A list of product ids kept on this device (the backend has no wishlist). */
export function createIdStore(key: string) {
  const listeners = new Set<() => void>()
  const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
  // Ids were numbers while the app ran on demo data; those are dropped.
  let ids = Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : []

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function set(next: string[]) {
    ids = next
    localStorage.setItem(key, JSON.stringify(ids))
    listeners.forEach((listener) => listener())
  }
  const toggle = (id: string) => set(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  const clear = () => set([])

  return function useIds() {
    const current = useSyncExternalStore(subscribe, () => ids)
    return { ids: current, toggle, clear }
  }
}
