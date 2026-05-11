import { useState, useMemo } from 'react'
import { CYCLE_TYPES, ACTIVITY_LEVELS } from '../../constants/cyclePresets.js'
import { calculateNutritionPlan } from '../../utils/nutrition.js'

function fmt(n) {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('pt-BR')
}

export default function CalorieCalculator({ profile, cycleType, onConfirm, onBack }) {
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [manualMode, setManualMode] = useState(false)
  const [manual, setManual] = useState({ protein: '', carb: '', fat: '' })

  const plan = useMemo(
    () => calculateNutritionPlan({ profile, cycleType, activityLevel }),
    [profile, cycleType, activityLevel]
  )

  const profileIncomplete =
    !profile?.age || !profile?.sex || !(profile?.weight_kg ?? profile?.current_weight_kg) || !profile?.height_cm

  const cycleLabel = CYCLE_TYPES.find((c) => c.id === cycleType)?.name ?? cycleType

  // Resolved macros (manual overrides auto)
  const proteinG = manualMode && manual.protein !== '' ? Number(manual.protein) : plan.proteinG
  const carbG    = manualMode && manual.carb    !== '' ? Number(manual.carb)    : plan.carbG
  const fatG     = manualMode && manual.fat     !== '' ? Number(manual.fat)     : plan.fatG

  const proteinKcal = proteinG * 4
  const carbKcal    = carbG    * 4
  const fatKcal     = fatG     * 9
  const totalKcal   = proteinKcal + carbKcal + fatKcal || 1

  const proteinPct = Math.round((proteinKcal / totalKcal) * 100)
  const carbPct    = Math.round((carbKcal    / totalKcal) * 100)
  const fatPct     = Math.round((fatKcal     / totalKcal) * 100)

  const calorieGoal = manualMode ? totalKcal : plan.targetCalories

  function handleConfirm() {
    onConfirm({
      calorieGoal,
      proteinGoalG: proteinG,
      carbGoalG:    carbG,
      fatGoalG:     fatG,
    })
  }

  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-4"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Calculadora de calorias
      </p>

      {/* Profile incomplete warning */}
      {profileIncomplete && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-[13px]"
          style={{
            backgroundColor: 'rgba(255,193,7,0.12)',
            border: '1px solid rgba(255,193,7,0.4)',
            color: '#b8860b',
          }}
        >
          Dados incompletos no perfil. Valores estimados.
        </div>
      )}

      {/* TDEE summary */}
      <div
        className="card p-4 mb-4 space-y-1"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex justify-between text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
          <span>Seu TDEE estimado</span>
          <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>
            {fmt(plan.tdee)} kcal
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span style={{ color: 'var(--theme-text-muted)' }}>Meta para {cycleLabel}</span>
          <span className="font-bold text-primary">{fmt(plan.targetCalories)} kcal/dia</span>
        </div>
      </div>

      {/* Activity level selector */}
      <div className="mb-4">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-2"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Nível de atividade
        </label>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((al) => (
            <button
              key={al.id}
              onClick={() => setActivityLevel(al.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-[13px] ${
                activityLevel === al.id
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent'
              }`}
              style={
                activityLevel !== al.id
                  ? { backgroundColor: 'var(--theme-surface-soft)', borderColor: 'var(--theme-border)' }
                  : {}
              }
            >
              <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{al.label}</span>
              <span className="ml-2 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                {al.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Macro breakdown */}
      <div className="card p-4 mb-4">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Distribuição de macros
        </p>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--theme-text-muted)' }}>Proteína</span>
            <span style={{ color: 'var(--theme-text)' }}>
              <strong>{fmt(proteinG)}g</strong>
              <span className="ml-1" style={{ color: 'var(--theme-text-muted)' }}>
                ({fmt(proteinKcal)} kcal · {proteinPct}%)
              </span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--theme-text-muted)' }}>Carboidratos</span>
            <span style={{ color: 'var(--theme-text)' }}>
              <strong>{fmt(carbG)}g</strong>
              <span className="ml-1" style={{ color: 'var(--theme-text-muted)' }}>
                ({fmt(carbKcal)} kcal · {carbPct}%)
              </span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--theme-text-muted)' }}>Gordura</span>
            <span style={{ color: 'var(--theme-text)' }}>
              <strong>{fmt(fatG)}g</strong>
              <span className="ml-1" style={{ color: 'var(--theme-text-muted)' }}>
                ({fmt(fatKcal)} kcal · {fatPct}%)
              </span>
            </span>
          </div>
        </div>

        {/* Visual bar */}
        <div className="flex h-2 rounded-full overflow-hidden mt-3">
          <div className="bg-primary"              style={{ width: `${proteinPct}%` }} />
          <div className="bg-blue-400"             style={{ width: `${carbPct}%`    }} />
          <div className="bg-yellow-400"           style={{ width: `${fatPct}%`     }} />
        </div>
        <div className="flex gap-4 mt-1.5 text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-primary mr-1" />Proteína</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-400 mr-1" />Carbo</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-yellow-400 mr-1" />Gordura</span>
        </div>
      </div>

      {/* Manual adjustment toggle */}
      <button
        onClick={() => setManualMode((v) => !v)}
        className="w-full btn-outline-dark mb-3 text-[13px]"
      >
        {manualMode ? 'Usar valores automáticos' : 'Ajustar manualmente'}
      </button>

      {manualMode && (
        <div className="card p-4 mb-4 space-y-3">
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Ajuste manual (gramas)
          </p>
          {[
            { key: 'protein', label: 'Proteína (g)', placeholder: fmt(plan.proteinG) },
            { key: 'carb',    label: 'Carboidratos (g)', placeholder: fmt(plan.carbG) },
            { key: 'fat',     label: 'Gordura (g)', placeholder: fmt(plan.fatG) },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label
                className="text-[11px] font-semibold block mb-1"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {label}
              </label>
              <input
                type="number"
                min="0"
                className="input-field w-full"
                placeholder={placeholder}
                value={manual[key]}
                onChange={(e) => setManual((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <button onClick={onBack} className="btn-outline-dark flex-1">
          Voltar
        </button>
        <button onClick={handleConfirm} className="btn-primary flex-1">
          Confirmar →
        </button>
      </div>
    </div>
  )
}
