import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPupils, CURRICULUM_AREA_LABELS, LEVEL_LABELS } from '../../data/mock'
import { fetchAuthUser, getStoredAccessToken, getSupabaseConfig, supabaseInsert, supabaseSelect } from '../../lib/supabase'
import type { Pupil, CurriculumArea, CfELevel } from '../../types'

const AI_ENABLED = true // toggle for demo

const MANUAL_AREAS: CurriculumArea[] = [
  'literacy_english', 'numeracy_maths', 'health_wellbeing', 'sciences',
  'social_studies', 'technologies', 'expressive_arts', 'rme',
]

const FALLBACK_MANUAL_EOS: Record<CurriculumArea, Array<{code: string; text: string}>> = {
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

type OutcomeOption = { code: string; text: string }

interface DbOutcomeRow {
  reference_code: string
  curriculum_area: CurriculumArea
  level: CfELevel
  outcome_text: string
}

interface DbPupilRow {
  id: string
  first_name: string
  last_name: string
  year_group: string
  current_level: string | null
  level_confirmed: boolean | null
}

interface DbClassRow {
  id: string
}

interface DbUserRow {
  id: string
  school_id: string | null
}

interface DbOutcomeIdRow {
  id: string
}

interface SuggestionApiRow {
  reference_code: string
  confidence?: 'strong' | 'good' | 'possible'
  reason?: string
  outcome_text?: string
  benchmark_keys?: string[]
}

interface SuggestionApiResponse {
  mode?: 'ai' | 'manual_fallback'
  curriculum_area?: CurriculumArea
  level?: CfELevel
  suggestions?: SuggestionApiRow[]
}

const LEVEL_ORDER: CfELevel[] = ['early', 'first', 'second', 'third_fourth', 'senior']

const AVATAR_COLORS = ['av-gold', 'av-sage', 'av-sky', 'av-plum', 'av-rose', 'av-teal'] as const

function toLevel(value: string | null | undefined): CfELevel {
  if (value === 'early' || value === 'first' || value === 'second' || value === 'third_fourth' || value === 'senior') {
    return value
  }
  return 'second'
}

function avatarColorFromId(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default function LogAchievement() {
  const navigate = useNavigate()
  const [pupils, setPupils] = useState<Pupil[]>(mockPupils)
  const [selectedPupil, setSelectedPupil] = useState<Pupil | null>(mockPupils[0])
  const [dataHint, setDataHint] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPupilPicker, setShowPupilPicker] = useState(false)
  const [description, setDescription] = useState('')
  const [descriptionFocused, setDescriptionFocused] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiShown, setAiShown] = useState(false)
  const [selectedEO, setSelectedEO] = useState<string | null>(null)
  const [manualArea, setManualArea] = useState<CurriculumArea | null>(null)
  const [manualOutcomesByArea, setManualOutcomesByArea] = useState<Record<CurriculumArea, OutcomeOption[]>>(FALLBACK_MANUAL_EOS)
  const [aiData, setAiData] = useState<{
    area: CurriculumArea
    level: CfELevel
    outcomes: Array<OutcomeOption & { confidence: 'strong' | 'good' | 'possible'; reason?: string; benchmarkKeys?: string[] }>
  } | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [saved, setSaved] = useState(false)
  const suggestAbortRef = useRef<AbortController | null>(null)
  const suggestRequestRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const lookupOutcomeText = (referenceCode: string): string => {
    const normalized = referenceCode.trim().toUpperCase()
    for (const area of MANUAL_AREAS) {
      const found = manualOutcomesByArea[area]?.find(o => o.code.trim().toUpperCase() === normalized)
      if (found) return found.text
    }
    for (const area of MANUAL_AREAS) {
      const found = FALLBACK_MANUAL_EOS[area]?.find(o => o.code.trim().toUpperCase() === normalized)
      if (found) return found.text
    }
    return ''
  }

  useEffect(() => {
    let cancelled = false

    const loadFallback = (hint?: string) => {
      if (cancelled) return
      setPupils(mockPupils)
      setSelectedPupil(prev => prev || mockPupils[0] || null)
      setDataHint(hint || null)
    }

    const loadTeacherPupils = async () => {
      try {
        const token = getStoredAccessToken()
        if (!token) {
          loadFallback('Sign in to load your own pupils. Showing demo pupils.')
          return
        }

        const authUser = await fetchAuthUser(token)
        if (!authUser?.id) {
          loadFallback('Could not load your account. Showing demo pupils.')
          return
        }

        const classes = await supabaseSelect<DbClassRow[]>(
          'classes',
          {
            select: 'id',
            teacher_id: `eq.${authUser.id}`,
            order: 'academic_year.desc,name.asc',
            limit: '1',
          },
          token
        )

        const activeClass = classes[0]
        if (!activeClass) {
          if (!cancelled) {
            setPupils([])
            setSelectedPupil(null)
            setDataHint('No class assigned yet. Add a pupil to create your class.')
          }
          return
        }

        const rows = await supabaseSelect<DbPupilRow[]>(
          'pupils',
          {
            select: 'id,first_name,last_name,year_group,current_level,level_confirmed',
            class_id: `eq.${activeClass.id}`,
            order: 'last_name.asc,first_name.asc',
            limit: '300',
          },
          token
        )

        const mapped = rows.map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          yearGroup: row.year_group,
          currentLevel: toLevel(row.current_level),
          levelConfirmed: !!row.level_confirmed,
          classId: activeClass.id,
          avatarColor: avatarColorFromId(row.id),
        }))

        if (cancelled) return

        if (!mapped.length) {
          setPupils([])
          setSelectedPupil(null)
          setDataHint('No pupils in your class yet. Add a pupil first.')
          return
        }

        setPupils(mapped)
        setSelectedPupil(prev => {
          if (prev) {
            const keep = mapped.find(pupil => pupil.id === prev.id)
            if (keep) return keep
          }
          return mapped[0]
        })
        setDataHint(null)
      } catch {
        loadFallback('Live pupil list could not be loaded. Showing demo pupils.')
      }
    }

    void loadTeacherPupils()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadManualOutcomes = async () => {
      const config = getSupabaseConfig()
      if (!config) {
        if (!cancelled) setManualOutcomesByArea(FALLBACK_MANUAL_EOS)
        return
      }

      try {
        const token = getStoredAccessToken()
        const rows = await supabaseSelect<DbOutcomeRow[]>(
          'cfe_outcomes',
          {
            select: 'reference_code,curriculum_area,level,outcome_text',
            level: `eq.${selectedPupil?.currentLevel || 'second'}`,
            order: 'reference_code.asc',
            limit: '500',
          },
          token
        )

        if (cancelled || !rows.length) return

        const grouped = MANUAL_AREAS.reduce((acc, area) => {
          acc[area] = []
          return acc
        }, {} as Record<CurriculumArea, OutcomeOption[]>)

        rows.forEach(row => {
          grouped[row.curriculum_area]?.push({
            code: row.reference_code,
            text: row.outcome_text,
          })
        })

        const merged = { ...FALLBACK_MANUAL_EOS }
        MANUAL_AREAS.forEach(area => {
          if (grouped[area]?.length) merged[area] = grouped[area]
        })

        setManualOutcomesByArea(merged)
      } catch {
        if (!cancelled) setManualOutcomesByArea(FALLBACK_MANUAL_EOS)
      }
    }

    loadManualOutcomes()
    return () => {
      cancelled = true
    }
  }, [selectedPupil?.currentLevel])

  useEffect(() => {
    return () => {
      suggestAbortRef.current?.abort()
    }
  }, [])

  const requestAiSuggestions = async (refine = false) => {
    if (!AI_ENABLED || description.length < 30 || !selectedPupil) return
    const pupil = selectedPupil

    const requestId = ++suggestRequestRef.current
    suggestAbortRef.current?.abort()
    const controller = new AbortController()
    suggestAbortRef.current = controller
    setAiLoading(true)

    try {
      const token = getStoredAccessToken()
      const response = await fetch('/api/achievements/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description,
          year_group: pupil.yearGroup,
          level: pupil.currentLevel,
          refine,
        }),
        signal: controller.signal,
      })

      const payload = (await response.json().catch(() => ({}))) as SuggestionApiResponse

      if (!response.ok || requestId !== suggestRequestRef.current) throw new Error('Suggestion request failed')

      const suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : []
      if (payload.mode !== 'ai' || suggestions.length === 0) {
        setAiShown(false)
        setAiData(null)
        return
      }

      const mapped = suggestions
        .filter(item => typeof item.reference_code === 'string')
        .slice(0, 3)
        .map(item => {
          const confidence = item.confidence === 'strong' || item.confidence === 'good' || item.confidence === 'possible'
            ? item.confidence
            : 'possible'

          const benchmarkKeys = Array.isArray(item.benchmark_keys)
            ? item.benchmark_keys.filter(key => typeof key === 'string')
            : []

          return {
            code: item.reference_code,
            text: item.outcome_text || lookupOutcomeText(item.reference_code),
            confidence,
            reason: item.reason,
            benchmarkKeys,
          }
        })
        .filter(item => item.text.length > 0)

      if (!mapped.length) {
        setAiShown(false)
        setAiData(null)
        return
      }

      const area = payload.curriculum_area && MANUAL_AREAS.includes(payload.curriculum_area)
        ? payload.curriculum_area
        : 'literacy_english'
      const level = payload.level && LEVEL_ORDER.includes(payload.level)
        ? payload.level
        : pupil.currentLevel

      setAiData({ area, level, outcomes: mapped })
      setAiShown(true)
      setSelectedEO(mapped[0].code)
    } catch {
      if (requestId === suggestRequestRef.current) {
        setAiShown(false)
        setAiData(null)
      }
    } finally {
      if (requestId === suggestRequestRef.current) setAiLoading(false)
    }
  }

  const handleAttachmentSelect = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSave = async () => {
    if (!selectedPupil) return

    setSaving(true)
    setSaveError(null)

    try {
      const token = getStoredAccessToken()
      const authUser = token ? await fetchAuthUser(token) : null

      if (!token || !authUser?.id) {
        setSaved(true)
        setTimeout(() => navigate('/teacher'), 1400)
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
        throw new Error('Your user profile is not linked to a school yet.')
      }

      let outcomeId: string | null = null
      if (selectedEO) {
        const outcomes = await supabaseSelect<DbOutcomeIdRow[]>(
          'cfe_outcomes',
          {
            select: 'id',
            reference_code: `eq.${selectedEO}`,
            limit: '1',
          },
          token
        ).catch(() => [] as DbOutcomeIdRow[])
        outcomeId = outcomes[0]?.id || null
      }

      const selectedAiOutcome = aiData?.outcomes.find(outcome => outcome.code === selectedEO)
      const resolvedArea = aiShown ? aiData?.area || manualArea : manualArea
      const resolvedLevel = aiShown ? aiData?.level || selectedPupil.currentLevel : selectedPupil.currentLevel

      await supabaseInsert(
        'achievements',
        {
          pupil_id: selectedPupil.id,
          school_id: schoolId,
          logged_by: authUser.id,
          submitted_by: authUser.id,
          source: 'school',
          description: description.trim(),
          cfe_outcome_id: outcomeId,
          curriculum_area: resolvedArea,
          cfe_level: resolvedLevel,
          ai_suggested: aiShown,
          ai_confidence: selectedAiOutcome?.confidence || null,
          status: 'active',
        },
        token
      )

      setSaved(true)
      setTimeout(() => navigate('/teacher'), 1400)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save achievement.')
    } finally {
      setSaving(false)
    }
  }

  const canRequestAi = AI_ENABLED && !!selectedPupil && description.length >= 30 && !aiLoading
  const hasAiMapping = AI_ENABLED && aiShown && !!selectedEO
  const hasManualMapping = !!manualArea && !!selectedEO
  const canSave = !!selectedPupil && description.length >= 10 && (hasAiMapping || hasManualMapping) && !saving
  const showManualSelector = !!selectedPupil && description.length >= 10 && (!AI_ENABLED || !aiShown || !!manualArea)

  let saveHint = ''
  if (!selectedPupil) {
    saveHint = 'Add a pupil first to start logging achievements.'
  } else if (saving) {
    saveHint = 'Saving achievement…'
  } else if (description.length < 10) {
    saveHint = `Add ${10 - description.length} more character${10 - description.length === 1 ? '' : 's'} to enable Save.`
  } else if (canSave) {
    saveHint = 'Ready to save.'
  } else if (aiLoading) {
    saveHint = 'AI is analysing. You can also map manually below.'
  } else if (AI_ENABLED && !aiShown && description.length < 30) {
    saveHint = 'AI suggestions unlock at 30+ characters. You can map manually below now.'
  } else if (AI_ENABLED && !aiShown && description.length >= 30) {
    saveHint = 'Tap Suggest with AI, or map manually below.'
  } else if (manualArea && !selectedEO) {
    saveHint = 'Select an Experience & Outcome to enable Save.'
  } else if (!manualArea && !aiShown) {
    saveHint = 'Choose a curriculum area and outcome to enable Save.'
  } else {
    saveHint = 'Select a suggestion to enable Save.'
  }

  if (saved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✓</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--color-ink)', marginBottom: 8 }}>
          Achievement saved
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-soft)' }}>
          {selectedPupil?.firstName || 'Pupil'}'s parent has been notified
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
        {dataHint && (
          <div className="card" style={{ padding: '12px 14px', marginBottom: 14, borderColor: '#D2DEEE' }}>
            <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>{dataHint}</div>
          </div>
        )}

        {/* Pupil selector */}
        {selectedPupil ? (
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
        ) : (
          <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', marginBottom: 10 }}>
              No pupils available for this teacher account yet.
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 14px', fontSize: 14 }}
              onClick={() => navigate('/teacher/pupils/new')}
            >
              Add pupil
            </button>
          </div>
        )}

        {/* Pupil picker dropdown */}
        {showPupilPicker && selectedPupil && (
          <div className="card animate-slide-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
            {pupils.map(p => (
              <button key={p.id} onClick={() => {
                setSelectedPupil(p)
                setShowPupilPicker(false)
                setAiShown(false)
                setAiData(null)
                setManualArea(null)
                setSelectedEO(null)
              }}
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
          border: `1.5px solid ${descriptionFocused ? 'var(--color-gold)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: 16,
          boxShadow: descriptionFocused ? '0 0 0 3px rgba(227,106,44,0.16)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <textarea
            ref={textareaRef}
            className="field"
            style={{
              border: 'none',
              padding: 0,
              margin: 0,
              lineHeight: 1.5,
              boxShadow: 'none',
              minHeight: 82,
              resize: 'none',
            }}
            placeholder="Describe what the pupil did…"
            value={description}
            onChange={e => {
              setDescription(e.target.value)
              if (aiShown || aiData) {
                setAiShown(false)
                setAiData(null)
              }
            }}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            rows={3}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)',
          }}>
            <input
              ref={attachmentInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleAttachmentSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => attachmentInputRef.current?.click()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-ink-soft)', fontWeight: 500 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add photo/video
            </button>
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{description.length} chars</span>
          </div>
        </div>

        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
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
                <span style={{ fontSize: 16, lineHeight: 1 }}>{file.type.startsWith('video/') ? '🎬' : '📷'}</span>
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

        {AI_ENABLED && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
            <button
              onClick={() => requestAiSuggestions(false)}
              disabled={!canRequestAi}
              style={{
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: canRequestAi ? 'pointer' : 'not-allowed',
                background: canRequestAi ? 'var(--color-gold-light)' : 'var(--color-border)',
                color: canRequestAi ? 'var(--color-gold)' : 'var(--color-ink-muted)',
              }}
            >
              Suggest with AI
            </button>
            {aiShown && !aiLoading && (
              <button
                onClick={() => requestAiSuggestions(true)}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'var(--color-white)',
                  color: 'var(--color-ink-soft)',
                }}
              >
                Refine
              </button>
            )}
          </div>
        )}

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
        {AI_ENABLED && aiShown && !aiLoading && aiData && (
          <div className="animate-slide-up" style={{
            background: 'var(--color-gold-faint)', border: '1.5px solid var(--color-gold-light)',
            borderRadius: 'var(--radius-lg)', padding: '18px 18px 14px', marginBottom: 20,
            maxWidth: '100%', minWidth: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-gold)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Suggested mapping
              </span>
            </div>

            {/* Area chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <span className="chip chip-active">
                {CURRICULUM_AREA_LABELS[aiData.area]}
              </span>
            </div>

            {/* Level indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4, flex: '1 1 150px', minWidth: 0 }}>
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: i <= (LEVEL_ORDER.indexOf(aiData.level) + 1) ? 'var(--color-gold)' : 'var(--color-gold-light)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-ink-soft)', fontWeight: 500 }}>{LEVEL_LABELS[aiData.level]}</span>
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
                  maxWidth: '100%', minWidth: 0,
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
                <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', letterSpacing: '0.05em', marginBottom: 3 }}>{o.code}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5 }}>{o.text}</div>
                  {o.reason && (
                    <div style={{ fontSize: 11, color: 'var(--color-ink-soft)', marginTop: 4 }}>{o.reason}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 3, textTransform: 'capitalize' }}>{o.confidence} match</div>
                  {!!o.benchmarkKeys?.length && (
                    <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2 }}>
                      {o.benchmarkKeys.length} benchmark{ o.benchmarkKeys.length === 1 ? '' : 's' } linked
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Manual selection (AI fallback / non-AI mode) */}
        {showManualSelector && (
          <div className="animate-slide-up" style={{ marginBottom: 20 }}>
            {AI_ENABLED && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-ink-soft)',
                  marginBottom: 10,
                  lineHeight: 1.45,
                }}
              >
                {aiShown ? 'Prefer manual mapping? Select area and outcome below.' : 'AI suggestion not ready yet. Use manual mapping now.'}
              </div>
            )}
            <div className="label-xs" style={{ marginBottom: 10 }}>Curriculum area</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, maxWidth: '100%', minWidth: 0 }}>
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
                {manualOutcomesByArea[manualArea]?.map(eo => (
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
        {saveError && (
          <div
            style={{
              marginBottom: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(184,51,51,0.24)',
              background: 'var(--color-red-faint)',
              color: 'var(--color-red-soft)',
              fontSize: 12,
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {saveError}
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            color: canSave ? 'var(--color-sage)' : 'var(--color-ink-soft)',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {saveHint}
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {saving ? 'Saving...' : 'Save Achievement'}
        </button>
      </div>
    </div>
  )
}
