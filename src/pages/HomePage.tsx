import { Link } from 'react-router-dom'
import { BadgeStrip } from '../components/BadgeStrip'
import { ContinueCard } from '../components/ContinueCard'
import { DailyPracticeCard } from '../components/DailyPracticeCard'
import { ProgressSummary } from '../components/ProgressSummary'
import { SituationCard } from '../components/SituationCard'
import { LevelBadge } from '../components/ui/LevelBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { buttonClassName } from '../components/ui/Button'
import { phrases, phrasesBySituation } from '../data/phrases'
import { situationById, situations } from '../data/situations'
import { computeBadges, filterPhrases, getDailyPhrases } from '../lib/learning'
import { useAppState } from '../state/AppContext'

const urgentSituationIds = ['doctor', 'pharmacy', 'transport', 'housing', 'documents']

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function HomePage() {
  const { state } = useAppState()
  const level = state.prefs.defaultLevel
  const visiblePhrases = filterPhrases(phrases, level)
  const dailyPhrases = getDailyPhrases(visiblePhrases, getTodayISO(), 10)
  const completedDaily = dailyPhrases.filter((item) => state.progress.completedPhraseIds.includes(item.id))
  const completedInVisible = visiblePhrases.filter((item) => state.progress.completedPhraseIds.includes(item.id)).length
  const quizTotal = state.progress.quizStats.totalAnswered
  const quizAccuracy = quizTotal === 0 ? 0 : Math.round((state.progress.quizStats.correct / quizTotal) * 100)
  const lastSituation = state.progress.lastVisitedSituationId
    ? situationById.get(state.progress.lastVisitedSituationId) ?? null
    : null
  const urgentSituations = situations.filter((situation) => urgentSituationIds.includes(situation.id))

  const continueProgressLabel = lastSituation
    ? (() => {
        const visibleInSituation = filterPhrases(phrasesBySituation[lastSituation.id] ?? [], level)
        const done = visibleInSituation.filter((item) => state.progress.completedPhraseIds.includes(item.id)).length
        return `${done}/${visibleInSituation.length}`
      })()
    : ''

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Главная</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--color-text)]">Практичный немецкий для жизни в Германии</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
              Спокойно тренируйте полезные фразы для бытовых ситуаций, общения и первых шагов в новой среде.
            </p>
          </div>
          <LevelBadge level={level} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link to="/practice" className={buttonClassName('secondary')}>
            Открыть всю практику
          </Link>
          <Link to="/saved" className={buttonClassName('ghost')}>
            Избранные фразы
          </Link>
        </div>
      </section>

      <DailyPracticeCard
        newCount={dailyPhrases.length - completedDaily.length}
        reviewCount={completedDaily.length}
        totalCount={dailyPhrases.length}
      />

      <ContinueCard situation={lastSituation} lastVisitedAt={state.progress.lastVisitedAt} progressLabel={continueProgressLabel} />

      <section>
        <SectionHeader
          title="Срочные ситуации"
          subtitle="Быстрый доступ к темам, которые чаще всего нужны в первые недели."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {urgentSituations.map((situation) => {
            const visibleInSituation = filterPhrases(phrasesBySituation[situation.id] ?? [], level)
            const done = visibleInSituation.filter((item) => state.progress.completedPhraseIds.includes(item.id)).length

            return (
              <SituationCard
                key={situation.id}
                situation={situation}
                to={`/situation/${situation.slug}`}
                progressLabel={`${done}/${visibleInSituation.length}`}
                level={level}
                variant="urgent"
              />
            )
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Все ситуации"
          subtitle="Выбирайте тему по текущей задаче и тренируйте короткие фразы в привычном темпе."
        />
        <div className="mt-4 grid gap-3">
          {situations.map((situation) => {
            const visibleInSituation = filterPhrases(phrasesBySituation[situation.id] ?? [], level)
            const done = visibleInSituation.filter((item) => state.progress.completedPhraseIds.includes(item.id)).length

            return (
              <SituationCard
                key={situation.id}
                situation={situation}
                to={`/situation/${situation.slug}`}
                progressLabel={`${done}/${visibleInSituation.length}`}
                level={level}
              />
            )
          })}
        </div>
      </section>

      <ProgressSummary
        completed={completedInVisible}
        total={visiblePhrases.length}
        quizTotal={quizTotal}
        quizAccuracy={quizAccuracy}
        streak={state.progress.quizStats.streak}
      />

      <BadgeStrip badges={computeBadges(state.progress)} />
    </div>
  )
}
