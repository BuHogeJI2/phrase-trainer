/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { derivePhraseStatus, getPhraseProgress } from '../lib/learning'
import { loadStateFromStorage, saveStateToStorage } from '../lib/storage'
import type { AppState, Direction, Level } from '../types'

type Action =
  | { type: 'completeOnboarding'; payload: { direction: Direction; defaultLevel: Level | 'all'; transliterationEnabled: boolean } }
  | { type: 'setDirection'; payload: Direction }
  | { type: 'setDefaultLevel'; payload: Level | 'all' }
  | { type: 'setTransliteration'; payload: boolean }
  | { type: 'setAudioAutoplay'; payload: boolean }
  | { type: 'toggleSaved'; payload: { phraseId: string } }
  | { type: 'recordPhraseView'; payload: { phraseId: string } }
  | { type: 'togglePhraseDifficult'; payload: { phraseId: string } }
  | { type: 'togglePhraseKnown'; payload: { phraseId: string } }
  | { type: 'recordPracticeResult'; payload: { phraseId: string; correct: boolean } }
  | { type: 'setLastVisitedSituation'; payload: { situationId: string } }
  | { type: 'resetProgress' }

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  isOnboardingOpen: boolean
  openOnboarding: () => void
  closeOnboarding: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function updatePhraseProgress(
  state: AppState,
  phraseId: string,
  updater: (current: ReturnType<typeof getPhraseProgress>) => ReturnType<typeof getPhraseProgress>,
): AppState {
  const current = getPhraseProgress(state.progress, phraseId)
  const next = updater(current)

  return {
    ...state,
    progress: {
      ...state.progress,
      phraseProgress: {
        ...state.progress.phraseProgress,
        [phraseId]: {
          ...next,
          status: derivePhraseStatus(next),
        },
      },
    },
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'completeOnboarding': {
      return {
        ...state,
        prefs: {
          ...state.prefs,
          direction: action.payload.direction,
          defaultLevel: action.payload.defaultLevel,
          transliterationEnabled: action.payload.transliterationEnabled,
          onboardingCompleted: true,
        },
      }
    }
    case 'setDirection': {
      return {
        ...state,
        prefs: {
          ...state.prefs,
          direction: action.payload,
        },
      }
    }
    case 'setDefaultLevel': {
      return {
        ...state,
        prefs: {
          ...state.prefs,
          defaultLevel: action.payload,
        },
      }
    }
    case 'setTransliteration': {
      return {
        ...state,
        prefs: {
          ...state.prefs,
          transliterationEnabled: action.payload,
        },
      }
    }
    case 'setAudioAutoplay': {
      return {
        ...state,
        prefs: {
          ...state.prefs,
          audioAutoplay: action.payload,
        },
      }
    }
    case 'toggleSaved': {
      const isSaved = state.progress.savedPhraseIds.includes(action.payload.phraseId)
      const savedPhraseIds = isSaved
        ? state.progress.savedPhraseIds.filter((id) => id !== action.payload.phraseId)
        : [...state.progress.savedPhraseIds, action.payload.phraseId]

      return {
        ...state,
        progress: {
          ...state.progress,
          savedPhraseIds,
        },
      }
    }
    case 'recordPhraseView': {
      return updatePhraseProgress(state, action.payload.phraseId, (current) => ({
        ...current,
        status: current.status === 'new' ? 'studying' : current.status,
        viewCount: current.viewCount + 1,
        lastViewedAt: new Date().toISOString(),
      }))
    }
    case 'togglePhraseDifficult': {
      return updatePhraseProgress(state, action.payload.phraseId, (current) => {
        const nextDifficult = !current.manualDifficult

        return {
          ...current,
          status: nextDifficult ? 'difficult' : current.manualKnown ? 'known' : 'studying',
          manualDifficult: nextDifficult,
          manualKnown: nextDifficult ? false : current.manualKnown,
        }
      })
    }
    case 'togglePhraseKnown': {
      return updatePhraseProgress(state, action.payload.phraseId, (current) => {
        const nextKnown = !current.manualKnown

        return {
          ...current,
          status: nextKnown ? 'known' : current.manualDifficult ? 'difficult' : 'studying',
          manualKnown: nextKnown,
          manualDifficult: nextKnown ? false : current.manualDifficult,
        }
      })
    }
    case 'recordPracticeResult': {
      const { correct, phraseId } = action.payload
      const nextState = updatePhraseProgress(state, phraseId, (current) => ({
        ...current,
        correctCount: current.correctCount + (correct ? 1 : 0),
        incorrectCount: current.incorrectCount + (correct ? 0 : 1),
        lastResult: correct ? 'correct' : 'incorrect',
        lastPracticedAt: new Date().toISOString(),
        manualKnown: correct ? current.manualKnown : false,
      }))

      return {
        ...nextState,
        progress: {
          ...nextState.progress,
          quizStats: {
            totalAnswered: state.progress.quizStats.totalAnswered + 1,
            correct: state.progress.quizStats.correct + (correct ? 1 : 0),
            streak: correct ? state.progress.quizStats.streak + 1 : 0,
          },
        },
      }
    }
    case 'setLastVisitedSituation': {
      return {
        ...state,
        progress: {
          ...state.progress,
          lastVisitedSituationId: action.payload.situationId,
          lastVisitedAt: new Date().toISOString(),
        },
      }
    }
    case 'resetProgress': {
      return {
        ...state,
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
    }
    default:
      return state
  }
}

interface ProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadStateFromStorage())
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      isOnboardingOpen,
      openOnboarding: () => setIsOnboardingOpen(true),
      closeOnboarding: () => setIsOnboardingOpen(false),
    }),
    [isOnboardingOpen, state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const value = useContext(AppContext)

  if (!value) {
    throw new Error('useAppState должен использоваться внутри AppProvider')
  }

  return value
}
