import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAuthUser, getStoredAccessToken, supabaseSelect } from '../../lib/supabase'

type DbUserRow = {
  id: string
  full_name: string
  school_id: string | null
}

export default function TeacherSetup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = getStoredAccessToken()
        if (!token) {
          navigate('/home', { replace: true })
          return
        }

        const authUser = await fetchAuthUser(token)
        if (!authUser?.id) {
          navigate('/home', { replace: true })
          return
        }

        const users = await supabaseSelect<DbUserRow[]>(
          'users',
          {
            select: 'id,full_name,school_id',
            id: `eq.${authUser.id}`,
            limit: '1',
          },
          token
        )

        const profile = users[0]
        if (!profile) {
          setErrorMessage('Could not load your teacher profile.')
          setLoading(false)
          return
        }

        if (profile.school_id) {
          navigate('/teacher', { replace: true })
          return
        }

        setUserId(profile.id)
        setLoading(false)
      } catch {
        setErrorMessage('Could not load teacher setup.')
        setLoading(false)
      }
    }

    void load()
  }, [navigate])

  const canSubmit = schoolName.trim().length >= 2 && !saving

  const handleSubmit = async () => {
    if (!canSubmit || !userId) return

    setSaving(true)
    setErrorMessage(null)

    try {
      const token = getStoredAccessToken()
      if (!token) {
        throw new Error('Please sign in again.')
      }

      const response = await fetch('/api/auth/bootstrap-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          school_name: schoolName.trim(),
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not save your school setup.')
      }

      navigate('/teacher', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your school setup.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Preparing teacher setup…</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 24px 28px' }}>
      <div className="card" style={{ padding: '18px 18px 16px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Set up your school
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.55 }}>
          Enter your school name once, then you can add pupils and log achievements normally.
        </div>
      </div>

      <div className="label-xs" style={{ marginBottom: 8 }}>School name</div>
      <input
        className="field"
        placeholder="e.g. Inverurie Primary School"
        value={schoolName}
        onChange={event => setSchoolName(event.target.value)}
        style={{ marginBottom: 14 }}
      />

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

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{ opacity: canSubmit ? 1 : 0.45 }}
      >
        {saving ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}
