import { createSignedToken, getInviteSigningSecret } from '../_shared/invite-tokens'
import {
  getRequesterProfile,
  getSupabaseServerConfig,
  jsonResponse,
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

function getPublicAppOrigin(req: Request): string {
  const configured =
    process.env.PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VITE_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (configured) {
    return configured.startsWith('http') ? configured.replace(/\/+$/, '') : `https://${configured.replace(/\/+$/, '')}`
  }

  const forwardedProto = String(req.headers.get('x-forwarded-proto') || 'https')
  const forwardedHost = String(req.headers.get('x-forwarded-host') || req.headers.get('host') || '')
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

  return 'http://localhost:5173'
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  try {
    const { serviceRoleKey, supabaseUrl } = getSupabaseServerConfig()
    const accessToken = parseBearerToken(req)
    if (!accessToken) {
      return jsonResponse(401, { error: 'Missing bearer token' })
    }

    const requester = await getRequesterProfile(supabaseUrl, serviceRoleKey, accessToken)
    if (!requester) {
      return jsonResponse(401, { error: 'Could not validate session' })
    }

    if (requester.role !== 'admin') {
      return jsonResponse(403, { error: 'Only admins can create teacher invites' })
    }

    if (!requester.school_id) {
      return jsonResponse(400, { error: 'Admin profile is not linked to a school yet' })
    }

    const body = await req.json().catch(() => ({}))
    const email = normalizeEmail(String(body.email || ''))

    if (email && !isValidEmail(email)) {
      return jsonResponse(400, { error: 'Invalid email format for invite lock' })
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

    return jsonResponse(200, {
      invite_url: inviteUrl,
      token,
      expires_at: new Date(payload.exp * 1000).toISOString(),
      school_id: requester.school_id,
      locked_email: email || null,
    })
  } catch (error) {
    console.error('create-teacher-invite failed', error)
    return jsonResponse(500, { error: 'Could not create teacher invite link' })
  }
}
