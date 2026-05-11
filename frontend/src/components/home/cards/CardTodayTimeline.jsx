import { useMemo } from 'react'
import { useSettings } from '../../../contexts/SettingsContext.jsx'
import { useMeals } from '../../../hooks/useMeals.js'
import { todayDateString } from '../../../lib/utils.js'

const HOURS = Array.from({ length: 25 }, (_, i) => i) // 0..24

function hourToPercent(hour) {
  return (hour / 24) * 100
}

function timeToPercent(hour, minute = 0) {
  return ((hour * 60 + minute) / (24 * 60)) * 100
}

export default function CardTodayTimeline({ userId, layout }) {
  const { settings } = useSettings()
  const { meals } = useMeals(userId, todayDateString())

  const now = new Date()
  const nowPct = timeToPercent(now.getHours(), now.getMinutes())

  const { fastStartHour, fastEndHour } = settings

  // Determine eating and fasting blocks
  // Eating window: fastEndHour → fastStartHour
  // Fasting window: fastStartHour → fastEndHour (next day, wraps midnight)
  const blocks = useMemo(() => {
    const result = []

    if (fastEndHour < fastStartHour) {
      // Eating: fastEndHour to fastStartHour (no midnight wrap)
      result.push({
        type: 'eating',
        left: hourToPercent(fastEndHour),
        width: hourToPercent(fastStartHour - fastEndHour),
      })
      // Fasting: 0 to fastEndHour
      result.push({
        type: 'fasting',
        left: 0,
        width: hourToPercent(fastEndHour),
      })
      // Fasting: fastStartHour to 24
      result.push({
        type: 'fasting',
        left: hourToPercent(fastStartHour),
        width: hourToPercent(24 - fastStartHour),
      })
    } else {
      // Eating window wraps midnight (fastEndHour > fastStartHour)
      result.push({
        type: 'fasting',
        left: hourToPercent(fastEndHour),
        width: hourToPercent(fastStartHour - fastEndHour),
      })
      result.push({
        type: 'eating',
        left: 0,
        width: hourToPercent(fastEndHour),
      })
      result.push({
        type: 'eating',
        left: hourToPercent(fastStartHour),
        width: hourToPercent(24 - fastStartHour),
      })
    }

    return result
  }, [fastStartHour, fastEndHour])

  // Meal markers
  const mealMarkers = useMemo(() => {
    return meals.map(meal => {
      const d = new Date(meal.logged_at)
      const pct = timeToPercent(d.getHours(), d.getMinutes())
      return { id: meal.id, pct, description: meal.description }
    })
  }, [meals])

  // Hour labels to show
  const hourLabels = [0, 6, 12, 18, 24]

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📅</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Timeline do Dia
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-8 rounded-lg overflow-hidden mb-1" style={{ backgroundColor: 'var(--theme-border)' }}>
        {/* Fasting/eating blocks */}
        {blocks.map((block, i) => (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{
              left: `${block.left}%`,
              width: `${block.width}%`,
              backgroundColor: block.type === 'eating' ? '#76b90033' : '#ef444433',
            }}
          />
        ))}

        {/* Meal dots */}
        {mealMarkers.map(marker => (
          <div
            key={marker.id}
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 z-10"
            style={{
              left: `${marker.pct}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#76b900',
              borderColor: 'var(--theme-surface)',
            }}
            title={marker.description}
          />
        ))}

        {/* Now indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 z-20"
          style={{
            left: `${nowPct}%`,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
      </div>

      {/* Hour labels */}
      <div className="relative h-4">
        {hourLabels.map(h => (
          <span
            key={h}
            className="absolute text-[10px]"
            style={{
              left: `${hourToPercent(h)}%`,
              transform: h === 0 ? 'none' : h === 24 ? 'translateX(-100%)' : 'translateX(-50%)',
              color: 'var(--theme-text-faint)',
            }}
          >
            {h === 24 ? '24h' : `${String(h).padStart(2, '0')}h`}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#76b90033', border: '1px solid #76b90066' }} />
          <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Janela</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef444433', border: '1px solid #ef444466' }} />
          <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Jejum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#76b900' }} />
          <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
            {meals.length} refeição{meals.length !== 1 ? 'ões' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
