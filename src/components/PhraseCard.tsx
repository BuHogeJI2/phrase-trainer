import { useState } from 'react'
import type { Direction, Phrase } from '../types'
import { getPromptAndAnswer } from '../lib/learning'

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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{phrase.level}</span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isSaved ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
          }`}
          onClick={() => onToggleSaved(phrase.id)}
          aria-label={isSaved ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isSaved ? 'В избранном' : 'В избранное'}
        </button>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{promptLabel}</p>
      <p className="text-lg font-semibold text-slate-900">{prompt}</p>

      {showAnswer ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{answerLabel}</p>
          <p className="text-base text-slate-900">{answer}</p>
          {transliterationEnabled && direction === 'ru_to_de' && phrase.translitRu ? (
            <p className="mt-2 text-sm text-slate-600">Произношение: {phrase.translitRu}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
          onClick={showAnswer ? () => setShowAnswer(false) : revealAnswer}
        >
          {showAnswer ? 'Скрыть ответ' : 'Показать перевод'}
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          onClick={() => playGermanAudio(phrase)}
        >
          Слушать DE
        </button>
      </div>

      {isCompleted ? <p className="mt-3 text-xs font-semibold text-emerald-700">Отмечено как изученное</p> : null}
    </article>
  )
}
