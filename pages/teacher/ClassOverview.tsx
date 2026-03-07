import { useNavigate } from 'react-router-dom'
import {
  mockPupils,
  mockAchievements,
  getLastAchievementDate,
  getDaysSince,
  formatDate,
  getPupilCoverageAreas,
} from '../../data/mock'
import type { CurriculumArea } from '../../types'

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

export default function ClassOverview() {
  const navigate = useNavigate()

  const totalAchievements = mockAchievements.filter(a => a.status === 'active').length
  const outsideSchool = mockAchievements.filter(a => a.source === 'outside_school' && a.status === 'active').length
  const pending = mockAchievements.filter(a => a.status === 'pending_review').length

  const pupils = mockPupils
    .map(pupil => {
      const last = getLastAchievementDate(pupil.id)
      const days = last ? getDaysSince(last) : 999
      const outsideCount = mockAchievements.filter(
        a => a.pupilId === pupil.id && a.source === 'outside_school' && a.status === 'active'
      ).length
      return { pupil, last, days, outsideCount }
    })
    .sort((a, b) => b.days - a.days)

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
                P5 Thistle
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
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: pending > 0 ? 'var(--color-gold)' : 'var(--color-stone)',
            border: pending > 0 ? 'none' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
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
            {mockPupils.length} pupils · {totalAchievements} achievements · {outsideSchool} outside
          </span>
        </div>

        {pupils.map(({ pupil, last, days, outsideCount }) => {
          const coverage = getPupilCoverageAreas(pupil.id)
          const areas = Object.entries(coverage) as [CurriculumArea, number][]
          const stale = days >= 7

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
              <div className={`avatar avatar-md ${pupil.avatarColor}`}>
                {pupil.firstName[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                    {pupil.firstName} {pupil.lastName}
                  </span>

                  {outsideCount > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-sage-faint)',
                      color: 'var(--color-sage)',
                    }}>
                      outside
                    </span>
                  )}

                  {!pupil.levelConfirmed && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-gold-faint)',
                      color: 'var(--color-gold)',
                    }}>
                      level to confirm
                    </span>
                  )}

                  {stale && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: '#FFF1DD',
                      color: '#A45D09',
                    }}>
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
                        <div key={area} style={{
                          height: 5,
                          width: Math.max(10, count * 8),
                          borderRadius: 3,
                          background: COVERAGE_COLORS[area] || 'var(--color-ink-muted)',
                        }} />
                      ))
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
