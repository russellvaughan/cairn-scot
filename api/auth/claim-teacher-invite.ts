import { getInviteSigningSecret, verifySignedToken } from '../_shared/invite-tokens'
import {
  authUserFromToken,
  getSupabaseServerConfig,
  json,
  normalizeEmail,
  normalizeText,
  parseBearerToken,
  supabaseAdminRequest,
  supabaseAdminSelect,
} from '../_shared/supabase-admin'

type TeacherInviteTokenPayload = {
  typ: 'teacher_invite'
  iat: number
  exp: number
  school_id: string
  email?: string
}

type DbUserRow = {
  id: string
  role: string
  school_id: string | null
  email: string
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

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const token = normalizeText(String(body.token || ''))
    if (!token) {
      return json(res, 400, { error: 'token is required' })
    }

    const authUser = await authUserFromToken(supabaseUrl, serviceRoleKey, accessToken)
    if (!authUser?.id) {
      return json(res, 401, { error: 'Could not validate session' })
    }

    const secret = getInviteSigningSecret(serviceRoleKey)
    const payload = verifySignedToken<TeacherInviteTokenPayload>(token, secret)
    if (!payload || payload.typ !== 'teacher_invite' || !payload.school_id) {
      return json(res, 400, { error: 'Invalid or expired teacher invite token' })
    }

    const schools = await supabaseAdminSelect<Array<{ id: string }>>(
      supabaseUrl,
      serviceRoleKey,
      'schools',
      {
        select: 'id',
        id: `eq.${payload.school_id}`,
        limit: '1',
      }
    )

    if (!schools[0]?.id) {
      return json(res, 400, { error: 'Invite references a school that no longer exists' })
    }

    const users = await supabaseAdminSelect<DbUserRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'users',
      {
        select: 'id,role,school_id,email',
        id: `eq.${authUser.id}`,
        limit: '1',
      }
    )

    const user = users[0]
    if (!user) {
      return json(res, 404, { error: 'User profile not found in public.users' })
    }

    if (user.role !== 'teacher') {
      return json(res, 403, { error: 'Only teacher accounts can claim teacher invites' })
    }

    if (payload.email) {
      const expected = normalizeEmail(payload.email)
      const actual = normalizeEmail(user.email)
      if (expected !== actual) {
        return json(res, 403, { error: 'Invite is locked to a different email address' })
      }
    }

    if (user.school_id && user.school_id !== payload.school_id) {
      return json(res, 409, { error: 'This account is already linked to a different school' })
    }

    if (!user.school_id) {
      await supabaseAdminRequest(
        supabaseUrl,
        serviceRoleKey,
        `/rest/v1/users?id=eq.${authUser.id}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            school_id: payload.school_id,
            role: 'teacher',
          }),
        }
      )
    }

    return json(res, 200, {
      linked: true,
      school_id: payload.school_id,
    })
  } catch (error) {
    console.error('claim-teacher-invite failed', error)
    return json(res, 500, { error: 'Could not claim teacher invite' })
  }
}
