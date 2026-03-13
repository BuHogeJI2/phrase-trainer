import { Link } from 'react-router-dom'
import type { Situation } from '../types'
import { LevelBadge } from './ui/LevelBadge'

interface SituationCardProps {
  situation: Situation
  to: string
  progressLabel: string
  level: 'A1' | 'A2' | 'all'
  variant?: 'default' | 'urgent'
}

export function SituationCard({ situation, to, progressLabel, level, variant = 'default' }: SituationCardProps) {
  const urgent = variant === 'urgent'

  return (
    <Link
      to={to}
      className={`block rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-150 hover:-translate-y-0.5 ${
        urgent ? 'p-4 shadow-[var(--shadow-soft)]' : 'p-5 shadow-[var(--shadow-soft)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-2xl">
            <span aria-hidden="true">{situation.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--color-text)]">{situation.titleRu}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{situation.descriptionRu}</p>
          </div>
        </div>
        <div className="shrink-0">
          <LevelBadge level={level} compact />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3 text-sm">
        <p className="text-[var(--color-text-muted)]">{urgent ? 'Быстрый вход' : 'Прогресс'}</p>
        <p className="font-semibold text-[var(--color-text)]">{progressLabel}</p>
      </div>
    </Link>
  )
}
