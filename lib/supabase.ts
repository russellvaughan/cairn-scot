const ACCESS_TOKEN_KEY = 'cairn_access_token'
const REFRESH_TOKEN_KEY = 'cairn_refresh_token'
const USER_ID_KEY = 'cairn_user_id'

interface AuthUser {
  id: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  email?: string
}

interface SupabaseConfig {
  url: string
  key: string
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as
    | string
    | undefined

  if (!url || !key) return null

  return {
    url: url.replace(/\/+$/, ''),
    key,
  }
}

export function setStoredSession(accessToken?: string | null, refreshToken?: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId)
    return
  }
  localStorage.removeItem(USER_ID_KEY)
}

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export async function fetchAuthUser(accessToken?: string | null): Promise<AuthUser | null> {
  const token = accessToken || getStoredAccessToken()
  const config = getSupabaseConfig()

  if (!token || !config) return null

  try {
    const res = await fetch(`${config.url}/auth/v1/user`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) return null

    const payload = await res.json()
    return payload as AuthUser
  } catch {
    return null
  }
}

export async function supabaseSelect<T>(
  table: string,
  params: Record<string, string>,
  accessToken?: string | null
): Promise<T> {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Missing Supabase config')
  }

  const qs = new URLSearchParams(params)
  const token = accessToken || getStoredAccessToken()

  const res = await fetch(`${config.url}/rest/v1/${table}?${qs.toString()}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${token || config.key}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const message = payload?.message || payload?.error || payload?.hint || `Failed query: ${table}`
    throw new Error(message)
  }

  return (await res.json()) as T
}
