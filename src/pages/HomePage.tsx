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
import {
  computeBadges,
  filterPhrases,
  getDailyPracticePool,
  getDifficultPhraseCount,
  getKnownPhraseCount,
  getPhraseStatus,
  getStudyingPhraseCount,
} from '../lib/learning'
import { useAppState } from '../state/AppContext'

const urgentSituationIds = ['doctor', 'pharmacy', 'transport', 'housing', 'documents']

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function HomePage() {
  const { state } = useAppState()
  const level = state.prefs.defaultLevel
  const visiblePhrases = filterPhrases(phrases, level)
  const visiblePhraseIds = visiblePhrases.map((phrase) => phrase.id)
  const dailyPhrases = getDailyPracticePool(visiblePhrases, state.progress, getTodayISO(), 10)
  const dailyNewCount = dailyPhrases.filter((item) => getPhraseStatus(state.progress, item.id) === 'new').length
  const dailyReviewCount = dailyPhrases.length - dailyNewCount
  const knownInVisible = getKnownPhraseCount(state.progress, visiblePhraseIds)
  const studyingInVisible = getStudyingPhraseCount(state.progress, visiblePhraseIds)
  const difficultInVisible = getDifficultPhraseCount(state.progress, visiblePhraseIds)
  const quizTotal = state.progress.quizStats.totalAnswered
  const quizAccuracy = quizTotal === 0 ? 0 : Math.round((state.progress.quizStats.correct / quizTotal) * 100)
  const lastSituation = state.progress.lastVisitedSituationId
    ? situationById.get(state.progress.lastVisitedSituationId) ?? null
    : null
  const urgentSituations = situations.filter((situation) => urgentSituationIds.includes(situation.id))

  const continueProgressLabel = lastSituation
    ? (() => {
        const visibleInSituation = filterPhrases(phrasesBySituation[lastSituation.id] ?? [], level)
        return `${getKnownPhraseCount(state.progress, visibleInSituation.map((item) => item.id))}/${visibleInSituation.length}`
      })()
    : ''
  const continueDetailLabel = lastSituation
    ? (() => {
        const visibleInSituation = filterPhrases(phrasesBySituation[lastSituation.id] ?? [], level)
        const phraseIds = visibleInSituation.map((item) => item.id)
        const studying = getStudyingPhraseCount(state.progress, phraseIds)
        const difficult = getDifficultPhraseCount(state.progress, phraseIds)

        return `В работе: ${studying}, трудных: ${difficult}`
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
        newCount={dailyNewCount}
        reviewCount={dailyReviewCount}
        totalCount={dailyPhrases.length}
      />

      <ContinueCard
        situation={lastSituation}
        lastVisitedAt={state.progress.lastVisitedAt}
        progressLabel={continueProgressLabel}
        detailLabel={continueDetailLabel}
      />

      <section>
        <SectionHeader
          title="Срочные ситуации"
          subtitle="Быстрый доступ к темам, которые чаще всего нужны в первые недели."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {urgentSituations.map((situation) => {
            const visibleInSituation = filterPhrases(phrasesBySituation[situation.id] ?? [], level)
            const phraseIds = visibleInSituation.map((item) => item.id)
            const known = getKnownPhraseCount(state.progress, phraseIds)
            const difficult = getDifficultPhraseCount(state.progress, phraseIds)

            return (
              <SituationCard
                key={situation.id}
                situation={situation}
                to={`/situation/${situation.slug}`}
                progressLabel={`${known}/${visibleInSituation.length}`}
                detailLabel={`Трудных: ${difficult}`}
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
            const phraseIds = visibleInSituation.map((item) => item.id)
            const known = getKnownPhraseCount(state.progress, phraseIds)
            const studying = getStudyingPhraseCount(state.progress, phraseIds)
            const difficult = getDifficultPhraseCount(state.progress, phraseIds)

            return (
              <SituationCard
                key={situation.id}
                situation={situation}
                to={`/situation/${situation.slug}`}
                progressLabel={`${known}/${visibleInSituation.length}`}
                detailLabel={`В работе: ${studying}, трудных: ${difficult}`}
                level={level}
              />
            )
          })}
        </div>
      </section>

      <ProgressSummary
        known={knownInVisible}
        studying={studyingInVisible}
        difficult={difficultInVisible}
        total={visiblePhrases.length}
        quizTotal={quizTotal}
        quizAccuracy={quizAccuracy}
        streak={state.progress.quizStats.streak}
      />

      <BadgeStrip badges={computeBadges(state.progress)} />
    </div>
  )
}
