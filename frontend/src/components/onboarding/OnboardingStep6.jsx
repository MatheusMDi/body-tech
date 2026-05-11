import { useState } from 'react'

const SUPPLEMENTS = [
  { key: 'creatina', label: 'Creatina', emoji: '💊' },
  { key: 'zma', label: 'ZMA', emoji: '💊' },
  { key: 'omega3', label: 'Ômega-3', emoji: '🐟' },
  { key: 'multivitaminico', label: 'Multivitamínico', emoji: '💊' },
  { key: 'd3k2', label: 'D3/K2', emoji: '☀️' },
]

export default function OnboardingStep6({ data, onNext, onBack, saving }) {
  const [selected, setSelected] = useState(new Set(data.active_supplements ?? []))
  const [custom, setCustom] = useState('')

  function toggle(key) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleNext() {
    const supplements = [...selected]
    if (custom.trim()) supplements.push(custom.trim())
    onNext({ active_supplements: supplements })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Suplementos</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Apenas os selecionados aparecerão nos hábitos e lembretes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SUPPLEMENTS.map(s => {
          const active = selected.has(s.key)
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              className="px-4 py-3 rounded-sm border text-left transition-colors"
              style={{
                borderColor: active ? '#76b900' : 'var(--theme-border)',
                backgroundColor: active ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface)',
              }}
            >
              <div className="text-[18px] mb-1">{s.emoji}</div>
              <div
                className="text-[13px] font-bold"
                style={{ color: active ? '#76b900' : 'var(--theme-text)' }}
              >
                {s.label}
              </div>
            </button>
          )
        })}
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
          Outro (opcional)
        </label>
        <input
          className="input-field"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder="Nome do suplemento"
        />
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="btn-outline-dark flex-1">Voltar</button>
        <button onClick={handleNext} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Salvando...' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
