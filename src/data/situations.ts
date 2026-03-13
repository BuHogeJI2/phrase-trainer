import type { Situation } from '../types'

export const situations: Situation[] = [
  {
    id: 'transport',
    slug: 'transport',
    titleRu: 'Транспорт',
    descriptionRu: 'Как спросить дорогу, остановку или билет.',
    icon: '🚌',
    order: 1,
  },
  {
    id: 'shop',
    slug: 'shop',
    titleRu: 'Магазин',
    descriptionRu: 'Покупки, цены и короткие вопросы на кассе.',
    icon: '🛒',
    order: 2,
  },
  {
    id: 'cafe',
    slug: 'cafe',
    titleRu: 'Кафе',
    descriptionRu: 'Заказ, просьбы и спокойное общение за столом.',
    icon: '☕',
    order: 3,
  },
  {
    id: 'doctor',
    slug: 'doctor',
    titleRu: 'Врач',
    descriptionRu: 'Запись, симптомы и простые вопросы.',
    icon: '🩺',
    order: 4,
  },
  {
    id: 'pharmacy',
    slug: 'pharmacy',
    titleRu: 'Аптека',
    descriptionRu: 'Как попросить лекарство и объяснить, что болит.',
    icon: '💊',
    order: 5,
  },
  {
    id: 'housing',
    slug: 'housing',
    titleRu: 'Жилье',
    descriptionRu: 'Аренда, проблемы дома и бытовые вопросы.',
    icon: '🏠',
    order: 6,
  },
  {
    id: 'work',
    slug: 'work',
    titleRu: 'Работа',
    descriptionRu: 'Короткие рабочие вопросы и повседневное общение.',
    icon: '💼',
    order: 7,
  },
  {
    id: 'documents',
    slug: 'documents',
    titleRu: 'Документы',
    descriptionRu: 'Ведомства, анкеты и базовые запросы.',
    icon: '📄',
    order: 8,
  },
  {
    id: 'school',
    slug: 'school',
    titleRu: 'Школа и дети',
    descriptionRu: 'Школьные вопросы, сообщения и общение с учителем.',
    icon: '🎒',
    order: 9,
  },
  {
    id: 'smalltalk',
    slug: 'smalltalk',
    titleRu: 'Повседневный разговор',
    descriptionRu: 'Знакомство, вежливые фразы и короткий разговор.',
    icon: '💬',
    order: 10,
  },
].sort((a, b) => a.order - b.order)

export const situationBySlug = new Map(situations.map((s) => [s.slug, s]))
export const situationById = new Map(situations.map((s) => [s.id, s]))
