import { getInviteSigningSecret, verifySignedToken } from '../_shared/invite-tokens.js'
import {
  authUserFromToken,
  getSupabaseServerConfig,
  normalizeText,
  parseBearerToken,
  supabaseAdminRequest,
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

type DbUserRow = {
  id: string
  role: string
  school_id: string | null
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

    const body = await readJsonBody(req)
    const token = normalizeText(String(body.token || ''))
    if (!token) {
      return sendJson(res, 400, { error: 'token is required' })
    }

    const authUser = await authUserFromToken(supabaseUrl, serviceRoleKey, accessToken)
    if (!authUser?.id) {
      return sendJson(res, 401, { error: 'Could not validate session' })
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const payload = await verifySignedToken<ParentLinkTokenPayload>(token, secret)
    if (!payload || payload.typ !== 'parent_link' || !payload.school_id || !payload.pupil_id) {
      return sendJson(res, 400, { error: 'Invalid or expired parent link token' })
    }

    const users = await supabaseAdminSelect<DbUserRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'users',
      {
        select: 'id,role,school_id',
        id: `eq.${authUser.id}`,
        limit: '1',
      }
    )

    const user = users[0]
    if (!user) {
      return sendJson(res, 404, { error: 'User profile not found in public.users' })
    }

    if (user.role !== 'parent') {
      return sendJson(res, 403, { error: 'Only parent accounts can claim parent links' })
    }

    if (user.school_id && user.school_id !== payload.school_id) {
      return sendJson(res, 409, { error: 'This account is already linked to a different school' })
    }

    const pupils = await supabaseAdminSelect<Array<{ id: string; school_id: string }>>(
      supabaseUrl,
      serviceRoleKey,
      'pupils',
      {
        select: 'id,school_id',
        id: `eq.${payload.pupil_id}`,
        school_id: `eq.${payload.school_id}`,
        limit: '1',
      }
    )

    if (!pupils[0]?.id) {
      return sendJson(res, 404, { error: 'Pupil not found for this school link' })
    }

    await supabaseAdminRequest(
      supabaseUrl,
      serviceRoleKey,
      '/rest/v1/parent_pupil_links?on_conflict=parent_id,pupil_id',
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify([
          {
            parent_id: authUser.id,
            pupil_id: payload.pupil_id,
            verified: true,
          },
        ]),
      }
    )

    if (!user.school_id) {
      await supabaseAdminRequest(
        supabaseUrl,
        serviceRoleKey,
        `/rest/v1/users?id=eq.${authUser.id}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ school_id: payload.school_id }),
        }
      )
    }

    return sendJson(res, 200, {
      linked: true,
      school_id: payload.school_id,
      pupil_id: payload.pupil_id,
    })
  } catch (error) {
    console.error('claim-parent-link failed', error)
    return sendJson(res, 500, { error: 'Could not claim parent link' })
  }
}
