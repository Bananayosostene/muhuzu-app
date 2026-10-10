// In development Vite proxies `/api` to the backend (vite.config.ts), so no CORS setup is needed.
const BASE: string = import.meta.env.VITE_API_URL ?? '/api/v1'
const REFRESH_KEY = 'refresh-token'

/** Every backend response, success or error, has this shape. */
interface Envelope<T> {
  data: T
  /** Written for people: safe to show as it is. */
  message: string
}

export interface Page<T> {
  items: T[]
  page: number
  total: number
  total_pages: number
}

interface Tokens {
  access_token: string
  refresh_token: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// The access token lives in memory only; the refresh token survives a reload.
let accessToken: string | null = null

export const hasRefreshToken = () => localStorage.getItem(REFRESH_KEY) !== null
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export function setTokens(tokens: Tokens | null) {
  accessToken = tokens?.access_token ?? null
  if (tokens) localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  else localStorage.removeItem(REFRESH_KEY)
}

async function read<T>(res: Response): Promise<T> {
  const body: Envelope<T> | null = await res.json().catch(() => null)
  if (!body) throw new ApiError('The server could not be reached. Please try again.', res.status)
  if (!res.ok) throw new ApiError(body.message, res.status)
  return body.data
}

let refreshing: Promise<boolean> | null = null

// Each refresh replaces the refresh token, and the backend treats a second use of an old one as theft
// and ends every session. So only one refresh runs at a time: in this tab through `refreshing`,
// across tabs through a lock, always with the newest stored token.
function refresh() {
  refreshing ??= navigator.locks
    .request('refresh-token', async () => {
      const token = getRefreshToken()
      if (!token) return false
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token }),
      })
      if (!res.ok) {
        setTokens(null)
        return false
      }
      setTokens(await read<Tokens>(res))
      return true
    })
    .finally(() => { refreshing = null })
  return refreshing
}

interface Options {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Sent as the JSON body. */
  json?: object
  /** Sent as a multipart body (file uploads). */
  form?: FormData
  /** Added to the URL; empty values are left out. */
  query?: object
}

function send(path: string, { method, json, form, query }: Options) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return fetch(`${BASE}${path}${params.size ? `?${params}` : ''}`, {
    method,
    body: form ?? (json && JSON.stringify(json)),
    headers: {
      ...(json && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  })
}

/** Calls the backend and returns the `data` of its envelope; throws `ApiError` with the backend's message. */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  if (!accessToken && hasRefreshToken()) await refresh()
  let res = await send(path, options)
  if (res.status === 401 && hasRefreshToken() && await refresh()) res = await send(path, options)
  return read<T>(res)
}
