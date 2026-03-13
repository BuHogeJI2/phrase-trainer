import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { EmptyState } from '../components/EmptyState'
import { LevelFilter } from '../components/LevelFilter'
import { PhraseCard } from '../components/PhraseCard'
import { buttonClassName } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { phrases, phrasesBySituation } from '../data/phrases'
import { situationBySlug } from '../data/situations'
import { buildQuizQuestion, createSeededRandom, filterPhrases, getDailyPhrases } from '../lib/learning'
import { useAppState } from '../state/AppContext'

type PracticeMode = 'cards' | 'quiz'

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PracticePage() {
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useAppState()
  const [mode, setMode] = useState<PracticeMode>('cards')
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState<{ selected: string; correct: boolean } | null>(null)

  const source = searchParams.get('source')
  const slug = searchParams.get('slug')

  const pool = useMemo(() => {
    const levelFiltered = filterPhrases(phrases, state.prefs.defaultLevel)

    if (source === 'daily') {
      return getDailyPhrases(levelFiltered, getTodayISO(), 10)
    }

    if (source === 'favorites') {
      return levelFiltered.filter((phrase) => state.progress.savedPhraseIds.includes(phrase.id))
    }

    if (source === 'situation' && slug) {
      const situation = situationBySlug.get(slug)
      if (!situation) {
        return []
      }

      return filterPhrases(phrasesBySituation[situation.id] ?? [], state.prefs.defaultLevel)
    }

    return levelFiltered
  }, [slug, source, state.prefs.defaultLevel, state.progress.savedPhraseIds])

  const activePhrase = pool[index] ?? null
  const quizQuestion = useMemo(() => {
    if (!activePhrase || mode !== 'quiz') {
      return null
    }

    const random = createSeededRandom(`${getTodayISO()}-${index}-${activePhrase.id}`)
    return buildQuizQuestion(pool, activePhrase, state.prefs.direction, random)
  }, [activePhrase, index, mode, pool, state.prefs.direction])

  function nextItem() {
    setAnswered(null)
    setIndex((prev) => {
      if (pool.length === 0) {
        return 0
      }
      return prev >= pool.length - 1 ? 0 : prev + 1
    })
  }

  function previousItem() {
    setAnswered(null)
    setIndex((prev) => {
      if (pool.length === 0) {
        return 0
      }
      return prev <= 0 ? pool.length - 1 : prev - 1
    })
  }

  function answerQuiz(selected: string) {
    if (!quizQuestion || answered) {
      return
    }

    const correct = selected === quizQuestion.correctAnswer
    setAnswered({ selected, correct })
    dispatch({ type: 'quizAnswered', payload: { correct } })
    dispatch({ type: 'markCompleted', payload: { phraseId: quizQuestion.phraseId } })
  }

  function jumpToSavedSession() {
    setIndex(0)
    setMode('cards')
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Практика"
          subtitle={`Текущий набор: ${
            source === 'daily' ? 'Сегодняшние 10 фраз' : source === 'favorites' ? 'Только избранное' : 'Общий'
          } (${pool.length} фраз)`}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
          <LevelFilter value={state.prefs.defaultLevel} onChange={(level) => dispatch({ type: 'setDefaultLevel', payload: level })} />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('cards')
              setAnswered(null)
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === 'cards'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
            }`}
          >
            Флеш-карточки
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('quiz')
              setAnswered(null)
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === 'quiz'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
            }`}
          >
            Тест
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/practice?source=favorites" onClick={jumpToSavedSession} className={buttonClassName('secondary')}>
            Режим по избранному
          </Link>
          <Link to="/practice?source=daily" onClick={jumpToSavedSession} className={buttonClassName('secondary')}>
            Сегодняшние 10
          </Link>
          <Link to="/practice" onClick={jumpToSavedSession} className={buttonClassName('ghost')}>
            Сбросить фильтр
          </Link>
        </div>
      </section>

      {!activePhrase ? (
        <EmptyState
          title="Пока нет фраз для этой практики"
          description="Добавьте избранные фразы или ослабьте фильтр уровня, чтобы продолжить тренировку."
        />
      ) : mode === 'cards' ? (
        <section className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Карточка {index + 1} из {pool.length}
          </p>
          <PhraseCard
            phrase={activePhrase}
            direction={state.prefs.direction}
            transliterationEnabled={state.prefs.transliterationEnabled}
            audioAutoplay={state.prefs.audioAutoplay}
            isSaved={state.progress.savedPhraseIds.includes(activePhrase.id)}
            isCompleted={state.progress.completedPhraseIds.includes(activePhrase.id)}
            onToggleSaved={(phraseId) => dispatch({ type: 'toggleSaved', payload: { phraseId } })}
            onMarkCompleted={(phraseId) => dispatch({ type: 'markCompleted', payload: { phraseId } })}
          />
          <div className="flex gap-2">
            <button type="button" onClick={previousItem} className={buttonClassName('secondary')}>
              Назад
            </button>
            <button type="button" onClick={nextItem} className={buttonClassName()}>
              Далее
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          {quizQuestion ? (
            <>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Вопрос {index + 1} из {pool.length}
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--color-text)]">{quizQuestion.prompt}</p>
              <div className="mt-4 grid gap-2">
                {quizQuestion.options.map((option) => {
                  const isSelected = answered?.selected === option
                  const isCorrect = quizQuestion.correctAnswer === option
                  const buttonClass = answered
                    ? isCorrect
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                      : isSelected
                        ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]'

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerQuiz(option)}
                      disabled={Boolean(answered)}
                      className={`rounded-[24px] border p-3 text-left text-sm font-medium ${buttonClass}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {answered ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-3">
                  <p
                    className={`text-sm font-semibold ${
                      answered.correct ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-danger)]'
                    }`}
                  >
                    {answered.correct ? 'Верно!' : 'Неправильно'}
                  </p>
                  <button type="button" onClick={nextItem} className={buttonClassName()}>
                    Следующий вопрос
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      )}

      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]">
        <p>Всего ответов: {state.progress.quizStats.totalAnswered}</p>
        <p>Правильных: {state.progress.quizStats.correct}</p>
        <p>Текущая серия: {state.progress.quizStats.streak}</p>
      </section>
    </div>
  )
}
