import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { CYCLE_TYPES } from '../../constants/cyclePresets.js'

function getCurrentMonthYear() {
  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export default function CycleConfig({ userId, cycleType, macros, onSave, onBack, saving }) {
  const cycleLabel = CYCLE_TYPES.find((c) => c.id === cycleType)?.name ?? cycleType

  const [name, setName] = useState(`${cycleLabel} — ${getCurrentMonthYear()}`)
  const [noEndDate, setNoEndDate] = useState(false)
  const [durationWeeks, setDurationWeeks] = useState('')
  const [weightGoal, setWeightGoal] = useState('')
  const [selectedRuleIds, setSelectedRuleIds] = useState([])
  const [customGoals, setCustomGoals] = useState('')
  const [rules, setRules] = useState([])
  const [rulesLoading, setRulesLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchRules() {
      setRulesLoading(true)
      try {
        const { data, error: err } = await supabase
          .from('user_rules')
          .select('id, name, emoji')
          .eq('user_id', userId)
          .eq('active', true)
        if (!cancelled) {
          if (err) throw err
          setRules(data ?? [])
        }
      } catch (e) {
        if (!cancelled) setError('Não foi possível carregar suas regras.')
      } finally {
        if (!cancelled) setRulesLoading(false)
      }
    }
    fetchRules()
    return () => { cancelled = true }
  }, [userId])

  function toggleRule(id) {
    setSelectedRuleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  function parseCustomGoals() {
    if (!customGoals.trim()) return {}
    try {
      // Try JSON first
      return JSON.parse(customGoals)
    } catch {
      // Parse key: value lines
      const obj = {}
      customGoals.split('\n').forEach((line) => {
        const idx = line.indexOf(':')
        if (idx > 0) {
          const k = line.slice(0, idx).trim()
          const v = line.slice(idx + 1).trim()
          if (k) obj[k] = v
        }
      })
      return obj
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setError('O nome do ciclo é obrigatório.')
      return
    }
    setError(null)
    onSave({
      cycle_type: cycleType,
      name: name.trim(),
      calorie_goal: macros.calorieGoal,
      protein_goal_g: macros.proteinGoalG,
      carb_goal_g: macros.carbGoalG,
      fat_goal_g: macros.fatGoalG,
      duration_weeks: noEndDate ? null : (durationWeeks ? Number(durationWeeks) : null),
      weight_goal_kg: weightGoal ? Number(weightGoal) : null,
      active_rule_ids: selectedRuleIds,
      custom_goals: parseCustomGoals(),
    })
  }

  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-4"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Configurar ciclo
      </p>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-[13px]"
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Macro summary */}
      <div
        className="rounded-lg px-4 py-3 mb-5 flex gap-4 flex-wrap text-[12px]"
        style={{ backgroundColor: 'var(--theme-surface-soft)', border: '1px solid var(--theme-border)' }}
      >
        <span style={{ color: 'var(--theme-text-muted)' }}>
          <span className="font-semibold text-primary">{macros.calorieGoal ?? '—'} kcal</span>
        </span>
        <span style={{ color: 'var(--theme-text-muted)' }}>
          Prot <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{macros.proteinGoalG ?? '—'}g</span>
        </span>
        <span style={{ color: 'var(--theme-text-muted)' }}>
          Carbo <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{macros.carbGoalG ?? '—'}g</span>
        </span>
        <span style={{ color: 'var(--theme-text-muted)' }}>
          Gord <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{macros.fatGoalG ?? '—'}g</span>
        </span>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Nome do ciclo
        </label>
        <input
          type="text"
          className="input-field w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Cut — Maio 2026"
        />
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Duração (semanas)
        </label>
        <input
          type="number"
          className="input-field w-full"
          min="1"
          max="52"
          placeholder="Ex: 8"
          value={noEndDate ? '' : durationWeeks}
          disabled={noEndDate}
          onChange={(e) => setDurationWeeks(e.target.value)}
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noEndDate}
            onChange={(e) => setNoEndDate(e.target.checked)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
            Sem data de fim
          </span>
        </label>
      </div>

      {/* Weight goal */}
      <div className="mb-4">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Meta de peso (kg) — opcional
        </label>
        <input
          type="number"
          className="input-field w-full"
          min="30"
          max="300"
          step="0.1"
          placeholder="Ex: 82.5"
          value={weightGoal}
          onChange={(e) => setWeightGoal(e.target.value)}
        />
      </div>

      {/* Active rules */}
      <div className="mb-4">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-2"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Regras ativas neste ciclo
        </label>
        {rulesLoading ? (
          <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
            Carregando regras…
          </p>
        ) : rules.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
            Nenhuma regra ativa encontrada.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {rules.map((rule) => {
              const selected = selectedRuleIds.includes(rule.id)
              return (
                <button
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1.5 rounded-full border-2 text-[12px] font-medium transition-all ${
                    selected ? 'border-primary bg-primary/10 text-primary' : ''
                  }`}
                  style={
                    !selected
                      ? {
                          borderColor: 'var(--theme-border)',
                          backgroundColor: 'var(--theme-surface-soft)',
                          color: 'var(--theme-text-muted)',
                        }
                      : {}
                  }
                >
                  {rule.emoji && <span className="mr-1">{rule.emoji}</span>}
                  {rule.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Custom goals */}
      <div className="mb-5">
        <label
          className="text-[11px] font-bold uppercase tracking-widest block mb-1.5"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Metas personalizadas — opcional
        </label>
        <textarea
          className="input-field w-full"
          rows={3}
          placeholder={'Ex:\nPassos diários: 10000\nLitragem: 4'}
          value={customGoals}
          onChange={(e) => setCustomGoals(e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <p className="text-[11px] mt-1" style={{ color: 'var(--theme-text-faint)' }}>
          Uma meta por linha no formato "chave: valor".
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-dark flex-1" disabled={saving}>
          Voltar
        </button>
        <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
          {saving ? 'Iniciando…' : 'Iniciar ciclo'}
        </button>
      </div>
    </div>
  )
}
