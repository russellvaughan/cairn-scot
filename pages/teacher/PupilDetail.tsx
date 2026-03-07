import { useParams, useNavigate } from 'react-router-dom'
import { getPupilById, getPupilAchievements, CURRICULUM_AREA_LABELS, CURRICULUM_AREA_ICONS, LEVEL_LABELS, formatDate } from '../../data/mock'
import type { CurriculumArea } from '../../types'

const AREA_COLORS: Partial<Record<CurriculumArea, { bg: string; text: string }>> = {
  literacy_english: { bg: 'var(--color-gold-faint)',  text: 'var(--color-gold)' },
  numeracy_maths:   { bg: 'var(--color-sky-light)',   text: 'var(--color-sky)' },
  health_wellbeing: { bg: 'var(--color-sage-faint)',  text: 'var(--color-sage)' },
  sciences:         { bg: 'var(--color-plum-faint)',  text: 'var(--color-plum)' },
  technologies:     { bg: '#EBF5F3',                  text: '#2D8C7A' },
  expressive_arts:  { bg: '#FDF0F7',                  text: '#A84E7B' },
  social_studies:   { bg: '#F5F0E8',                  text: '#8C6B2D' },
  rme:              { bg: '#EEF7F0',                  text: '#3D7A50' },
}

export default function PupilDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pupil = getPupilById(id || '')
  const achievements = getPupilAchievements(id || '')

  if (!pupil) return (
    <div className="empty-state">
      <div className="empty-state-icon">🤷</div>
      <div className="empty-state-title">Pupil not found</div>
    </div>
  )

  // Area coverage
  const areaCounts: Partial<Record<CurriculumArea, number>> = {}
  achievements.forEach(a => {
    if (a.curriculumArea) areaCounts[a.curriculumArea] = (areaCounts[a.curriculumArea] || 0) + 1
  })
  const maxCount = Math.max(...Object.values(areaCounts), 1)

  return (
    <div>
      {/* Nav */}
      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/teacher')} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-white)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Pupil Profile</span>
      </div>

      {/* Pupil header */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className={`avatar avatar-lg ${pupil.avatarColor}`}>{pupil.firstName[0]}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
              {pupil.firstName} {pupil.lastName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              {pupil.yearGroup} · {LEVEL_LABELS[pupil.currentLevel]}
              {!pupil.levelConfirmed && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-gold-faint)', color: 'var(--color-gold)', fontWeight: 600 }}>
                  Level not confirmed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { num: achievements.length,                                               label: 'Total achievements' },
            { num: achievements.filter(a => a.source === 'outside_school').length,    label: 'Outside school' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--color-gold)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Coverage */}
        <div className="section-header">
          <span className="section-title">Curriculum coverage</span>
        </div>
        <div className="card" style={{ padding: '16px', marginBottom: 24 }}>
          {Object.keys(CURRICULUM_AREA_LABELS).map(area => {
            const a = area as CurriculumArea
            const count = areaCounts[a] || 0
            const colors = AREA_COLORS[a] || { bg: 'var(--color-border)', text: 'var(--color-ink-muted)' }
            return (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{CURRICULUM_AREA_ICONS[a]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: count > 0 ? 'var(--color-ink)' : 'var(--color-ink-muted)' }}>
                      {CURRICULUM_AREA_LABELS[a]}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: count > 0 ? colors.text : 'transparent',
                      width: `${(count / maxCount) * 100}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Log button */}
        <button className="btn btn-gold" style={{ marginBottom: 24 }} onClick={() => navigate('/teacher/log')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log achievement for {pupil.firstName}
        </button>

        {/* Achievement feed */}
        <div className="section-header">
          <span className="section-title">Achievement timeline</span>
          <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{achievements.length} total</span>
        </div>

        {achievements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Nothing logged yet</div>
            <div className="empty-state-text">Log the first achievement to get started.</div>
          </div>
        ) : (
          achievements
            .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
            .map(achievement => {
              const colors = achievement.curriculumArea ? (AREA_COLORS[achievement.curriculumArea] || { bg: 'var(--color-border)', text: 'var(--color-ink-soft)' }) : { bg: 'var(--color-border)', text: 'var(--color-ink-soft)' }
              return (
                <div key={achievement.id} className="card" style={{ padding: '16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: achievement.source === 'school' ? 'var(--color-gold)' : 'var(--color-sage)',
                      }} />
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: achievement.source === 'school' ? 'var(--color-gold)' : 'var(--color-sage)',
                      }}>
                        {achievement.source === 'school' ? 'In school' : 'Outside school'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDate(achievement.achievementDate)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.6, marginBottom: 10 }}>
                    {achievement.description}
                  </div>
                  {achievement.outcomeCode && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {achievement.curriculumArea && (
                        <span className="chip" style={{ background: colors.bg, color: colors.text }}>
                          {CURRICULUM_AREA_LABELS[achievement.curriculumArea]}
                        </span>
                      )}
                      <span className="chip chip-muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                        {achievement.outcomeCode}
                      </span>
                      {achievement.aiSuggested && (
                        <span className="chip" style={{ background: 'var(--color-gold-faint)', color: 'var(--color-gold)' }}>AI mapped</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
