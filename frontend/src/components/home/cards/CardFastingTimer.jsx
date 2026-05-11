import { useState, useEffect } from 'react'
import { useFasting } from '../../../hooks/useFasting.js'
import { useModules } from '../../../contexts/ModuleContext.jsx'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatCountdown(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const s = 0 // useFasting tracks minutes; we animate seconds locally
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

export default function CardFastingTimer({ userId, layout }) {
  const { isModuleActive } = useModules()
  const fasting = useFasting()
  const [seconds, setSeconds] = useState(0)

  // Tick seconds locally for smooth display
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s + 1) % 60)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isModuleActive('fasting')) {
    return (
      <div className="card p-4 flex items-center justify-center min-h-[96px]">
        <span className="text-sm" style={{ color: 'var(--theme-text-faint)' }}>
          Módulo de Jejum inativo
        </span>
      </div>
    )
  }

  const { state, isEating, minutesUntilTransition, fastingProgressPct, fastingElapsedMinutes, durationH, fastEndHour, fastStartHour } = fasting

  const remainingH = Math.floor(minutesUntilTransition / 60)
  const remainingM = minutesUntilTransition % 60
  const remainingS = isEating ? seconds : (59 - seconds)

  const countdownDisplay = `${pad2(remainingH)}:${pad2(remainingM)}:${pad2(remainingS)}`

  const progressPct = isEating
    ? Math.min(100, ((durationH * 60 - minutesUntilTransition) / (durationH * 60)) * 100)
    : Math.min(100, fastingProgressPct)

  const stateColor = isEating ? '#76b900' : '#f59e0b'
  const stateLabel = isEating ? 'Janela aberta' : 'Em jejum'
  const nextLabel = isEating
    ? `Janela fecha às ${pad2(fastStartHour)}:00`
    : `Janela abre às ${pad2(fastEndHour)}:00`

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏱️</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Jejum Intermitente
          </span>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: stateColor + '22', color: stateColor }}
        >
          {stateLabel}
        </span>
      </div>

      <div
        className="text-[42px] font-black tabular-nums leading-none mb-1"
        style={{ color: 'var(--theme-text)' }}
      >
        {countdownDisplay}
      </div>

      <div className="text-[13px] mb-4" style={{ color: 'var(--theme-text-muted)' }}>
        {nextLabel}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{
            width: `${progressPct}%`,
            backgroundColor: isEating ? '#76b900' : '#f59e0b',
          }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
          {isEating ? 'Início da janela' : 'Início do jejum'}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
          {isEating ? `${durationH}h janela` : `${durationH}h jejum`}
        </span>
      </div>
    </div>
  )
}
