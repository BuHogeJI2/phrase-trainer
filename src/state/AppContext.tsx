/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadStateFromStorage, saveStateToStorage } from '../lib/storage'
import type { AppState, Direction, Level } from '../types'

type Action =
  | { type: 'completeOnboarding'; payload: { direction: Direction; defaultLevel: Level | 'all'; transliterationEnabled: boolean } }
  | { type: 'setDirection'; payload: Direction }
  | { type: 'setDefaultLevel'; payload: Level | 'all' }
  | { type: 'setTransliteration'; payload: boolean }
  | { type: 'setAudioAutoplay'; payload: boolean }
  | { type: 'toggleSaved'; payload: { phraseId: string } }
  | { type: 'markCompleted'; payload: { phraseId: string } }
  | { type: 'quizAnswered'; payload: { correct: boolean } }
  | { type: 'setLastVisitedSituation'; payload: { situationId: string } }
  | { type: 'resetProgress' }

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

function unique(items: string[]): string[] {
  return Array.from(new Set(items))
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
    case 'markCompleted': {
      return {
        ...state,
        progress: {
          ...state.progress,
          completedPhraseIds: unique([...state.progress.completedPhraseIds, action.payload.phraseId]),
        },
      }
    }
    case 'quizAnswered': {
      const { correct } = action.payload

      return {
        ...state,
        progress: {
          ...state.progress,
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

  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const value = useContext(AppContext)

  if (!value) {
    throw new Error('useAppState должен использоваться внутри AppProvider')
  }

  return value
}
