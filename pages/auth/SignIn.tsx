import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserRole } from '../../types'

interface Props {
  onRoleSelect: (role: UserRole) => void
}

type AuthMode = 'signin' | 'signup'

const ROLE_LABEL: Record<UserRole, string> = {
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
}

const ROLE_HINT: Record<UserRole, string> = {
  teacher: 'Log and review achievements',
  parent: 'Track and submit achievements',
  student: 'View progress and achievements',
}

const ROLE_ROUTE: Record<UserRole, string> = {
  teacher: '/teacher',
  parent: '/parent',
  student: '/student',
}

export default function SignIn({ onRoleSelect }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'role' | 'email' | 'sent'>('role')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    localStorage.setItem('cairn_last_role', role)
    setSelectedRole(role)
    setAuthMode('signin')
    setErrorMessage(null)
    setStep('email')
  }

  const handleSubmit = async () => {
    if (!email || !selectedRole || sending) return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as
      | string
      | undefined

    if (!supabaseUrl || !supabaseKey) {
      setErrorMessage(
        'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).'
      )
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/otp`

    setSending(true)
    setErrorMessage(null)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          create_user: authMode === 'signup',
          email_redirect_to: `${window.location.origin}/auth/callback?role=${selectedRole}`,
          data: { role: selectedRole },
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          payload?.msg ||
          payload?.error_description ||
          payload?.error ||
          'Could not send link. Please check your Supabase auth settings.'
        throw new Error(message)
      }

      setEmail(normalizedEmail)
      setStep('sent')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send link.')
    } finally {
      setSending(false)
    }
  }

  const handleDemo = (role: UserRole) => {
    localStorage.setItem('cairn_last_role', role)
    onRoleSelect(role)
    navigate(ROLE_ROUTE[role])
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '20px 24px 24px' }}>
        {step === 'role' && (
          <div className="animate-slide-up">
            <div
              className="card"
              style={{
                marginBottom: 14,
                padding: '22px 20px 20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #EAF2FF 56%, #FFF0E7 100%)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 34,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                }}
              >
                cairn<span style={{ color: 'var(--color-gold)' }}>.</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.55, marginBottom: 14 }}>
                Achievement tracking for teachers, parents and students.
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-sage)',
                  background: 'var(--color-sage-faint)',
                  border: '1px solid var(--color-sage-light)',
                  borderRadius: '999px',
                  padding: '5px 10px',
                }}
              >
                Live demo ready
              </div>
            </div>

            <div
              className="card"
              style={{
                marginBottom: 18,
                padding: '16px',
                background: 'linear-gradient(155deg, #1F6FE5 0%, #2D5FA8 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'white', marginBottom: 6 }}>
                Try a demo first
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', marginBottom: 13, lineHeight: 1.5 }}>
                Full walkthrough access with no email needed.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '12px 8px', fontSize: 13 }} onClick={() => handleDemo('teacher')}>
                  Teacher
                </button>
                <button className="btn btn-secondary" style={{ padding: '12px 8px', fontSize: 13 }} onClick={() => handleDemo('parent')}>
                  Parent
                </button>
                <button className="btn btn-secondary" style={{ padding: '12px 8px', fontSize: 13 }} onClick={() => handleDemo('student')}>
                  Student
                </button>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
              Sign in or create account
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(Object.keys(ROLE_LABEL) as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    background: 'var(--color-white)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 2 }}>
                      {ROLE_LABEL[role]}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{ROLE_HINT[role]}</div>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.4" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'email' && selectedRole && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep('role')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-gold)',
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 18,
                padding: 0,
              }}
            >
              ← Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
              <button
                onClick={() => setAuthMode('signin')}
                style={{
                  border: authMode === 'signin' ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border)',
                  background: authMode === 'signin' ? 'var(--color-gold-faint)' : 'var(--color-white)',
                  color: authMode === 'signin' ? 'var(--color-gold)' : 'var(--color-ink-soft)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '11px 12px',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                style={{
                  border: authMode === 'signup' ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border)',
                  background: authMode === 'signup' ? 'var(--color-gold-faint)' : 'var(--color-white)',
                  color: authMode === 'signup' ? 'var(--color-gold)' : 'var(--color-ink-soft)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '11px 12px',
                  cursor: 'pointer',
                }}
              >
                Create account
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, marginBottom: 7, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
              {authMode === 'signup' ? `Create ${ROLE_LABEL[selectedRole]} account` : `${ROLE_LABEL[selectedRole]} sign in`}
            </div>
            <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', marginBottom: 24, lineHeight: 1.55 }}>
              {authMode === 'signup'
                ? 'We will send a one-time setup link to your email.'
                : 'We will send a one-time sign-in link to your email.'}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label-xs" style={{ display: 'block', marginBottom: 8 }}>
                Email address
              </label>
              <input
                className="field"
                type="email"
                placeholder="you@school.org.uk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {errorMessage && (
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-red-faint)',
                  border: '1px solid rgba(184,51,51,0.25)',
                  color: 'var(--color-red-soft)',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {errorMessage}
              </div>
            )}

            <button className="btn btn-primary" onClick={handleSubmit} disabled={!email || sending}>
              {sending ? 'Sending...' : authMode === 'signup' ? 'Send setup link' : 'Send sign-in link'}
            </button>
          </div>
        )}

        {step === 'sent' && (
          <div className="animate-slide-up" style={{ textAlign: 'center', paddingTop: 38 }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                margin: '0 auto 18px',
                border: '1px solid var(--color-gold-light)',
                background: 'var(--color-gold-faint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 4h16v16H4z" />
                <path d="m4 8 8 6 8-6" />
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
              Check your inbox
            </div>
            <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 26 }}>
              {authMode === 'signup' ? 'Setup link' : 'Sign-in link'} sent to <strong>{email}</strong>.
            </div>
            <button className="btn btn-secondary" onClick={() => setStep('email')}>
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
