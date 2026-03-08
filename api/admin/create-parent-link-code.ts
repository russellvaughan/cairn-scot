import { createSignedToken, getInviteSigningSecret } from '../_shared/invite-tokens'
import {
  getRequesterProfile,
  getSupabaseServerConfig,
  jsonResponse,
  normalizeText,
  parseBearerToken,
  supabaseAdminSelect,
} from '../_shared/supabase-admin'

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

    if (requester.role !== 'admin' && requester.role !== 'teacher') {
      return jsonResponse(403, { error: 'Only staff can create parent links' })
    }

    if (!requester.school_id) {
      return jsonResponse(400, { error: 'Your profile is not linked to a school yet' })
    }

    const body = await req.json().catch(() => ({}))
    const pupilId = normalizeText(String(body.pupil_id || ''))

    if (!pupilId) {
      return jsonResponse(400, { error: 'pupil_id is required' })
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
      return jsonResponse(404, { error: 'Pupil not found in your school' })
    }

    const now = Math.floor(Date.now() / 1000)
    const ttlHoursRaw = Number(process.env.PARENT_LINK_TTL_HOURS || 168)
    const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 168

    const payload: ParentLinkTokenPayload = {
      typ: 'parent_link',
      iat: now,
      exp: now + Math.floor(ttlHours * 3600),
      school_id: requester.school_id,
      pupil_id: pupil.id,
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const token = createSignedToken(payload, secret)
    const appOrigin = getPublicAppOrigin(req)
    const linkUrl = `${appOrigin}/home?link_child=${encodeURIComponent(token)}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(linkUrl)}&size=220&margin=2`

    return jsonResponse(200, {
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
    return jsonResponse(500, { error: 'Could not create parent link' })
  }
}
