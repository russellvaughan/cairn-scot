import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { UserRole } from '../../types'

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
      const accessToken = hashParams.get('access_token')
      const roleFromQuery = searchParams.get('role')
      const roleFromStorage = localStorage.getItem('cairn_last_role')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as
        | string
        | undefined

      let roleFromProfile: string | null = null

      if (accessToken && supabaseUrl && supabaseKey) {
        try {
          const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/auth/v1/user`, {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${accessToken}`,
            },
          })
          if (res.ok) {
            const payload = await res.json()
            roleFromProfile = payload?.user_metadata?.role ?? payload?.app_metadata?.role ?? null
          }
        } catch {
          // Fallback resolution is handled below.
        }
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
