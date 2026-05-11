import { useState } from 'react'
import { suggestFastingWindow } from '../../services/onboarding.js'

const PROTOCOLS = ['16:8', '18:6', '20:4', 'Personalizado']

export default function OnboardingStep3({ data, onNext, onBack, saving }) {
  const [protocol, setProtocol] = useState(data.fasting_protocol)
  const [startTime, setStartTime] = useState(data.fast_start_time)
  const [endTime, setEndTime] = useState(data.fast_end_time)
  const [accepted, setAccepted] = useState(true)

  function handleProtocolChange(p) {
    setProtocol(p)
    if (p !== 'Personalizado') {
      const suggestion = suggestFastingWindow(p)
      setStartTime(suggestion.start)
      setEndTime(suggestion.end)
    }
  }

  const suggestion = protocol !== 'Personalizado' ? suggestFastingWindow(protocol) : null

  function handleNext() {
    onNext({
      fasting_protocol: protocol,
      fast_start_time: startTime,
      fast_end_time: endTime,
    })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Protocolo de jejum</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Qual protocolo você vai seguir?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PROTOCOLS.map(p => (
          <button
            key={p}
            onClick={() => handleProtocolChange(p)}
            className="px-4 py-3 rounded-sm border text-[14px] font-bold text-left transition-colors"
            style={{
              borderColor: protocol === p ? '#76b900' : 'var(--theme-border)',
              backgroundColor: protocol === p ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface)',
              color: protocol === p ? '#76b900' : 'var(--theme-text-muted)',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {suggestion && (
        <div
          className="rounded-sm p-4 border"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
            Janela sugerida para {protocol}
          </div>
          <div className="text-[16px] font-bold" style={{ color: 'var(--theme-text)' }}>
            {suggestion.start} → {suggestion.end}
          </div>
        </div>
      )}

      {protocol === 'Personalizado' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                Início do jejum
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                Fim do jejum
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="btn-outline-dark flex-1">Voltar</button>
        <button onClick={handleNext} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Salvando...' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
