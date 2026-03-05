import type { AppState, Direction, Level } from '../types'

const STORAGE_KEY = 'ru-de-phrase-trainer-state-v1'

const DEFAULT_DIRECTION: Direction = 'ru_to_de'
const DEFAULT_LEVEL: Level | 'all' = 'all'

export const defaultState: AppState = {
  prefs: {
    direction: DEFAULT_DIRECTION,
    defaultLevel: DEFAULT_LEVEL,
    transliterationEnabled: true,
    audioAutoplay: false,
    onboardingCompleted: false,
  },
  progress: {
    completedPhraseIds: [],
    savedPhraseIds: [],
    quizStats: {
      totalAnswered: 0,
      correct: 0,
      streak: 0,
    },
    lastVisitedSituationId: null,
    lastVisitedAt: null,
  },
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

export function loadStateFromStorage(storage: Storage = window.localStorage): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultState
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isObject(parsed)) {
      return defaultState
    }

    const prefs = isObject(parsed.prefs) ? parsed.prefs : {}
    const progress = isObject(parsed.progress) ? parsed.progress : {}
    const quizStats = isObject(progress.quizStats) ? progress.quizStats : {}

    return {
      prefs: {
        direction: prefs.direction === 'de_to_ru' ? 'de_to_ru' : DEFAULT_DIRECTION,
        defaultLevel: prefs.defaultLevel === 'A1' || prefs.defaultLevel === 'A2' ? prefs.defaultLevel : DEFAULT_LEVEL,
        transliterationEnabled: prefs.transliterationEnabled !== false,
        audioAutoplay: prefs.audioAutoplay === true,
        onboardingCompleted: prefs.onboardingCompleted === true,
      },
      progress: {
        completedPhraseIds: asStringArray(progress.completedPhraseIds),
        savedPhraseIds: asStringArray(progress.savedPhraseIds),
        quizStats: {
          totalAnswered: typeof quizStats.totalAnswered === 'number' ? quizStats.totalAnswered : 0,
          correct: typeof quizStats.correct === 'number' ? quizStats.correct : 0,
          streak: typeof quizStats.streak === 'number' ? quizStats.streak : 0,
        },
        lastVisitedSituationId: typeof progress.lastVisitedSituationId === 'string' ? progress.lastVisitedSituationId : null,
        lastVisitedAt: typeof progress.lastVisitedAt === 'string' ? progress.lastVisitedAt : null,
      },
    }
  } catch {
    return defaultState
  }
}

export function saveStateToStorage(state: AppState, storage: Storage = window.localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore write errors in private mode / full storage
  }
}

export function resetStateInStorage(storage: Storage = window.localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // ignore remove errors
  }
}
