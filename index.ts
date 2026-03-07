export type UserRole = 'teacher' | 'parent' | 'student'

export type CfELevel = 'early' | 'first' | 'second' | 'third_fourth' | 'senior'

export type CurriculumArea =
  | 'literacy_english'
  | 'numeracy_maths'
  | 'health_wellbeing'
  | 'sciences'
  | 'social_studies'
  | 'technologies'
  | 'expressive_arts'
  | 'rme'

export type AchievementSource = 'school' | 'outside_school'
export type AchievementStatus = 'active' | 'pending_review' | 'declined'
export type AiConfidence = 'strong' | 'good' | 'possible'

export interface CfEOutcome {
  id: string
  referenceCode: string
  curriculumArea: CurriculumArea
  level: CfELevel
  outcomeText: string
  capacityTags: string[]
  keywords: string[]
}

export interface Pupil {
  id: string
  firstName: string
  lastName: string
  yearGroup: string
  currentLevel: CfELevel
  levelConfirmed: boolean
  classId: string
  avatarColor: string
}

export interface Achievement {
  id: string
  pupilId: string
  description: string
  source: AchievementSource
  status: AchievementStatus
  curriculumArea?: CurriculumArea
  cfeLevel?: CfELevel
  outcomeCode?: string
  outcomeText?: string
  aiSuggested: boolean
  aiConfidence?: AiConfidence
  achievementDate: string
  loggedBy?: string
  submittedBy?: string
  parentCategory?: string
}

export interface AiSuggestion {
  curriculumArea: CurriculumArea
  level: CfELevel
  outcomes: {
    referenceCode: string
    outcomeText: string
    confidence: AiConfidence
  }[]
}

export interface ClassStats {
  totalAchievements: number
  outsideSchool: number
  activePupils: number
}
