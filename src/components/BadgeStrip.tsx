import type { Badge } from '../types'

interface BadgeStripProps {
  badges: Badge[]
}

export function BadgeStrip({ badges }: BadgeStripProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900">Достижения</h2>
      <div className="mt-3 grid gap-2">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`rounded-xl border p-3 ${
              badge.achieved ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{badge.title}</p>
            <p className="text-xs text-slate-600">{badge.description}</p>
            <p className={`mt-2 text-xs font-semibold ${badge.achieved ? 'text-emerald-700' : 'text-slate-500'}`}>
              {badge.achieved ? 'Получено' : 'В процессе'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
