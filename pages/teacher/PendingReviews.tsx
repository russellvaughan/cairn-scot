import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockAchievements, getPupilById, CURRICULUM_AREA_LABELS, formatDate } from '../../data/mock'

export default function PendingReviews() {
  const navigate = useNavigate()
  const pending = mockAchievements.filter(a => a.status === 'pending_review')
  const [approved, setApproved] = useState<string[]>([])
  const [declined, setDeclined] = useState<string[]>([])

  const handleApprove = (id: string) => setApproved(prev => [...prev, id])
  const handleDecline = (id: string) => setDeclined(prev => [...prev, id])

  const remaining = pending.filter(a => !approved.includes(a.id) && !declined.includes(a.id))

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
        {remaining.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 60 }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All caught up</div>
            <div className="empty-state-text">No outside achievements waiting for review.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>
              These outside-school achievements have been submitted by parents. Review the suggested curriculum mapping and approve or decline each one.
            </div>

            {remaining.map(achievement => {
              const pupil = getPupilById(achievement.pupilId)
              if (!pupil) return null
              return (
                <div key={achievement.id} className="card animate-slide-up" style={{ padding: '18px', marginBottom: 16 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div className={`avatar avatar-sm ${pupil.avatarColor}`}>{pupil.firstName[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                        {pupil.firstName} {pupil.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                        Submitted by parent · {formatDate(achievement.achievementDate)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.6, marginBottom: 14, padding: '12px 14px', background: 'var(--color-stone)', borderRadius: 'var(--radius-sm)' }}>
                    {achievement.description}
                  </div>

                  {/* Parent category */}
                  {achievement.parentCategory && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span className="label-xs">Parent category:</span>
                      <span className="chip chip-muted" style={{ textTransform: 'capitalize' }}>
                        {achievement.parentCategory}
                      </span>
                    </div>
                  )}

                  {/* AI suggestion */}
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
                      {achievement.aiConfidence} match
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 14 }}
                      onClick={() => handleDecline(achievement.id)}
                    >
                      Decline
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 14, background: 'var(--color-sage)' }}
                      onClick={() => handleApprove(achievement.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Completed this session */}
        {(approved.length > 0 || declined.length > 0) && (
          <div style={{ marginTop: 24, padding: 16, background: 'var(--color-sage-faint)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sage-light)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-sage)', fontWeight: 600 }}>
              {approved.length > 0 && `${approved.length} approved`}
              {approved.length > 0 && declined.length > 0 && ' · '}
              {declined.length > 0 && `${declined.length} declined`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
