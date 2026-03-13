import type { Badge } from '../types'

interface BadgeStripProps {
  badges: Badge[]
}

export function BadgeStrip({ badges }: BadgeStripProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[var(--color-text)]">Небольшие победы</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`rounded-2xl border p-3 ${
              badge.achieved
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            }`}
          >
            <p className="text-sm font-semibold text-[var(--color-text)]">{badge.title}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{badge.description}</p>
            <p
              className={`mt-2 text-xs font-semibold ${
                badge.achieved ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {badge.achieved ? 'Получено' : 'В процессе'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
