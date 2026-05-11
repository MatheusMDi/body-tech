import { useWater } from '../../../hooks/useWater.js'
import { useSettings } from '../../../contexts/SettingsContext.jsx'
import { pct } from '../../../lib/utils.js'

export default function CardWater({ userId, layout }) {
  const { total, loading } = useWater(userId)
  const { settings } = useSettings()

  if (loading) {
    return (
      <div className="card p-3 animate-pulse" style={{ minHeight: 96 }}>
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
      </div>
    )
  }

  const goalMl = settings.waterGoalMl ?? 4000
  const progressPct = pct(total, goalMl)
  const liters = (total / 1000).toFixed(1)
  const goalL = (goalMl / 1000).toFixed(1)

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">💧</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Água
        </span>
      </div>
      <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
        {liters}
        <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
          / {goalL}L
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
