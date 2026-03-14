import type {
  Badge,
  Direction,
  Level,
  Phrase,
  PhraseLearningState,
  PhraseProgress,
  ProgressState,
} from '../types'

function hashSeed(input: string): number {
  return input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function mulberry32(seed: number): () => number {
  let value = seed
  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getPromptAndAnswer(phrase: Phrase, direction: Direction): { prompt: string; answer: string } {
  if (direction === 'ru_to_de') {
    return { prompt: phrase.ru, answer: phrase.de }
  }

  return { prompt: phrase.de, answer: phrase.ru }
}

export function filterPhrases(phrases: Phrase[], level: Level | 'all', situationId?: string): Phrase[] {
  return phrases.filter((phrase) => {
    const levelMatches = level === 'all' ? true : phrase.level === level
    const situationMatches = situationId ? phrase.situationId === situationId : true
    return levelMatches && situationMatches
  })
}

export function createDefaultPhraseProgress(
  overrides: Partial<PhraseProgress> = {},
): PhraseProgress {
  return {
    status: 'new',
    viewCount: 0,
    lastViewedAt: null,
    correctCount: 0,
    incorrectCount: 0,
    lastResult: null,
    manualDifficult: false,
    manualKnown: false,
    lastPracticedAt: null,
    ...overrides,
  }
}

export function derivePhraseStatus(progress: PhraseProgress): PhraseLearningState {
  if (progress.manualKnown) {
    return 'known'
  }

  if (progress.manualDifficult || progress.lastResult === 'incorrect' || progress.incorrectCount > progress.correctCount) {
    return 'difficult'
  }

  if (progress.correctCount >= 3 && progress.incorrectCount === 0) {
    return 'known'
  }

  if (progress.viewCount > 0 || progress.correctCount > 0 || progress.incorrectCount > 0) {
    return 'studying'
  }

  return 'new'
}

export function normalizePhraseProgress(progress?: Partial<PhraseProgress> | null): PhraseProgress {
  const normalized = createDefaultPhraseProgress(progress ?? {})
  return {
    ...normalized,
    status: derivePhraseStatus(normalized),
  }
}

export function getPhraseProgress(state: ProgressState, phraseId: string): PhraseProgress {
  return normalizePhraseProgress(state.phraseProgress[phraseId])
}

export function getPhraseStatus(state: ProgressState, phraseId: string): PhraseLearningState {
  return getPhraseProgress(state, phraseId).status
}

export function getKnownPhraseCount(state: ProgressState, phraseIds: string[]): number {
  return phraseIds.filter((phraseId) => getPhraseStatus(state, phraseId) === 'known').length
}

export function getDifficultPhraseCount(state: ProgressState, phraseIds: string[]): number {
  return phraseIds.filter((phraseId) => getPhraseStatus(state, phraseId) === 'difficult').length
}

export function getStudyingPhraseCount(state: ProgressState, phraseIds: string[]): number {
  return phraseIds.filter((phraseId) => getPhraseStatus(state, phraseId) === 'studying').length
}

function getPracticePriority(progress: PhraseProgress): number {
  if (progress.manualDifficult || progress.lastResult === 'incorrect') {
    return 0
  }

  switch (progress.status) {
    case 'difficult':
      return 1
    case 'studying':
      return 2
    case 'new':
      return 3
    case 'known':
    default:
      return 4
  }
}

function getPracticeFreshness(progress: PhraseProgress): number {
  const lastPracticed = progress.lastPracticedAt ? Date.parse(progress.lastPracticedAt) : 0
  return Number.isNaN(lastPracticed) ? 0 : lastPracticed
}

export function prioritizePhrasesForPractice(phrases: Phrase[], progressState: ProgressState, seed = 'practice'): Phrase[] {
  const random = mulberry32(hashSeed(seed))

  return [...phrases].sort((left, right) => {
    const leftProgress = getPhraseProgress(progressState, left.id)
    const rightProgress = getPhraseProgress(progressState, right.id)
    const bucketDiff = getPracticePriority(leftProgress) - getPracticePriority(rightProgress)

    if (bucketDiff !== 0) {
      return bucketDiff
    }

    const freshnessDiff = getPracticeFreshness(leftProgress) - getPracticeFreshness(rightProgress)
    if (freshnessDiff !== 0) {
      return freshnessDiff
    }

    return random() - 0.5
  })
}

export function getDailyPracticePool(
  phrases: Phrase[],
  progressState: ProgressState,
  dateISO: string,
  amount = 10,
): Phrase[] {
  return prioritizePhrasesForPractice(phrases, progressState, `daily-${dateISO}`).slice(0, amount)
}

export interface QuizQuestion {
  phraseId: string
  prompt: string
  options: string[]
  correctAnswer: string
}

export function buildQuizQuestion(
  phrasesPool: Phrase[],
  phrase: Phrase,
  direction: Direction,
  random: () => number,
): QuizQuestion {
  const { prompt, answer } = getPromptAndAnswer(phrase, direction)
  const wrongCandidates = phrasesPool
    .filter((item) => item.id !== phrase.id)
    .map((item) => getPromptAndAnswer(item, direction).answer)
    .filter((item, index, array) => array.indexOf(item) === index)

  const wrongAnswers = [...wrongCandidates]
    .sort(() => random() - 0.5)
    .slice(0, 3)

  const options = [answer, ...wrongAnswers].sort(() => random() - 0.5)

  return {
    phraseId: phrase.id,
    prompt,
    options,
    correctAnswer: answer,
  }
}

export interface MatchingItem {
  phraseId: string
  text: string
}

export interface MatchingRound {
  prompts: MatchingItem[]
  answers: MatchingItem[]
}

export function buildMatchingRound(
  phrasesPool: Phrase[],
  direction: Direction,
  random: () => number,
): MatchingRound {
  const prompts = phrasesPool.map((phrase) => {
    const { prompt, answer } = getPromptAndAnswer(phrase, direction)

    return {
      phraseId: phrase.id,
      prompt,
      answer,
    }
  })

  const answers = [...prompts]
    .sort(() => random() - 0.5)
    .map(({ phraseId, answer }) => ({ phraseId, text: answer }))

  return {
    prompts: prompts.map(({ phraseId, prompt }) => ({ phraseId, text: prompt })),
    answers,
  }
}

export function computeBadges(progress: ProgressState): Badge[] {
  const learned = Object.values(progress.phraseProgress).filter((item) => normalizePhraseProgress(item).status === 'known').length
  const quizCount = progress.quizStats.totalAnswered
  const streak = progress.quizStats.streak

  return [
    {
      id: 'first-steps',
      title: 'Первые шаги',
      description: 'Выучить 20 фраз',
      achieved: learned >= 20,
    },
    {
      id: 'half-way',
      title: 'Половина пути',
      description: 'Выучить 100 фраз',
      achieved: learned >= 100,
    },
    {
      id: 'routine-master',
      title: 'Рутина под контролем',
      description: 'Выучить 200 фраз',
      achieved: learned >= 200,
    },
    {
      id: 'quiz-starter',
      title: 'Старт в практике',
      description: 'Ответить на 30 вопросов',
      achieved: quizCount >= 30,
    },
    {
      id: 'steady-learner',
      title: 'Стабильный ритм',
      description: 'Серия 7 правильных ответов',
      achieved: streak >= 7,
    },
  ]
}

export function createSeededRandom(dateISO: string): () => number {
  return mulberry32(hashSeed(dateISO))
}
