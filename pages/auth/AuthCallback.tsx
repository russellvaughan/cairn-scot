import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { UserRole } from '../../types'
import { fetchAuthUser, getStoredAccessToken, setStoredSession, setStoredUserId } from '../../lib/supabase'

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
        roleFromProfile = (authUser.user_metadata?.role as string | null) ?? (authUser.app_metadata?.role as string | null) ?? null
      }

      const resolvedRoleCandidate =
        (isUserRole(roleFromProfile) ? roleFromProfile : null) ||
        (isUserRole(roleFromQuery) ? roleFromQuery : null) ||
        (isUserRole(roleFromStorage) ? roleFromStorage : null) ||
        'teacher'

      const resolvedRole: UserRole = resolvedRoleCandidate
      localStorage.setItem('cairn_last_role', resolvedRole)
      onRoleResolved(resolvedRole)

      if (window.location.hash) {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
      }

      navigate(ROLE_ROUTES[resolvedRole], { replace: true })
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
