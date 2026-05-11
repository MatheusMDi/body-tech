import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { useModules } from '../../../contexts/ModuleContext.jsx'

function computeStreak(records, useFasting) {
  if (!records || records.length === 0) return { current: 0, record: 0 }

  // Sort descending by date (already should be, but ensure)
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))

  let current = 0
  let record = 0
  let tempStreak = 0
  let prevDate = null

  for (const rec of sorted) {
    const meetsCondition = useFasting
      ? Array.isArray(rec.flags) && rec.flags.includes('JEJUM_COMPLETO')
      : true // if fasting inactive, count consecutive days present

    if (!meetsCondition) {
      if (tempStreak > record) record = tempStreak
      if (current === tempStreak && current > 0) {
        // We haven't broken current streak yet
      }
      tempStreak = 0
      prevDate = null
      continue
    }

    if (prevDate === null) {
      tempStreak = 1
    } else {
      // Check if consecutive
      const prev = new Date(prevDate + 'T12:00:00')
      const curr = new Date(rec.date + 'T12:00:00')
      const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        tempStreak++
      } else {
        if (tempStreak > record) record = tempStreak
        tempStreak = 1
      }
    }

    prevDate = rec.date
  }

  if (tempStreak > record) record = tempStreak

  // Current streak: streak starting from today or yesterday
  const today = new Date().toISOString().split('T')[0]
  const firstDate = sorted[0]?.date

  // If most recent record matches condition and is today or yesterday, current = tempStreak from start
  const firstMeets = useFasting
    ? Array.isArray(sorted[0]?.flags) && sorted[0]?.flags.includes('JEJUM_COMPLETO')
    : true

  if (firstDate && (firstDate === today || firstDate === getYesterday()) && firstMeets) {
    // recalculate current streak from the beginning
    current = 0
    let streak = 0
    let prev = null
    for (const rec of sorted) {
      const meets = useFasting
        ? Array.isArray(rec.flags) && rec.flags.includes('JEJUM_COMPLETO')
        : true

      if (!meets) break

      if (prev === null) {
        streak = 1
      } else {
        const prevD = new Date(prev + 'T12:00:00')
        const currD = new Date(rec.date + 'T12:00:00')
        const diff = Math.round((prevD - currD) / (1000 * 60 * 60 * 24))
        if (diff === 1) {
          streak++
        } else {
          break
        }
      }
      prev = rec.date
    }
    current = streak
  } else {
    current = 0
  }

  return { current, record }
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export default function CardStreak({ userId, layout }) {
  const { isModuleActive } = useModules()
  const [streakData, setStreakData] = useState({ current: 0, record: 0 })
  const [loading, setLoading] = useState(true)

  const fastingActive = isModuleActive('fasting')

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('daily_records')
        .select('date, flags')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(60)

      if (!cancelled) {
        setStreakData(computeStreak(data ?? [], fastingActive))
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId, fastingActive])

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
        <span className="text-lg">🔥</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Sequência
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
