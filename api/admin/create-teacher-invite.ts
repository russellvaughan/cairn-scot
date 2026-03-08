import { createSignedToken, getInviteSigningSecret } from '../_shared/invite-tokens.js'
import { readEnv, readFirstEnv } from '../_shared/env.js'
import {
  getRequesterProfile,
  getSupabaseServerConfig,
  normalizeEmail,
  parseBearerToken,
} from '../_shared/supabase-admin.js'
import { readJsonBody, sendJson } from '../_shared/http.js'

type TeacherInviteTokenPayload = {
  typ: 'teacher_invite'
  iat: number
  exp: number
  school_id: string
  email?: string
}

function getPublicAppOrigin(req: Request): string {
  const configured = readFirstEnv([
    'PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_URL',
    'VITE_PUBLIC_APP_URL',
    'VERCEL_PROJECT_PRODUCTION_URL',
    'VERCEL_URL',
  ])

  if (configured) {
    return configured.startsWith('http') ? configured.replace(/\/+$/, '') : `https://${configured.replace(/\/+$/, '')}`
  }

  const header = (name: string): string => {
    if (typeof (req as any)?.headers?.get === 'function') {
      return String((req as any).headers.get(name) || '')
    }
    const key = name.toLowerCase()
    const raw = (req as any)?.headers?.[key] ?? (req as any)?.headers?.[name]
    if (Array.isArray(raw)) return String(raw[0] || '')
    return String(raw || '')
  }

  const forwardedProto = header('x-forwarded-proto') || 'https'
  const forwardedHost = header('x-forwarded-host') || header('host')
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

  return 'http://localhost:5173'
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const { serviceRoleKey, supabaseUrl } = getSupabaseServerConfig()
    const accessToken = parseBearerToken(req)
    if (!accessToken) {
      return sendJson(res, 401, { error: 'Missing bearer token' })
    }

    const requester = await getRequesterProfile(supabaseUrl, serviceRoleKey, accessToken)
    if (!requester) {
      return sendJson(res, 401, { error: 'Could not validate session' })
    }

    if (requester.role !== 'admin') {
      return sendJson(res, 403, { error: 'Only admins can create teacher invites' })
    }

    if (!requester.school_id) {
      return sendJson(res, 400, { error: 'Admin profile is not linked to a school yet' })
    }

    const body = await readJsonBody(req)
    const email = normalizeEmail(String(body.email || ''))

    if (email && !isValidEmail(email)) {
      return sendJson(res, 400, { error: 'Invalid email format for invite lock' })
    }

    const now = Math.floor(Date.now() / 1000)
    const ttlHoursRaw = Number(readEnv('TEACHER_INVITE_TTL_HOURS') || 168)
    const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 168
    const payload: TeacherInviteTokenPayload = {
      typ: 'teacher_invite',
      iat: now,
      exp: now + Math.floor(ttlHours * 3600),
      school_id: requester.school_id,
      ...(email ? { email } : {}),
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const token = await createSignedToken(payload, secret)
    const appOrigin = getPublicAppOrigin(req)
    const inviteUrl = `${appOrigin}/home?invite_teacher=${encodeURIComponent(token)}`

    return sendJson(res, 200, {
      invite_url: inviteUrl,
      token,
      expires_at: new Date(payload.exp * 1000).toISOString(),
      school_id: requester.school_id,
      locked_email: email || null,
    })
  } catch (error) {
    console.error('create-teacher-invite failed', error)
    return sendJson(res, 500, { error: 'Could not create teacher invite link' })
  }
}
