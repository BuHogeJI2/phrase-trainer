import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { HomePage } from './HomePage'
import { AppProvider } from '../state/AppContext'
import { defaultState, saveStateToStorage } from '../lib/storage'
import { createDefaultPhraseProgress } from '../lib/learning'

function renderHome() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the daily CTA, urgent situations, continue card, and situation descriptions', () => {
    saveStateToStorage({
      ...defaultState,
      prefs: {
        ...defaultState.prefs,
        onboardingCompleted: true,
      },
      progress: {
        ...defaultState.progress,
        phraseProgress: {
          'transport-01': createDefaultPhraseProgress({
            status: 'known',
            correctCount: 3,
          }),
        },
        lastVisitedSituationId: 'transport',
        lastVisitedAt: '2026-03-12T18:15:00.000Z',
      },
    })

    renderHome()

    expect(screen.getByText('Практика на сегодня')).toBeInTheDocument()
    expect(screen.getByText('Срочные ситуации')).toBeInTheDocument()
    expect(screen.getAllByText('Продолжить').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1/20').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Как спросить дорогу, остановку или билет.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Как попросить лекарство и объяснить, что болит.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Покупки, цены и короткие вопросы на кассе.').length).toBeGreaterThan(0)
    expect(screen.getByText(/В памяти уверенно:/)).toBeInTheDocument()
  })
})
