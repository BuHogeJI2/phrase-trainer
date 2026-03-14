export type Direction = 'ru_to_de' | 'de_to_ru'
export type Level = 'A1' | 'A2'
export type PhraseLearningState = 'new' | 'studying' | 'difficult' | 'known'
export type PhrasePracticeResult = 'correct' | 'incorrect'
export type PracticeSessionPhase = 'learn' | 'checkpoint' | 'mistakes' | 'retry' | 'done'

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
  descriptionRu: string
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

export interface PhraseProgress {
  status: PhraseLearningState
  viewCount: number
  lastViewedAt: string | null
  correctCount: number
  incorrectCount: number
  lastResult: PhrasePracticeResult | null
  manualDifficult: boolean
  manualKnown: boolean
  lastPracticedAt: string | null
}

export interface ProgressState {
  savedPhraseIds: string[]
  phraseProgress: Record<string, PhraseProgress>
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
