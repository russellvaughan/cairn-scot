import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CfELevel } from '../../types'
import { fetchAuthUser, getStoredAccessToken, supabaseInsert, supabaseSelect } from '../../lib/supabase'

const YEAR_GROUPS = [
  'Nursery',
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7',
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6',
]

const YEAR_GROUP_TO_LEVEL: Record<string, CfELevel> = {
  Nursery: 'early',
  P1: 'early',
  P2: 'first',
  P3: 'first',
  P4: 'first',
  P5: 'second',
  P6: 'second',
  P7: 'second',
  S1: 'third_fourth',
  S2: 'third_fourth',
  S3: 'third_fourth',
  S4: 'senior',
  S5: 'senior',
  S6: 'senior',
}

type DbUserRow = {
  id: string
  school_id: string | null
}

type DbClassRow = {
  id: string
  school_id: string
  teacher_id: string | null
  name: string
  year_group: string
  academic_year: string
}

type DbPupilRow = {
  id: string
  first_name: string
  last_name: string
  year_group: string
}

function currentAcademicYear(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = String((startYear + 1) % 100).padStart(2, '0')
  return `${startYear}/${endYear}`
}

export default function AddPupil() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [yearGroup, setYearGroup] = useState('P5')
  const [saving, setSaving] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const levelPreview = useMemo(() => YEAR_GROUP_TO_LEVEL[yearGroup] || 'second', [yearGroup])

  const canSave = firstName.trim().length > 0 && lastName.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!canSave) return

    setSaving(true)
    setErrorMessage(null)

    try {
      const accessToken = getStoredAccessToken()
      if (!accessToken) {
        throw new Error('Please sign in again before adding a pupil.')
      }

      const authUser = await fetchAuthUser(accessToken)
      if (!authUser?.id) {
        throw new Error('Could not resolve your teacher account.')
      }

      const users = await supabaseSelect<DbUserRow[]>(
        'users',
        {
          select: 'id,school_id',
          id: `eq.${authUser.id}`,
          limit: '1',
        },
        accessToken
      )

      const user = users[0]
      if (!user?.school_id) {
        throw new Error('Your account is not linked to a school yet. Add school_id to your user profile first.')
      }

      const classes = await supabaseSelect<DbClassRow[]>(
        'classes',
        {
          select: 'id,school_id,teacher_id,name,year_group,academic_year',
          teacher_id: `eq.${authUser.id}`,
          order: 'academic_year.desc',
          limit: '1',
        },
        accessToken
      )

      let classId = classes[0]?.id
      if (!classId) {
        const createdClasses = await supabaseInsert<DbClassRow[]>(
          'classes',
          {
            school_id: user.school_id,
            teacher_id: authUser.id,
            name: `${yearGroup} Class`,
            year_group: yearGroup,
            academic_year: currentAcademicYear(),
          },
          accessToken
        )

        classId = createdClasses[0]?.id
      }

      if (!classId) {
        throw new Error('Could not create or find your class.')
      }

      const pupils = await supabaseInsert<DbPupilRow[]>(
        'pupils',
        {
          school_id: user.school_id,
          class_id: classId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          year_group: yearGroup,
          current_level: YEAR_GROUP_TO_LEVEL[yearGroup] || 'second',
          level_confirmed: false,
        },
        accessToken
      )

      const created = pupils[0]
      setSavedName(created ? `${created.first_name} ${created.last_name}` : `${firstName.trim()} ${lastName.trim()}`)
      setTimeout(() => navigate('/teacher'), 900)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not add pupil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/teacher')}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Add Pupil</span>
      </div>

      <div style={{ padding: '0 24px 28px' }}>
        {savedName && (
          <div
            className="card"
            style={{
              padding: '12px 14px',
              marginBottom: 14,
              borderColor: 'var(--color-sage-light)',
              background: 'var(--color-sage-faint)',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-sage)' }}>{savedName} added successfully.</div>
          </div>
        )}

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

        <div className="label-xs" style={{ marginBottom: 8 }}>First name</div>
        <input
          className="field"
          placeholder="First name"
          value={firstName}
          onChange={event => setFirstName(event.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="label-xs" style={{ marginBottom: 8 }}>Last name</div>
        <input
          className="field"
          placeholder="Last name"
          value={lastName}
          onChange={event => setLastName(event.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="label-xs" style={{ marginBottom: 8 }}>Year group</div>
        <select
          className="field"
          value={yearGroup}
          onChange={event => setYearGroup(event.target.value)}
          style={{ marginBottom: 14 }}
        >
          {YEAR_GROUPS.map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>

        <div
          style={{
            marginBottom: 22,
            background: 'var(--color-stone)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            fontSize: 12,
            color: 'var(--color-ink-soft)',
          }}
        >
          Default CfE level for {yearGroup}: <strong style={{ color: 'var(--color-ink)' }}>{levelPreview}</strong>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.45 }}
        >
          {saving ? 'Saving…' : 'Save pupil'}
        </button>
      </div>
    </div>
  )
}
