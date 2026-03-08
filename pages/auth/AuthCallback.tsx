import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { UserRole } from '../../types'
import {
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
}

const isUserRole = (value: string | null): value is UserRole =>
  value === 'teacher' || value === 'parent' || value === 'student'

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

export default function AuthCallback({ onRoleResolved }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const resolve = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessTokenFromHash = hashParams.get('access_token')
      const refreshTokenFromHash = hashParams.get('refresh_token')
      const roleFromQuery = searchParams.get('role')
      const roleFromStorage = localStorage.getItem('cairn_last_role')

      if (accessTokenFromHash) {
        setStoredSession(accessTokenFromHash, refreshTokenFromHash)
      }

      let roleFromProfile: string | null = null
      const accessToken = accessTokenFromHash || getStoredAccessToken()

      const authUser = await fetchAuthUser(accessToken)
      if (authUser?.id) {
        setStoredUserId(authUser.id)
        roleFromProfile =
          (authUser.user_metadata?.role as string | null) ??
          (authUser.app_metadata?.role as string | null) ??
          null
      }

      const preferredRole =
        (isUserRole(roleFromProfile) ? roleFromProfile : null) ||
        (isUserRole(roleFromQuery) ? roleFromQuery : null) ||
        (isUserRole(roleFromStorage) ? roleFromStorage : null) ||
        'teacher'

      let resolvedRole: UserRole = preferredRole
      let needsTeacherSetup = false

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
          }
        } catch {
          // Keep auth flow resilient: route by preferred role even if profile bootstrap fails.
        }
      }

      localStorage.setItem('cairn_last_role', resolvedRole)
      onRoleResolved(resolvedRole)

      if (window.location.hash) {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
      }

      const nextPath = resolvedRole === 'teacher' && needsTeacherSetup ? '/teacher/setup' : ROLE_ROUTES[resolvedRole]
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
