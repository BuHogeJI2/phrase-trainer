import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { EmptyState } from '../components/EmptyState'
import { LevelFilter } from '../components/LevelFilter'
import { PhraseCard } from '../components/PhraseCard'
import { buttonClassName } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { phraseById, phrases, phrasesBySituation } from '../data/phrases'
import { situationBySlug } from '../data/situations'
import {
  buildMatchingRound,
  buildQuizQuestion,
  createSeededRandom,
  filterPhrases,
  getDailyPracticePool,
  getPhraseProgress,
  prioritizePhrasesForPractice,
} from '../lib/learning'
import { useAppState } from '../state/AppContext'
import type { Phrase, PracticeSessionPhase } from '../types'

const BLOCK_SIZE = 5

interface AnswerState {
  selected: string
  correct: boolean
}

interface MatchingState {
  selectedPromptId: string | null
  completedPromptIds: string[]
  usedAnswerIds: string[]
  promptResults: Record<string, 'correct' | 'incorrect'>
  message: string | null
}

interface PracticeSessionState {
  phase: PracticeSessionPhase
  blockIndex: number
  learnIndex: number
  checkpointStep: 'matching' | 'quiz'
  checkpointQuestionIndex: number
  checkpointAnswer: AnswerState | null
  matching: MatchingState
  mistakePhraseIds: string[]
  mistakeReviewIndex: number
  retryQuestionIndex: number
  retryAnswer: AnswerState | null
}

interface PracticeSessionContentProps {
  initialPool: Phrase[]
  sourceKey: string
}

function createMatchingState(): MatchingState {
  return {
    selectedPromptId: null,
    completedPromptIds: [],
    usedAnswerIds: [],
    promptResults: {},
    message: null,
  }
}

function createSessionState(): PracticeSessionState {
  return {
    phase: 'learn',
    blockIndex: 0,
    learnIndex: 0,
    checkpointStep: 'matching',
    checkpointQuestionIndex: 0,
    checkpointAnswer: null,
    matching: createMatchingState(),
    mistakePhraseIds: [],
    mistakeReviewIndex: 0,
    retryQuestionIndex: 0,
    retryAnswer: null,
  }
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

function appendUnique(items: string[], phraseId: string): string[] {
  return items.includes(phraseId) ? items : [...items, phraseId]
}

function PracticeSessionContent({ initialPool, sourceKey }: PracticeSessionContentProps) {
  const { state, dispatch } = useAppState()
  const [pool] = useState<Phrase[]>(() => initialPool)
  const [session, setSession] = useState<PracticeSessionState>(() => createSessionState())

  const blockStart = session.blockIndex * BLOCK_SIZE
  const activeBlock = pool.slice(blockStart, blockStart + BLOCK_SIZE)
  const learnPhrase = activeBlock[session.learnIndex] ?? null
  const mistakePhrases = session.mistakePhraseIds
    .map((id) => phraseById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  const mistakeReviewPhrase = mistakePhrases[session.mistakeReviewIndex] ?? null

  const matchingRound =
    activeBlock.length > 0
      ? buildMatchingRound(activeBlock, state.prefs.direction, createSeededRandom(`${sourceKey}-${session.blockIndex}-matching`))
      : null

  const checkpointQuestions = activeBlock.map((phrase, index) =>
    buildQuizQuestion(pool, phrase, state.prefs.direction, createSeededRandom(`${sourceKey}-${session.blockIndex}-quiz-${index}`)),
  )

  const retryQuestions = mistakePhrases.map((phrase, index) =>
    buildQuizQuestion(
      pool.length > 0 ? pool : mistakePhrases,
      phrase,
      state.prefs.direction,
      createSeededRandom(`${sourceKey}-${session.blockIndex}-retry-${index}`),
    ),
  )

  const activeCheckpointQuestion = checkpointQuestions[session.checkpointQuestionIndex] ?? null
  const activeRetryQuestion = retryQuestions[session.retryQuestionIndex] ?? null
  const hasMoreBlocks = blockStart + BLOCK_SIZE < pool.length

  function goToCheckpoint() {
    setSession((prev) => ({
      ...prev,
      phase: 'checkpoint',
      checkpointStep: 'matching',
      checkpointQuestionIndex: 0,
      checkpointAnswer: null,
      matching: createMatchingState(),
    }))
  }

  function handleNextLearn() {
    if (session.learnIndex >= activeBlock.length - 1) {
      goToCheckpoint()
      return
    }

    setSession((prev) => ({
      ...prev,
      learnIndex: prev.learnIndex + 1,
    }))
  }

  function handleMatchingPromptSelect(phraseId: string) {
    if (session.matching.completedPromptIds.includes(phraseId)) {
      return
    }

    setSession((prev) => ({
      ...prev,
      matching: {
        ...prev.matching,
        selectedPromptId: phraseId,
        message: null,
      },
    }))
  }

  function handleMatchingAnswerSelect(answerPhraseId: string) {
    const selectedPromptId = session.matching.selectedPromptId

    if (!selectedPromptId || session.matching.usedAnswerIds.includes(answerPhraseId)) {
      return
    }

    const correct = selectedPromptId === answerPhraseId
    dispatch({ type: 'recordPracticeResult', payload: { phraseId: selectedPromptId, correct } })

    setSession((prev) => ({
      ...prev,
      mistakePhraseIds: correct ? prev.mistakePhraseIds : appendUnique(prev.mistakePhraseIds, selectedPromptId),
      matching: {
        ...prev.matching,
        selectedPromptId: null,
        completedPromptIds: appendUnique(prev.matching.completedPromptIds, selectedPromptId),
        usedAnswerIds: appendUnique(prev.matching.usedAnswerIds, correct ? answerPhraseId : selectedPromptId),
        promptResults: {
          ...prev.matching.promptResults,
          [selectedPromptId]: correct ? 'correct' : 'incorrect',
        },
        message: correct ? 'Верно. Пара готова.' : 'Не совсем. Правильную пару мы закрепили и вернем к этой фразе позже.',
      },
    }))
  }

  function startCheckpointQuestions() {
    setSession((prev) => ({
      ...prev,
      checkpointStep: 'quiz',
      checkpointQuestionIndex: 0,
      checkpointAnswer: null,
    }))
  }

  function handleCheckpointAnswer(selected: string) {
    if (!activeCheckpointQuestion || session.checkpointAnswer) {
      return
    }

    const correct = selected === activeCheckpointQuestion.correctAnswer
    dispatch({ type: 'recordPracticeResult', payload: { phraseId: activeCheckpointQuestion.phraseId, correct } })

    setSession((prev) => ({
      ...prev,
      checkpointAnswer: { selected, correct },
      mistakePhraseIds: correct ? prev.mistakePhraseIds : appendUnique(prev.mistakePhraseIds, activeCheckpointQuestion.phraseId),
    }))
  }

  function moveToCorrectionLoop() {
    setSession((prev) => {
      const isLastQuestion = prev.checkpointQuestionIndex >= checkpointQuestions.length - 1

      if (!isLastQuestion) {
        return {
          ...prev,
          checkpointQuestionIndex: prev.checkpointQuestionIndex + 1,
          checkpointAnswer: null,
        }
      }

      if (prev.mistakePhraseIds.length > 0) {
        return {
          ...prev,
          phase: 'mistakes',
          mistakeReviewIndex: 0,
          checkpointAnswer: null,
        }
      }

      return {
        ...prev,
        phase: 'done',
        checkpointAnswer: null,
      }
    })
  }

  function handleNextMistakeReview() {
    setSession((prev) => {
      if (prev.mistakeReviewIndex >= mistakePhrases.length - 1) {
        return {
          ...prev,
          phase: 'retry',
          retryQuestionIndex: 0,
          retryAnswer: null,
        }
      }

      return {
        ...prev,
        mistakeReviewIndex: prev.mistakeReviewIndex + 1,
      }
    })
  }

  function handleRetryAnswer(selected: string) {
    if (!activeRetryQuestion || session.retryAnswer) {
      return
    }

    const correct = selected === activeRetryQuestion.correctAnswer
    dispatch({ type: 'recordPracticeResult', payload: { phraseId: activeRetryQuestion.phraseId, correct } })

    setSession((prev) => ({
      ...prev,
      retryAnswer: { selected, correct },
    }))
  }

  function handleNextRetry() {
    setSession((prev) => {
      if (prev.retryQuestionIndex >= retryQuestions.length - 1) {
        return {
          ...prev,
          phase: 'done',
          retryAnswer: null,
        }
      }

      return {
        ...prev,
        retryQuestionIndex: prev.retryQuestionIndex + 1,
        retryAnswer: null,
      }
    })
  }

  function handleNextBlock() {
    setSession((prev) => ({
      ...prev,
      phase: 'learn',
      blockIndex: prev.blockIndex + 1,
      learnIndex: 0,
      checkpointStep: 'matching',
      checkpointQuestionIndex: 0,
      checkpointAnswer: null,
      matching: createMatchingState(),
      mistakePhraseIds: [],
      mistakeReviewIndex: 0,
      retryQuestionIndex: 0,
      retryAnswer: null,
    }))
  }

  if (activeBlock.length === 0) {
    return (
      <EmptyState
        title="Пока нет фраз для этой практики"
        description="Добавьте избранные фразы или ослабьте фильтр уровня, чтобы продолжить тренировку."
      />
    )
  }

  return (
    <>
      {session.phase === 'learn' && learnPhrase ? (
        <section className="space-y-3">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]">
            <p className="font-semibold text-[var(--color-text)]">Этап 1 из 4: изучение блока</p>
            <p className="mt-1">
              Фраза {session.learnIndex + 1} из {activeBlock.length}. Прослушайте, откройте перевод и при необходимости отметьте сложные фразы.
            </p>
          </div>
          {(() => {
            const progress = getPhraseProgress(state.progress, learnPhrase.id)

            return (
              <PhraseCard
                key={learnPhrase.id}
                phrase={learnPhrase}
                direction={state.prefs.direction}
                transliterationEnabled={state.prefs.transliterationEnabled}
                audioAutoplay={state.prefs.audioAutoplay}
                isSaved={state.progress.savedPhraseIds.includes(learnPhrase.id)}
                status={progress.status}
                isDifficult={progress.manualDifficult || progress.status === 'difficult'}
                isKnown={progress.manualKnown || progress.status === 'known'}
                onToggleSaved={(phraseId) => dispatch({ type: 'toggleSaved', payload: { phraseId } })}
                onRecordView={(phraseId) => dispatch({ type: 'recordPhraseView', payload: { phraseId } })}
                onToggleDifficult={(phraseId) => dispatch({ type: 'togglePhraseDifficult', payload: { phraseId } })}
                onToggleKnown={(phraseId) => dispatch({ type: 'togglePhraseKnown', payload: { phraseId } })}
              />
            )
          })()}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setSession((prev) => ({
                  ...prev,
                  learnIndex: prev.learnIndex > 0 ? prev.learnIndex - 1 : prev.learnIndex,
                }))
              }
              className={buttonClassName('secondary')}
              disabled={session.learnIndex === 0}
            >
              Назад
            </button>
            <button type="button" onClick={handleNextLearn} className={buttonClassName()}>
              {session.learnIndex >= activeBlock.length - 1 ? 'Перейти к проверке' : 'Следующая фраза'}
            </button>
          </div>
        </section>
      ) : null}

      {session.phase === 'checkpoint' && session.checkpointStep === 'matching' && matchingRound ? (
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Этап 2 из 4</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">Сопоставьте фразы и переводы</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Сначала выберите фразу, затем подходящий перевод. Если пара выбрана неверно, правильный ответ сразу закрепится, а фраза уйдет в блок ошибок.
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">
            Готово: {session.matching.completedPromptIds.length} из {matchingRound.prompts.length}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Фразы</p>
              {matchingRound.prompts.map((prompt) => {
                const result = session.matching.promptResults[prompt.phraseId]
                const isSelected = session.matching.selectedPromptId === prompt.phraseId
                const answerText = activeBlock.find((phrase) => phrase.id === prompt.phraseId)
                const completed = session.matching.completedPromptIds.includes(prompt.phraseId)

                return (
                  <button
                    key={prompt.phraseId}
                    type="button"
                    onClick={() => handleMatchingPromptSelect(prompt.phraseId)}
                    disabled={completed}
                    className={`w-full rounded-[24px] border p-3 text-left text-sm font-medium ${
                      completed
                        ? result === 'correct'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                          : 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                        : isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                    }`}
                  >
                    <span className="block">{prompt.text}</span>
                    {completed && answerText ? (
                      <span className="mt-2 block text-xs font-semibold">
                        {state.prefs.direction === 'ru_to_de' ? answerText.de : answerText.ru}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Ответы</p>
              {matchingRound.answers.map((answer) => {
                const used = session.matching.usedAnswerIds.includes(answer.phraseId)

                return (
                  <button
                    key={answer.phraseId}
                    type="button"
                    onClick={() => handleMatchingAnswerSelect(answer.phraseId)}
                    disabled={used || !session.matching.selectedPromptId}
                    className={`w-full rounded-[24px] border p-3 text-left text-sm font-medium ${
                      used
                        ? 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                    }`}
                  >
                    {answer.text}
                  </button>
                )
              })}
            </div>
          </div>

          {session.matching.message ? (
            <div className="mt-4 rounded-[24px] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-text-muted)]">
              {session.matching.message}
            </div>
          ) : null}

          {session.matching.completedPromptIds.length === matchingRound.prompts.length ? (
            <button type="button" onClick={startCheckpointQuestions} className={`${buttonClassName()} mt-4`}>
              Перейти к вопросам
            </button>
          ) : null}
        </section>
      ) : null}

      {session.phase === 'checkpoint' && session.checkpointStep === 'quiz' && activeCheckpointQuestion ? (
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Этап 2 из 4</p>
          <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">
            Вопрос {session.checkpointQuestionIndex + 1} из {checkpointQuestions.length}
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--color-text)]">{activeCheckpointQuestion.prompt}</p>
          <div className="mt-4 grid gap-2">
            {activeCheckpointQuestion.options.map((option) => {
              const isSelected = session.checkpointAnswer?.selected === option
              const isCorrect = activeCheckpointQuestion.correctAnswer === option
              const buttonClass = session.checkpointAnswer
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
                  onClick={() => handleCheckpointAnswer(option)}
                  disabled={Boolean(session.checkpointAnswer)}
                  className={`rounded-[24px] border p-3 text-left text-sm font-medium ${buttonClass}`}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {session.checkpointAnswer ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-3">
              <p
                className={`text-sm font-semibold ${
                  session.checkpointAnswer.correct ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {session.checkpointAnswer.correct ? 'Верно!' : 'Ошибка сохранена для быстрого повтора.'}
              </p>
              <button type="button" onClick={moveToCorrectionLoop} className={buttonClassName()}>
                {session.checkpointQuestionIndex >= checkpointQuestions.length - 1 ? 'К разбору' : 'Следующий вопрос'}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {session.phase === 'mistakes' && mistakeReviewPhrase ? (
        <section className="space-y-3">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]">
            <p className="font-semibold text-[var(--color-text)]">Этап 3 из 4: разбор ошибок</p>
            <p className="mt-1">
              Фраза {session.mistakeReviewIndex + 1} из {mistakePhrases.length}. Просмотрите проблемные фразы сразу, пока они еще свежи.
            </p>
          </div>
          {(() => {
            const progress = getPhraseProgress(state.progress, mistakeReviewPhrase.id)

            return (
              <PhraseCard
                key={mistakeReviewPhrase.id}
                phrase={mistakeReviewPhrase}
                direction={state.prefs.direction}
                transliterationEnabled={state.prefs.transliterationEnabled}
                audioAutoplay={state.prefs.audioAutoplay}
                isSaved={state.progress.savedPhraseIds.includes(mistakeReviewPhrase.id)}
                status={progress.status}
                isDifficult={progress.manualDifficult || progress.status === 'difficult'}
                isKnown={progress.manualKnown || progress.status === 'known'}
                onToggleSaved={(phraseId) => dispatch({ type: 'toggleSaved', payload: { phraseId } })}
                onRecordView={(phraseId) => dispatch({ type: 'recordPhraseView', payload: { phraseId } })}
                onToggleDifficult={(phraseId) => dispatch({ type: 'togglePhraseDifficult', payload: { phraseId } })}
                onToggleKnown={(phraseId) => dispatch({ type: 'togglePhraseKnown', payload: { phraseId } })}
              />
            )
          })()}
          <button type="button" onClick={handleNextMistakeReview} className={buttonClassName()}>
            {session.mistakeReviewIndex >= mistakePhrases.length - 1 ? 'Перепроверить ошибки' : 'Следующая сложная фраза'}
          </button>
        </section>
      ) : null}

      {session.phase === 'retry' && activeRetryQuestion ? (
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Этап 4 из 4</p>
          <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">
            Повтор {session.retryQuestionIndex + 1} из {retryQuestions.length}
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--color-text)]">{activeRetryQuestion.prompt}</p>
          <div className="mt-4 grid gap-2">
            {activeRetryQuestion.options.map((option) => {
              const isSelected = session.retryAnswer?.selected === option
              const isCorrect = activeRetryQuestion.correctAnswer === option
              const buttonClass = session.retryAnswer
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
                  onClick={() => handleRetryAnswer(option)}
                  disabled={Boolean(session.retryAnswer)}
                  className={`rounded-[24px] border p-3 text-left text-sm font-medium ${buttonClass}`}
                >
                  {option}
                </button>
              )
            })}
          </div>
          {session.retryAnswer ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-3">
              <p
                className={`text-sm font-semibold ${
                  session.retryAnswer.correct ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {session.retryAnswer.correct ? 'Стало лучше. Фраза останется в практике до уверенного запоминания.' : 'Эта фраза останется в повторении.'}
              </p>
              <button type="button" onClick={handleNextRetry} className={buttonClassName()}>
                {session.retryQuestionIndex >= retryQuestions.length - 1 ? 'К результату' : 'Дальше'}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {session.phase === 'done' ? (
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Блок завершен</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">Сессия закончилась не на просмотре, а на закреплении.</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Фраз в блоке</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">{activeBlock.length}</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Ошибок</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">{session.mistakePhraseIds.length}</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Вопросов</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                {checkpointQuestions.length + retryQuestions.length + activeBlock.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Следующий шаг</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                {hasMoreBlocks ? 'Еще 5 фраз' : 'Пауза или другой режим'}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {hasMoreBlocks ? (
              <button type="button" onClick={handleNextBlock} className={buttonClassName()}>
                Следующий блок
              </button>
            ) : (
              <Link to="/practice?source=daily" className={buttonClassName()}>
                Взять новую сессию
              </Link>
            )}
            <Link to="/" className={buttonClassName('secondary')}>
              На главную
            </Link>
          </div>
        </section>
      ) : null}
    </>
  )
}

export function PracticePage() {
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useAppState()
  const source = searchParams.get('source')
  const slug = searchParams.get('slug')
  const todayISO = getTodayISO()
  const sourceKey = `${source ?? 'all'}:${slug ?? 'all'}:${state.prefs.defaultLevel}:${todayISO}`

  const poolCandidate = useMemo(() => {
    const levelFiltered = filterPhrases(phrases, state.prefs.defaultLevel)

    if (source === 'daily') {
      return getDailyPracticePool(levelFiltered, state.progress, todayISO, 10)
    }

    if (source === 'favorites') {
      const favorites = levelFiltered.filter((phrase) => state.progress.savedPhraseIds.includes(phrase.id))
      return prioritizePhrasesForPractice(favorites, state.progress, `favorites-${todayISO}`)
    }

    if (source === 'situation' && slug) {
      const situation = situationBySlug.get(slug)
      if (!situation) {
        return []
      }

      return prioritizePhrasesForPractice(
        filterPhrases(phrasesBySituation[situation.id] ?? [], state.prefs.defaultLevel),
        state.progress,
        `situation-${slug}-${todayISO}`,
      )
    }

    return prioritizePhrasesForPractice(levelFiltered, state.progress, `all-${todayISO}`)
  }, [slug, source, state.prefs.defaultLevel, state.progress, todayISO])

  const sourceLabel =
    source === 'daily'
      ? 'Сегодняшняя подборка'
      : source === 'favorites'
        ? 'Избранные фразы'
        : source === 'situation' && slug
          ? `Только тема «${situationBySlug.get(slug)?.titleRu ?? 'Ситуация'}»`
          : 'Вся практика'

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Практика"
          subtitle={`${sourceLabel}. Один блок строится по циклу: изучить 5 фраз -> проверить себя -> разобрать ошибки.`}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
          <LevelFilter value={state.prefs.defaultLevel} onChange={(level) => dispatch({ type: 'setDefaultLevel', payload: level })} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/practice?source=favorites" className={buttonClassName('secondary')}>
            По избранному
          </Link>
          <Link to="/practice?source=daily" className={buttonClassName('secondary')}>
            На сегодня
          </Link>
          <Link to="/practice" className={buttonClassName('ghost')}>
            Сбросить фильтр
          </Link>
        </div>
      </section>

      <PracticeSessionContent key={sourceKey} initialPool={poolCandidate} sourceKey={sourceKey} />

      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]">
        <p>Всего ответов: {state.progress.quizStats.totalAnswered}</p>
        <p>Правильных: {state.progress.quizStats.correct}</p>
        <p>Текущая серия: {state.progress.quizStats.streak}</p>
      </section>
    </div>
  )
}
