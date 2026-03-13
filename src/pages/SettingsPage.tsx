import { DirectionSwitch } from '../components/DirectionSwitch'
import { LevelFilter } from '../components/LevelFilter'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useAppState } from '../state/AppContext'

export function SettingsPage() {
  const { state, dispatch, openOnboarding } = useAppState()

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <SectionHeader title="Настройки обучения" subtitle="Все настройки сохраняются локально на устройстве." />

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Направление по умолчанию</p>
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Фильтр уровня</p>
          <LevelFilter
            value={state.prefs.defaultLevel}
            onChange={(level) => dispatch({ type: 'setDefaultLevel', payload: level })}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={state.prefs.transliterationEnabled}
            onChange={(event) => dispatch({ type: 'setTransliteration', payload: event.target.checked })}
          />
          Показывать подсказку произношения
        </label>

        <label className="mt-3 flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={state.prefs.audioAutoplay}
            onChange={(event) => dispatch({ type: 'setAudioAutoplay', payload: event.target.checked })}
          />
          Автовоспроизведение немецкой фразы после показа перевода
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={openOnboarding}>
            Открыть краткое введение
          </Button>
          <Button variant="danger" onClick={() => dispatch({ type: 'resetProgress' })}>
            Сбросить прогресс
          </Button>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <SectionHeader title="Как это работает" subtitle="Приложение остается простым и локальным, без сложной настройки." />
        <div className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-text-muted)]">
          <p>Интерфейс полностью остается на русском языке.</p>
          <p>Прогресс и предпочтения хранятся только на вашем устройстве.</p>
          <p>Офлайн-режим включен через PWA shell, поэтому приложение быстрее открывается повторно.</p>
        </div>
      </section>
    </div>
  )
}
