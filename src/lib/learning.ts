import type { Badge, Direction, Level, Phrase, ProgressState } from '../types'

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

export function getDailyPhrases(phrases: Phrase[], dateISO: string, amount = 10): Phrase[] {
  const random = mulberry32(hashSeed(dateISO))
  const pool = [...phrases]

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, amount)
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

export function computeBadges(progress: ProgressState): Badge[] {
  const learned = progress.completedPhraseIds.length
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
