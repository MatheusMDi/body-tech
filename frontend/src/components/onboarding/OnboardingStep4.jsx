import { useState } from 'react'
import { calculateProteinGoal } from '../../services/onboarding.js'

export default function OnboardingStep4({ data, onNext, onBack, saving }) {
  const suggestedProtein = data.weight_kg ? calculateProteinGoal(parseFloat(data.weight_kg)) : 160
  const [waterGoal, setWaterGoal] = useState(data.water_goal_liters ?? 4.0)
  const [useCustomProtein, setUseCustomProtein] = useState(false)
  const [customProtein, setCustomProtein] = useState(String(suggestedProtein))

  const proteinGoal = useCustomProtein ? (parseFloat(customProtein) || suggestedProtein) : suggestedProtein

  function handleNext() {
    onNext({
      water_goal_liters: parseFloat(waterGoal),
      protein_goal_g: proteinGoal,
    })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Metas diárias</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Vamos definir suas metas de água e proteína
        </p>
      </div>

      {/* Water goal */}
      <div
        className="rounded-sm p-4 border"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--theme-text-faint)' }}>
            Meta de água
          </div>
          <span className="text-primary font-bold text-[18px]">{parseFloat(waterGoal).toFixed(1)}L</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          step="0.5"
          value={waterGoal}
          onChange={e => setWaterGoal(e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--theme-text-faint)' }}>
          <span>1L</span><span>6L</span>
        </div>
      </div>

      {/* Protein goal */}
      <div
        className="rounded-sm p-4 border space-y-3"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
      >
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--theme-text-faint)' }}>
          Meta de proteína
        </div>
        {data.weight_kg && (
          <p className="text-[14px]" style={{ color: 'var(--theme-text-muted)' }}>
            Baseado no seu peso ({data.weight_kg}kg), sugerimos{' '}
            <strong className="text-primary">{suggestedProtein}g/dia</strong> (2g/kg)
          </p>
        )}

        <div className="space-y-2">
          {[
            { label: `Usar ${suggestedProtein}g (recomendado)`, value: false },
            { label: 'Definir manualmente', value: true },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setUseCustomProtein(opt.value)}
              className="w-full px-4 py-3 rounded-sm border text-[14px] font-bold text-left transition-colors"
              style={{
                borderColor: useCustomProtein === opt.value ? '#76b900' : 'var(--theme-border)',
                backgroundColor: useCustomProtein === opt.value ? 'rgba(118,185,0,0.1)' : 'transparent',
                color: useCustomProtein === opt.value ? '#76b900' : 'var(--theme-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {useCustomProtein && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
              Proteína (g/dia)
            </label>
            <input
              type="number"
              min="50"
              max="400"
              value={customProtein}
              onChange={e => setCustomProtein(e.target.value)}
              className="input-field"
            />
          </div>
        )}
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
