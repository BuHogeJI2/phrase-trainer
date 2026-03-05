import { Link } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { PhraseCard } from '../components/PhraseCard'
import { phraseById } from '../data/phrases'
import { useAppState } from '../state/AppContext'

export function SavedPage() {
  const { state, dispatch } = useAppState()

  const saved = state.progress.savedPhraseIds
    .map((id) => phraseById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Избранные фразы</h1>
        <p className="mt-1 text-sm text-slate-600">Здесь сохраняются фразы для быстрого повторения и отдельной практики.</p>
        <div className="mt-3">
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
        </div>
        <Link to="/practice?source=favorites" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Практика только по избранному
        </Link>
      </section>

      {saved.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Пока нет избранных фраз. Добавьте их на экране ситуаций.
        </section>
      ) : (
        <div className="grid gap-3">
          {saved.map((phrase) => (
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
      )}
    </div>
  )
}
