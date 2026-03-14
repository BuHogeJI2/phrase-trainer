import { describe, expect, it } from 'vitest'
import { defaultState, loadStateFromStorage, saveStateToStorage } from './storage'

describe('storage', () => {
  it('falls back to default state for invalid json', () => {
    localStorage.setItem('ru-de-phrase-trainer-state-v2', 'not-json')
    const state = loadStateFromStorage(localStorage)
    expect(state).toEqual(defaultState)
  })

  it('saves and restores valid state', () => {
    saveStateToStorage(
      {
        ...defaultState,
        prefs: {
          ...defaultState.prefs,
          direction: 'de_to_ru',
          onboardingCompleted: true,
        },
      },
      localStorage,
    )

    const state = loadStateFromStorage(localStorage)
    expect(state.prefs.direction).toBe('de_to_ru')
    expect(state.prefs.onboardingCompleted).toBe(true)
  })

  it('migrates completed phrases from v1 into studying progress', () => {
    localStorage.setItem(
      'ru-de-phrase-trainer-state-v1',
      JSON.stringify({
        prefs: {
          onboardingCompleted: true,
        },
        progress: {
          completedPhraseIds: ['transport-01'],
          savedPhraseIds: ['transport-01'],
        },
      }),
    )

    const state = loadStateFromStorage(localStorage)

    expect(state.progress.savedPhraseIds).toEqual(['transport-01'])
    expect(state.progress.phraseProgress['transport-01']).toMatchObject({
      status: 'studying',
      viewCount: 1,
    })
  })
})
