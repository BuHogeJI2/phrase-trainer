import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { AppProvider } from './state/AppContext'
import { defaultState, saveStateToStorage } from './lib/storage'

function renderRoutes(initialEntry = '/') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProvider>,
  )
}

describe('onboarding flow', () => {
  it('shows a 3-step onboarding on first run and persists preferences', async () => {
    const user = userEvent.setup()

    const view = renderRoutes('/')

    expect(screen.getByText('Немецкие фразы для реальных ситуаций в Германии')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Далее' }))
    expect(screen.getByText('Не просто читать, а запоминать и использовать')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Далее' }))
    expect(screen.getByText('Настройте удобный старт')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DE → RU' }))
    await user.click(screen.getByRole('button', { name: 'A2' }))
    await user.click(screen.getByLabelText('Показывать подсказку произношения (кириллица)'))
    await user.click(screen.getByRole('button', { name: 'Начать обучение' }))

    await waitFor(() => {
      const raw = localStorage.getItem('ru-de-phrase-trainer-state-v1')
      expect(raw).not.toBeNull()
      expect(screen.queryByText('Немецкие фразы для реальных ситуаций в Германии')).not.toBeInTheDocument()

      const parsed = JSON.parse(raw ?? '{}')
      expect(parsed.prefs.direction).toBe('de_to_ru')
      expect(parsed.prefs.defaultLevel).toBe('A2')
      expect(parsed.prefs.transliterationEnabled).toBe(false)
      expect(parsed.prefs.onboardingCompleted).toBe(true)
    })

    view.unmount()
    renderRoutes('/')

    expect(screen.queryByText('Немецкие фразы для реальных ситуаций в Германии')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Практичный немецкий для жизни в Германии' })).toBeInTheDocument()
  })

  it('can be reopened from settings and save updated preferences', async () => {
    const user = userEvent.setup()

    saveStateToStorage({
      ...defaultState,
      prefs: {
        ...defaultState.prefs,
        onboardingCompleted: true,
        direction: 'ru_to_de',
        defaultLevel: 'all',
        transliterationEnabled: true,
      },
    })

    renderRoutes('/settings')

    await user.click(screen.getByRole('button', { name: 'Открыть краткое введение' }))
    expect(screen.getByText('Немецкие фразы для реальных ситуаций в Германии')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Далее' }))
    await user.click(screen.getByRole('button', { name: 'Далее' }))
    const dialog = screen.getByRole('dialog')
    const dialogQueries = within(dialog)

    await user.click(dialogQueries.getByRole('button', { name: 'DE → RU' }))
    await user.click(dialogQueries.getByRole('button', { name: 'A1' }))
    await user.click(dialogQueries.getByLabelText('Показывать подсказку произношения (кириллица)'))
    await user.click(dialogQueries.getByRole('button', { name: 'Сохранить настройки' }))

    await waitFor(() => {
      const parsed = JSON.parse(localStorage.getItem('ru-de-phrase-trainer-state-v1') ?? '{}')
      expect(parsed.prefs.direction).toBe('de_to_ru')
      expect(parsed.prefs.defaultLevel).toBe('A1')
      expect(parsed.prefs.transliterationEnabled).toBe(false)
    })

    expect(screen.queryByText('Настройте удобный старт')).not.toBeInTheDocument()
  })
})
