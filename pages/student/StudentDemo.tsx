import { useNavigate } from 'react-router-dom'
import { getPupilById, getPupilAchievements, CURRICULUM_AREA_LABELS, formatDate } from '../../data/mock'

const PUPIL_ID = 'p1'

export default function StudentDemo() {
  const navigate = useNavigate()
  const pupil = getPupilById(PUPIL_ID)
  const achievements = getPupilAchievements(PUPIL_ID)
    .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
    .slice(0, 5)

  if (!pupil) return null

  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>
        STUDENT DEMO
      </div>

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
          A clean, student-friendly view of recent achievements and progress moments.
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
        <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{achievements.length}</span>
      </div>

      {achievements.map(achievement => (
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
