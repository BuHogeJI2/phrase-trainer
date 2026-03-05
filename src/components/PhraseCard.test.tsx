import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PhraseCard } from './PhraseCard'
import type { Phrase } from '../types'

const phrase: Phrase = {
  id: 'shop-01',
  situationId: 'shop',
  level: 'A1',
  de: 'Guten Tag',
  ru: 'Добрый день',
  translitRu: 'гутен таг',
  audioDeSrc: '/audio/shop-01.mp3',
}

describe('PhraseCard', () => {
  it('shows russian UI labels and switches answer content by direction', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <PhraseCard
        phrase={phrase}
        direction="ru_to_de"
        transliterationEnabled
        isSaved={false}
        isCompleted={false}
        onToggleSaved={vi.fn()}
        onMarkCompleted={vi.fn()}
      />,
    )

    expect(screen.getByText('Русский')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Показать перевод' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Показать перевод' }))
    expect(screen.getByText('Немецкий')).toBeInTheDocument()
    expect(screen.getByText('Guten Tag')).toBeInTheDocument()

    rerender(
      <PhraseCard
        phrase={phrase}
        direction="de_to_ru"
        transliterationEnabled
        isSaved={false}
        isCompleted={false}
        onToggleSaved={vi.fn()}
        onMarkCompleted={vi.fn()}
      />,
    )

    expect(screen.getByText('Немецкий')).toBeInTheDocument()
  })
})
