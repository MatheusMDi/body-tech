import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase.js'
import { todayDateString } from '../../../lib/utils.js'

function Skeleton() {
  return (
    <div className="card p-4 animate-pulse" style={{ minHeight: 120 }}>
      <div className="h-3 w-20 rounded mb-3" style={{ background: 'var(--theme-border)' }} />
      <div className="h-5 w-36 rounded mb-2" style={{ background: 'var(--theme-border)' }} />
      <div className="h-3 w-48 rounded" style={{ background: 'var(--theme-border)' }} />
    </div>
  )
}

const FORMAT_LABELS = {
  strength: '💪 Força',
  hiit: '🔥 HIIT',
  cardio: '🏃 Cardio',
  crossfit: '🏋️ CrossFit',
  yoga: '🧘 Yoga',
  mobility: '🤸 Mobilidade',
  sport: '⚽ Esporte',
  walk: '🚶 Caminhada',
}

export default function CardWodToday({ userId, layout }) {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('session_date', todayDateString())
        .single()

      if (!cancelled) {
        setSession(data ?? null)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <Skeleton />

  if (!session) {
    return (
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏋️</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Treino de Hoje
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Nenhum treino registrado hoje.
        </p>
        <button
          className="btn-primary text-sm py-2 px-4 self-start"
          onClick={() => navigate('/workout')}
        >
          Registrar treino
        </button>
      </div>
    )
  }

  const formatLabel = FORMAT_LABELS[session.format] ?? session.format ?? 'Treino'
  const exercises = session.exercises ?? []
  const exerciseSummary = exercises.length > 0
    ? exercises.slice(0, 3).map(e => e.name ?? e).join(', ') + (exercises.length > 3 ? ` +${exercises.length - 3}` : '')
    : session.notes ?? 'Sessão concluída'

  const rpeColor = session.rpe >= 8 ? '#ef4444' : session.rpe >= 5 ? '#f59e0b' : '#76b900'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏋️</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Treino de Hoje
          </span>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#76b90022', color: '#76b900' }}
        >
          ✓ Concluído
        </span>
      </div>

      <div className="text-[17px] font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
        {session.name || 'Sessão de Treino'}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
        >
          {formatLabel}
        </span>
        {session.duration_minutes && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
          >
            ⏱ {session.duration_minutes}min
          </span>
        )}
      </div>

      <div className="text-[13px] mb-3" style={{ color: 'var(--theme-text-muted)' }}>
        {exerciseSummary}
      </div>

      {session.rpe != null && (
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>RPE</span>
          <span className="text-[15px] font-bold" style={{ color: rpeColor }}>
            {session.rpe}/10
          </span>
        </div>
      )}
    </div>
  )
}
