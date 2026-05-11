import { CYCLE_TYPES } from '../../constants/cyclePresets.js'

function val(v, suffix = '') {
  if (v == null || (typeof v === 'number' && isNaN(v))) return '—'
  return `${v}${suffix}`
}

function pct(v) {
  if (v == null || isNaN(v)) return '—'
  return `${Math.round(v)}%`
}

function signedKg(delta) {
  if (delta == null || isNaN(delta)) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} kg`
}

const FLAG_LABELS = {
  ALCOOL: 'Álcool',
  ACUCAR: 'Açúcar',
  JUNK: 'Junk food',
  FAST_FOOD: 'Fast food',
  SEDENTARY: 'Sedentarismo',
}

export default function CycleReport({ report, cycle, onNewCycle, onClose }) {
  const r = report ?? {}
  const cycleType = CYCLE_TYPES.find((c) => c.id === cycle?.cycle_type)
  const emoji = cycleType?.emoji ?? '🎯'
  const cycleName = cycle?.name ?? cycleType?.name ?? cycle?.cycle_type ?? 'Ciclo'
  const durationWeeks = cycle?.duration_weeks ?? null

  // Weight
  const weightStart = r.weight_start ?? null
  const weightEnd = r.weight_end ?? null
  const weightDelta = r.weight_delta ?? null

  // Compliance rows
  const complianceRows = [
    { label: 'Proteína', value: r.protein_compliance_pct, active: true },
    { label: 'Hidratação', value: r.water_compliance_pct, active: true },
    { label: 'Jejum', value: r.fasting_compliance_pct, active: r.fasting_compliance_pct != null },
  ].filter((row) => row.active)

  const negativeFlags = Object.entries(r.flags ?? {}).filter(([, v]) => v > 0)

  return (
    <div style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{emoji}</div>
        <h2 className="text-[20px] font-bold" style={{ color: 'var(--theme-text)' }}>
          {cycleName}
        </h2>
        {durationWeeks && (
          <p className="text-[13px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            {durationWeeks} {durationWeeks === 1 ? 'semana' : 'semanas'}
          </p>
        )}
        <div
          className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
          style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
        >
          Relatório Final
        </div>
      </div>

      {/* Weight */}
      <div className="card p-4 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-text-faint)' }}>
          Peso corporal
        </p>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {val(weightStart, ' kg')}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Início</div>
          </div>
          <div className="text-[20px]" style={{ color: 'var(--theme-text-faint)' }}>→</div>
          <div className="text-center">
            <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {val(weightEnd, ' kg')}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Fim</div>
          </div>
          <div className="text-center">
            <div
              className="text-[22px] font-bold"
              style={{
                color:
                  weightDelta == null ? 'var(--theme-text-faint)'
                  : weightDelta < 0 ? '#76b900'
                  : weightDelta > 0 ? '#f97316'
                  : 'var(--theme-text)',
              }}
            >
              {signedKg(weightDelta)}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Delta</div>
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="card p-4 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-text-faint)' }}>
          Compliance
        </p>
        <div className="space-y-3">
          {complianceRows.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-[13px] mb-1">
                <span style={{ color: 'var(--theme-text-muted)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{pct(value)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-surface-soft)' }}>
                <div
                  className="h-1.5 bg-primary rounded-full"
                  style={{ width: value != null ? `${Math.min(100, Math.round(value))}%` : '0%' }}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between text-[13px] pt-1">
            <span style={{ color: 'var(--theme-text-muted)' }}>Sessões de treino</span>
            <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>
              {val(r.workout_sessions)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'PRs quebrados', value: val(r.prs_broken) },
          { label: 'Score médio', value: val(r.avg_score) },
          { label: 'Melhor sequência', value: val(r.best_streak, ' dias') },
          { label: 'Conquistas', value: val(r.achievements) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: 'var(--theme-surface-soft)' }}
          >
            <div className="text-[22px] font-bold text-primary">{value}</div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Negative flags */}
      {negativeFlags.length > 0 && (
        <div className="card p-4 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-text-faint)' }}>
            Flags negativas
          </p>
          <div className="space-y-1.5">
            {negativeFlags.map(([key, count]) => (
              <div key={key} className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--theme-text-muted)' }}>
                  {FLAG_LABELS[key] ?? key}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: '#f97316' }}
                >
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onNewCycle} className="btn-primary flex-1">
          Iniciar novo ciclo
        </button>
        <button onClick={onClose} className="btn-outline-dark flex-1">
          Fechar
        </button>
      </div>
    </div>
  )
}
