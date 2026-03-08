import { readEnv } from './env.js'

export function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function normalizeEmail(value: string): string {
  return normalizeText(value).toLowerCase()
}

export function parseBearerToken(req: Request | any): string {
  if (typeof req?.headers?.get === 'function') {
    const authHeader = String(req.headers.get('authorization') || '')
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  }

  const authHeader = String(req?.headers?.authorization || req?.headers?.Authorization || '')
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
}

export function getSupabaseServerConfig() {
  const supabaseUrl = (readEnv('SUPABASE_URL') || '').replace(/\/+$/, '')
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY') || ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return { supabaseUrl, serviceRoleKey }
}

export async function supabaseAdminRequest(
  supabaseUrl: string,
  serviceRoleKey: string,
  path: string,
  init: RequestInit = {}
) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${body}`)
  }

  return response
}

export async function supabaseAdminSelect<T>(
  supabaseUrl: string,
  serviceRoleKey: string,
  table: string,
  params: Record<string, string>
): Promise<T> {
  const query = new URLSearchParams(params)
  const response = await supabaseAdminRequest(
    supabaseUrl,
    serviceRoleKey,
    `/rest/v1/${table}?${query.toString()}`
  )
  return (await response.json()) as T
}

export async function authUserFromToken(
  supabaseUrl: string,
  serviceRoleKey: string,
  accessToken: string
) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) return null
  return await response.json()
}

export async function getRequesterProfile(
  supabaseUrl: string,
  serviceRoleKey: string,
  accessToken: string
): Promise<{ id: string; role: string; school_id: string | null; email: string } | null> {
  const authUser = await authUserFromToken(supabaseUrl, serviceRoleKey, accessToken)
  if (!authUser?.id) return null

  const users = await supabaseAdminSelect<Array<{ id: string; role: string; school_id: string | null; email: string }>>(
    supabaseUrl,
    serviceRoleKey,
    'users',
    {
      select: 'id,role,school_id,email',
      id: `eq.${authUser.id}`,
      limit: '1',
    }
  )

  return users[0] || null
}
