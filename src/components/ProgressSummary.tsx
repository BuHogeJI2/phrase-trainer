interface ProgressSummaryProps {
  completed: number
  total: number
  quizTotal: number
  quizAccuracy: number
  streak: number
}

export function ProgressSummary({ completed, total, quizTotal, quizAccuracy, streak }: ProgressSummaryProps) {
  const progressPercent = Math.round((completed / total) * 100)

  return (
    <section className="rounded-2xl bg-slate-900 p-4 text-white shadow-sm">
      <h2 className="text-lg font-semibold">Ваш прогресс</h2>
      <p className="mt-1 text-sm text-slate-300">Изучено фраз: {completed} из {total} ({progressPercent}%)</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="text-xs text-slate-300">Вопросов</p>
          <p className="mt-1 text-base font-semibold">{quizTotal}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="text-xs text-slate-300">Точность</p>
          <p className="mt-1 text-base font-semibold">{quizAccuracy}%</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="text-xs text-slate-300">Серия</p>
          <p className="mt-1 text-base font-semibold">{streak}</p>
        </div>
      </div>
    </section>
  )
}
