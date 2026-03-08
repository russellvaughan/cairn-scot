import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  mockPupils,
  mockAchievements,
  formatDate,
  getDaysSince,
  getLastAchievementDate,
  getPupilCoverageAreas,
} from '../../data/mock'
import type { CfELevel, CurriculumArea } from '../../types'
import { fetchAuthUser, getStoredAccessToken, supabaseSelect } from '../../lib/supabase'

const COVERAGE_COLORS: Partial<Record<CurriculumArea, string>> = {
  literacy_english: 'var(--color-gold)',
  numeracy_maths: '#3B6EA8',
  health_wellbeing: 'var(--color-sage)',
  sciences: '#7B4EA8',
  technologies: '#2D8C7A',
  expressive_arts: '#A84E7B',
  social_studies: '#8C6B2D',
  rme: '#5E9E6E',
}

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
  source: 'school' | 'outside_school'
  status: 'active' | 'pending_review' | 'declined'
  curriculumArea?: CurriculumArea
  achievementDate: string
}

type DbUserRow = {
  id: string
  school_id: string | null
  role: string
}

type DbClassRow = {
  id: string
  name: string
  year_group: string
  academic_year: string
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
  source: 'school' | 'outside_school'
  status: 'active' | 'pending_review' | 'declined'
  curriculum_area: CurriculumArea | null
  achievement_date: string
}

function avatarColorFromId(id: string): string {
  const hash = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function toLevel(level: string | null | undefined): CfELevel {
  if (level === 'early' || level === 'first' || level === 'second' || level === 'third_fourth' || level === 'senior') {
    return level
  }
  return 'second'
}

export default function ClassOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dataHint, setDataHint] = useState<string | null>(null)
  const [classTitle, setClassTitle] = useState('P5 Thistle')
  const [pupils, setPupils] = useState<LocalPupil[]>(mockPupils)
  const [achievements, setAchievements] = useState<LocalAchievement[]>(
    mockAchievements.map(item => ({
      id: item.id,
      pupilId: item.pupilId,
      source: item.source,
      status: item.status,
      curriculumArea: item.curriculumArea,
      achievementDate: item.achievementDate,
    }))
  )

  useEffect(() => {
    const loadFallback = (hint?: string) => {
      setClassTitle('P5 Thistle')
      setPupils(mockPupils)
      setAchievements(
        mockAchievements.map(item => ({
          id: item.id,
          pupilId: item.pupilId,
          source: item.source,
          status: item.status,
          curriculumArea: item.curriculumArea,
          achievementDate: item.achievementDate,
        }))
      )
      setDataHint(hint || null)
      setLoading(false)
    }

    const loadTeacherData = async () => {
      try {
        const token = getStoredAccessToken()
        if (!token) {
          loadFallback('Sign in to load your teacher workspace. Showing demo data.')
          return
        }

        const authUser = await fetchAuthUser(token)
        if (!authUser?.id) {
          setClassTitle('Teacher workspace')
          setPupils([])
          setAchievements([])
          setDataHint('Your session could not be verified. Sign in again to load your class data.')
          setLoading(false)
          return
        }

        const users = await supabaseSelect<DbUserRow[]>(
          'users',
          {
            select: 'id,school_id,role',
            id: `eq.${authUser.id}`,
            limit: '1',
          },
          token
        )

        const profile = users[0]
        if (!profile?.school_id) {
          setClassTitle('Teacher setup needed')
          setPupils([])
          setAchievements([])
          setDataHint('Your teacher profile is missing a school link. Set users.school_id for this account to enable live data.')
          setLoading(false)
          return
        }

        const classes = await supabaseSelect<DbClassRow[]>(
          'classes',
          {
            select: 'id,name,year_group,academic_year',
            teacher_id: `eq.${authUser.id}`,
            order: 'academic_year.desc,name.asc',
            limit: '1',
          },
          token
        )

        const activeClass = classes[0]
        if (!activeClass) {
          setClassTitle('No class assigned yet')
          setPupils([])
          setAchievements([])
          setDataHint('Create or assign a class, then add pupils to start logging achievements.')
          setLoading(false)
          return
        }

        const dbPupils = await supabaseSelect<DbPupilRow[]>(
          'pupils',
          {
            select: 'id,first_name,last_name,year_group,current_level,level_confirmed',
            class_id: `eq.${activeClass.id}`,
            order: 'last_name.asc,first_name.asc',
            limit: '300',
          },
          token
        )

        const mappedPupils: LocalPupil[] = dbPupils.map(pupil => ({
          id: pupil.id,
          firstName: pupil.first_name,
          lastName: pupil.last_name,
          yearGroup: pupil.year_group,
          currentLevel: toLevel(pupil.current_level),
          levelConfirmed: !!pupil.level_confirmed,
          avatarColor: avatarColorFromId(pupil.id),
        }))

        let mappedAchievements: LocalAchievement[] = []
        if (mappedPupils.length > 0) {
          const pupilIds = mappedPupils.map(pupil => pupil.id)
          const dbAchievements = await supabaseSelect<DbAchievementRow[]>(
            'achievements',
            {
              select: 'id,pupil_id,source,status,curriculum_area,achievement_date',
              pupil_id: `in.(${pupilIds.join(',')})`,
              status: 'in.(active,pending_review)',
              order: 'achievement_date.desc',
              limit: '500',
            },
            token
          )

          mappedAchievements = dbAchievements.map(achievement => ({
            id: achievement.id,
            pupilId: achievement.pupil_id,
            source: achievement.source,
            status: achievement.status,
            curriculumArea: achievement.curriculum_area || undefined,
            achievementDate: achievement.achievement_date,
          }))
        }

        setClassTitle(activeClass.name)
        setPupils(mappedPupils)
        setAchievements(mappedAchievements)
        setDataHint(null)
        setLoading(false)
      } catch {
        setClassTitle('Teacher workspace')
        setPupils([])
        setAchievements([])
        setDataHint('Live class data could not be loaded right now.')
        setLoading(false)
      }
    }

    void loadTeacherData()
  }, [])

  const totalAchievements = useMemo(
    () => achievements.filter(item => item.status === 'active').length,
    [achievements]
  )
  const outsideSchool = useMemo(
    () => achievements.filter(item => item.source === 'outside_school' && item.status === 'active').length,
    [achievements]
  )
  const pending = useMemo(
    () => achievements.filter(item => item.status === 'pending_review').length,
    [achievements]
  )

  const pupilsWithStats = useMemo(() => {
    if (!pupils.length) return []

    return pupils
      .map(pupil => {
        if (dataHint) {
          const last = getLastAchievementDate(pupil.id)
          const days = last ? getDaysSince(last) : 999
          const outsideCount = mockAchievements.filter(
            item => item.pupilId === pupil.id && item.source === 'outside_school' && item.status === 'active'
          ).length
          return { pupil, last, days, outsideCount }
        }

        const pupilAchievements = achievements.filter(item => item.pupilId === pupil.id)
        const activeAchievements = pupilAchievements.filter(item => item.status === 'active')
        const last = activeAchievements
          .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))[0]?.achievementDate || null
        const days = last ? getDaysSince(last) : 999
        const outsideCount = activeAchievements.filter(item => item.source === 'outside_school').length
        return { pupil, last, days, outsideCount }
      })
      .sort((a, b) => b.days - a.days)
  }, [pupils, achievements, dataHint])

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Loading your class…</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '16px 24px 10px' }}>
        <div className="card" style={{ padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600, marginBottom: 2 }}>
                Class Dashboard
              </div>
              <h1 style={{ fontSize: 27, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
                {classTitle}
              </h1>
            </div>
            <button
              onClick={() => navigate('/teacher/log')}
              style={{
                width: 44,
                height: 44,
                background: 'var(--color-gold)',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 12px' }}>
        <button
          className="btn btn-secondary"
          style={{
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            padding: '12px 14px',
          }}
          onClick={() => navigate('/teacher/pupils/new')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add pupil
        </button>
      </div>

      {dataHint && (
        <div style={{ padding: '0 24px 12px' }}>
          <div className="card" style={{ padding: '12px 14px', borderColor: '#D2DEEE' }}>
            <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.55 }}>{dataHint}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 24px 14px' }}>
        <button
          onClick={() => navigate('/teacher/pending')}
          style={{
            width: '100%',
            background: pending > 0 ? 'var(--color-gold-faint)' : 'var(--color-white)',
            border: pending > 0 ? '1.5px solid var(--color-gold-light)' : '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '15px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: pending > 0 ? 'var(--color-gold)' : 'var(--color-stone)',
              border: pending > 0 ? 'none' : '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pending > 0 ? 'white' : 'var(--color-ink-soft)'} strokeWidth="2.2" strokeLinecap="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 1 }}>
              {pending > 0
                ? `${pending} achievement${pending > 1 ? 's' : ''} waiting for review`
                : 'No pending reviews'}
            </div>
            <div style={{ fontSize: 12, color: pending > 0 ? 'var(--color-gold)' : 'var(--color-ink-muted)', fontWeight: 500 }}>
              {pending > 0 ? 'Parent submissions ready to approve' : 'You are all caught up'}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pending > 0 ? 'var(--color-gold)' : 'var(--color-ink-muted)'} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <div className="section-header">
          <span className="section-title">Pupil list</span>
          <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
            {pupils.length} pupils · {totalAchievements} achievements · {outsideSchool} outside
          </span>
        </div>

        {pupilsWithStats.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 12px' }}>
            <div className="empty-state-icon">🧭</div>
            <div className="empty-state-title">No pupils yet</div>
            <div className="empty-state-text" style={{ marginBottom: 12 }}>
              Add your first pupil to start logging individual achievements.
            </div>
            <button
              className="btn btn-primary"
              style={{ maxWidth: 260, margin: '0 auto' }}
              onClick={() => navigate('/teacher/pupils/new')}
            >
              Add first pupil
            </button>
          </div>
        ) : (
          pupilsWithStats.map(({ pupil, last, days, outsideCount }) => {
            const stale = days >= 7

            const coverage = dataHint
              ? getPupilCoverageAreas(pupil.id)
              : achievements
                  .filter(item => item.pupilId === pupil.id && item.status === 'active' && !!item.curriculumArea)
                  .reduce((acc, item) => {
                    if (!item.curriculumArea) return acc
                    acc[item.curriculumArea] = (acc[item.curriculumArea] || 0) + 1
                    return acc
                  }, {} as Partial<Record<CurriculumArea, number>>)

            const areas = Object.entries(coverage) as [CurriculumArea, number][]

            return (
              <button
                key={pupil.id}
                onClick={() => navigate(`/teacher/pupil/${pupil.id}`)}
                className="card"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 9,
                  cursor: 'pointer',
                  border: stale ? '1px solid #F0D3B1' : '1px solid var(--color-border)',
                  background: stale ? '#FFFBF6' : 'var(--color-white)',
                }}
              >
                <div className={`avatar avatar-md ${pupil.avatarColor}`}>{pupil.firstName[0]}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {pupil.firstName} {pupil.lastName}
                    </span>

                    {outsideCount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-sage-faint)',
                          color: 'var(--color-sage)',
                        }}
                      >
                        outside
                      </span>
                    )}

                    {!pupil.levelConfirmed && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-gold-faint)',
                          color: 'var(--color-gold)',
                        }}
                      >
                        level to confirm
                      </span>
                    )}

                    {stale && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: '#FFF1DD',
                          color: '#A45D09',
                        }}
                      >
                        check in
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 6 }}>
                    {last ? `Last logged ${formatDate(last)}` : 'No achievements logged yet'}
                  </div>

                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {areas.length === 0 ? (
                      <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>No coverage yet</span>
                    ) : (
                      areas
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([area, count]) => (
                          <div
                            key={area}
                            style={{
                              height: 5,
                              width: Math.max(10, count * 8),
                              borderRadius: 3,
                              background: COVERAGE_COLORS[area] || 'var(--color-ink-muted)',
                            }}
                          />
                        ))
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
