import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase.js'
import { CYCLE_TYPES } from '../../../constants/cyclePresets.js'

function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
      <div
        className="h-1.5 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}

function Skeleton() {
  return (
    <div className="card p-4 animate-pulse" style={{ minHeight: 120 }}>
      <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--theme-border)' }} />
      <div className="h-5 w-40 rounded mb-2" style={{ background: 'var(--theme-border)' }} />
      <div className="h-1.5 rounded-full" style={{ background: 'var(--theme-border)' }} />
    </div>
  )
}

export default function CardCycleStatus({ userId, layout }) {
  const navigate = useNavigate()
  const [cycle, setCycle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('protocol_cycles')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (!cancelled) {
        setCycle(data ?? null)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <Skeleton />

  if (!cycle) {
    return (
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Ciclo de Protocolo
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Nenhum ciclo ativo no momento.
        </p>
        <button
          className="btn-primary text-sm py-2 px-4 self-start"
          onClick={() => navigate('/cycles')}
        >
          Iniciar ciclo
        </button>
      </div>
    )
  }

  const typeEmoji = CYCLE_TYPES[cycle.type]?.emoji ?? '🎯'
  const startDate = new Date(cycle.start_date)
  const endDate = cycle.end_date ? new Date(cycle.end_date) : null
  const now = new Date()

  const daysElapsed = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)))
  const totalDays = endDate
    ? Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : null
  const progressPct = totalDays ? (daysElapsed / totalDays) * 100 : 0
  const daysLeft = totalDays ? Math.max(0, totalDays - daysElapsed) : null

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeEmoji}</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Ciclo Ativo
          </span>
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#76b90022', color: '#76b900' }}
        >
          Dia {daysElapsed + 1}
        </span>
      </div>

      <div className="text-[18px] font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
        {cycle.name || `Ciclo ${cycle.type}`}
      </div>

      <div className="flex gap-4 mb-3">
        {cycle.calorie_goal && (
          <div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Calorias/dia</div>
            <div className="text-[15px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {cycle.calorie_goal} kcal
            </div>
          </div>
        )}
        {cycle.protein_goal_g && (
          <div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Proteína/dia</div>
            <div className="text-[15px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {cycle.protein_goal_g}g
            </div>
          </div>
        )}
        {daysLeft !== null && (
          <div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Restam</div>
            <div className="text-[15px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {daysLeft}d
            </div>
          </div>
        )}
      </div>

      {totalDays && (
        <>
          <ProgressBar pct={progressPct} />
          <div className="flex justify-between mt-1">
            <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
              {daysElapsed}d concluídos
            </span>
            <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
              {totalDays}d total
            </span>
          </div>
        </>
      )}
    </div>
  )
}
