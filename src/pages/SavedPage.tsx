import { Link } from 'react-router-dom'
import { DirectionSwitch } from '../components/DirectionSwitch'
import { EmptyState } from '../components/EmptyState'
import { PhraseCard } from '../components/PhraseCard'
import { buttonClassName } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { phraseById } from '../data/phrases'
import { useAppState } from '../state/AppContext'

export function SavedPage() {
  const { state, dispatch } = useAppState()

  const saved = state.progress.savedPhraseIds
    .map((id) => phraseById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Избранные фразы"
          subtitle="Здесь сохраняются фразы для быстрого повторения и отдельной практики."
        />
        <div className="mt-3">
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
        </div>
        <Link to="/practice?source=favorites" className={`${buttonClassName()} mt-4`}>
          Практика только по избранному
        </Link>
      </section>

      {saved.length === 0 ? (
        <EmptyState title="Пока нет избранных фраз" description="Добавьте полезные фразы на экране ситуации, чтобы быстро вернуться к ним позже." />
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
