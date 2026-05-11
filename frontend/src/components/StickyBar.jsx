import { useFasting } from '../hooks/useFasting.js'
import { useMeals } from '../hooks/useMeals.js'
import { useWater } from '../hooks/useWater.js'
import { useModal } from '../contexts/ModalContext.jsx'
import { useUser } from '../contexts/UserContext.jsx'
import { formatDuration, pct, todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

function BarBlock({ label, value, unit, goal, percent, onClick, color, emoji }) {
  const clampedPct = Math.min(100, Math.max(0, percent))
  const barColor = percent >= 100 ? '#76b900' : percent >= 50 ? '#df6500' : '#e52020'

  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center px-2 py-2 active:opacity-70 transition-opacity min-w-0"
    >
      <div className="flex items-baseline gap-0.5 mb-1 w-full justify-center">
        <span className="text-[10px] mr-0.5">{emoji}</span>
        <span className="text-[13px] font-bold text-theme truncate" style={{ color }}>
          {value}
        </span>
        <span className="text-[10px] text-theme-faint">{unit}</span>
        {goal && (
          <span className="text-[9px] text-theme-faint ml-0.5">/ {goal}</span>
        )}
      </div>
      <div className="w-full h-1 rounded-none overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${clampedPct}%`, backgroundColor: barColor }}
        />
      </div>
    </button>
  )
}

export default function StickyBar() {
  const user = useUser()
  const { openModal } = useModal()
  const fasting = useFasting()
  const { totals } = useMeals(user?.id, todayDateString())
  const { total: waterTotal } = useWater(user?.id, todayDateString())

  const waterLiters = ((totals.water_ml + waterTotal) / 1000).toFixed(1)
  const waterPct = pct(totals.water_ml + waterTotal, PROTOCOL.WATER_GOAL_ML)
  const proteinPct = pct(totals.protein_g, PROTOCOL.PROTEIN_GOAL_G)

  const fastingColor = fasting.isEating ? '#76b900' : '#e52020'
  const fastingLabel = fasting.isEating
    ? `Janela: ${formatDuration(fasting.minutesUntilTransition)}`
    : `Jejum: ${formatDuration(fasting.fastingElapsedMinutes)}`

  return (
    <div
      className="sticky top-0 z-40 border-b flex items-stretch max-w-md mx-auto w-full"
      style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
    >
      {/* Fasting block — non-interactive */}
      <div className="flex-1 flex flex-col items-center px-2 py-2 min-w-0 border-r" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-baseline gap-0.5 mb-1 w-full justify-center">
          <span className="text-[10px]">⏱️</span>
          <span className="text-[13px] font-bold truncate" style={{ color: fastingColor }}>
            {fastingLabel}
          </span>
        </div>
        <div className="w-full h-1 rounded-none overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: fasting.isEating
                ? `${pct(PROTOCOL.EATING_DURATION_HOURS * 60 - fasting.minutesUntilTransition, PROTOCOL.EATING_DURATION_HOURS * 60)}%`
                : `${fasting.fastingProgressPct}%`,
              backgroundColor: fastingColor,
            }}
          />
        </div>
      </div>

      {/* Water block */}
      <div className="border-r" style={{ borderColor: 'var(--theme-border)' }}>
        <BarBlock
          emoji="💧"
          value={waterLiters}
          unit="L"
          goal={`${PROTOCOL.WATER_GOAL_ML / 1000}L`}
          percent={waterPct}
          color={waterPct >= 100 ? '#76b900' : 'var(--theme-text)'}
          onClick={() => openModal('water')}
        />
      </div>

      {/* Protein block */}
      <BarBlock
        emoji="🥩"
        value={Math.round(totals.protein_g)}
        unit="g"
        goal={`${PROTOCOL.PROTEIN_GOAL_G}g`}
        percent={proteinPct}
        color={proteinPct >= 100 ? '#76b900' : 'var(--theme-text)'}
        onClick={() => openModal('meal')}
      />
    </div>
  )
}
