import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CURRICULUM_AREA_LABELS, formatDate, getPupilAchievements, getPupilById } from '../../data/mock'
import type { CfELevel, CurriculumArea } from '../../types'
import { fetchAuthUser, getStoredAccessToken, supabaseSelect } from '../../lib/supabase'

const FALLBACK_PUPIL_ID = 'p1'
const AVATAR_COLORS = ['av-gold', 'av-sage', 'av-sky', 'av-plum', 'av-rose', 'av-teal'] as const

type LocalPupil = {
  id: string
  firstName: string
  lastName: string
  yearGroup: string
  currentLevel: CfELevel
  levelConfirmed: boolean
  avatarColor: string
}

type LocalAchievement = {
  id: string
  pupilId: string
  description: string
  source: 'school' | 'outside_school'
  status: 'active' | 'pending_review' | 'declined'
  curriculumArea?: CurriculumArea
  achievementDate: string
}

type DbPupilRow = {
  id: string
  first_name: string
  last_name: string
  year_group: string
  current_level: string | null
  level_confirmed: boolean | null
}

type DbAchievementRow = {
  id: string
  pupil_id: string
  description: string
  source: 'school' | 'outside_school'
  status: 'active' | 'pending_review' | 'declined'
  curriculum_area: CurriculumArea | null
  achievement_date: string
}

function toLevel(value: string | null | undefined): CfELevel {
  if (value === 'early' || value === 'first' || value === 'second' || value === 'third_fourth' || value === 'senior') {
    return value
  }
  return 'second'
}

function avatarColorFromId(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function mapDbPupil(row: DbPupilRow): LocalPupil {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    yearGroup: row.year_group,
    currentLevel: toLevel(row.current_level),
    levelConfirmed: !!row.level_confirmed,
    avatarColor: avatarColorFromId(row.id),
  }
}

export default function StudentDemo() {
  const navigate = useNavigate()
  const [pupil, setPupil] = useState<LocalPupil | null>(null)
  const [achievements, setAchievements] = useState<LocalAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [linkHint, setLinkHint] = useState<string | null>(null)

  useEffect(() => {
    const loadFallback = (hint?: string) => {
      const fallbackPupil = getPupilById(FALLBACK_PUPIL_ID)
      if (!fallbackPupil) {
        setPupil(null)
        setAchievements([])
        setLinkHint(hint || null)
        setLoading(false)
        return
      }

      setPupil({
        id: fallbackPupil.id,
        firstName: fallbackPupil.firstName,
        lastName: fallbackPupil.lastName,
        yearGroup: fallbackPupil.yearGroup,
        currentLevel: fallbackPupil.currentLevel,
        levelConfirmed: fallbackPupil.levelConfirmed,
        avatarColor: fallbackPupil.avatarColor,
      })
      setAchievements(
        getPupilAchievements(fallbackPupil.id).map(achievement => ({
          id: achievement.id,
          pupilId: achievement.pupilId,
          description: achievement.description,
          source: achievement.source,
          status: achievement.status,
          curriculumArea: achievement.curriculumArea,
          achievementDate: achievement.achievementDate,
        }))
      )
      setLinkHint(hint || null)
      setLoading(false)
    }

    const loadStudentData = async () => {
      try {
        const accessToken = getStoredAccessToken()
        if (!accessToken) {
          loadFallback('Sign in to load your linked student record. Showing demo data.')
          return
        }

        const authUser = await fetchAuthUser(accessToken)
        if (!authUser) {
          loadFallback('Could not load your account. Showing demo data.')
          return
        }

        const metadata = authUser.user_metadata || {}
        const pupilIdFromMetadata =
          typeof metadata.pupil_id === 'string'
            ? metadata.pupil_id
            : Array.isArray(metadata.pupil_ids)
              ? (metadata.pupil_ids.find(id => typeof id === 'string') as string | undefined) || null
              : null

        if (!pupilIdFromMetadata) {
          loadFallback('Student account is not linked yet. Add pupil_id in user metadata to personalize this screen.')
          return
        }

        const dbPupils = await supabaseSelect<DbPupilRow[]>(
          'pupils',
          {
            select: 'id,first_name,last_name,year_group,current_level,level_confirmed',
            id: `eq.${pupilIdFromMetadata}`,
            limit: '1',
          },
          accessToken
        )

        if (!dbPupils.length) {
          loadFallback('Linked pupil record was not found. Showing demo data.')
          return
        }

        const mappedPupil = mapDbPupil(dbPupils[0])
        const dbAchievements = await supabaseSelect<DbAchievementRow[]>(
          'achievements',
          {
            select: 'id,pupil_id,description,source,status,curriculum_area,achievement_date',
            pupil_id: `eq.${mappedPupil.id}`,
            status: 'in.(active,pending_review)',
            order: 'achievement_date.desc',
          },
          accessToken
        )

        setPupil(mappedPupil)
        setAchievements(
          dbAchievements.map(achievement => ({
            id: achievement.id,
            pupilId: achievement.pupil_id,
            description: achievement.description,
            source: achievement.source,
            status: achievement.status,
            curriculumArea: achievement.curriculum_area || undefined,
            achievementDate: achievement.achievement_date,
          }))
        )
        setLinkHint(null)
        setLoading(false)
      } catch {
        loadFallback('Live student data could not be loaded. Showing demo data.')
      }
    }

    void loadStudentData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Loading your profile…</div>
        </div>
      </div>
    )
  }

  if (!pupil) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Profile unavailable</div>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>{linkHint || 'No student profile could be loaded.'}</div>
        </div>
      </div>
    )
  }

  const recent = achievements
    .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
    .slice(0, 5)

  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>STUDENT</div>

      {linkHint && (
        <div className="card" style={{ marginBottom: 12, padding: '12px 14px', borderColor: '#D2DEEE' }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>{linkHint}</div>
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: 18,
          padding: '18px 18px 16px',
          background: 'linear-gradient(170deg, #FFFFFF 0%, #F4F8F2 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className={`avatar avatar-lg ${pupil.avatarColor}`}>{pupil.firstName[0]}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 500, letterSpacing: '-0.02em' }}>
              {pupil.firstName} {pupil.lastName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{pupil.yearGroup}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
          Your recent achievements and progress moments.
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginBottom: 18 }} onClick={() => navigate('/student/add-achievement')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Log achievement
      </button>

      <div className="section-header">
        <span className="section-title">Recent achievements</span>
        <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{recent.length}</span>
      </div>

      {recent.map(achievement => (
        <div key={achievement.id} className="card" style={{ padding: '15px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: achievement.source === 'school' ? 'var(--color-gold)' : 'var(--color-sage)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {achievement.source === 'school' ? 'School' : 'Outside'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDate(achievement.achievementDate)}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.55, marginBottom: 10 }}>{achievement.description}</div>
          {achievement.curriculumArea && (
            <span className="chip chip-sage" style={{ fontWeight: 600 }}>
              {CURRICULUM_AREA_LABELS[achievement.curriculumArea]}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
