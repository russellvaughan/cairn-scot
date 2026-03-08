import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAuthUser, getStoredAccessToken, supabaseSelect } from '../../lib/supabase'

type DbUserRow = {
  id: string
  role: string
  school_id: string | null
  full_name: string
  email: string
}

type DbSchoolRow = {
  id: string
  name: string
  local_authority: string | null
  ai_enabled: boolean
}

type DbTeacherRow = {
  id: string
  full_name: string
  email: string
  last_active_at: string | null
}

type DbPupilRow = {
  id: string
  first_name: string
  last_name: string
  year_group: string
}

type ParentLinkView = {
  linkUrl: string
  qrImageUrl: string
  expiresAt: string
}

type TeacherInviteView = {
  linkUrl: string
  expiresAt: string
}

function formatExpiry(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function copyToClipboard(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  void navigator.clipboard.writeText(value)
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [school, setSchool] = useState<DbSchoolRow | null>(null)
  const [teachers, setTeachers] = useState<DbTeacherRow[]>([])
  const [pupils, setPupils] = useState<DbPupilRow[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [teacherInvite, setTeacherInvite] = useState<TeacherInviteView | null>(null)

  const [generatingPupilId, setGeneratingPupilId] = useState<string | null>(null)
  const [parentLinkError, setParentLinkError] = useState<string | null>(null)
  const [parentLinks, setParentLinks] = useState<Record<string, ParentLinkView>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const token = getStoredAccessToken()
        if (!token) {
          navigate('/home', { replace: true })
          return
        }

        setSessionToken(token)

        const authUser = await fetchAuthUser(token)
        if (!authUser?.id) {
          navigate('/home', { replace: true })
          return
        }

        const profiles = await supabaseSelect<DbUserRow[]>(
          'users',
          {
            select: 'id,role,school_id,full_name,email',
            id: `eq.${authUser.id}`,
            limit: '1',
          },
          token
        )

        const profile = profiles[0]
        if (!profile || profile.role !== 'admin') {
          navigate('/home', { replace: true })
          return
        }

        if (!profile.school_id) {
          navigate('/admin/setup', { replace: true })
          return
        }

        const [schools, staff, pupilRows] = await Promise.all([
          supabaseSelect<DbSchoolRow[]>(
            'schools',
            {
              select: 'id,name,local_authority,ai_enabled',
              id: `eq.${profile.school_id}`,
              limit: '1',
            },
            token
          ),
          supabaseSelect<DbTeacherRow[]>(
            'users',
            {
              select: 'id,full_name,email,last_active_at',
              school_id: `eq.${profile.school_id}`,
              role: 'eq.teacher',
              order: 'full_name.asc',
            },
            token
          ),
          supabaseSelect<DbPupilRow[]>(
            'pupils',
            {
              select: 'id,first_name,last_name,year_group',
              school_id: `eq.${profile.school_id}`,
              order: 'last_name.asc,first_name.asc',
              limit: '500',
            },
            token
          ),
        ])

        setSchool(schools[0] || null)
        setTeachers(staff)
        setPupils(pupilRows)
        setLoading(false)
      } catch {
        setErrorMessage('Could not load admin data right now.')
        setLoading(false)
      }
    }

    void load()
  }, [navigate])

  const canCreateInvite = !creatingInvite

  const sortedPupils = useMemo(
    () => [...pupils].sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)),
    [pupils]
  )

  const createTeacherInvite = async () => {
    if (!canCreateInvite) return

    setCreatingInvite(true)
    setInviteError(null)

    try {
      const token = sessionToken || getStoredAccessToken()
      if (!token) throw new Error('Please sign in again.')

      const response = await fetch('/api/admin/create-teacher-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim() || undefined,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not generate teacher invite link.')
      }

      setTeacherInvite({
        linkUrl: String(payload.invite_url || ''),
        expiresAt: String(payload.expires_at || ''),
      })
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Could not generate teacher invite link.')
    } finally {
      setCreatingInvite(false)
    }
  }

  const createParentLink = async (pupilId: string) => {
    if (generatingPupilId) return

    setGeneratingPupilId(pupilId)
    setParentLinkError(null)

    try {
      const token = sessionToken || getStoredAccessToken()
      if (!token) throw new Error('Please sign in again.')

      const response = await fetch('/api/admin/create-parent-link-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pupil_id: pupilId }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not generate parent link.')
      }

      const linkUrl = String(payload.link_url || '')
      const qrImageUrl = String(payload.qr_image_url || '')
      const expiresAt = String(payload.expires_at || '')

      if (!linkUrl) {
        throw new Error('Parent link generation returned an empty URL.')
      }

      setParentLinks(current => ({
        ...current,
        [pupilId]: {
          linkUrl,
          qrImageUrl,
          expiresAt,
        },
      }))
    } catch (error) {
      setParentLinkError(error instanceof Error ? error.message : 'Could not generate parent link.')
    } finally {
      setGeneratingPupilId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Loading admin workspace…</div>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>School setup needed</div>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', marginBottom: 14 }}>
            Add your school details before inviting staff.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/setup')}>Continue setup</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 24px 28px' }}>
      <div className="card" style={{ padding: '18px 16px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {school.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
              {school.local_authority ? `${school.local_authority} · ` : ''}AI {school.ai_enabled ? 'enabled' : 'disabled'}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/home')}
            style={{ whiteSpace: 'nowrap', width: 'auto', padding: '8px 12px', fontSize: 12 }}
          >
            Home
          </button>
        </div>
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

      <div className="card" style={{ padding: '16px', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Invite a teacher</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 10 }}>
          Generate a secure link for teacher signup. Optional: lock to one email address.
        </div>
        <input
          className="field"
          type="email"
          placeholder="teacher@school.org.uk (optional)"
          value={inviteEmail}
          onChange={event => setInviteEmail(event.target.value)}
          style={{ marginBottom: 10 }}
        />
        <button className="btn btn-primary" disabled={!canCreateInvite} onClick={createTeacherInvite}>
          {creatingInvite ? 'Generating...' : 'Generate teacher invite'}
        </button>

        {inviteError && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-red-soft)' }}>{inviteError}</div>
        )}

        {teacherInvite?.linkUrl && (
          <div className="card" style={{ marginTop: 12, padding: '10px 12px', borderColor: '#D2DEEE' }}>
            <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Invite link</div>
            <div style={{ fontSize: 12, color: 'var(--color-ink)', lineHeight: 1.45, wordBreak: 'break-all', marginBottom: 8 }}>
              {teacherInvite.linkUrl}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-ink-soft)' }}>Expires: {formatExpiry(teacherInvite.expiresAt)}</div>
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard(teacherInvite.linkUrl)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
              >
                Copy link
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Teachers ({teachers.length})</div>
        {teachers.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>No teachers linked yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teachers.map(teacher => (
              <div key={teacher.id} style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{teacher.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{teacher.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Parent QR links</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 10 }}>
          Generate a parent linking QR for each pupil. Parents can scan and sign in.
        </div>

        {parentLinkError && (
          <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--color-red-soft)' }}>{parentLinkError}</div>
        )}

        {sortedPupils.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>No pupils found yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedPupils.map(pupil => {
              const link = parentLinks[pupil.id]
              const isBusy = generatingPupilId === pupil.id
              return (
                <div key={pupil.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>
                        {pupil.first_name} {pupil.last_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{pupil.year_group}</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => createParentLink(pupil.id)}
                      disabled={!!generatingPupilId}
                      style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
                    >
                      {isBusy ? 'Generating...' : 'Generate link'}
                    </button>
                  </div>

                  {link && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Parent link</div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink)', lineHeight: 1.45, wordBreak: 'break-all', marginBottom: 8 }}>
                        {link.linkUrl}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => copyToClipboard(link.linkUrl)}
                          style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
                        >
                          Copy link
                        </button>
                        <div style={{ fontSize: 11, color: 'var(--color-ink-soft)' }}>Expires: {formatExpiry(link.expiresAt)}</div>
                      </div>
                      {link.qrImageUrl && (
                        <img
                          src={link.qrImageUrl}
                          alt={`QR link for ${pupil.first_name} ${pupil.last_name}`}
                          style={{ width: 132, height: 132, marginTop: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
