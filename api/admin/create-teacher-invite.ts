import { createSignedToken, getInviteSigningSecret } from '../_shared/invite-tokens'
import {
  getRequesterProfile,
  getSupabaseServerConfig,
  json,
  normalizeEmail,
  parseBearerToken,
} from '../_shared/supabase-admin'

type TeacherInviteTokenPayload = {
  typ: 'teacher_invite'
  iat: number
  exp: number
  school_id: string
  email?: string
}

function getPublicAppOrigin(req: any): string {
  const configured =
    process.env.PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VITE_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (configured) {
    return configured.startsWith('http') ? configured.replace(/\/+$/, '') : `https://${configured.replace(/\/+$/, '')}`
  }

  const forwardedProto = String(req.headers?.['x-forwarded-proto'] || 'https')
  const forwardedHost = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '')
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

  return 'http://localhost:5173'
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  try {
    const { serviceRoleKey, supabaseUrl } = getSupabaseServerConfig()
    const accessToken = parseBearerToken(req)
    if (!accessToken) {
      return json(res, 401, { error: 'Missing bearer token' })
    }

    const requester = await getRequesterProfile(supabaseUrl, serviceRoleKey, accessToken)
    if (!requester) {
      return json(res, 401, { error: 'Could not validate session' })
    }

    if (requester.role !== 'admin') {
      return json(res, 403, { error: 'Only admins can create teacher invites' })
    }

    if (!requester.school_id) {
      return json(res, 400, { error: 'Admin profile is not linked to a school yet' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const email = normalizeEmail(String(body.email || ''))

    if (email && !isValidEmail(email)) {
      return json(res, 400, { error: 'Invalid email format for invite lock' })
    }

    const now = Math.floor(Date.now() / 1000)
    const ttlHoursRaw = Number(process.env.TEACHER_INVITE_TTL_HOURS || 168)
    const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 168
    const payload: TeacherInviteTokenPayload = {
      typ: 'teacher_invite',
      iat: now,
      exp: now + Math.floor(ttlHours * 3600),
      school_id: requester.school_id,
      ...(email ? { email } : {}),
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const token = createSignedToken(payload, secret)
    const appOrigin = getPublicAppOrigin(req)
    const inviteUrl = `${appOrigin}/home?invite_teacher=${encodeURIComponent(token)}`

    return json(res, 200, {
      invite_url: inviteUrl,
      token,
      expires_at: new Date(payload.exp * 1000).toISOString(),
      school_id: requester.school_id,
      locked_email: email || null,
    })
  } catch (error) {
    console.error('create-teacher-invite failed', error)
    return json(res, 500, { error: 'Could not create teacher invite link' })
  }
}
