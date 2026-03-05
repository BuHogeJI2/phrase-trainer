import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { LevelFilter } from '../components/LevelFilter'
import { PhraseCard } from '../components/PhraseCard'
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
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-rose-800">Ситуация не найдена.</p>
        <Link to="/" className="mt-3 inline-flex rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white">
          На главную
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-base font-semibold text-slate-900">
          {situation.icon} {situation.titleRu}
        </p>
        <p className="mt-1 text-sm text-slate-600">Нажимайте "Показать перевод", чтобы отметить фразу как изученную.</p>
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

      <Link to={`/practice?source=situation&slug=${situation.slug}`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        Практиковать только эту ситуацию
      </Link>
    </div>
  )
}
