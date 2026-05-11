import { useState } from 'react'
import { CYCLE_TYPES } from '../../constants/cyclePresets.js'

function fmt(n, fallback = '—') {
  if (n == null || isNaN(n)) return fallback
  return n.toLocaleString('pt-BR')
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CycleCard({ cycle, onEnd, onCancel }) {
  const [expanded, setExpanded] = useState(false)

  const cycleType = CYCLE_TYPES.find((c) => c.id === cycle.cycle_type)
  const emoji = cycleType?.emoji ?? '🎯'

  // Days elapsed
  const startedAt = cycle.started_at ? new Date(cycle.started_at) : null
  const daysElapsed = startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 86400000) : 0
  const totalDays = cycle.duration_weeks ? cycle.duration_weeks * 7 : null
  const progressPct = totalDays ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : null

  // Macros
  const proteinKcal = (cycle.protein_goal_g ?? 0) * 4
  const carbKcal = (cycle.carb_goal_g ?? 0) * 4
  const fatKcal = (cycle.fat_goal_g ?? 0) * 9
  const totalMacroKcal = proteinKcal + carbKcal + fatKcal || 1
  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100)
  const carbPct = Math.round((carbKcal / totalMacroKcal) * 100)
  const fatPct = Math.round((fatKcal / totalMacroKcal) * 100)

  const hasCustomGoals =
    cycle.custom_goals && typeof cycle.custom_goals === 'object' && Object.keys(cycle.custom_goals).length > 0

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="font-bold text-[16px]" style={{ color: 'var(--theme-text)' }}>
              {cycle.name ?? cycleType?.name ?? cycle.cycle_type}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
              Iniciado em {fmtDate(cycle.started_at)}
            </div>
          </div>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-primary/15 text-primary shrink-0"
        >
          Ativo
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-[12px] mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
          <span>
            {totalDays
              ? `${daysElapsed} / ${totalDays} dias`
              : `${daysElapsed} ${daysElapsed === 1 ? 'dia' : 'dias'}`}
          </span>
          {progressPct != null && <span className="font-semibold text-primary">{progressPct}%</span>}
        </div>
        {totalDays && (
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--theme-surface-soft)' }}
          >
            <div
              className="h-2 bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Goals row */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: 'var(--theme-surface-soft)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--theme-text-faint)' }}>
            Meta calórica
          </div>
          <div className="font-bold text-primary text-[15px]">
            {fmt(cycle.calorie_goal)} <span className="font-normal text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>kcal</span>
          </div>
        </div>
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: 'var(--theme-surface-soft)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--theme-text-faint)' }}>
            Meta proteína
          </div>
          <div className="font-bold text-[15px]" style={{ color: 'var(--theme-text)' }}>
            {fmt(cycle.protein_goal_g)} <span className="font-normal text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>g/dia</span>
          </div>
        </div>
      </div>

      {/* Macro mini-breakdown */}
      {(cycle.protein_goal_g || cycle.carb_goal_g || cycle.fat_goal_g) && (
        <div>
          <div className="flex h-1.5 rounded-full overflow-hidden mb-1">
            <div className="bg-primary" style={{ width: `${proteinPct}%` }} />
            <div className="bg-blue-400" style={{ width: `${carbPct}%` }} />
            <div className="bg-yellow-400" style={{ width: `${fatPct}%` }} />
          </div>
          <div className="flex gap-3 text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            <span><span className="inline-block w-1.5 h-1.5 rounded-sm bg-primary mr-1" />{fmt(cycle.protein_goal_g)}g prot</span>
            <span><span className="inline-block w-1.5 h-1.5 rounded-sm bg-blue-400 mr-1" />{fmt(cycle.carb_goal_g)}g carbo</span>
            <span><span className="inline-block w-1.5 h-1.5 rounded-sm bg-yellow-400 mr-1" />{fmt(cycle.fat_goal_g)}g gord</span>
          </div>
        </div>
      )}

      {/* Custom goals expandable */}
      {hasCustomGoals && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[12px] font-semibold"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {expanded ? '▲ Ocultar metas personalizadas' : '▼ Ver metas personalizadas'}
          </button>
          {expanded && (
            <div
              className="mt-2 rounded-lg p-3 space-y-1"
              style={{ backgroundColor: 'var(--theme-surface-soft)' }}
            >
              {Object.entries(cycle.custom_goals).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--theme-text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--theme-text)' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={onEnd} className="btn-primary flex-1">
          Encerrar ciclo
        </button>
        <button
          onClick={onCancel}
          className="text-[13px] font-medium px-3"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
