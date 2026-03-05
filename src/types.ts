export type Direction = 'ru_to_de' | 'de_to_ru'
export type Level = 'A1' | 'A2'

export interface Phrase {
  id: string
  situationId: string
  level: Level
  de: string
  ru: string
  translitRu?: string
  audioDeSrc: string
  tags?: string[]
}

export interface Situation {
  id: string
  slug: string
  titleRu: string
  icon: string
  order: number
}

export interface UserPrefs {
  direction: Direction
  defaultLevel: Level | 'all'
  transliterationEnabled: boolean
  audioAutoplay: boolean
  onboardingCompleted: boolean
}

export interface QuizStats {
  totalAnswered: number
  correct: number
  streak: number
}

export interface ProgressState {
  completedPhraseIds: string[]
  savedPhraseIds: string[]
  quizStats: QuizStats
  lastVisitedSituationId: string | null
  lastVisitedAt: string | null
}

export interface AppState {
  prefs: UserPrefs
  progress: ProgressState
}

export interface Badge {
  id: string
  title: string
  description: string
  achieved: boolean
}
