import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPupils, CURRICULUM_AREA_LABELS, LEVEL_LABELS, mockAiSuggestions } from '../../data/mock'
import type { Pupil, CurriculumArea, CfELevel } from '../../types'

const AI_ENABLED = true // toggle for demo

const MANUAL_AREAS: CurriculumArea[] = [
  'literacy_english', 'numeracy_maths', 'health_wellbeing', 'sciences',
  'social_studies', 'technologies', 'expressive_arts', 'rme',
]

const MANUAL_EOS: Record<CurriculumArea, Array<{code: string; text: string}>> = {
  literacy_english: [
    { code: 'LIT 2-10a', text: 'I can communicate clearly and independently in a range of situations.' },
    { code: 'LIT 2-20a', text: 'I enjoy creating texts of my choice and regularly select subject, form, audience and purpose.' },
    { code: 'LIT 2-09a', text: 'I am developing confidence when engaging with others within and beyond my place of learning.' },
    { code: 'LIT 2-23a', text: 'Throughout the writing process, I can check that my writing makes sense and meets its purpose.' },
  ],
  numeracy_maths: [
    { code: 'MNU 2-01a', text: 'I can use addition, subtraction, multiplication and division when solving problems.' },
    { code: 'MNU 2-03a', text: 'I can solve problems involving whole numbers using a range of methods.' },
    { code: 'MTH 2-21a', text: 'I can collect data, display data clearly and extract and interpret key information.' },
    { code: 'MNU 2-07a', text: 'I can investigate everyday contexts where fractions, percentages or decimals are used.' },
  ],
  health_wellbeing: [
    { code: 'HWB 2-12a', text: 'In everyday situations, I can recognise my strengths, face challenges and feel positive about achievements.' },
    { code: 'HWB 2-35a', text: 'Demonstrating fair play, I can cooperate with others in a team to share experiences and solve problems.' },
    { code: 'HWB 2-25a', text: 'I can explain the benefits of being physically active and the need to maintain a healthy balance.' },
    { code: 'HWB 2-09a', text: 'I can identify and understand the feelings and emotions of others and demonstrate empathy.' },
  ],
  sciences: [
    { code: 'SCN 2-20c', text: 'I can describe sources of renewable and non-renewable energy and discuss their implications.' },
    { code: 'SCN 2-12a', text: 'By investigating different materials, I can explain how their properties enable different purposes.' },
    { code: 'SCN 2-04a', text: 'I can describe and explain how the body uses food and the process of digestion.' },
    { code: 'SCN 2-26a', text: 'I can describe the position of the sun and planets and explain how gravity affects movement.' },
  ],
  social_studies: [
    { code: 'SOC 2-01a', text: 'I can use primary and secondary sources selectively to research events in the past.' },
    { code: 'SOC 2-07a', text: 'I can explain how physical and human features of a place impact on the way of life.' },
    { code: 'SOC 2-14a', text: 'I can explain the nature of democracy and the role of citizens in bringing about change.' },
    { code: 'SOC 2-02a', text: 'I can interpret historical evidence to understand events and explain why things happened.' },
  ],
  technologies: [
    { code: 'TCH 2-14a', text: 'I can explore how reprogrammable devices work and produce a working solution.' },
    { code: 'TCH 2-03a', text: 'I can use digital technologies to present my ideas and findings in different ways.' },
    { code: 'TCH 2-09a', text: 'I can extend and enhance my design skills to solve problems and create new solutions.' },
    { code: 'TCH 2-15a', text: 'I can create and present my own work using a range of digital technologies and evaluate it.' },
  ],
  expressive_arts: [
    { code: 'EXA 2-02a', text: 'I can sing and play music, using techniques and understanding to perform and express myself.' },
    { code: 'EXA 2-12a', text: 'I can use different creative skills and techniques to communicate ideas through visual art.' },
    { code: 'EXA 2-14a', text: 'I can create and present performances and productions, applying skills in expressive arts.' },
    { code: 'EXA 2-16a', text: 'I can use movement and expression to create my own dance, taking inspiration from stimuli.' },
  ],
  rme: [
    { code: 'RME 2-09a', text: 'I can discuss moral issues and explore the importance of values such as honesty and compassion.' },
    { code: 'RME 2-02a', text: 'I can describe the main beliefs, practices and traditions of world religions.' },
    { code: 'RME 2-04a', text: 'I can explain the importance of having a caring and compassionate attitude towards others.' },
    { code: 'RME 2-01a', text: 'I can describe the main beliefs and practices of Christianity and how they influence Christians.' },
  ],
}

export default function LogAchievement() {
  const navigate = useNavigate()
  const [selectedPupil, setSelectedPupil] = useState<Pupil>(mockPupils[0])
  const [showPupilPicker, setShowPupilPicker] = useState(false)
  const [description, setDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiShown, setAiShown] = useState(false)
  const [selectedEO, setSelectedEO] = useState<string | null>(null)
  const [manualArea, setManualArea] = useState<CurriculumArea | null>(null)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const aiData = mockAiSuggestions.default

  useEffect(() => {
    if (!AI_ENABLED || description.length < 20) {
      setAiShown(false)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setAiLoading(true)
      setTimeout(() => {
        setAiLoading(false)
        setAiShown(true)
        setSelectedEO(aiData.outcomes[0].code)
      }, 1200)
    }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [description])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => navigate('/teacher'), 1400)
  }

  const canSave = description.length >= 10 && (
    (AI_ENABLED && aiShown && selectedEO) ||
    (!AI_ENABLED && manualArea && selectedEO)
  )

  if (saved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✓</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 8 }}>
          Achievement saved
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-soft)' }}>
          {selectedPupil.firstName}'s parent has been notified
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Nav */}
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/teacher')} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-white)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>Log Achievement</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '0 24px' }}>
        {/* Pupil selector */}
        <button
          onClick={() => setShowPupilPicker(!showPupilPicker)}
          className="card"
          style={{
            width: '100%', textAlign: 'left',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 20, cursor: 'pointer',
          }}
        >
          <div className={`avatar avatar-md ${selectedPupil.avatarColor}`}>{selectedPupil.firstName[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
              {selectedPupil.firstName} {selectedPupil.lastName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 2 }}>
              {selectedPupil.yearGroup} · {LEVEL_LABELS[selectedPupil.currentLevel]}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-gold)', fontWeight: 600 }}>Change</span>
        </button>

        {/* Pupil picker dropdown */}
        {showPupilPicker && (
          <div className="card animate-slide-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
            {mockPupils.map(p => (
              <button key={p.id} onClick={() => { setSelectedPupil(p); setShowPupilPicker(false); setAiShown(false); setSelectedEO(null) }}
                style={{
                  width: '100%', textAlign: 'left', background: p.id === selectedPupil.id ? 'var(--color-gold-faint)' : 'transparent',
                  border: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                }}>
                <div className={`avatar avatar-sm ${p.avatarColor}`}>{p.firstName[0]}</div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>{p.firstName} {p.lastName}</span>
                <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginLeft: 'auto' }}>{p.yearGroup}</span>
              </button>
            ))}
          </div>
        )}

        {/* Description field */}
        <div className="label-xs" style={{ marginBottom: 8 }}>What happened?</div>
        <div style={{
          background: 'var(--color-white)',
          border: `1.5px solid ${description.length > 0 ? 'var(--color-gold)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 18px',
          marginBottom: 16,
          boxShadow: description.length > 0 ? '0 0 0 3px rgba(194,123,43,0.08)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <textarea
            ref={textareaRef}
            className="field"
            style={{ border: 'none', padding: 0, boxShadow: 'none', minHeight: 80, resize: 'none' }}
            placeholder="Describe what the pupil did…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)',
          }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-ink-soft)', fontWeight: 500 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              Voice note
            </button>
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{description.length} chars</span>
          </div>
        </div>

        {/* AI loading state */}
        {AI_ENABLED && aiLoading && (
          <div style={{
            background: 'var(--color-gold-faint)', border: '1.5px solid var(--color-gold-light)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-gold)', animation: 'pulse 1.2s ease infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Analysing…
              </span>
            </div>
          </div>
        )}

        {/* AI suggestions */}
        {AI_ENABLED && aiShown && !aiLoading && (
          <div className="animate-slide-up" style={{
            background: 'var(--color-gold-faint)', border: '1.5px solid var(--color-gold-light)',
            borderRadius: 'var(--radius-lg)', padding: '18px 18px 14px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-gold)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Suggested mapping
              </span>
            </div>

            {/* Area chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {(['literacy_english', 'sciences', 'health_wellbeing'] as CurriculumArea[]).map((area, i) => (
                <span key={area} className={`chip ${i === 0 ? 'chip-active' : 'chip-muted'}`}>
                  {CURRICULUM_AREA_LABELS[area]}
                </span>
              ))}
            </div>

            {/* Level indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: 26, height: 5, borderRadius: 3, background: i <= 2 ? 'var(--color-gold)' : 'var(--color-gold-light)' }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-ink-soft)', fontWeight: 500 }}>Second Level</span>
            </div>

            {/* E&O options */}
            <div className="label-xs" style={{ marginBottom: 10 }}>Experiences & Outcomes</div>
            {aiData.outcomes.map(o => (
              <button key={o.code}
                onClick={() => setSelectedEO(o.code)}
                style={{
                  width: '100%', textAlign: 'left', background: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${selectedEO === o.code ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  padding: '13px 14px', marginBottom: 8, cursor: 'pointer',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  boxShadow: selectedEO === o.code ? '0 0 0 3px rgba(194,123,43,0.08)' : 'none',
                }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: selectedEO === o.code ? 'var(--color-gold)' : 'transparent',
                  border: selectedEO === o.code ? 'none' : '1.5px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedEO === o.code && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', letterSpacing: '0.05em', marginBottom: 3 }}>{o.code}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5 }}>{o.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 3, textTransform: 'capitalize' }}>{o.confidence} match</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Manual selection (non-AI mode) */}
        {!AI_ENABLED && description.length >= 10 && (
          <div className="animate-slide-up" style={{ marginBottom: 20 }}>
            <div className="label-xs" style={{ marginBottom: 10 }}>Curriculum area</div>
            <div className="scroll-row" style={{ marginBottom: 16 }}>
              {MANUAL_AREAS.map(area => (
                <button key={area}
                  onClick={() => { setManualArea(area); setSelectedEO(null) }}
                  className={`chip ${manualArea === area ? 'chip-active' : 'chip-muted'}`}
                  style={{ border: 'none', cursor: 'pointer' }}>
                  {CURRICULUM_AREA_LABELS[area]}
                </button>
              ))}
            </div>

            {manualArea && (
              <div className="animate-slide-up">
                <div className="label-xs" style={{ marginBottom: 10 }}>Experience & Outcome</div>
                {MANUAL_EOS[manualArea]?.map(eo => (
                  <button key={eo.code}
                    onClick={() => setSelectedEO(eo.code)}
                    className="card"
                    style={{
                      width: '100%', textAlign: 'left', padding: '13px 14px', marginBottom: 8,
                      cursor: 'pointer', display: 'flex', gap: 10,
                      border: `1.5px solid ${selectedEO === eo.code ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      background: selectedEO === eo.code ? 'var(--color-gold)' : 'transparent',
                      border: selectedEO === eo.code ? 'none' : '1.5px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedEO === eo.code && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', marginBottom: 3 }}>{eo.code}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5 }}>{eo.text}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div style={{ padding: '8px 24px 32px' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Save Achievement
        </button>
      </div>
    </div>
  )
}
