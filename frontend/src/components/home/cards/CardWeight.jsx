import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'

export default function CardWeight({ userId, layout }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('body_metrics')
        .select('weight_kg, measured_at')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(2)

      if (!cancelled) {
        setEntries(data ?? [])
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

  const latest = entries[0]
  const previous = entries[1]

  const weight = latest?.weight_kg ?? null
  const delta = weight != null && previous?.weight_kg != null
    ? weight - previous.weight_kg
    : null

  const deltaColor = delta == null ? 'var(--theme-text-muted)' : delta < 0 ? '#76b900' : delta > 0 ? '#ef4444' : 'var(--theme-text-muted)'
  const deltaSign = delta != null && delta > 0 ? '+' : ''

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">⚖️</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Peso
        </span>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
          {weight != null ? weight.toFixed(1) : '—'}
          {weight != null && (
            <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>kg</span>
          )}
        </div>
        {delta != null && (
          <span className="text-[12px] font-semibold mb-0.5" style={{ color: deltaColor }}>
            {deltaSign}{delta.toFixed(1)}kg
          </span>
        )}
      </div>

      <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
        {weight == null ? 'Sem medições' : delta != null ? 'vs. medição anterior' : 'Última medição'}
      </div>
    </div>
  )
}
