import { useState } from 'react'
import type { Direction, Phrase, PhraseLearningState } from '../types'
import { getPromptAndAnswer } from '../lib/learning'
import { buttonClassName } from './ui/Button'

interface PhraseCardProps {
  phrase: Phrase
  direction: Direction
  transliterationEnabled: boolean
  isSaved: boolean
  status: PhraseLearningState
  isDifficult: boolean
  isKnown: boolean
  audioAutoplay?: boolean
  onToggleSaved: (phraseId: string) => void
  onRecordView: (phraseId: string) => void
  onToggleDifficult: (phraseId: string) => void
  onToggleKnown: (phraseId: string) => void
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
  status,
  isDifficult,
  isKnown,
  audioAutoplay = false,
  onToggleSaved,
  onRecordView,
  onToggleDifficult,
  onToggleKnown,
}: PhraseCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const { prompt, answer } = getPromptAndAnswer(phrase, direction)

  const promptLabel = direction === 'ru_to_de' ? 'Русский' : 'Немецкий'
  const answerLabel = direction === 'ru_to_de' ? 'Немецкий' : 'Русский'

  async function revealAnswer() {
    setShowAnswer(true)
    onRecordView(phrase.id)

    if (audioAutoplay && direction === 'ru_to_de') {
      await playGermanAudio(phrase)
    }
  }

  const statusLabel =
    status === 'known'
      ? 'Знаю'
      : status === 'difficult'
        ? 'Трудная'
        : status === 'studying'
          ? 'В работе'
          : 'Новая'

  return (
    <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
            {phrase.level}
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
            {statusLabel}
          </span>
        </div>
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

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            isDifficult
              ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
          }`}
          onClick={() => onToggleDifficult(phrase.id)}
          aria-pressed={isDifficult}
        >
          {isDifficult ? 'Трудная фраза' : 'Отметить как трудную'}
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            isKnown
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
          }`}
          onClick={() => onToggleKnown(phrase.id)}
          aria-pressed={isKnown}
        >
          {isKnown ? 'Уже знаю' : 'Отметить как знаю'}
        </button>
      </div>
    </article>
  )
}
