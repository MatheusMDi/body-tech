import { useState } from 'react'
import { calculateProteinGoal } from '../../services/onboarding.js'

export default function OnboardingStep2({ data, onNext, saving }) {
  const [name, setName] = useState(data.name)
  const [weight, setWeight] = useState(data.weight_kg)
  const [height, setHeight] = useState(data.height_cm)
  const [goal, setGoal] = useState(data.goal_weight_kg)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Obrigatório'
    if (!weight || parseFloat(weight) <= 0) e.weight = 'Obrigatório'
    if (!height || parseFloat(height) <= 0) e.height = 'Obrigatório'
    if (!goal || parseFloat(goal) <= 0) e.goal = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validate()) return
    onNext({
      name: name.trim(),
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      goal_weight_kg: parseFloat(goal),
      protein_goal_g: calculateProteinGoal(parseFloat(weight)),
    })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Perfil básico</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Usaremos esses dados para calcular suas metas
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Nome" error={errors.name}>
          <input
            className="input-field"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            autoComplete="given-name"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso atual (kg)" error={errors.weight}>
            <input
              className="input-field"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="85.0"
            />
          </Field>
          <Field label="Altura (cm)" error={errors.height}>
            <input
              className="input-field"
              type="number"
              min="100"
              max="250"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="175"
            />
          </Field>
        </div>

        <Field label="Meta de peso (kg)" error={errors.goal}>
          <input
            className="input-field"
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="80.0"
          />
        </Field>
      </div>

      <div className="mt-auto">
        <button onClick={handleNext} disabled={saving} className="btn-primary w-full">
          {saving ? 'Salvando...' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error, #c94040)' }}>{error}</p>}
    </div>
  )
}
