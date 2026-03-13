import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { LevelFilter } from '../components/LevelFilter'
import { PhraseCard } from '../components/PhraseCard'
import { LevelBadge } from '../components/ui/LevelBadge'
import { buttonClassName } from '../components/ui/Button'
import { phrasesBySituation } from '../data/phrases'
import { situationBySlug } from '../data/situations'
import { filterPhrases } from '../lib/learning'
import { useAppState } from '../state/AppContext'

export function SituationPage() {
  const { slug } = useParams()
  const { state, dispatch } = useAppState()

  const situation = slug ? situationBySlug.get(slug) : null

  const list = useMemo(() => {
    if (!situation) {
      return []
    }

    return filterPhrases(phrasesBySituation[situation.id] ?? [], state.prefs.defaultLevel)
  }, [situation, state.prefs.defaultLevel])

  useEffect(() => {
    if (situation && state.progress.lastVisitedSituationId !== situation.id) {
      dispatch({ type: 'setLastVisitedSituation', payload: { situationId: situation.id } })
    }
  }, [dispatch, situation, state.progress.lastVisitedSituationId])

  if (!situation) {
    return (
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-semibold text-[var(--color-danger)]">Ситуация не найдена.</p>
        <Link to="/" className={`${buttonClassName()} mt-4`}>
          На главную
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[var(--color-text)]">
              {situation.icon} {situation.titleRu}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{situation.descriptionRu}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Нажимайте «Показать перевод», чтобы отметить фразу как изученную.</p>
          </div>
          <LevelBadge level={state.prefs.defaultLevel} compact />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
          <LevelFilter
            value={state.prefs.defaultLevel}
            onChange={(level) => dispatch({ type: 'setDefaultLevel', payload: level })}
          />
        </div>
      </section>

      <div className="grid gap-3">
        {list.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            direction={state.prefs.direction}
            transliterationEnabled={state.prefs.transliterationEnabled}
            audioAutoplay={state.prefs.audioAutoplay}
            isSaved={state.progress.savedPhraseIds.includes(phrase.id)}
            isCompleted={state.progress.completedPhraseIds.includes(phrase.id)}
            onToggleSaved={(phraseId) => dispatch({ type: 'toggleSaved', payload: { phraseId } })}
            onMarkCompleted={(phraseId) => dispatch({ type: 'markCompleted', payload: { phraseId } })}
          />
        ))}
      </div>

      <Link to={`/practice?source=situation&slug=${situation.slug}`} className={buttonClassName()}>
        Практиковать только эту ситуацию
      </Link>
    </div>
  )
}
