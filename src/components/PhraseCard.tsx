import { useState } from 'react'
import type { Direction, Phrase } from '../types'
import { getPromptAndAnswer } from '../lib/learning'
import { buttonClassName } from './ui/Button'

interface PhraseCardProps {
  phrase: Phrase
  direction: Direction
  transliterationEnabled: boolean
  isSaved: boolean
  isCompleted: boolean
  audioAutoplay?: boolean
  onToggleSaved: (phraseId: string) => void
  onMarkCompleted: (phraseId: string) => void
}

async function playGermanAudio(phrase: Phrase): Promise<void> {
  try {
    const audio = new Audio(phrase.audioDeSrc)
    await audio.play()
    return
  } catch {
    // fallback below
  }

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(phrase.de)
    utterance.lang = 'de-DE'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }
}

export function PhraseCard({
  phrase,
  direction,
  transliterationEnabled,
  isSaved,
  isCompleted,
  audioAutoplay = false,
  onToggleSaved,
  onMarkCompleted,
}: PhraseCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const { prompt, answer } = getPromptAndAnswer(phrase, direction)

  const promptLabel = direction === 'ru_to_de' ? 'Русский' : 'Немецкий'
  const answerLabel = direction === 'ru_to_de' ? 'Немецкий' : 'Русский'

  async function revealAnswer() {
    setShowAnswer(true)
    onMarkCompleted(phrase.id)

    if (audioAutoplay && direction === 'ru_to_de') {
      await playGermanAudio(phrase)
    }
  }

  return (
    <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
          {phrase.level}
        </span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isSaved
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
          }`}
          onClick={() => onToggleSaved(phrase.id)}
          aria-label={isSaved ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isSaved ? 'В избранном' : 'В избранное'}
        </button>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{promptLabel}</p>
      <p className="text-lg font-semibold text-[var(--color-text)]">{prompt}</p>

      {showAnswer ? (
        <div className="mt-4 rounded-[24px] bg-[var(--color-surface-muted)] p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{answerLabel}</p>
          <p className="text-base text-[var(--color-text)]">{answer}</p>
          {transliterationEnabled && direction === 'ru_to_de' && phrase.translitRu ? (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Произношение: {phrase.translitRu}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClassName()}
          onClick={showAnswer ? () => setShowAnswer(false) : revealAnswer}
        >
          {showAnswer ? 'Скрыть ответ' : 'Показать перевод'}
        </button>
        <button
          type="button"
          className={buttonClassName('secondary')}
          onClick={() => playGermanAudio(phrase)}
        >
          Слушать DE
        </button>
      </div>

      {isCompleted ? <p className="mt-3 text-xs font-semibold text-[var(--color-accent-strong)]">Отмечено как изученное</p> : null}
    </article>
  )
}
