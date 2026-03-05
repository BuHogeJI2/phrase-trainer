import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { LevelFilter } from '../components/LevelFilter'
import { PhraseCard } from '../components/PhraseCard'
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
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Практика</h1>
        <p className="mt-1 text-sm text-slate-600">
          Текущий набор: {source === 'daily' ? 'Сегодняшние 10 фраз' : source === 'favorites' ? 'Только избранное' : 'Общий'} ({pool.length} фраз)
        </p>

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
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === 'cards' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
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
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === 'quiz' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Тест
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/practice?source=favorites" onClick={jumpToSavedSession} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700">
            Режим по избранному
          </Link>
          <Link to="/practice?source=daily" onClick={jumpToSavedSession} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700">
            Сегодняшние 10
          </Link>
          <Link to="/practice" onClick={jumpToSavedSession} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700">
            Сбросить фильтр
          </Link>
        </div>
      </section>

      {!activePhrase ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          В выбранном режиме пока нет фраз. Добавьте избранные фразы или ослабьте фильтр уровня.
        </section>
      ) : mode === 'cards' ? (
        <section className="space-y-3">
          <p className="text-sm font-medium text-slate-600">
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
            <button type="button" onClick={previousItem} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Назад
            </button>
            <button type="button" onClick={nextItem} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Далее
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {quizQuestion ? (
            <>
              <p className="text-sm font-medium text-slate-600">
                Вопрос {index + 1} из {pool.length}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">{quizQuestion.prompt}</p>
              <div className="mt-4 grid gap-2">
                {quizQuestion.options.map((option) => {
                  const isSelected = answered?.selected === option
                  const isCorrect = quizQuestion.correctAnswer === option
                  const buttonClass = answered
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-white text-slate-500'
                    : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerQuiz(option)}
                      disabled={Boolean(answered)}
                      className={`rounded-xl border p-3 text-left text-sm font-medium ${buttonClass}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {answered ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-100 p-3">
                  <p className={`text-sm font-semibold ${answered.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {answered.correct ? 'Верно!' : 'Неправильно'}
                  </p>
                  <button type="button" onClick={nextItem} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    Следующий вопрос
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p>Всего ответов: {state.progress.quizStats.totalAnswered}</p>
        <p>Правильных: {state.progress.quizStats.correct}</p>
        <p>Текущая серия: {state.progress.quizStats.streak}</p>
      </section>
    </div>
  )
}
