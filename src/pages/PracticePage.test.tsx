import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PracticePage } from './PracticePage'
import { AppProvider } from '../state/AppContext'
import { defaultState, saveStateToStorage } from '../lib/storage'
import { phrases, phrasesBySituation } from '../data/phrases'
import {
  buildMatchingRound,
  buildQuizQuestion,
  createSeededRandom,
  filterPhrases,
  getDailyPracticePool,
  prioritizePhrasesForPractice,
} from '../lib/learning'

function renderPractice(initialEntry: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/practice" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  )
}

describe('PracticePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-14T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs the daily session through learn, checkpoint, mistakes, retry, and done', async () => {
    saveStateToStorage({
      ...defaultState,
      prefs: {
        ...defaultState.prefs,
        onboardingCompleted: true,
      },
    })

    renderPractice('/practice?source=daily')

    const sourceKey = 'daily:all:all:2026-03-14'
    const dailyPool = getDailyPracticePool(filterPhrases(phrases, 'all'), defaultState.progress, '2026-03-14', 10)
    const block = dailyPool.slice(0, 5)
    const matchingRound = buildMatchingRound(block, 'ru_to_de', createSeededRandom(`${sourceKey}-0-matching`))
    const checkpointQuestions = block.map((phrase, index) =>
      buildQuizQuestion(dailyPool, phrase, 'ru_to_de', createSeededRandom(`${sourceKey}-0-quiz-${index}`)),
    )
    const mistakePhraseIds = [matchingRound.prompts[0].phraseId]
    if (!mistakePhraseIds.includes(checkpointQuestions[0].phraseId)) {
      mistakePhraseIds.push(checkpointQuestions[0].phraseId)
    }
    const retryQuestions = mistakePhraseIds.map((phraseId, index) =>
      buildQuizQuestion(
        dailyPool,
        block.find((phrase) => phrase.id === phraseId) ?? dailyPool.find((phrase) => phrase.id === phraseId)!,
        'ru_to_de',
        createSeededRandom(`${sourceKey}-0-retry-${index}`),
      ),
    )

    expect(screen.getByText('Этап 1 из 4: изучение блока')).toBeInTheDocument()

    for (let index = 0; index < block.length - 1; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Следующая фраза' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Перейти к проверке' }))

    expect(screen.getByText('Сопоставьте фразы и переводы')).toBeInTheDocument()

    const wrongPrompt = matchingRound.prompts[0]
    const wrongAnswer = matchingRound.answers.find((answer) => answer.phraseId !== wrongPrompt.phraseId)!
    fireEvent.click(screen.getByRole('button', { name: wrongPrompt.text }))
    fireEvent.click(screen.getByRole('button', { name: wrongAnswer.text }))

    for (const prompt of matchingRound.prompts.slice(1)) {
      const correctAnswer = matchingRound.answers.find((answer) => answer.phraseId === prompt.phraseId)!
      fireEvent.click(screen.getByRole('button', { name: prompt.text }))
      fireEvent.click(screen.getByRole('button', { name: correctAnswer.text }))
    }

    fireEvent.click(screen.getByRole('button', { name: 'Перейти к вопросам' }))

    const firstWrongOption = checkpointQuestions[0].options.find((option) => option !== checkpointQuestions[0].correctAnswer)!
    fireEvent.click(screen.getByRole('button', { name: firstWrongOption }))
    fireEvent.click(screen.getByRole('button', { name: 'Следующий вопрос' }))

    for (const [index, question] of checkpointQuestions.slice(1).entries()) {
      fireEvent.click(screen.getByRole('button', { name: question.correctAnswer }))
      fireEvent.click(screen.getByRole('button', { name: index === checkpointQuestions.length - 2 ? 'К разбору' : 'Следующий вопрос' }))
    }

    expect(screen.getByText('Этап 3 из 4: разбор ошибок')).toBeInTheDocument()

    for (let index = 0; index < mistakePhraseIds.length; index += 1) {
      fireEvent.click(
        screen.getByRole('button', {
          name: index === mistakePhraseIds.length - 1 ? 'Перепроверить ошибки' : 'Следующая сложная фраза',
        }),
      )
    }

    expect(screen.getByText('Этап 4 из 4')).toBeInTheDocument()

    for (const [index, question] of retryQuestions.entries()) {
      fireEvent.click(screen.getByRole('button', { name: question.correctAnswer }))
      fireEvent.click(screen.getByRole('button', { name: index === retryQuestions.length - 1 ? 'К результату' : 'Дальше' }))
    }

    expect(screen.getByText('Блок завершен')).toBeInTheDocument()
  }, 15000)

  it('keeps situation practice scoped to the chosen situation', () => {
    saveStateToStorage({
      ...defaultState,
      prefs: {
        ...defaultState.prefs,
        onboardingCompleted: true,
      },
    })

    renderPractice('/practice?source=situation&slug=transport')

    const expected = prioritizePhrasesForPractice(phrasesBySituation.transport, defaultState.progress, 'situation-transport-2026-03-14')

    expect(screen.getByText(expected[0].ru)).toBeInTheDocument()
    expect(screen.getByText(/Только тема «Транспорт»/)).toBeInTheDocument()
  })

  it('uses saved phrases for favorites practice', () => {
    saveStateToStorage({
      ...defaultState,
      prefs: {
        ...defaultState.prefs,
        onboardingCompleted: true,
      },
      progress: {
        ...defaultState.progress,
        savedPhraseIds: ['shop-01'],
      },
    })

    renderPractice('/practice?source=favorites')

    expect(screen.getByText(/Избранные фразы/)).toBeInTheDocument()
    expect(screen.getByText('Где я могу найти хлеб?')).toBeInTheDocument()
  })
})
