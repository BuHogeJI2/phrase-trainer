import { describe, expect, it } from 'vitest'
import { buildQuizQuestion, createSeededRandom, filterPhrases, getPromptAndAnswer } from './learning'
import type { Phrase } from '../types'

const samplePhrases: Phrase[] = [
  {
    id: 'one',
    situationId: 'shop',
    level: 'A1',
    de: 'Guten Tag',
    ru: 'Добрый день',
    translitRu: 'гутен таг',
    audioDeSrc: '/audio/one.mp3',
  },
  {
    id: 'two',
    situationId: 'shop',
    level: 'A2',
    de: 'Wie viel kostet das?',
    ru: 'Сколько это стоит?',
    translitRu: 'ви филь костет дас',
    audioDeSrc: '/audio/two.mp3',
  },
  {
    id: 'three',
    situationId: 'transport',
    level: 'A1',
    de: 'Wo ist der Bus?',
    ru: 'Где автобус?',
    translitRu: 'во ист дер бус',
    audioDeSrc: '/audio/three.mp3',
  },
  {
    id: 'four',
    situationId: 'transport',
    level: 'A2',
    de: 'Der Zug hat Verspätung.',
    ru: 'Поезд задерживается',
    translitRu: 'дер цуг хат фершпетунг',
    audioDeSrc: '/audio/four.mp3',
  },
]

describe('getPromptAndAnswer', () => {
  it('returns RU prompt and DE answer for ru_to_de', () => {
    const output = getPromptAndAnswer(samplePhrases[0], 'ru_to_de')
    expect(output.prompt).toBe('Добрый день')
    expect(output.answer).toBe('Guten Tag')
  })

  it('returns DE prompt and RU answer for de_to_ru', () => {
    const output = getPromptAndAnswer(samplePhrases[0], 'de_to_ru')
    expect(output.prompt).toBe('Guten Tag')
    expect(output.answer).toBe('Добрый день')
  })
})

describe('filterPhrases', () => {
  it('filters by level and situation together', () => {
    const filtered = filterPhrases(samplePhrases, 'A1', 'transport')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('three')
  })
})

describe('buildQuizQuestion', () => {
  it('contains correct answer in options', () => {
    const random = createSeededRandom('2026-03-05')
    const question = buildQuizQuestion(samplePhrases, samplePhrases[0], 'ru_to_de', random)

    expect(question.correctAnswer).toBe('Guten Tag')
    expect(question.options).toContain('Guten Tag')
    expect(question.options).toHaveLength(4)
  })
})
