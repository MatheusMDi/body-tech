import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'

function computeWorkoutStreak(sessions) {
  if (!sessions || sessions.length === 0) return { current: 0, record: 0 }

  // Get unique dates descending
  const uniqueDates = [...new Set(sessions.map(s => s.session_date))].sort((a, b) => b.localeCompare(a))

  const today = new Date().toISOString().split('T')[0]
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  })()

  let current = 0
  let record = 0
  let streak = 0
  let prevDate = null

  for (const date of uniqueDates) {
    if (prevDate === null) {
      streak = 1
    } else {
      const prev = new Date(prevDate + 'T12:00:00')
      const curr = new Date(date + 'T12:00:00')
      const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        streak++
      } else {
        if (streak > record) record = streak
        streak = 1
      }
    }
    prevDate = date
  }

  if (streak > record) record = streak

  // Current streak only if it includes today or yesterday
  const firstDate = uniqueDates[0]
  if (firstDate === today || firstDate === yesterday) {
    let s = 0
    let prev = null
    for (const date of uniqueDates) {
      if (prev === null) {
        s = 1
      } else {
        const prevD = new Date(prev + 'T12:00:00')
        const currD = new Date(date + 'T12:00:00')
        const diff = Math.round((prevD - currD) / (1000 * 60 * 60 * 24))
        if (diff === 1) {
          s++
        } else {
          break
        }
      }
      prev = date
    }
    current = s
  } else {
    current = 0
  }

  return { current, record }
}

export default function CardWorkoutStreak({ userId, layout }) {
  const [streakData, setStreakData] = useState({ current: 0, record: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(30)

      if (!cancelled) {
        setStreakData(computeWorkoutStreak(data ?? []))
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  if (loading) {
    return (
      <div className="card p-3 animate-pulse" style={{ minHeight: 96 }}>
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
      </div>
    )
  }

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🏋️</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Streak Treino
        </span>
      </div>
      <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
        {streakData.current}
        <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
          {streakData.current === 1 ? 'dia' : 'dias'}
        </span>
      </div>
      <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
        Recorde: {streakData.record} {streakData.record === 1 ? 'dia' : 'dias'}
      </div>
    </div>
  )
}
