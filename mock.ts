import type { Pupil, Achievement, CurriculumArea, CfELevel } from '../types'

export const CURRICULUM_AREA_LABELS: Record<CurriculumArea, string> = {
  literacy_english: 'Literacy',
  numeracy_maths: 'Numeracy',
  health_wellbeing: 'Health & Wellbeing',
  sciences: 'Sciences',
  social_studies: 'Social Studies',
  technologies: 'Technologies',
  expressive_arts: 'Expressive Arts',
  rme: 'Values & Belief',
}

export const CURRICULUM_AREA_ICONS: Record<CurriculumArea, string> = {
  literacy_english: '📖',
  numeracy_maths: '🔢',
  health_wellbeing: '🌿',
  sciences: '🔬',
  social_studies: '🌍',
  technologies: '💻',
  expressive_arts: '🎨',
  rme: '🕊️',
}

export const LEVEL_LABELS: Record<CfELevel, string> = {
  early: 'Early Level',
  first: 'First Level',
  second: 'Second Level',
  third_fourth: 'Third & Fourth Level',
  senior: 'Senior Phase',
}

export const YEAR_GROUP_DEFAULT_LEVEL: Record<string, CfELevel> = {
  'Nursery': 'early', 'P1': 'early',
  'P2': 'first', 'P3': 'first', 'P4': 'first',
  'P5': 'second', 'P6': 'second', 'P7': 'second',
  'S1': 'third_fourth', 'S2': 'third_fourth', 'S3': 'third_fourth',
  'S4': 'senior', 'S5': 'senior', 'S6': 'senior',
}

export const PARENT_CATEGORIES = [
  { id: 'sport',     label: 'Sport & physical activity', icon: '⚽' },
  { id: 'creative',  label: 'Creative & performing arts', icon: '🎭' },
  { id: 'community', label: 'Community & volunteering',   icon: '🤝' },
  { id: 'challenge', label: 'Personal challenge',         icon: '🏆' },
  { id: 'academic',  label: 'Learning outside school',    icon: '📚' },
  { id: 'other',     label: 'Something else',             icon: '⭐' },
]

export const mockPupils: Pupil[] = [
  { id: 'p1', firstName: 'Callum',  lastName: 'Reid',    yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: true,  classId: 'c1', avatarColor: 'av-gold' },
  { id: 'p2', firstName: 'Sophie',  lastName: 'Grant',   yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: true,  classId: 'c1', avatarColor: 'av-sage' },
  { id: 'p3', firstName: 'Thomas',  lastName: 'MacLeod', yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: false, classId: 'c1', avatarColor: 'av-sky' },
  { id: 'p4', firstName: 'Robyn',   lastName: 'Fraser',  yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: true,  classId: 'c1', avatarColor: 'av-plum' },
  { id: 'p5', firstName: 'Aisha',   lastName: 'Patel',   yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: true,  classId: 'c1', avatarColor: 'av-rose' },
  { id: 'p6', firstName: 'Jamie',   lastName: 'Kerr',    yearGroup: 'P5', currentLevel: 'first',        levelConfirmed: true,  classId: 'c1', avatarColor: 'av-teal' },
  { id: 'p7', firstName: 'Isla',    lastName: 'Morrison', yearGroup: 'P5', currentLevel: 'second',      levelConfirmed: false, classId: 'c1', avatarColor: 'av-gold' },
  { id: 'p8', firstName: 'Luca',    lastName: 'Ricci',   yearGroup: 'P5', currentLevel: 'second',       levelConfirmed: true,  classId: 'c1', avatarColor: 'av-sky' },
]

export const mockAchievements: Achievement[] = [
  {
    id: 'a1', pupilId: 'p1',
    description: 'Gave a confident presentation to the class about his science project on renewable energy. Handled questions well from peers.',
    source: 'school', status: 'active',
    curriculumArea: 'literacy_english', cfeLevel: 'second',
    outcomeCode: 'LIT 2-10a', outcomeText: 'I can communicate clearly and independently in a range of situations.',
    aiSuggested: true, aiConfidence: 'strong',
    achievementDate: '2026-03-07', loggedBy: 'Ms Elliot',
  },
  {
    id: 'a2', pupilId: 'p1',
    description: 'Completed a Grade 2 football coaching badge. Showed great leadership with younger players in the group.',
    source: 'outside_school', status: 'active',
    curriculumArea: 'health_wellbeing', cfeLevel: 'second',
    outcomeCode: 'HWB 2-35a', outcomeText: 'Demonstrating a sense of fair play, I can cooperate with others in a team setting.',
    aiSuggested: true, aiConfidence: 'good',
    achievementDate: '2026-03-03', submittedBy: 'Parent',
    parentCategory: 'sport',
  },
  {
    id: 'a3', pupilId: 'p1',
    description: 'Completed a sustained piece of creative writing, developing character and setting across multiple paragraphs with real detail.',
    source: 'school', status: 'active',
    curriculumArea: 'literacy_english', cfeLevel: 'second',
    outcomeCode: 'LIT 2-20a', outcomeText: 'I enjoy creating texts of my choice and I regularly select subject, form, audience and purpose.',
    aiSuggested: true, aiConfidence: 'strong',
    achievementDate: '2026-02-28', loggedBy: 'Ms Elliot',
  },
  {
    id: 'a4', pupilId: 'p1',
    description: 'Used a bar chart to display results from a class survey and explained what the data showed to the group.',
    source: 'school', status: 'active',
    curriculumArea: 'numeracy_maths', cfeLevel: 'second',
    outcomeCode: 'MTH 2-21a', outcomeText: 'I can collect data, display data clearly and extract and interpret the key information.',
    aiSuggested: true, aiConfidence: 'strong',
    achievementDate: '2026-02-24', loggedBy: 'Ms Elliot',
  },
  {
    id: 'a5', pupilId: 'p2',
    description: 'Performed a solo piece at the school music evening. Played with real expression and confidence.',
    source: 'school', status: 'active',
    curriculumArea: 'expressive_arts', cfeLevel: 'second',
    outcomeCode: 'EXA 2-02a', outcomeText: 'I can sing and play music, using techniques and understanding to perform and express myself.',
    aiSuggested: true, aiConfidence: 'strong',
    achievementDate: '2026-03-05', loggedBy: 'Ms Elliot',
  },
  {
    id: 'a6', pupilId: 'p2',
    description: 'Passed her Grade 3 violin exam with merit.',
    source: 'outside_school', status: 'active',
    curriculumArea: 'expressive_arts', cfeLevel: 'second',
    outcomeCode: 'EXA 2-01a', outcomeText: 'I have experienced the energy and excitement of taking part in creative and performance activities.',
    aiSuggested: true, aiConfidence: 'good',
    achievementDate: '2026-02-20', submittedBy: 'Parent',
    parentCategory: 'creative',
  },
  {
    id: 'a7', pupilId: 'p4',
    description: 'Volunteered at the local food bank for three Saturdays running. Showed real responsibility and initiative.',
    source: 'outside_school', status: 'pending_review',
    curriculumArea: 'health_wellbeing', cfeLevel: 'second',
    outcomeCode: 'HWB 2-36a', outcomeText: 'I can show consideration for others and explore the importance of keeping myself and others safe.',
    aiSuggested: true, aiConfidence: 'good',
    achievementDate: '2026-03-06', submittedBy: 'Parent',
    parentCategory: 'community',
  },
  {
    id: 'a8', pupilId: 'p3',
    description: 'Completed a coding project using Scratch to create an interactive quiz game for younger pupils.',
    source: 'school', status: 'active',
    curriculumArea: 'technologies', cfeLevel: 'second',
    outcomeCode: 'TCH 2-14a', outcomeText: 'I can explore how reprogrammable devices work, and use my findings to produce a working solution.',
    aiSuggested: true, aiConfidence: 'strong',
    achievementDate: '2026-03-01', loggedBy: 'Ms Elliot',
  },
  {
    id: 'a9', pupilId: 'p6',
    description: 'Completed a local history project on Hawick's textile heritage, using library sources and interviews.',
    source: 'school', status: 'active',
    curriculumArea: 'social_studies', cfeLevel: 'second',
    outcomeCode: 'SOC 2-01a', outcomeText: 'I can use primary and secondary sources selectively to research events in the past.',
    aiSuggested: false, aiConfidence: undefined,
    achievementDate: '2026-02-19', loggedBy: 'Ms Elliot',
  },
]

export const mockPendingAchievements = mockAchievements.filter(a => a.status === 'pending_review')

export function getPupilAchievements(pupilId: string): Achievement[] {
  return mockAchievements.filter(a => a.pupilId === pupilId && a.status !== 'pending_review')
}

export function getPupilById(id: string): Pupil | undefined {
  return mockPupils.find(p => p.id === id)
}

export function getLastAchievementDate(pupilId: string): string | null {
  const achievements = getPupilAchievements(pupilId)
  if (!achievements.length) return null
  return achievements.sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))[0].achievementDate
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const days = getDaysSince(dateStr)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function getPupilCoverageAreas(pupilId: string): Partial<Record<CurriculumArea, number>> {
  const achievements = getPupilAchievements(pupilId)
  const counts: Partial<Record<CurriculumArea, number>> = {}
  achievements.forEach(a => {
    if (a.curriculumArea) {
      counts[a.curriculumArea] = (counts[a.curriculumArea] || 0) + 1
    }
  })
  return counts
}

// Simulated AI suggestions
export const mockAiSuggestions: Record<string, { area: CurriculumArea; level: CfELevel; outcomes: Array<{ code: string; text: string; confidence: 'strong' | 'good' | 'possible' }> }> = {
  default: {
    area: 'literacy_english',
    level: 'second',
    outcomes: [
      { code: 'LIT 2-10a', text: 'I can communicate clearly and independently in a range of situations, organising and presenting information in an appropriate way for the audience.', confidence: 'strong' },
      { code: 'LIT 2-09a', text: 'I am developing confidence when engaging with others within and beyond my place of learning.', confidence: 'good' },
      { code: 'EXA 2-01a', text: 'I have experienced the energy and excitement of taking part in creative and performance activities.', confidence: 'possible' },
    ]
  }
}
