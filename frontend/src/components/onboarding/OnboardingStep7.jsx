import { useState } from 'react'
import { usePush } from '../../hooks/usePush.js'

const NOTIFICATION_TYPES = [
  { key: 'window_open', label: 'Janela alimentar abre', emoji: '🍽️' },
  { key: 'window_close', label: 'Janela alimentar fecha', emoji: '🌙' },
  { key: 'pre_workout', label: 'Pré-treino', emoji: '🏃' },
  { key: 'sleep_reminder', label: 'Lembrete de sono', emoji: '😴' },
  { key: 'daily_summary', label: 'Resumo diário', emoji: '📊' },
  { key: 'supplement', label: 'Suplementos', emoji: '💊' },
  { key: 'measure_reminder', label: 'Lembrete de medição', emoji: '📏' },
]

export default function OnboardingStep7({ data, onNext, onBack, saving, user }) {
  const { subscribe } = usePush(user?.id)
  const [mode, setMode] = useState(
    data.notifications_enabled === false ? 'none' : 'all'
  )
  const [prefs, setPrefs] = useState(
    data.notification_preferences ?? Object.fromEntries(NOTIFICATION_TYPES.map(t => [t.key, true]))
  )
  const [requesting, setRequesting] = useState(false)

  function togglePref(key) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleNext() {
    if (mode !== 'none') {
      setRequesting(true)
      try { await subscribe() } catch {}
      setRequesting(false)
    }
    onNext({
      notifications_enabled: mode !== 'none',
      notification_preferences: mode === 'custom' ? prefs : Object.fromEntries(NOTIFICATION_TYPES.map(t => [t.key, true])),
    })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Notificações</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Lembretes do protocolo para manter você no trilho
        </p>
      </div>

      <div className="space-y-2">
        {[
          { val: 'all', label: 'Sim, ativar todos' },
          { val: 'custom', label: 'Quero escolher quais' },
          { val: 'none', label: 'Não por agora' },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setMode(opt.val)}
            className="w-full px-4 py-3 rounded-sm border text-[14px] font-bold text-left transition-colors"
            style={{
              borderColor: mode === opt.val ? '#76b900' : 'var(--theme-border)',
              backgroundColor: mode === opt.val ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface)',
              color: mode === opt.val ? '#76b900' : 'var(--theme-text-muted)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="space-y-2">
          {NOTIFICATION_TYPES.map(t => (
            <label
              key={t.key}
              className="flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
            >
              <span className="text-[14px]" style={{ color: 'var(--theme-text)' }}>
                {t.emoji} {t.label}
              </span>
              <input
                type="checkbox"
                checked={prefs[t.key] ?? true}
                onChange={() => togglePref(t.key)}
                className="accent-primary w-4 h-4"
              />
            </label>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="btn-outline-dark flex-1">Voltar</button>
        <button onClick={handleNext} disabled={saving || requesting} className="btn-primary flex-1">
          {saving || requesting ? 'Aguarde...' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
