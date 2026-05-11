import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { CYCLE_TYPES } from '../../constants/cyclePresets.js'
import CycleReport from './CycleReport.jsx'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function signedKg(delta) {
  if (delta == null || isNaN(delta)) return null
  const sign = delta > 0 ? '+' : ''
  return `${sign}${Number(delta).toFixed(1)} kg`
}

const STATUS_LABELS = {
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLORS = {
  completed: { bg: 'bg-primary/15', text: 'text-primary' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-400' },
}

export default function CycleHistory({ userId }) {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reportCycle, setReportCycle] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      setLoading(true)
      try {
        const { data, error: err } = await supabase
          .from('protocol_cycles')
          .select('*')
          .eq('user_id', userId)
          .neq('status', 'active')
          .order('started_at', { ascending: false })
        if (!cancelled) {
          if (err) throw err
          setCycles(data ?? [])
        }
      } catch (e) {
        if (!cancelled) setError('Não foi possível carregar o histórico.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [userId])

  if (loading) {
    return (
      <p className="text-[13px] text-center py-6" style={{ color: 'var(--theme-text-muted)' }}>
        Carregando histórico…
      </p>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-lg px-4 py-3 text-[13px]"
        style={{
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.35)',
          color: '#ef4444',
        }}
      >
        {error}
      </div>
    )
  }

  if (cycles.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--theme-text-faint)' }}>
          Nenhum ciclo concluído ainda.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {cycles.map((cycle) => {
          const cycleType = CYCLE_TYPES.find((c) => c.id === cycle.cycle_type)
          const emoji = cycleType?.emoji ?? '🎯'
          const statusColors = STATUS_COLORS[cycle.status] ?? STATUS_COLORS.cancelled
          const delta = cycle.report?.weight_delta ?? null
          const deltaStr = signedKg(delta)

          return (
            <div key={cycle.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>
                      {cycle.name ?? cycleType?.name ?? cycle.cycle_type}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                      {fmtDate(cycle.started_at)}
                      {cycle.ended_at ? ` → ${fmtDate(cycle.ended_at)}` : ''}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${statusColors.bg} ${statusColors.text}`}
                >
                  {STATUS_LABELS[cycle.status] ?? cycle.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2">
                {deltaStr && (
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: delta < 0 ? '#76b900' : delta > 0 ? '#f97316' : 'var(--theme-text-muted)' }}
                  >
                    {deltaStr}
                  </span>
                )}
                {cycle.report ? (
                  <button
                    onClick={() => setReportCycle(cycle)}
                    className="text-[12px] font-semibold text-primary ml-auto"
                  >
                    Ver relatório →
                  </button>
                ) : (
                  <span className="text-[12px] ml-auto" style={{ color: 'var(--theme-text-faint)' }}>
                    Sem relatório
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Report modal */}
      {reportCycle && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setReportCycle(null) }}
        >
          <div
            className="w-full max-w-md rounded-t-2xl p-6 overflow-y-auto"
            style={{
              backgroundColor: 'var(--theme-bg)',
              maxHeight: '90vh',
              borderTop: '1px solid var(--theme-border)',
            }}
          >
            <CycleReport
              report={reportCycle.report}
              cycle={reportCycle}
              onNewCycle={() => setReportCycle(null)}
              onClose={() => setReportCycle(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
