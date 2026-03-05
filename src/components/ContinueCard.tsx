import { Link } from 'react-router-dom'
import type { Situation } from '../types'

interface ContinueCardProps {
  situation: Situation | null
  lastVisitedAt: string | null
}

export function ContinueCard({ situation, lastVisitedAt }: ContinueCardProps) {
  if (!situation) {
    return null
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <h2 className="text-base font-semibold text-indigo-900">Продолжить с последней сессии</h2>
      <p className="mt-1 text-sm text-indigo-900/80">
        {situation.icon} {situation.titleRu}
      </p>
      {lastVisitedAt ? (
        <p className="mt-1 text-xs text-indigo-700">Последний визит: {new Date(lastVisitedAt).toLocaleString('ru-RU')}</p>
      ) : null}
      <Link
        to={`/situation/${situation.slug}`}
        className="mt-3 inline-flex rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Продолжить
      </Link>
    </section>
  )
}
