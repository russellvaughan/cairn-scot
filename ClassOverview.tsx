import { useNavigate } from 'react-router-dom'
import {
  mockPupils, mockAchievements,
  getLastAchievementDate, getDaysSince, formatDate,
  getPupilCoverageAreas, CURRICULUM_AREA_ICONS
} from '../../data/mock'
import type { CurriculumArea } from '../../types'

const COVERAGE_COLORS: Partial<Record<CurriculumArea, string>> = {
  literacy_english: 'var(--color-gold)',
  numeracy_maths:   '#3B6EA8',
  health_wellbeing: 'var(--color-sage)',
  sciences:         '#7B4EA8',
  technologies:     '#2D8C7A',
  expressive_arts:  '#A84E7B',
  social_studies:   '#8C6B2D',
  rme:              '#5E9E6E',
}

export default function ClassOverview() {
  const navigate = useNavigate()

  const totalAchievements = mockAchievements.filter(a => a.status === 'active').length
  const outsideSchool = mockAchievements.filter(a => a.source === 'outside_school' && a.status === 'active').length
  const pending = mockAchievements.filter(a => a.status === 'pending_review').length

  const needsAttention = mockPupils.filter(p => {
    const last = getLastAchievementDate(p.id)
    return !last || getDaysSince(last) >= 7
  })

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500, marginBottom: 2 }}>
            Good morning, Ms Elliot
          </div>
          <h1 style={{ fontSize: 28, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            P5 Thistle
          </h1>
        </div>
        <button
          onClick={() => navigate('/teacher/log')}
          style={{
            width: 46, height: 46,
            background: 'var(--color-gold)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-gold)',
            marginTop: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 24px 20px' }}>
        {[
          { num: totalAchievements, label: 'Achievements\nthis term', color: 'var(--color-ink)' },
          { num: outsideSchool,     label: 'Outside\nschool',         color: 'var(--color-gold)' },
          { num: mockPupils.length, label: 'Pupils in\nyour class',   color: 'var(--color-sage)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.num}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 4, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <div className="section-header">
            <span className="section-title">Needs attention</span>
            <button className="section-link">{needsAttention.length} pupils</button>
          </div>
          {needsAttention.slice(0, 3).map(pupil => {
            const last = getLastAchievementDate(pupil.id)
            const days = last ? getDaysSince(last) : 999
            return (
              <button
                key={pupil.id}
                onClick={() => navigate(`/teacher/pupil/${pupil.id}`)}
                style={{
                  width: '100%',
                  background: 'var(--color-red-faint)',
                  border: '1.5px solid var(--color-red-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div className={`avatar avatar-md ${pupil.avatarColor}`}>
                  {pupil.firstName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>
                    {pupil.firstName} {pupil.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-red-soft)', fontWeight: 500 }}>
                    {last ? `No achievements in ${days} days` : 'No achievements logged yet'}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-red-soft)' }}>
                  {last ? `${days}d` : '—'}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Pending approvals */}
      {pending > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <button
            onClick={() => navigate('/teacher/pending')}
            style={{
              width: '100%',
              background: 'var(--color-gold-faint)',
              border: '1.5px solid var(--color-gold-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-gold)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>
                {pending} outside achievement{pending > 1 ? 's' : ''} to review
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-gold)', fontWeight: 500 }}>
                Submitted by parents — tap to approve
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Pupil list */}
      <div style={{ padding: '0 24px 24px' }}>
        <div className="section-header">
          <span className="section-title">Your class</span>
          <button className="section-link">Filter</button>
        </div>

        {mockPupils.map(pupil => {
          const last = getLastAchievementDate(pupil.id)
          const days = last ? getDaysSince(last) : 999
          const coverage = getPupilCoverageAreas(pupil.id)
          const areas = Object.entries(coverage) as [CurriculumArea, number][]
          const outsideCount = mockAchievements.filter(a => a.pupilId === pupil.id && a.source === 'outside_school' && a.status === 'active').length

          return (
            <button
              key={pupil.id}
              onClick={() => navigate(`/teacher/pupil/${pupil.id}`)}
              className="card"
              style={{
                width: '100%', textAlign: 'left',
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 8,
                cursor: 'pointer', border: '1px solid var(--color-border)',
                background: 'var(--color-white)',
              }}
            >
              <div className={`avatar avatar-md ${pupil.avatarColor}`}>
                {pupil.firstName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                    {pupil.firstName} {pupil.lastName}
                  </span>
                  {outsideCount > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-sage-faint)', color: 'var(--color-sage)',
                    }}>+outside</span>
                  )}
                  {!pupil.levelConfirmed && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-gold-faint)', color: 'var(--color-gold)',
                    }}>level unset</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {areas.length === 0 ? (
                    <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>No achievements yet</span>
                  ) : (
                    areas.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([area, count]) => (
                      <div key={area} style={{
                        height: 5, width: Math.max(10, count * 8),
                        borderRadius: 3,
                        background: COVERAGE_COLORS[area] || 'var(--color-ink-muted)',
                      }} />
                    ))
                  )}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: days <= 2 ? 'var(--color-sage)' : days >= 7 ? 'var(--color-amber)' : 'var(--color-ink-muted)',
                textAlign: 'right', flexShrink: 0,
              }}>
                {last ? formatDate(last) : '—'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
