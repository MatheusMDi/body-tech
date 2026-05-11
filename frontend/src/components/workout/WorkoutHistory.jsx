import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { todayDateString } from '../../lib/utils.js'

const FORMAT_LABELS = {
  amrap:           'AMRAP',
  emom:            'EMOM',
  for_time:        'For Time',
  rounds_for_time: 'Rounds for Time',
  chipper:         'Chipper',
  tabata:          'Tabata',
  strength:        'Séries',
  drop_set:        'Drop Set',
  superset:        'Superset',
  pyramid:         'Pirâmide',
  custom:          'Personalizado',
}

const FORMAT_COLORS = {
  amrap:           '#f59e0b',
  emom:            '#3b82f6',
  for_time:        '#ef4444',
  rounds_for_time: '#f97316',
  chipper:         '#8b5cf6',
  tabata:          '#ec4899',
  strength:        '#76b900',
  drop_set:        '#10b981',
  superset:        '#06b6d4',
  pyramid:         '#6366f1',
  custom:          '#9ca3af',
}

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const today = todayDateString()
  const yesterday = todayDateString(new Date(Date.now() - 86400000))
  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function getWeekLabel(dateStr) {
  if (!dateStr) return 'Outro'
  const sessionDate = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

  if (sessionDate >= startOfThisWeek) return 'Esta semana'
  if (sessionDate >= startOfLastWeek) return 'Semana passada'
  const weeksAgo = Math.floor((startOfThisWeek - sessionDate) / (7 * 86400000))
  if (weeksAgo < 4) return `${weeksAgo + 1} semanas atrás`
  return 'Mais de 1 mês atrás'
}

function getRpeEmoji(rpe) {
  if (!rpe) return null
  if (rpe <= 3) return '😴'
  if (rpe <= 6) return '💪'
  if (rpe <= 9) return '🔥'
  return '💥'
}

function FormatBadge({ format }) {
  if (!format) return null
  return (
    <span
      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm"
      style={{
        background: `${FORMAT_COLORS[format] ?? '#9ca3af'}22`,
        color: FORMAT_COLORS[format] ?? '#9ca3af',
        border: `1px solid ${FORMAT_COLORS[format] ?? '#9ca3af'}44`,
      }}
    >
      {FORMAT_LABELS[format] ?? format}
    </span>
  )
}

function ExerciseDetail({ exercises }) {
  if (!exercises || exercises.length === 0) return null
  const list = Array.isArray(exercises) ? exercises : []
  return (
    <div
      className="mt-3 pt-3"
      style={{ borderTop: '1px solid var(--theme-border)' }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Exercícios
      </p>
      <div className="flex flex-col gap-1.5">
        {list.map((ex, i) => {
          const sets = ex.sets ?? []
          const hasSets = sets.length > 0
          return (
            <div key={ex.id ?? i} className="flex items-start justify-between gap-2">
              <span
                className="text-[13px] font-medium"
                style={{ color: 'var(--theme-text)' }}
              >
                {ex.name}
              </span>
              {hasSets && (
                <span
                  className="text-[11px] text-right shrink-0"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {sets
                    .filter((s) => s.reps || s.weight)
                    .map((s) => `${s.reps ?? '?'}×${s.weight ?? '?'}kg`)
                    .join(', ') || '—'}
                </span>
              )}
              {!hasSets && ex.reps && (
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {ex.reps} reps
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false)
  const exercises = session.exercises ?? []

  return (
    <button
      className="card p-4 w-full text-left transition-all duration-150 active:opacity-80"
      onClick={() => setExpanded((v) => !v)}
      style={{ display: 'block' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[11px] font-bold"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {formatDateLabel(session.session_date)}
            </span>
            <FormatBadge format={session.format} />
          </div>
          <p
            className="text-[15px] font-bold truncate"
            style={{ color: 'var(--theme-text)' }}
          >
            {session.name || 'Treino sem nome'}
          </p>
          {session.result && (
            <p
              className="text-[13px] mt-0.5"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {session.result}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {session.rpe != null && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: 'var(--theme-surface-soft)',
                color: 'var(--theme-text-muted)',
              }}
            >
              <span>{getRpeEmoji(session.rpe)}</span>
              <span>RPE {session.rpe}</span>
            </div>
          )}
          {session.duration_minutes && (
            <span
              className="text-[11px]"
              style={{ color: 'var(--theme-text-faint)' }}
            >
              {session.duration_minutes}min
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              color: 'var(--theme-text-faint)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              marginTop: 4,
            }}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {expanded && (
        <div onClick={(e) => e.stopPropagation()}>
          <ExerciseDetail exercises={exercises} />
          {session.notes && (
            <p
              className="mt-2 text-[12px]"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {session.notes}
            </p>
          )}
        </div>
      )}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex gap-2 mb-2">
        <div className="h-3 w-12 rounded" style={{ background: 'var(--theme-surface-soft)' }} />
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-surface-soft)' }} />
      </div>
      <div className="h-4 w-40 rounded mb-1" style={{ background: 'var(--theme-surface-soft)' }} />
      <div className="h-3 w-28 rounded" style={{ background: 'var(--theme-surface-soft)' }} />
    </div>
  )
}

export default function WorkoutHistory({ userId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)

    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(30)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setSessions(data ?? [])
        }
        setLoading(false)
      })
  }, [userId])

  // Group by week
  const grouped = sessions.reduce((acc, session) => {
    const weekLabel = getWeekLabel(session.session_date)
    if (!acc[weekLabel]) acc[weekLabel] = []
    acc[weekLabel].push(session)
    return acc
  }, {})

  const weekOrder = ['Esta semana', 'Semana passada']
  const sortedKeys = [
    ...weekOrder.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !weekOrder.includes(k)),
  ]

  if (!userId) {
    return (
      <div className="px-4 py-8 text-center">
        <p style={{ color: 'var(--theme-text-muted)' }}>Usuário não identificado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Histórico
        </p>
        <h2
          className="text-[22px] font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          Treinos Realizados
        </h2>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div
          className="card p-4 text-center"
          style={{ color: '#ef4444' }}
        >
          <p className="text-[14px]">Erro ao carregar histórico.</p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>{error}</p>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🏋️</p>
          <p
            className="text-[16px] font-bold mb-1"
            style={{ color: 'var(--theme-text)' }}
          >
            Nenhum treino registrado
          </p>
          <p
            className="text-[13px]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Registre seu primeiro treino e acompanhe sua evolução.
          </p>
        </div>
      )}

      {!loading && !error && sortedKeys.map((weekLabel) => (
        <div key={weekLabel}>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2 px-0"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {weekLabel}
          </p>
          <div className="flex flex-col gap-2">
            {grouped[weekLabel].map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
