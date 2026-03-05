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
      <button type="button" onClick={() => dispatch({ type: 'markCompleted', payload: { phraseId: 'transport-01' } })}>
        complete
      </button>
      <button type="button" onClick={() => dispatch({ type: 'setTransliteration', payload: false })}>
        translit off
      </button>
      <p data-testid="saved-count">{state.progress.savedPhraseIds.length}</p>
      <p data-testid="completed-count">{state.progress.completedPhraseIds.length}</p>
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
    await user.click(screen.getByRole('button', { name: 'complete' }))
    await user.click(screen.getByRole('button', { name: 'translit off' }))

    await waitFor(() => {
      expect(screen.getByTestId('saved-count')).toHaveTextContent('1')
      expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
      expect(screen.getByTestId('translit')).toHaveTextContent('false')
    })

    view.unmount()

    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    )

    expect(screen.getByTestId('saved-count')).toHaveTextContent('1')
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
    expect(screen.getByTestId('translit')).toHaveTextContent('false')
  })
})
