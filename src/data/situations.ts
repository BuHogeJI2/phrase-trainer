import type { Situation } from '../types'

export const situations: Situation[] = [
  { id: 'transport', slug: 'transport', titleRu: 'Транспорт', icon: '🚌', order: 1 },
  { id: 'shop', slug: 'shop', titleRu: 'Магазин', icon: '🛒', order: 2 },
  { id: 'cafe', slug: 'cafe', titleRu: 'Кафе', icon: '☕', order: 3 },
  { id: 'doctor', slug: 'doctor', titleRu: 'Врач', icon: '🩺', order: 4 },
  { id: 'pharmacy', slug: 'pharmacy', titleRu: 'Аптека', icon: '💊', order: 5 },
  { id: 'housing', slug: 'housing', titleRu: 'Жилье', icon: '🏠', order: 6 },
  { id: 'work', slug: 'work', titleRu: 'Работа', icon: '💼', order: 7 },
  { id: 'documents', slug: 'documents', titleRu: 'Документы', icon: '📄', order: 8 },
  { id: 'school', slug: 'school', titleRu: 'Школа и дети', icon: '🎒', order: 9 },
  { id: 'smalltalk', slug: 'smalltalk', titleRu: 'Повседневный разговор', icon: '💬', order: 10 },
].sort((a, b) => a.order - b.order)

export const situationBySlug = new Map(situations.map((s) => [s.slug, s]))
export const situationById = new Map(situations.map((s) => [s.id, s]))
