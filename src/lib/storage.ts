import type { AppState, Direction, Level, PhrasePracticeResult, PhraseProgress } from '../types'
import { createDefaultPhraseProgress, derivePhraseStatus } from './learning'

const STORAGE_KEY_V2 = 'ru-de-phrase-trainer-state-v2'
const STORAGE_KEY_V1 = 'ru-de-phrase-trainer-state-v1'

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
    savedPhraseIds: [],
    phraseProgress: {},
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

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && value >= 0 ? value : 0
}

function asPhraseResult(value: unknown): PhrasePracticeResult | null {
  return value === 'correct' || value === 'incorrect' ? value : null
}

function parsePhraseProgressRecord(value: unknown): Record<string, PhraseProgress> {
  if (!isObject(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, PhraseProgress>>((acc, [phraseId, item]) => {
    if (!isObject(item)) {
      return acc
    }

    const parsed = createDefaultPhraseProgress({
      status: item.status === 'studying' || item.status === 'difficult' || item.status === 'known' ? item.status : 'new',
      viewCount: asNonNegativeNumber(item.viewCount),
      lastViewedAt: asNullableString(item.lastViewedAt),
      correctCount: asNonNegativeNumber(item.correctCount),
      incorrectCount: asNonNegativeNumber(item.incorrectCount),
      lastResult: asPhraseResult(item.lastResult),
      manualDifficult: item.manualDifficult === true,
      manualKnown: item.manualKnown === true,
      lastPracticedAt: asNullableString(item.lastPracticedAt),
    })

    acc[phraseId] = {
      ...parsed,
      status: derivePhraseStatus(parsed),
    }

    return acc
  }, {})
}

function buildMigratedPhraseProgress(completedPhraseIds: string[]): Record<string, PhraseProgress> {
  return completedPhraseIds.reduce<Record<string, PhraseProgress>>((acc, phraseId) => {
    const progress = createDefaultPhraseProgress({
      status: 'studying',
      viewCount: 1,
    })

    acc[phraseId] = {
      ...progress,
      status: derivePhraseStatus(progress),
    }

    return acc
  }, {})
}

function parsePrefs(prefs: Record<string, unknown>) {
  return {
    direction: prefs.direction === 'de_to_ru' ? 'de_to_ru' : DEFAULT_DIRECTION,
    defaultLevel: prefs.defaultLevel === 'A1' || prefs.defaultLevel === 'A2' ? prefs.defaultLevel : DEFAULT_LEVEL,
    transliterationEnabled: prefs.transliterationEnabled !== false,
    audioAutoplay: prefs.audioAutoplay === true,
    onboardingCompleted: prefs.onboardingCompleted === true,
  } as const
}

function parseProgress(progress: Record<string, unknown>) {
  const quizStats = isObject(progress.quizStats) ? progress.quizStats : {}

  return {
    savedPhraseIds: asStringArray(progress.savedPhraseIds),
    phraseProgress: parsePhraseProgressRecord(progress.phraseProgress),
    quizStats: {
      totalAnswered: asNonNegativeNumber(quizStats.totalAnswered),
      correct: asNonNegativeNumber(quizStats.correct),
      streak: asNonNegativeNumber(quizStats.streak),
    },
    lastVisitedSituationId: asNullableString(progress.lastVisitedSituationId),
    lastVisitedAt: asNullableString(progress.lastVisitedAt),
  }
}

function parseV2State(parsed: Record<string, unknown>): AppState {
  const prefs = isObject(parsed.prefs) ? parsed.prefs : {}
  const progress = isObject(parsed.progress) ? parsed.progress : {}

  return {
    prefs: parsePrefs(prefs),
    progress: parseProgress(progress),
  }
}

function parseV1State(parsed: Record<string, unknown>): AppState {
  const prefs = isObject(parsed.prefs) ? parsed.prefs : {}
  const progress = isObject(parsed.progress) ? parsed.progress : {}
  const quizStats = isObject(progress.quizStats) ? progress.quizStats : {}
  const completedPhraseIds = asStringArray(progress.completedPhraseIds)

  return {
    prefs: parsePrefs(prefs),
    progress: {
      savedPhraseIds: asStringArray(progress.savedPhraseIds),
      phraseProgress: buildMigratedPhraseProgress(completedPhraseIds),
      quizStats: {
        totalAnswered: asNonNegativeNumber(quizStats.totalAnswered),
        correct: asNonNegativeNumber(quizStats.correct),
        streak: asNonNegativeNumber(quizStats.streak),
      },
      lastVisitedSituationId: asNullableString(progress.lastVisitedSituationId),
      lastVisitedAt: asNullableString(progress.lastVisitedAt),
    },
  }
}

export function loadStateFromStorage(storage: Storage = window.localStorage): AppState {
  try {
    const rawV2 = storage.getItem(STORAGE_KEY_V2)
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2)
      if (!isObject(parsed)) {
        return defaultState
      }

      return parseV2State(parsed)
    }

    const rawV1 = storage.getItem(STORAGE_KEY_V1)
    if (!rawV1) {
      return defaultState
    }

    const parsed: unknown = JSON.parse(rawV1)
    if (!isObject(parsed)) {
      return defaultState
    }

    return parseV1State(parsed)
  } catch {
    return defaultState
  }
}

export function saveStateToStorage(state: AppState, storage: Storage = window.localStorage): void {
  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(state))
  } catch {
    // ignore write errors in private mode / full storage
  }
}

export function resetStateInStorage(storage: Storage = window.localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY_V2)
    storage.removeItem(STORAGE_KEY_V1)
  } catch {
    // ignore remove errors
  }
}
