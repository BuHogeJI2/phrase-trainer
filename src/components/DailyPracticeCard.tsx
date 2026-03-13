import { Link } from 'react-router-dom'
import { buttonClassName } from './ui/Button'

interface DailyPracticeCardProps {
  newCount: number
  reviewCount: number
  totalCount: number
}

export function DailyPracticeCard({ newCount, reviewCount, totalCount }: DailyPracticeCardProps) {
  const actionLabel = reviewCount > 0 ? 'Продолжить' : 'Начать'

  return (
    <section className="rounded-[32px] border border-[var(--color-border-strong)] bg-[var(--color-accent)] p-6 text-white shadow-[var(--shadow-strong)]">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/75">Практика на сегодня</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight">Короткая сессия, чтобы не терять ритм и быстрее привыкать к живым фразам.</h2>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/12 p-3">
          <p className="text-xs text-white/70">Новых</p>
          <p className="mt-1 text-xl font-semibold">{newCount}</p>
        </div>
        <div className="rounded-2xl bg-white/12 p-3">
          <p className="text-xs text-white/70">На повторение</p>
          <p className="mt-1 text-xl font-semibold">{reviewCount}</p>
        </div>
        <div className="rounded-2xl bg-white/12 p-3">
          <p className="text-xs text-white/70">Время</p>
          <p className="mt-1 text-xl font-semibold">~5 мин</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/80">Сегодня в подборке {totalCount} фраз. Сессия подстраивается под ваш текущий фильтр уровня.</p>

      <Link
        to="/practice?source=daily"
        className={`${buttonClassName('secondary', true)} mt-5 bg-white text-[var(--color-accent-strong)] hover:bg-white/90`}
      >
        {actionLabel}
      </Link>
    </section>
  )
}
