import {
  authUserFromToken,
  getSupabaseServerConfig,
  json,
  normalizeText,
  parseBearerToken,
  supabaseAdminRequest,
  supabaseAdminSelect,
} from '../_shared/supabase-admin'

type DbUserRow = {
  id: string
  role: string
  email: string
  school_id: string | null
}

function fallbackSchoolName(email?: string): string {
  const domain = (email || '').split('@')[1] || ''
  const label = domain.split('.')[0] || ''
  const safe = label.replace(/[^a-z0-9-]/gi, ' ').trim()

  if (!safe) return 'Cairn School'

  const titled = safe
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')

  return `${titled} School`
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  try {
    const { supabaseUrl, serviceRoleKey } = getSupabaseServerConfig()
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const userId = normalizeText(String(body.user_id || ''))
    const schoolNameInput = normalizeText(String(body.school_name || ''))

    if (!userId) {
      return json(res, 400, { error: 'user_id is required' })
    }

    const accessToken = parseBearerToken(req)
    if (!accessToken) {
      return json(res, 401, { error: 'Missing bearer token' })
    }

    const authUser = await authUserFromToken(supabaseUrl, serviceRoleKey, accessToken)
    if (!authUser?.id || authUser.id !== userId) {
      return json(res, 403, { error: 'Unauthorized for requested user_id' })
    }

    const users = await supabaseAdminSelect<DbUserRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'users',
      {
        select: 'id,role,email,school_id',
        id: `eq.${userId}`,
        limit: '1',
      }
    )

    const user = users[0]
    if (!user) {
      return json(res, 404, { error: 'User profile not found in public.users' })
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return json(res, 400, { error: 'Only teacher or admin accounts can bootstrap school setup' })
    }

    if (user.school_id) {
      return json(res, 200, {
        school_id: user.school_id,
        created_school: false,
      })
    }

    const schoolName = schoolNameInput.length >= 2 ? schoolNameInput : fallbackSchoolName(user.email)

    const schoolInsertResponse = await supabaseAdminRequest(
      supabaseUrl,
      serviceRoleKey,
      '/rest/v1/schools',
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{ name: schoolName }]),
      }
    )

    const schools = (await schoolInsertResponse.json()) as Array<{ id: string; name: string }>
    const school = schools[0]

    if (!school?.id) {
      return json(res, 500, { error: 'Failed to create school record' })
    }

    await supabaseAdminRequest(
      supabaseUrl,
      serviceRoleKey,
      `/rest/v1/users?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ school_id: school.id }),
      }
    )

    return json(res, 200, {
      school_id: school.id,
      school_name: school.name,
      created_school: true,
    })
  } catch (error) {
    console.error('bootstrap-teacher failed', error)
    return json(res, 500, { error: 'Could not complete school setup' })
  }
}
