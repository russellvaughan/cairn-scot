import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserRole } from '../../types'

interface Props {
  onRoleSelect: (role: UserRole) => void
}

export default function SignIn({ onRoleSelect }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'role' | 'email' | 'sent'>('role')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setErrorMessage(null)
    setStep('email')
  }

  const handleSubmit = async () => {
    if (!email || !selectedRole || sending) return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

    if (!supabaseUrl || !supabaseKey) {
      setErrorMessage('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).')
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
          create_user: true,
          email_redirect_to: window.location.origin,
          data: { role: selectedRole },
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          payload?.msg ||
          payload?.error_description ||
          payload?.error ||
          'Could not send sign-in link. Please check your Supabase auth settings.'
        throw new Error(message)
      }

      setEmail(normalizedEmail)
      setStep('sent')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send sign-in link.')
    } finally {
      setSending(false)
    }
  }

  const handleDemo = (role: UserRole) => {
    onRoleSelect(role)
    navigate(role === 'teacher' ? '/teacher' : '/parent')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-stone)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header section */}
      <div style={{
        background: 'var(--color-ink)',
        padding: '60px 32px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(194,123,43,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: 20,
          width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(74,103,65,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            color: 'white',
            letterSpacing: '-0.03em',
            marginBottom: 8,
          }}>
            cairn<span style={{ color: 'var(--color-gold)' }}>.</span>
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            Every achievement, in one place.
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 24px' }}>

        {step === 'role' && (
          <div className="animate-slide-up">
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              color: 'var(--color-ink)',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>Welcome back</div>
            <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', marginBottom: 32, lineHeight: 1.6 }}>
              How are you using Cairn today?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                { role: 'teacher' as UserRole, label: 'I\'m a teacher', sub: 'Log achievements, view your class', icon: '👩‍🏫' },
                { role: 'parent'  as UserRole, label: 'I\'m a parent',  sub: 'See your child\'s progress',       icon: '👨‍👧' },
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  style={{
                    background: 'var(--color-white)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: 16 }}>
                Try a demo — no account needed
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ fontSize: 14 }} onClick={() => handleDemo('teacher')}>
                  Teacher demo
                </button>
                <button className="btn btn-secondary" style={{ fontSize: 14 }} onClick={() => handleDemo('parent')}>
                  Parent demo
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep('role')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontWeight: 600, fontSize: 14, marginBottom: 24, padding: 0 }}
            >
              ← Back
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {selectedRole === 'teacher' ? 'Sign in as a teacher' : 'Sign in as a parent'}
            </div>
            <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', marginBottom: 32, lineHeight: 1.6 }}>
              We'll send you a secure sign-in link — no password needed.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label-xs" style={{ display: 'block', marginBottom: 8 }}>Your email address</label>
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
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-red-faint)',
                border: '1px solid rgba(192,57,43,0.2)',
                color: 'var(--color-red-soft)',
                fontSize: 13,
                lineHeight: 1.45,
              }}>
                {errorMessage}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!email || sending}>
              {sending ? 'Sending...' : 'Send sign-in link'}
            </button>
            <div style={{ marginTop: 24, padding: 16, background: 'var(--color-gold-faint)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold-light)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-gold)', fontWeight: 600, marginBottom: 4 }}>Your data is protected</div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
                Cairn is fully compliant with UK GDPR. Your school's data stays in the UK and is never shared with third parties.
              </div>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="animate-slide-up" style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Check your inbox
            </div>
            <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 32 }}>
              We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
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
