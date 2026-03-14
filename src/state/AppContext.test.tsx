import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppProvider, useAppState } from './AppContext'

function Probe() {
  const { state, dispatch } = useAppState()

  return (
    <div>
      <button type="button" onClick={() => dispatch({ type: 'toggleSaved', payload: { phraseId: 'transport-01' } })}>
        toggle saved
      </button>
      <button type="button" onClick={() => dispatch({ type: 'recordPhraseView', payload: { phraseId: 'transport-01' } })}>
        view phrase
      </button>
      <button type="button" onClick={() => dispatch({ type: 'togglePhraseKnown', payload: { phraseId: 'transport-01' } })}>
        know phrase
      </button>
      <button type="button" onClick={() => dispatch({ type: 'setTransliteration', payload: false })}>
        translit off
      </button>
      <p data-testid="saved-count">{state.progress.savedPhraseIds.length}</p>
      <p data-testid="status">{state.progress.phraseProgress['transport-01']?.status ?? 'new'}</p>
      <p data-testid="views">{state.progress.phraseProgress['transport-01']?.viewCount ?? 0}</p>
      <p data-testid="translit">{String(state.prefs.transliterationEnabled)}</p>
    </div>
  )
}

describe('AppProvider persistence', () => {
  it('persists favorites/progress/preferences across remount', async () => {
    const user = userEvent.setup()

    const view = render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'toggle saved' }))
    await user.click(screen.getByRole('button', { name: 'view phrase' }))
    await user.click(screen.getByRole('button', { name: 'know phrase' }))
    await user.click(screen.getByRole('button', { name: 'translit off' }))

    await waitFor(() => {
      expect(screen.getByTestId('saved-count')).toHaveTextContent('1')
      expect(screen.getByTestId('status')).toHaveTextContent('known')
      expect(screen.getByTestId('views')).toHaveTextContent('1')
      expect(screen.getByTestId('translit')).toHaveTextContent('false')
    })

    view.unmount()

    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    )

    expect(screen.getByTestId('saved-count')).toHaveTextContent('1')
    expect(screen.getByTestId('status')).toHaveTextContent('known')
    expect(screen.getByTestId('views')).toHaveTextContent('1')
    expect(screen.getByTestId('translit')).toHaveTextContent('false')
  })
})
