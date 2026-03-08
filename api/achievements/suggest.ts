import { createHash } from 'node:crypto'

const CURRICULUM_AREAS = [
  'literacy_english',
  'numeracy_maths',
  'health_wellbeing',
  'sciences',
  'social_studies',
  'technologies',
  'expressive_arts',
  'rme',
] as const

const LEVELS = ['early', 'first', 'second', 'third_fourth', 'senior'] as const

type CurriculumArea = (typeof CURRICULUM_AREAS)[number]
type CfELevel = (typeof LEVELS)[number]
type Confidence = 'strong' | 'good' | 'possible'

interface DbOutcomeRow {
  id: string
  reference_code: string
  curriculum_area: CurriculumArea
  level: CfELevel
  outcome_text: string
  keywords?: string[] | null
}

interface DbBenchmarkRow {
  benchmark_key: string
  curriculum_area: CurriculumArea
  level: CfELevel
  benchmark_text: string
  related_outcome_codes?: string[] | null
}

interface AnthropicSuggestion {
  reference_code: string
  confidence: Confidence
  reason: string
  benchmark_keys?: string[]
}

interface CandidateOutcome extends DbOutcomeRow {
  benchmark_keys: string[]
}

interface SuggestionResponse {
  mode: 'ai' | 'manual_fallback'
  curriculum_area?: CurriculumArea
  level: CfELevel
  suggestions: Array<AnthropicSuggestion & { outcome_text?: string }>
}

interface RawAiResponse {
  curriculum_area?: CurriculumArea
  level: CfELevel
  suggestions: unknown
}

const MIN_AI_CHARS = 30
const CANDIDATE_LIMIT = 20
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CHEAP_MODEL = process.env.ANTHROPIC_MODEL_CHEAP || 'claude-3-5-haiku-latest'
const QUALITY_MODEL = process.env.ANTHROPIC_MODEL_QUALITY || 'claude-sonnet-4-20250514'
const CHEAP_MAX_TOKENS = 420
const QUALITY_MAX_TOKENS = 620

const suggestionCache = new Map<string, { expiresAt: number; response: SuggestionResponse }>()

const AREA_KEYWORDS: Record<CurriculumArea, string[]> = {
  literacy_english: ['read', 'reading', 'write', 'writing', 'talk', 'speaking', 'presentation', 'story', 'literacy', 'debate'],
  numeracy_maths: ['math', 'maths', 'number', 'fraction', 'decimal', 'percentage', 'sum', 'data', 'graph', 'chart', 'measure'],
  health_wellbeing: ['team', 'wellbeing', 'sport', 'fitness', 'health', 'cooperate', 'leadership', 'respect', 'food', 'mental'],
  sciences: ['science', 'experiment', 'investigate', 'material', 'energy', 'planet', 'body', 'biology', 'chemistry', 'physics'],
  social_studies: ['history', 'democracy', 'community', 'citizen', 'environment', 'place', 'society', 'geography'],
  technologies: ['technology', 'coding', 'code', 'program', 'digital', 'scratch', 'device', 'design', 'prototype'],
  expressive_arts: ['music', 'art', 'dance', 'drama', 'perform', 'creative', 'drawing', 'painting', 'expressive'],
  rme: ['religion', 'belief', 'values', 'ethics', 'moral', 'compassion', 'faith'],
}

const AI_SYSTEM_PROMPT = `You are a curriculum mapping assistant for Scottish schools using Curriculum for Excellence (CfE).

Your job is to analyse a brief achievement description and suggest the most relevant Experiences and Outcomes (Es & Os) from the CfE framework.

You will be given:
- The achievement description (written by a teacher)
- The pupil's year group and current CfE level
- A list of relevant Es & Os to match against
- Optional linked benchmark keys per E&O

Return ONLY a JSON object in this exact format, with no preamble, explanation, or markdown:

{
  "curriculum_area": "one of: literacy_english | numeracy_maths | health_wellbeing | sciences | social_studies | technologies | expressive_arts | rme",
  "level": "one of: early | first | second | third_fourth | senior",
  "suggestions": [
    {
      "reference_code": "LIT 2-10a",
      "confidence": "strong | good | possible",
      "reason": "one sentence explaining why this matches",
      "benchmark_keys": ["optional benchmark key strings"]
    }
  ]
}

Rules:
- Return exactly 2 suggestions, ranked by relevance
- Only suggest Es & Os that genuinely and specifically match the description
- Use the pupil's current level as the default, but suggest a different level if clearly indicated
- Never invent reference codes — only use codes from the list provided
- Keep reasons short (max 15 words)
- If the description is too vague, return your best guess with confidence "possible" for all suggestions`

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function normalizeText(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

function normalizeCode(input: string): string {
  return normalizeText(input).toUpperCase()
}

function tokenize(input: string): string[] {
  return normalizeText(input.toLowerCase())
    .split(/[^a-z0-9_]+/)
    .filter(Boolean)
}

function inferAreas(description: string): CurriculumArea[] {
  const tokens = tokenize(description)
  const scores = CURRICULUM_AREAS.map(area => {
    const score = AREA_KEYWORDS[area].reduce((sum, keyword) => sum + (tokens.includes(keyword) ? 1 : 0), 0)
    return { area, score }
  })

  const ranked = scores.sort((a, b) => b.score - a.score)
  const nonZero = ranked.filter(item => item.score > 0).map(item => item.area)
  if (nonZero.length >= 3) return nonZero.slice(0, 3)

  const fallback = ranked.map(item => item.area)
  return [...new Set([...nonZero, ...fallback])].slice(0, 3)
}

function scoreOutcome(description: string, outcome: DbOutcomeRow): number {
  const descTokens = new Set(tokenize(description))
  const combined = `${outcome.outcome_text} ${(outcome.keywords || []).join(' ')}`
  const outcomeTokens = tokenize(combined)
  let score = 0
  outcomeTokens.forEach(token => {
    if (descTokens.has(token)) score += 1
  })
  return score
}

async function supabaseSelect<T>(
  supabaseUrl: string,
  serviceRoleKey: string,
  table: string,
  params: Record<string, string>
): Promise<T> {
  const query = new URLSearchParams(params)
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query.toString()}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase ${table} query failed: ${response.status} ${message}`)
  }

  return (await response.json()) as T
}

function parseAnthropicJson(rawText: string): any {
  try {
    return JSON.parse(rawText)
  } catch {
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(rawText.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

async function callAnthropic(
  apiKey: string,
  model: string,
  maxTokens: number,
  description: string,
  yearGroup: string,
  level: CfELevel,
  candidateOutcomes: CandidateOutcome[]
): Promise<RawAiResponse | null> {
  const promptPayload = {
    description,
    year_group: yearGroup,
    current_level: level,
    candidate_outcomes: candidateOutcomes.map(outcome => ({
      reference_code: outcome.reference_code,
      curriculum_area: outcome.curriculum_area,
      level: outcome.level,
      outcome_text: outcome.outcome_text.slice(0, 240),
      benchmark_keys: outcome.benchmark_keys.slice(0, 4),
    })),
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      system: AI_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: JSON.stringify(promptPayload) }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Anthropic call failed: ${response.status} ${message}`)
  }

  const payload = await response.json()
  const textBlocks = Array.isArray(payload?.content) ? payload.content : []
  const rawText = textBlocks
    .filter((item: any) => item?.type === 'text')
    .map((item: any) => item?.text || '')
    .join('\n')

  const parsed = parseAnthropicJson(rawText)
  if (!parsed || typeof parsed !== 'object') return null

  const area = CURRICULUM_AREAS.includes(parsed.curriculum_area) ? parsed.curriculum_area : undefined
  const resolvedLevel = LEVELS.includes(parsed.level) ? parsed.level : level

  return {
    curriculum_area: area,
    level: resolvedLevel,
    suggestions: parsed.suggestions,
  }
}

function makeCacheKey(description: string, yearGroup: string, level: CfELevel): string {
  const raw = `${normalizeText(description).toLowerCase()}|${yearGroup.toLowerCase()}|${level}`
  return createHash('sha256').update(raw).digest('hex')
}

function getCached(cacheKey: string): SuggestionResponse | null {
  const entry = suggestionCache.get(cacheKey)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    suggestionCache.delete(cacheKey)
    return null
  }
  return entry.response
}

function setCached(cacheKey: string, response: SuggestionResponse) {
  if (suggestionCache.size > 500) {
    const firstKey = suggestionCache.keys().next().value
    if (firstKey) suggestionCache.delete(firstKey)
  }
  suggestionCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    response,
  })
}

function validateSuggestions(rawSuggestions: unknown, candidateByCode: Map<string, CandidateOutcome>) {
  const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : []

  const validated = suggestions
    .map(suggestion => {
      if (!suggestion || typeof suggestion !== 'object') return null
      const typed = suggestion as Record<string, unknown>
      const referenceCode = typeof typed.reference_code === 'string' ? typed.reference_code : ''
      if (!referenceCode) return null

      const candidate = candidateByCode.get(normalizeCode(referenceCode))
      if (!candidate) return null

      const rawConfidence = typed.confidence
      const confidence: Confidence =
        rawConfidence === 'strong' || rawConfidence === 'good' || rawConfidence === 'possible'
          ? rawConfidence
          : 'possible'

      const benchmarkKeys = Array.isArray(typed.benchmark_keys)
        ? typed.benchmark_keys.filter(key => typeof key === 'string')
        : candidate.benchmark_keys

      return {
        reference_code: candidate.reference_code,
        curriculum_area: candidate.curriculum_area,
        confidence,
        reason: normalizeText(String(typed.reason || '')).slice(0, 180),
        benchmark_keys: benchmarkKeys,
        outcome_text: candidate.outcome_text,
      }
    })
    .filter(Boolean)
    .slice(0, 2) as Array<AnthropicSuggestion & { outcome_text?: string; curriculum_area?: CurriculumArea }>

  return validated
}

function isLowConfidence(suggestions: Array<{ confidence: Confidence }>): boolean {
  return suggestions.length > 0 && suggestions.every(item => item.confidence === 'possible')
}

function manualFallback(level: CfELevel): SuggestionResponse {
  return {
    mode: 'manual_fallback',
    level,
    suggestions: [],
  }
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const description = normalizeText(String(body.description || ''))
    const yearGroup = normalizeText(String(body.year_group || ''))
    const level = String(body.level || '') as CfELevel
    const refine = body.refine === true

    if (!description || description.length < MIN_AI_CHARS) {
      return jsonResponse(200, manualFallback(LEVELS.includes(level) ? level : 'second'))
    }

    if (!LEVELS.includes(level)) {
      return jsonResponse(400, { error: 'Invalid level' })
    }

    const cacheKey = makeCacheKey(description, yearGroup, level)
    if (!refine) {
      const cached = getCached(cacheKey)
      if (cached) return jsonResponse(200, cached)
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return jsonResponse(200, manualFallback(level))
    }

    const preferredAreas = inferAreas(description)

    const outcomes = await supabaseSelect<DbOutcomeRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'cfe_outcomes',
      {
        select: 'id,reference_code,curriculum_area,level,outcome_text,keywords',
        level: `eq.${level}`,
        curriculum_area: `in.(${preferredAreas.join(',')})`,
        order: 'reference_code.asc',
        limit: '220',
      }
    )

    const allCandidates = outcomes.length
      ? outcomes
      : await supabaseSelect<DbOutcomeRow[]>(
          supabaseUrl,
          serviceRoleKey,
          'cfe_outcomes',
          {
            select: 'id,reference_code,curriculum_area,level,outcome_text,keywords',
            level: `eq.${level}`,
            order: 'reference_code.asc',
            limit: '220',
          }
        )

    if (!allCandidates.length) return jsonResponse(200, manualFallback(level))

    const benchmarks = await supabaseSelect<DbBenchmarkRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'cfe_benchmarks',
      {
        select: 'benchmark_key,curriculum_area,level,benchmark_text,related_outcome_codes',
        level: `eq.${level}`,
        curriculum_area: `in.(${preferredAreas.join(',')})`,
        order: 'benchmark_key.asc',
        limit: '1200',
      }
    ).catch(() => [] as DbBenchmarkRow[])

    const benchmarkMap = new Map<string, string[]>()
    benchmarks.forEach(benchmark => {
      const codes = Array.isArray(benchmark.related_outcome_codes) ? benchmark.related_outcome_codes : []
      codes.forEach(code => {
        const normalized = normalizeCode(code)
        const existing = benchmarkMap.get(normalized) || []
        existing.push(benchmark.benchmark_key)
        benchmarkMap.set(normalized, existing.slice(0, 6))
      })
    })

    const rankedCandidates: CandidateOutcome[] = allCandidates
      .map(outcome => ({
        ...outcome,
        benchmark_keys: benchmarkMap.get(normalizeCode(outcome.reference_code)) || [],
        score: scoreOutcome(description, outcome),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, CANDIDATE_LIMIT)
      .map(({ score, ...candidate }) => candidate)

    const candidateByCode = new Map<string, CandidateOutcome>(
      rankedCandidates.map(item => [normalizeCode(item.reference_code), item])
    )

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      console.error('Missing ANTHROPIC_API_KEY')
      return jsonResponse(200, manualFallback(level))
    }

    let bestResult: SuggestionResponse | null = null

    if (!refine) {
      const cheapResult = await callAnthropic(
        anthropicKey,
        CHEAP_MODEL,
        CHEAP_MAX_TOKENS,
        description,
        yearGroup,
        level,
        rankedCandidates
      )

      const cheapSuggestions = validateSuggestions(cheapResult?.suggestions, candidateByCode)
      if (cheapSuggestions.length) {
        bestResult = {
          mode: 'ai',
          curriculum_area:
            cheapResult?.curriculum_area && CURRICULUM_AREAS.includes(cheapResult.curriculum_area)
              ? cheapResult.curriculum_area
              : cheapSuggestions[0]?.curriculum_area,
          level: cheapResult?.level && LEVELS.includes(cheapResult.level) ? cheapResult.level : level,
          suggestions: cheapSuggestions,
        }
      }

      if (!bestResult || !isLowConfidence(bestResult.suggestions)) {
        if (bestResult) {
          setCached(cacheKey, bestResult)
          return jsonResponse(200, bestResult)
        }
        return jsonResponse(200, manualFallback(level))
      }
    }

    const qualityResult = await callAnthropic(
      anthropicKey,
      QUALITY_MODEL,
      QUALITY_MAX_TOKENS,
      description,
      yearGroup,
      level,
      rankedCandidates
    )

    const qualitySuggestions = validateSuggestions(qualityResult?.suggestions, candidateByCode)
    if (qualitySuggestions.length) {
      const finalResponse: SuggestionResponse = {
        mode: 'ai',
        curriculum_area:
          qualityResult?.curriculum_area && CURRICULUM_AREAS.includes(qualityResult.curriculum_area)
            ? qualityResult.curriculum_area
            : qualitySuggestions[0]?.curriculum_area,
        level: qualityResult?.level && LEVELS.includes(qualityResult.level) ? qualityResult.level : level,
        suggestions: qualitySuggestions,
      }

      if (!refine) setCached(cacheKey, finalResponse)
      return jsonResponse(200, finalResponse)
    }

    if (bestResult) {
      if (!refine) setCached(cacheKey, bestResult)
      return jsonResponse(200, bestResult)
    }

    return jsonResponse(200, manualFallback(level))
  } catch (error) {
    console.error('Suggestion route failed', error)
    return jsonResponse(200, manualFallback('second'))
  }
}
