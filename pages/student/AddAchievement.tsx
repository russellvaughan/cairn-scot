import { useState, useRef, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PARENT_CATEGORIES } from '../../data/mock'

export default function AddAchievement() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSubmit = description.length >= 10 && category !== null

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || [])
      .filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))

    if (!incoming.length) return

    setAttachments(prev => {
      const merged = [...prev]
      incoming.forEach(file => {
        const exists = merged.some(
          existing =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        )
        if (!exists) merged.push(file)
      })
      return merged.slice(0, 6)
    })

    event.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: '56px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 18 }}>⭐</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Achievement sent
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>
          Nice work. Your teacher can now review this achievement.
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'left', marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Your description</div>
          <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.55 }}>{description}</div>
          {attachments.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-ink-soft)' }}>
              Attachments selected: {attachments.length}
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/student')}>
          Back to feed
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/student')}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Log My Achievement</span>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
          Share something you achieved at home, in sport, clubs, or the community.
        </div>

        <div className="label-xs" style={{ marginBottom: 8 }}>What did you do?</div>
        <textarea
          className="field"
          placeholder="E.g. I practised my guitar every day this week and learned a full song..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{ marginBottom: 22 }}
        />

        <div className="label-xs" style={{ marginBottom: 10 }}>Add photo or video (optional)</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesSelected}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            background: 'var(--color-white)',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '13px 14px',
            marginBottom: attachments.length > 0 ? 10 : 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--color-ink-soft)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Select attachments
        </button>

        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>
                  {file.type.startsWith('video/') ? '🎬' : '📷'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
                    {file.type.startsWith('video/') ? 'Video' : 'Photo'}
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-ink-muted)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="label-xs" style={{ marginBottom: 12 }}>Choose a category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PARENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                background: category === cat.id ? 'var(--color-gold-faint)' : 'var(--color-white)',
                border: `1.5px solid ${category === cat.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: category === cat.id ? 'var(--color-gold)' : 'var(--color-ink)',
                }}
              >
                {cat.label}
              </span>
              {category === cat.id && (
                <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'var(--color-stone)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>
            Your teacher will review this before adding it to your official record.
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.4 }}>
          Submit achievement
        </button>
      </div>
    </div>
  )
}
