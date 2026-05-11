import { useState, useEffect } from 'react'
import { useFasting } from '../../../hooks/useFasting.js'
import { useModules } from '../../../contexts/ModuleContext.jsx'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export default function CardNextMeal({ userId, layout }) {
  const { isModuleActive } = useModules()
  const fasting = useFasting()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s + 1) % 60)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isModuleActive('fasting')) {
    return (
      <div className="card p-3 flex items-center justify-center min-h-[96px]">
        <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
          Módulo de jejum inativo
        </span>
      </div>
    )
  }

  const { isEating, minutesUntilTransition, fastEndHour } = fasting

  if (isEating) {
    return (
      <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🍽️</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Próx. Refeição
          </span>
        </div>
        <div className="text-[18px] font-bold" style={{ color: '#76b900' }}>
          Agora ✅
        </div>
        <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
          Janela de alimentação aberta
        </div>
      </div>
    )
  }

  const h = Math.floor(minutesUntilTransition / 60)
  const m = minutesUntilTransition % 60
  const s = 59 - seconds
  const countdown = `${pad2(h)}:${pad2(m)}:${pad2(s)}`

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🍽️</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Próx. Refeição
        </span>
      </div>
      <div className="text-[20px] font-bold tabular-nums" style={{ color: 'var(--theme-text)' }}>
        {countdown}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
        Janela abre às {pad2(fastEndHour)}:00
      </div>
    </div>
  )
}
