import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PARENT_CATEGORIES } from '../../data/mock'

export default function AddOutside() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = description.length >= 10 && category !== null

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🎉</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Submitted!
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 32 }}>
          Your child's teacher will review this and add it to their achievement record. You'll be notified when it's approved.
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 6 }}>What you submitted</div>
          <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.6 }}>{description}</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/parent')}>
          Back to feed
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Nav */}
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/parent')} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-white)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Add Outside Achievement</span>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>
          Tell us about something your child achieved outside of school. Their teacher will review it and add it to their record.
        </div>

        {/* Description */}
        <div className="label-xs" style={{ marginBottom: 8 }}>What did they do?</div>
        <textarea
          className="field"
          placeholder="E.g. Scored the winning goal in Saturday's football match. Showed great teamwork and really led the team…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{ marginBottom: 24 }}
        />

        {/* Category */}
        <div className="label-xs" style={{ marginBottom: 12 }}>What kind of achievement is this?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {PARENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                background: category === cat.id ? 'var(--color-gold-faint)' : 'var(--color-white)',
                border: `1.5px solid ${category === cat.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.icon}</span>
              <span style={{
                fontSize: 14, fontWeight: 500,
                color: category === cat.id ? 'var(--color-gold)' : 'var(--color-ink)',
              }}>{cat.label}</span>
              {category === cat.id && (
                <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>

        {/* Privacy note */}
        <div style={{
          padding: '14px 16px', background: 'var(--color-stone)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>
            🔒 This goes directly to your child's teacher for review. It won't be visible on their record until approved.
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.4 }}>
          Submit for teacher review
        </button>
      </div>
    </div>
  )
}
