import { describe, expect, it } from 'vitest'
import { defaultState, loadStateFromStorage, saveStateToStorage } from './storage'

describe('storage', () => {
  it('falls back to default state for invalid json', () => {
    localStorage.setItem('ru-de-phrase-trainer-state-v1', 'not-json')
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
})
