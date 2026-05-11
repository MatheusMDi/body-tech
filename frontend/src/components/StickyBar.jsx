import { useFasting } from '../hooks/useFasting.js'
import { useMeals } from '../hooks/useMeals.js'
import { useWater } from '../hooks/useWater.js'
import { useModal } from '../contexts/ModalContext.jsx'
import { useUser } from '../contexts/UserContext.jsx'
import { useSettings } from '../contexts/SettingsContext.jsx'
import { formatDuration, pct, todayDateString } from '../lib/utils.js'

function BarBlock({ value, unit, goal, percent, onClick, color, emoji }) {
  const clampedPct = Math.min(100, Math.max(0, percent))
  const barColor = percent >= 100 ? '#76b900' : percent >= 50 ? '#c06010' : '#c94040'

  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center px-2 py-2 active:opacity-70 transition-opacity min-w-0"
    >
      <div className="flex items-baseline gap-0.5 mb-1 w-full justify-center">
        <span className="text-[10px] mr-0.5">{emoji}</span>
        <span className="text-[13px] font-bold truncate" style={{ color }}>
          {value}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>{unit}</span>
        {goal && (
          <span className="text-[9px] ml-0.5" style={{ color: 'var(--theme-text-faint)' }}>/ {goal}</span>
        )}
      </div>
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clampedPct}%`, backgroundColor: barColor }}
        />
      </div>
    </button>
  )
}

export default function StickyBar() {
  const user = useUser()
  const { openModal } = useModal()
  const { settings } = useSettings()
  const fasting = useFasting()
  const { totals } = useMeals(user?.id, todayDateString())
  const { total: waterTotal } = useWater(user?.id, todayDateString())

  const waterMl    = totals.water_ml + waterTotal
  const waterLiters = (waterMl / 1000).toFixed(1)
  const waterPct   = pct(waterMl, settings.waterGoalMl)
  const proteinPct = pct(totals.protein_g, settings.proteinGoalG)

  const eatDurationH = 24 - (fasting.durationH ?? 18)

  const fastingColor = fasting.isEating ? '#76b900' : '#c94040'
  const fastingLabel = fasting.isEating
    ? `Janela: ${formatDuration(fasting.minutesUntilTransition)}`
    : `Jejum: ${formatDuration(fasting.fastingElapsedMinutes)}`

  const fastingPct = fasting.isEating
    ? pct(eatDurationH * 60 - fasting.minutesUntilTransition, eatDurationH * 60)
    : fasting.fastingProgressPct

  return (
    <div
      className="sticky top-0 z-40 border-b flex items-stretch max-w-md mx-auto w-full"
      style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
    >
      {/* Fasting — non-clickable */}
      <div
        className="flex-1 flex flex-col items-center px-2 py-2 min-w-0 border-r"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex items-baseline gap-0.5 mb-1 w-full justify-center">
          <span className="text-[10px]">⏱️</span>
          <span className="text-[13px] font-bold truncate" style={{ color: fastingColor }}>
            {fastingLabel}
          </span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${fastingPct}%`, backgroundColor: fastingColor }}
          />
        </div>
      </div>

      {/* Water */}
      <div className="border-r" style={{ borderColor: 'var(--theme-border)' }}>
        <BarBlock
          emoji="💧"
          value={waterLiters}
          unit="L"
          goal={`${settings.waterGoalL.toFixed(1)}L`}
          percent={waterPct}
          color={waterPct >= 100 ? '#76b900' : 'var(--theme-text)'}
          onClick={() => openModal('water')}
        />
      </div>

      {/* Protein */}
      <BarBlock
        emoji="🥩"
        value={Math.round(totals.protein_g)}
        unit="g"
        goal={`${settings.proteinGoalG}g`}
        percent={proteinPct}
        color={proteinPct >= 100 ? '#76b900' : 'var(--theme-text)'}
        onClick={() => openModal('meal')}
      />
    </div>
  )
}
