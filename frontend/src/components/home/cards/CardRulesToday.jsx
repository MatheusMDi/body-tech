import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { todayDateString } from '../../../lib/utils.js'

export default function CardRulesToday({ userId, layout }) {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('daily_rules')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayDateString())

      if (!cancelled) {
        setRules(data ?? [])
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

  const total = rules.length
  const completed = rules.filter(r => r.completed || r.is_completed || r.done).length
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">📋</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Regras
        </span>
      </div>

      {total === 0 ? (
        <div className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
          Nenhuma regra hoje
        </div>
      ) : (
        <>
          <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
            {completed}
            <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              /{total}
            </span>
          </div>

          {/* Dot indicators */}
          <div className="flex flex-wrap gap-1">
            {rules.map((rule, i) => {
              const done = rule.completed || rule.is_completed || rule.done
              return (
                <div
                  key={rule.id ?? i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: done ? '#76b900' : 'var(--theme-border)' }}
                />
              )
            })}
          </div>

          <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            {completed === total ? 'Todas concluídas ✓' : `${progressPct}% completo`}
          </div>
        </>
      )}
    </div>
  )
}
