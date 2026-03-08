import { createSignedToken, getInviteSigningSecret } from '../_shared/invite-tokens.js'
import { readEnv, readFirstEnv } from '../_shared/env.js'
import {
  getRequesterProfile,
  getSupabaseServerConfig,
  normalizeText,
  parseBearerToken,
  supabaseAdminSelect,
} from '../_shared/supabase-admin.js'
import { readJsonBody, sendJson } from '../_shared/http.js'

type ParentLinkTokenPayload = {
  typ: 'parent_link'
  iat: number
  exp: number
  school_id: string
  pupil_id: string
}

type DbPupilRow = {
  id: string
  first_name: string
  last_name: string
  year_group: string
  school_id: string
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

    if (requester.role !== 'admin' && requester.role !== 'teacher') {
      return sendJson(res, 403, { error: 'Only staff can create parent links' })
    }

    if (!requester.school_id) {
      return sendJson(res, 400, { error: 'Your profile is not linked to a school yet' })
    }

    const body = await readJsonBody(req)
    const pupilId = normalizeText(String(body.pupil_id || ''))

    if (!pupilId) {
      return sendJson(res, 400, { error: 'pupil_id is required' })
    }

    const pupils = await supabaseAdminSelect<DbPupilRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'pupils',
      {
        select: 'id,first_name,last_name,year_group,school_id',
        id: `eq.${pupilId}`,
        school_id: `eq.${requester.school_id}`,
        limit: '1',
      }
    )

    const pupil = pupils[0]
    if (!pupil) {
      return sendJson(res, 404, { error: 'Pupil not found in your school' })
    }

    const now = Math.floor(Date.now() / 1000)
    const ttlHoursRaw = Number(readEnv('PARENT_LINK_TTL_HOURS') || 168)
    const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 168

    const payload: ParentLinkTokenPayload = {
      typ: 'parent_link',
      iat: now,
      exp: now + Math.floor(ttlHours * 3600),
      school_id: requester.school_id,
      pupil_id: pupil.id,
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const token = await createSignedToken(payload, secret)
    const appOrigin = getPublicAppOrigin(req)
    const linkUrl = `${appOrigin}/home?link_child=${encodeURIComponent(token)}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(linkUrl)}&size=220&margin=2`

    return sendJson(res, 200, {
      link_url: linkUrl,
      token,
      qr_image_url: qrImageUrl,
      expires_at: new Date(payload.exp * 1000).toISOString(),
      pupil: {
        id: pupil.id,
        first_name: pupil.first_name,
        last_name: pupil.last_name,
        year_group: pupil.year_group,
      },
    })
  } catch (error) {
    console.error('create-parent-link-code failed', error)
    return sendJson(res, 500, { error: 'Could not create parent link' })
  }
}
