import { DirectionSwitch } from '../components/DirectionSwitch'
import { LevelFilter } from '../components/LevelFilter'
import { useAppState } from '../state/AppContext'

export function SettingsPage() {
  const { state, dispatch } = useAppState()

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Настройки обучения</h1>
        <p className="mt-1 text-sm text-slate-600">Все настройки сохраняются локально на устройстве.</p>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Направление по умолчанию</p>
          <DirectionSwitch
            direction={state.prefs.direction}
            onChange={(direction) => dispatch({ type: 'setDirection', payload: direction })}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Фильтр уровня</p>
          <LevelFilter
            value={state.prefs.defaultLevel}
            onChange={(level) => dispatch({ type: 'setDefaultLevel', payload: level })}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.prefs.transliterationEnabled}
            onChange={(event) => dispatch({ type: 'setTransliteration', payload: event.target.checked })}
          />
          Показывать подсказку произношения
        </label>

        <label className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.prefs.audioAutoplay}
            onChange={(event) => dispatch({ type: 'setAudioAutoplay', payload: event.target.checked })}
          />
          Автовоспроизведение немецкой фразы после показа перевода
        </label>

        <button
          type="button"
          className="mt-4 rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
          onClick={() => dispatch({ type: 'resetProgress' })}
        >
          Сбросить прогресс
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p>Офлайн-режим включен через PWA shell. При повторном открытии приложение работает быстрее.</p>
      </section>
    </div>
  )
}
