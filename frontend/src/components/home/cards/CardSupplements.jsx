import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { useSettings } from '../../../contexts/SettingsContext.jsx'
import { todayDateString } from '../../../lib/utils.js'

export default function CardSupplements({ userId, layout }) {
  const { settings } = useSettings()
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('daily_records')
        .select('flags')
        .eq('user_id', userId)
        .eq('date', todayDateString())
        .single()

      if (!cancelled) {
        setFlags(data?.flags ?? [])
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

  const activeSupplements = settings.activeSupplements ?? []
  const total = activeSupplements.length

  // Count how many supplements are in flags (flag format assumed to be supplement name uppercased)
  const taken = total === 0
    ? 0
    : activeSupplements.filter(supp => {
        const flagKey = supp.toUpperCase().replace(/\s+/g, '_')
        return flags.includes(flagKey) || flags.includes(supp)
      }).length

  const progressPct = total === 0 ? 0 : Math.round((taken / total) * 100)

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">💊</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Suplementos
        </span>
      </div>

      {total === 0 ? (
        <div className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
          Nenhum configurado
        </div>
      ) : (
        <>
          <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
            {taken}
            <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              /{total}
            </span>
          </div>
          <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div
              className="h-1 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            {taken === total ? 'Todos tomados ✓' : `${total - taken} restante${total - taken !== 1 ? 's' : ''}`}
          </div>
        </>
      )}
    </div>
  )
}
