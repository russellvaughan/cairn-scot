function json(res: any, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
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

async function supabaseRequest(
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

async function authUserFromToken(supabaseUrl: string, serviceRoleKey: string, accessToken: string) {
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const userId = normalizeText(String(body.user_id || ''))
    const schoolNameInput = normalizeText(String(body.school_name || ''))

    if (!userId) {
      return json(res, 400, { error: 'user_id is required' })
    }

    const authHeader = String(req.headers?.authorization || req.headers?.Authorization || '')
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    if (!accessToken) {
      return json(res, 401, { error: 'Missing bearer token' })
    }

    const authUser = await authUserFromToken(supabaseUrl, serviceRoleKey, accessToken)
    if (!authUser?.id || authUser.id !== userId) {
      return json(res, 403, { error: 'Unauthorized for requested user_id' })
    }

    const usersResponse = await supabaseRequest(
      supabaseUrl,
      serviceRoleKey,
      `/rest/v1/users?select=id,role,email,full_name,school_id&id=eq.${userId}&limit=1`
    )
    const users = (await usersResponse.json()) as Array<{
      id: string
      role: string
      email: string
      full_name: string
      school_id: string | null
    }>

    const user = users[0]
    if (!user) {
      return json(res, 404, { error: 'User profile not found in public.users' })
    }

    if (user.role !== 'teacher') {
      return json(res, 400, { error: 'Only teacher accounts can bootstrap school setup' })
    }

    if (user.school_id) {
      return json(res, 200, {
        school_id: user.school_id,
        created_school: false,
      })
    }

    const schoolName = schoolNameInput.length >= 2 ? schoolNameInput : fallbackSchoolName(user.email)

    const schoolInsertResponse = await supabaseRequest(
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

    await supabaseRequest(
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
