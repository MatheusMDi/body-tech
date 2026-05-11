import { useMeals } from '../../../hooks/useMeals.js'
import { useSettings } from '../../../contexts/SettingsContext.jsx'
import { todayDateString, pct } from '../../../lib/utils.js'

export default function CardProtein({ userId, layout }) {
  const { totals, loading } = useMeals(userId, todayDateString())
  const { settings } = useSettings()

  if (loading) {
    return (
      <div className="card p-3 animate-pulse" style={{ minHeight: 96 }}>
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
      </div>
    )
  }

  const goal = settings.proteinGoalG ?? 160
  const current = Math.round(totals.protein_g ?? 0)
  const progressPct = pct(current, goal)

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🥩</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Proteína
        </span>
      </div>
      <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
        {current}
        <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
          / {goal}g
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-1 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
        {progressPct}% da meta
      </div>
    </div>
  )
}
