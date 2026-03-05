import { Link } from 'react-router-dom'
import { BadgeStrip } from '../components/BadgeStrip'
import { ContinueCard } from '../components/ContinueCard'
import { ProgressSummary } from '../components/ProgressSummary'
import { phrases, phrasesBySituation } from '../data/phrases'
import { situationById, situations } from '../data/situations'
import { computeBadges, filterPhrases } from '../lib/learning'
import { useAppState } from '../state/AppContext'

export function HomePage() {
  const { state } = useAppState()

  const level = state.prefs.defaultLevel
  const visiblePhrases = filterPhrases(phrases, level)
  const completedInVisible = visiblePhrases.filter((item) => state.progress.completedPhraseIds.includes(item.id)).length
  const quizTotal = state.progress.quizStats.totalAnswered
  const quizAccuracy = quizTotal === 0 ? 0 : Math.round((state.progress.quizStats.correct / quizTotal) * 100)
  const lastSituation = state.progress.lastVisitedSituationId
    ? situationById.get(state.progress.lastVisitedSituationId) ?? null
    : null

  return (
    <div className="space-y-4">
      <ProgressSummary
        completed={completedInVisible}
        total={visiblePhrases.length}
        quizTotal={quizTotal}
        quizAccuracy={quizAccuracy}
        streak={state.progress.quizStats.streak}
      />

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <h2 className="text-base font-semibold text-sky-900">Сегодняшние 10 фраз</h2>
        <p className="mt-1 text-sm text-sky-800/80">Короткая сессия, чтобы поддерживать ежедневный ритм.</p>
        <Link to="/practice?source=daily" className="mt-3 inline-flex rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white">
          Начать daily-сессию
        </Link>
      </section>

      <ContinueCard situation={lastSituation} lastVisitedAt={state.progress.lastVisitedAt} />

      <BadgeStrip badges={computeBadges(state.progress)} />

      <section>
        <h2 className="text-base font-semibold text-slate-900">Ситуации для практики</h2>
        <div className="mt-3 grid gap-2">
          {situations.map((situation) => {
            const total = filterPhrases(phrasesBySituation[situation.id] ?? [], level).length
            const done = filterPhrases(phrasesBySituation[situation.id] ?? [], level).filter((item) =>
              state.progress.completedPhraseIds.includes(item.id),
            ).length

            return (
              <Link
                key={situation.id}
                to={`/situation/${situation.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">
                    {situation.icon} {situation.titleRu}
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {done}/{total}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Фразы уровня {level === 'all' ? 'A1 и A2' : level}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
