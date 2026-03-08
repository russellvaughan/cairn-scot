import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { UserRole } from '../../types'
import {
  clearStoredSession,
  fetchAuthUser,
  getStoredAccessToken,
  setStoredSession,
  setStoredUserId,
  supabaseSelect,
  supabaseUpsert,
} from '../../lib/supabase'

interface Props {
  onRoleResolved: (role: UserRole) => void
}

const ROLE_ROUTES: Record<UserRole, string> = {
  teacher: '/teacher',
  parent: '/parent',
  student: '/student',
  admin: '/admin',
}

const isUserRole = (value: string | null): value is UserRole =>
  value === 'teacher' || value === 'parent' || value === 'student' || value === 'admin'

type DbUserRow = {
  id: string
  role: string
  email: string
  full_name: string
  school_id: string | null
}

function guessFullName(email?: string): string {
  const localPart = (email || '').split('@')[0] || 'Cairn User'
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim()
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Cairn User'
}

async function callClaimEndpoint(
  path: string,
  accessToken: string,
  body: Record<string, string>
): Promise<Record<string, unknown>> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(String(payload?.error || 'Claim request failed'))
  }

  return payload as Record<string, unknown>
}

export default function AuthCallback({ onRoleResolved }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const resolve = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessTokenFromHash = hashParams.get('access_token')
      const refreshTokenFromHash = hashParams.get('refresh_token')
      const roleFromQuery = searchParams.get('role')
      const teacherInviteToken = searchParams.get('invite_teacher')
      const parentLinkToken = searchParams.get('link_child')
      const roleFromStorage = localStorage.getItem('cairn_last_role')

      if (accessTokenFromHash) {
        setStoredSession(accessTokenFromHash, refreshTokenFromHash)
      }

      let roleFromProfile: string | null = null
      const accessToken = accessTokenFromHash || getStoredAccessToken()
      if (!accessToken) {
        clearStoredSession()
        localStorage.removeItem('cairn_last_role')
        navigate('/home', { replace: true })
        return
      }

      const authUser = await fetchAuthUser(accessToken)
      if (!authUser?.id) {
        clearStoredSession()
        localStorage.removeItem('cairn_last_role')
        navigate('/home', { replace: true })
        return
      }

      setStoredUserId(authUser.id)
      roleFromProfile =
        (authUser.user_metadata?.role as string | null) ??
        (authUser.app_metadata?.role as string | null) ??
        null

      const preferredRole =
        (isUserRole(roleFromProfile) ? roleFromProfile : null) ||
        (isUserRole(roleFromQuery) ? roleFromQuery : null) ||
        (isUserRole(roleFromStorage) ? roleFromStorage : null) ||
        'teacher'

      let resolvedRole: UserRole = preferredRole
      let needsTeacherSetup = false
      let needsAdminSetup = false

      if (authUser?.id && accessToken) {
        try {
          const existing = await supabaseSelect<DbUserRow[]>(
            'users',
            {
              select: 'id,role,email,full_name,school_id',
              id: `eq.${authUser.id}`,
              limit: '1',
            },
            accessToken
          )

          const profile = existing[0]
          if (profile) {
            if (isUserRole(profile.role)) resolvedRole = profile.role
            if (resolvedRole === 'teacher' && !profile.school_id) {
              needsTeacherSetup = true
            }
            if (resolvedRole === 'admin' && !profile.school_id) {
              needsAdminSetup = true
            }
          } else {
            const email = authUser.email || ''
            const metadataName = authUser.user_metadata?.full_name
            const fullName =
              typeof metadataName === 'string' && metadataName.trim().length > 0
                ? metadataName.trim()
                : guessFullName(email)

            const inserted = await supabaseUpsert<DbUserRow[]>(
              'users',
              {
                id: authUser.id,
                email: email || `${authUser.id}@example.local`,
                full_name: fullName,
                role: preferredRole,
              },
              'id',
              accessToken
            )

            if (inserted[0] && isUserRole(inserted[0].role)) {
              resolvedRole = inserted[0].role
            }
            if (resolvedRole === 'teacher' && !inserted[0]?.school_id) {
              needsTeacherSetup = true
            }
            if (resolvedRole === 'admin' && !inserted[0]?.school_id) {
              needsAdminSetup = true
            }
          }
        } catch {
          // Keep auth flow resilient: route by preferred role even if profile bootstrap fails.
        }
      }

      if (resolvedRole === 'teacher' && teacherInviteToken) {
        try {
          const claimResult = await callClaimEndpoint('/api/auth/claim-teacher-invite', accessToken, {
            token: teacherInviteToken,
          })
          if (typeof claimResult.school_id === 'string' && claimResult.school_id.length > 0) {
            needsTeacherSetup = false
          }
        } catch {
          // Invite links are best effort; teacher can still use setup fallback.
        }
      }

      if (resolvedRole === 'parent' && parentLinkToken) {
        try {
          await callClaimEndpoint('/api/auth/claim-parent-link', accessToken, {
            token: parentLinkToken,
          })
        } catch {
          // Parent can still access their account even if link claim fails.
        }
      }

      localStorage.setItem('cairn_last_role', resolvedRole)
      onRoleResolved(resolvedRole)

      if (window.location.hash) {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
      }

      const nextPath =
        resolvedRole === 'teacher' && needsTeacherSetup
          ? '/teacher/setup'
          : resolvedRole === 'admin' && needsAdminSetup
            ? '/admin/setup'
            : ROLE_ROUTES[resolvedRole]
      navigate(nextPath, { replace: true })
    }

    void resolve()
  }, [navigate, onRoleResolved, searchParams])

  return (
    <div style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Signing you in…</div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Please wait a moment.</div>
      </div>
    </div>
  )
}
