import { InlineError } from '../ErrorBoundary.jsx'

export default function OnboardingStep8({ data, onBack, onComplete, saving, error }) {
  const rows = [
    { label: 'Jejum', value: `${data.fasting_protocol} (${data.fast_start_time?.slice(0,5)} → ${data.fast_end_time?.slice(0,5)})` },
    { label: 'Meta água', value: `${parseFloat(data.water_goal_liters || 4).toFixed(1)}L/dia` },
    { label: 'Meta proteína', value: `${data.protein_goal_g || 160}g/dia` },
    data.trains && { label: 'Treino', value: `${data.training_modality} às ${data.training_time?.slice(0,5)} · ${data.training_days_per_week}x/semana` },
    data.active_supplements?.length > 0 && {
      label: 'Suplementos',
      value: `${data.active_supplements.length} ativo${data.active_supplements.length !== 1 ? 's' : ''}`,
    },
  ].filter(Boolean)

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Tudo pronto{data.name ? `, ${data.name.split(' ')[0]}` : ''}!
        </h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Confirme seu protocolo antes de começar
        </p>
      </div>

      <div
        className="rounded-sm border divide-y"
        style={{ borderColor: 'var(--theme-border)', divideColor: 'var(--theme-border)' }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-start justify-between px-4 py-3 gap-4"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-wide shrink-0 mt-0.5"
              style={{ color: 'var(--theme-text-faint)' }}
            >
              {row.label}
            </span>
            <span className="text-[14px] font-bold text-right" style={{ color: 'var(--theme-text)' }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div
        className="rounded-sm p-4 border"
        style={{ borderColor: '#76b900', backgroundColor: 'rgba(118,185,0,0.07)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
          Você pode ajustar qualquer configuração a qualquer momento em <strong style={{ color: 'var(--theme-text)' }}>Configurações</strong>.
        </p>
      </div>

      {error && <InlineError message={error} onRetry={onComplete} />}

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} disabled={saving} className="btn-outline-dark flex-1">Voltar</button>
        <button onClick={onComplete} disabled={saving} className="btn-primary flex-1">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Salvando…
            </span>
          ) : 'Começar meu protocolo'}
        </button>
      </div>
    </div>
  )
}
