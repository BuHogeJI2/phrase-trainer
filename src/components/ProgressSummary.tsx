interface ProgressSummaryProps {
  completed: number
  total: number
  quizTotal: number
  quizAccuracy: number
  streak: number
}

export function ProgressSummary({ completed, total, quizTotal, quizAccuracy, streak }: ProgressSummaryProps) {
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Ваш ритм</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Изучено фраз: {completed} из {total} ({progressPercent}%)
          </p>
        </div>
        <div className="h-11 w-11 rounded-full bg-[var(--color-accent-soft)] text-center text-xs font-semibold leading-[44px] text-[var(--color-accent-strong)]">
          {progressPercent}%
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
          <p className="text-xs text-[var(--color-text-muted)]">Вопросов</p>
          <p className="mt-1 text-base font-semibold text-[var(--color-text)]">{quizTotal}</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
          <p className="text-xs text-[var(--color-text-muted)]">Точность</p>
          <p className="mt-1 text-base font-semibold text-[var(--color-text)]">{quizAccuracy}%</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
          <p className="text-xs text-[var(--color-text-muted)]">Серия</p>
          <p className="mt-1 text-base font-semibold text-[var(--color-text)]">{streak}</p>
        </div>
      </div>
    </section>
  )
}
