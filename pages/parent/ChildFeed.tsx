import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPupilById, getPupilAchievements,
  CURRICULUM_AREA_LABELS, CURRICULUM_AREA_ICONS,
  getPupilCoverageAreas, formatDate
} from '../../data/mock'
import type { CurriculumArea } from '../../types'

const PUPIL_ID = 'p1' // demo — Callum

const AREA_TAG_STYLES: Partial<Record<CurriculumArea, { bg: string; color: string }>> = {
  literacy_english: { bg: 'var(--color-gold-faint)',  color: 'var(--color-gold)' },
  numeracy_maths:   { bg: 'var(--color-sky-light)',   color: 'var(--color-sky)' },
  health_wellbeing: { bg: 'var(--color-sage-faint)',  color: 'var(--color-sage)' },
  sciences:         { bg: 'var(--color-plum-faint)',  color: 'var(--color-plum)' },
  technologies:     { bg: '#EBF5F3',                  color: '#2D8C7A' },
  expressive_arts:  { bg: '#FDF0F7',                  color: '#A84E7B' },
  social_studies:   { bg: '#F5F0E8',                  color: '#8C6B2D' },
  rme:              { bg: '#EEF7F0',                  color: '#3D7A50' },
}

export default function ChildFeed() {
  const navigate = useNavigate()
  const pupil = getPupilById(PUPIL_ID)!
  const achievements = getPupilAchievements(PUPIL_ID)
  const [filterArea, setFilterArea] = useState<CurriculumArea | null>(null)
  const coverage = getPupilCoverageAreas(PUPIL_ID)
  const allAreas = Object.keys(coverage) as CurriculumArea[]

  const filtered = filterArea
    ? achievements.filter(a => a.curriculumArea === filterArea)
    : achievements

  const outsideCount = achievements.filter(a => a.source === 'outside_school').length

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
          cairn<span style={{ color: 'var(--color-gold)' }}>.</span>
        </div>
        <button style={{
          width: 38, height: 38, background: 'var(--color-white)', border: '1px solid var(--color-border)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          position: 'relative',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="notif-dot" style={{ position: 'absolute', top: 8, right: 8 }} />
        </button>
      </div>

      {/* Child summary card */}
      <div style={{
        margin: '0 24px 24px',
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F4F8F2 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 22px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(194,123,43,0.14) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(74,103,65,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div className={`avatar avatar-lg ${pupil.avatarColor}`}>{pupil.firstName[0]}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--color-ink)', letterSpacing: '-0.01em' }}>
                {pupil.firstName} {pupil.lastName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 2 }}>
                Hawick Primary · {pupil.yearGroup}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { num: achievements.length, label: 'Achievements\nthis term' },
              { num: allAreas.length,     label: 'Curriculum\nareas active' },
              { num: outsideCount,        label: 'Outside\nschool' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 4, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Areas of learning */}
      <div style={{ padding: '0 24px 20px' }}>
        <div className="section-header">
          <span className="section-title">Areas of learning</span>
          <button className="section-link" onClick={() => setFilterArea(null)}>
            {filterArea ? 'Show all' : 'All areas'}
          </button>
        </div>
        <div className="scroll-row">
          {allAreas.map(area => {
            const count = coverage[area] || 0
            const active = count >= 5
            const style = AREA_TAG_STYLES[area]
            const isSelected = filterArea === area
            return (
              <button key={area}
                onClick={() => setFilterArea(isSelected ? null : area)}
                style={{
                  flexShrink: 0, width: 90,
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${isSelected ? (style?.color || 'var(--color-gold)') : active ? (style?.bg || 'var(--color-gold-faint)') : 'var(--color-border)'}`,
                  background: isSelected ? (style?.color || 'var(--color-gold)') : active ? (style?.bg || 'var(--color-gold-faint)') : 'var(--color-white)',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{CURRICULUM_AREA_ICONS[area]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: isSelected ? 'white' : active ? (style?.color || 'var(--color-gold)') : 'var(--color-ink-muted)' }}>
                  {CURRICULUM_AREA_LABELS[area]}
                </div>
                <div style={{ fontSize: 10, marginTop: 3, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-ink-muted)' }}>
                  {count} this term
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add outside achievement */}
      <div style={{ padding: '0 24px 20px' }}>
        <button
          onClick={() => navigate('/parent/add-outside')}
          style={{
            width: '100%', background: 'transparent',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
          <div style={{
            width: 38, height: 38, background: 'var(--color-sage-faint)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>Add an outside achievement</div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Sport, music, volunteering — anything counts</div>
          </div>
        </button>
      </div>

      {/* Feed */}
      <div style={{ padding: '0 24px 24px' }}>
        <div className="section-header">
          <span className="section-title">
            {filterArea ? CURRICULUM_AREA_LABELS[filterArea] : 'Recent achievements'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{filtered.length}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{filterArea ? CURRICULUM_AREA_ICONS[filterArea] : '📋'}</div>
            <div className="empty-state-title">Nothing here yet</div>
            <div className="empty-state-text">
              {filterArea ? `No achievements in ${CURRICULUM_AREA_LABELS[filterArea]} yet.` : 'No achievements logged yet.'}
            </div>
          </div>
        ) : (
          filtered
            .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
            .map(achievement => {
              const areaStyle = achievement.curriculumArea ? (AREA_TAG_STYLES[achievement.curriculumArea] || { bg: 'var(--color-border)', color: 'var(--color-ink-soft)' }) : null
              return (
                <div key={achievement.id} className="card" style={{ padding: '18px 18px 14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
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
                    <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                      {formatDate(achievement.achievementDate)}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.6, marginBottom: 12 }}>
                    {achievement.description}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {achievement.curriculumArea && areaStyle && (
                      <span className="chip" style={{ background: areaStyle.bg, color: areaStyle.color }}>
                        {CURRICULUM_AREA_LABELS[achievement.curriculumArea]}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
