import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockAchievements, getPupilById, CURRICULUM_AREA_LABELS, formatDate } from '../../data/mock'
import type { AiConfidence, CurriculumArea } from '../../types'
import { fetchAuthUser, getStoredAccessToken, supabaseSelect, supabaseUpdate } from '../../lib/supabase'

type DbUserRow = {
  id: string
  school_id: string | null
}

type DbPupilRow = {
  id: string
  first_name: string
  last_name: string
  year_group: string
}

type DbOutcomeRow = {
  reference_code: string
  outcome_text: string
}

type DbPendingRow = {
  id: string
  pupil_id: string
  description: string
  parent_category: string | null
  curriculum_area: CurriculumArea | null
  cfe_level: string | null
  ai_confidence: AiConfidence | null
  achievement_date: string
  pupils: DbPupilRow | DbPupilRow[] | null
  cfe_outcomes?: DbOutcomeRow | DbOutcomeRow[] | null
}

type PendingItem = {
  id: string
  pupilId: string
  pupilFirstName: string
  pupilLastName: string
  pupilYearGroup: string
  avatarColor: string
  description: string
  parentCategory: string | null
  curriculumArea: CurriculumArea | null
  outcomeCode: string | null
  outcomeText: string | null
  aiConfidence: AiConfidence | null
  achievementDate: string
}

const AVATAR_COLORS = ['av-gold', 'av-sage', 'av-sky', 'av-plum', 'av-rose', 'av-teal'] as const

function avatarColorFromId(id: string): string {
  const hash = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function toPendingItem(row: DbPendingRow): PendingItem | null {
  const pupil = Array.isArray(row.pupils) ? row.pupils[0] : row.pupils
  if (!pupil) return null

  const outcome = Array.isArray(row.cfe_outcomes) ? row.cfe_outcomes[0] : row.cfe_outcomes

  return {
    id: row.id,
    pupilId: row.pupil_id,
    pupilFirstName: pupil.first_name,
    pupilLastName: pupil.last_name,
    pupilYearGroup: pupil.year_group,
    avatarColor: avatarColorFromId(pupil.id),
    description: row.description,
    parentCategory: row.parent_category,
    curriculumArea: row.curriculum_area,
    outcomeCode: outcome?.reference_code || null,
    outcomeText: outcome?.outcome_text || null,
    aiConfidence: row.ai_confidence,
    achievementDate: row.achievement_date,
  }
}

export default function PendingReviews() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dataHint, setDataHint] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [approved, setApproved] = useState<string[]>([])
  const [declined, setDeclined] = useState<string[]>([])
  const [busyIds, setBusyIds] = useState<string[]>([])

  useEffect(() => {
    const loadDemoFallback = (hint?: string) => {
      const demoPending: PendingItem[] = mockAchievements
        .filter(item => item.status === 'pending_review')
        .map(item => {
          const pupil = getPupilById(item.pupilId)
          if (!pupil) return null
          return {
            id: item.id,
            pupilId: item.pupilId,
            pupilFirstName: pupil.firstName,
            pupilLastName: pupil.lastName,
            pupilYearGroup: pupil.yearGroup,
            avatarColor: pupil.avatarColor,
            description: item.description,
            parentCategory: item.parentCategory || null,
            curriculumArea: item.curriculumArea || null,
            outcomeCode: item.outcomeCode || null,
            outcomeText: item.outcomeText || null,
            aiConfidence: item.aiConfidence || null,
            achievementDate: item.achievementDate,
          }
        })
        .filter((item): item is PendingItem => !!item)

      setPendingItems(demoPending)
      setDataHint(hint || null)
      setLoading(false)
    }

    const loadLive = async () => {
      try {
        const token = getStoredAccessToken()
        if (!token) {
          loadDemoFallback('Sign in to review live submissions. Showing demo pending items.')
          return
        }

        const authUser = await fetchAuthUser(token)
        if (!authUser?.id) {
          loadDemoFallback('Could not load your account. Showing demo pending items.')
          return
        }

        const users = await supabaseSelect<DbUserRow[]>(
          'users',
          {
            select: 'id,school_id',
            id: `eq.${authUser.id}`,
            limit: '1',
          },
          token
        )

        const schoolId = users[0]?.school_id
        if (!schoolId) {
          setPendingItems([])
          setDataHint('Your teacher profile is missing a school link. Set users.school_id for this account.')
          setLoading(false)
          return
        }

        const rows = await supabaseSelect<DbPendingRow[]>(
          'achievements',
          {
            select:
              'id,pupil_id,description,parent_category,curriculum_area,cfe_level,ai_confidence,achievement_date,pupils!inner(id,first_name,last_name,year_group),cfe_outcomes(reference_code,outcome_text)',
            school_id: `eq.${schoolId}`,
            source: 'eq.outside_school',
            status: 'eq.pending_review',
            order: 'achievement_date.desc',
            limit: '300',
          },
          token
        )

        const mapped = rows.map(toPendingItem).filter((item): item is PendingItem => !!item)
        setPendingItems(mapped)
        setDataHint(null)
        setLoading(false)
      } catch {
        setPendingItems([])
        setDataHint('Live pending submissions could not be loaded right now.')
        setLoading(false)
      }
    }

    void loadLive()
  }, [])

  const remaining = pendingItems

  const handleReview = async (id: string, approve: boolean) => {
    if (busyIds.includes(id)) return

    setBusyIds(prev => [...prev, id])
    setErrorMessage(null)

    try {
      const token = getStoredAccessToken()
      if (!token) {
        throw new Error('Please sign in again to complete this review action.')
      }

      await supabaseUpdate<DbPendingRow[]>(
        'achievements',
        {
          status: approve ? 'active' : 'declined',
          declined_reason: approve ? null : 'Declined by teacher review',
        },
        {
          id: `eq.${id}`,
        },
        token
      )

      setPendingItems(prev => prev.filter(item => item.id !== id))
      if (approve) {
        setApproved(prev => [...prev, id])
      } else {
        setDeclined(prev => [...prev, id])
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update review status.')
    } finally {
      setBusyIds(prev => prev.filter(busyId => busyId !== id))
    }
  }

  const summaryText = useMemo(() => {
    if (approved.length === 0 && declined.length === 0) return ''
    if (approved.length > 0 && declined.length > 0) return `${approved.length} approved · ${declined.length} declined`
    if (approved.length > 0) return `${approved.length} approved`
    return `${declined.length} declined`
  }, [approved.length, declined.length])

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>Loading pending reviews…</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/teacher')} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-white)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Pending Review</span>
        {remaining.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '4px 10px', background: 'var(--color-gold)', color: 'white', borderRadius: 'var(--radius-full)' }}>
            {remaining.length}
          </span>
        )}
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {dataHint && (
          <div className="card" style={{ padding: '12px 14px', marginBottom: 14, borderColor: '#D2DEEE' }}>
            <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>{dataHint}</div>
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

        {remaining.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 60 }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All caught up</div>
            <div className="empty-state-text">No outside achievements waiting for review.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>
              These outside-school achievements were submitted by families. Approve or decline each one.
            </div>

            {remaining.map(achievement => {
              const isBusy = busyIds.includes(achievement.id)

              return (
                <div key={achievement.id} className="card animate-slide-up" style={{ padding: '18px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div className={`avatar avatar-sm ${achievement.avatarColor}`}>{achievement.pupilFirstName[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                        {achievement.pupilFirstName} {achievement.pupilLastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                        {achievement.pupilYearGroup} · Submitted by parent · {formatDate(achievement.achievementDate)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.6, marginBottom: 14, padding: '12px 14px', background: 'var(--color-stone)', borderRadius: 'var(--radius-sm)' }}>
                    {achievement.description}
                  </div>

                  {achievement.parentCategory && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span className="label-xs">Parent category:</span>
                      <span className="chip chip-muted" style={{ textTransform: 'capitalize' }}>
                        {achievement.parentCategory}
                      </span>
                    </div>
                  )}

                  <div style={{
                    background: 'var(--color-gold-faint)', border: '1px solid var(--color-gold-light)',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16,
                  }}>
                    <div className="label-gold" style={{ marginBottom: 8 }}>Suggested mapping</div>
                    {achievement.curriculumArea && (
                      <div style={{ fontSize: 13, color: 'var(--color-ink)', marginBottom: 4 }}>
                        <strong>{CURRICULUM_AREA_LABELS[achievement.curriculumArea]}</strong>
                      </div>
                    )}
                    {achievement.outcomeCode && (
                      <div style={{ fontSize: 12, color: 'var(--color-gold)', fontWeight: 600, marginBottom: 4 }}>
                        {achievement.outcomeCode}
                      </div>
                    )}
                    {achievement.outcomeText && (
                      <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
                        {achievement.outcomeText}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 6, textTransform: 'capitalize' }}>
                      {achievement.aiConfidence ? `${achievement.aiConfidence} match` : 'manual suggestion'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 14, opacity: isBusy ? 0.5 : 1 }}
                      onClick={() => handleReview(achievement.id, false)}
                      disabled={isBusy}
                    >
                      {isBusy ? 'Saving...' : 'Decline'}
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 14, background: 'var(--color-sage)', opacity: isBusy ? 0.5 : 1 }}
                      onClick={() => handleReview(achievement.id, true)}
                      disabled={isBusy}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {isBusy ? 'Saving...' : 'Approve'}
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {summaryText && (
          <div style={{ marginTop: 24, padding: 16, background: 'var(--color-sage-faint)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sage-light)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-sage)', fontWeight: 600 }}>
              {summaryText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
