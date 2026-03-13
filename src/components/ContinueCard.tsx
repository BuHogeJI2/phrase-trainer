import { Link } from 'react-router-dom'
import type { Situation } from '../types'
import { buttonClassName } from './ui/Button'

interface ContinueCardProps {
  situation: Situation | null
  lastVisitedAt: string | null
  progressLabel: string
}

export function ContinueCard({ situation, lastVisitedAt, progressLabel }: ContinueCardProps) {
  if (!situation) {
    return null
  }

  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Продолжить</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
        {situation.icon} {situation.titleRu}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{situation.descriptionRu}</p>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        Прогресс: <span className="font-semibold text-[var(--color-text)]">{progressLabel}</span>
      </p>
      {lastVisitedAt ? (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Последний визит: {new Date(lastVisitedAt).toLocaleString('ru-RU')}</p>
      ) : null}
      <Link
        to={`/situation/${situation.slug}`}
        className={`${buttonClassName('secondary')} mt-4`}
      >
        Продолжить
      </Link>
    </section>
  )
}
