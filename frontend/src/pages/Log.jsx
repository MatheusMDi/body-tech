import { useState } from 'react'
import MealTimeline from '../components/MealTimeline.jsx'
import { useMeals } from '../hooks/useMeals.js'
import { todayDateString, formatDateLabel } from '../lib/utils.js'
import { FLAGS } from '../lib/constants.js'

const ALL_FLAGS = { ...FLAGS.AUTO, ...FLAGS.MANUAL }

function getDateRange(days = 7) {
  const dates = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(todayDateString(d))
  }
  return dates
}

function DayRecord({ date, user }) {
  const { meals, totals } = useMeals(user?.id, date)
  const [open, setOpen] = useState(date === todayDateString())

  const allFlags = meals.flatMap(m => m.meal_flags?.map(f => f.flag) ?? [])
  const negativeFlags = allFlags.filter(f => ['ALCOOL', 'ACUCAR', 'ULTRAPROCESSADO', 'FORA_DA_JANELA'].includes(f))
  const hasFlags = negativeFlags.length > 0

  return (
    <div className="card-dark border border-hairline-strong rounded-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[15px] font-bold text-on-dark">{formatDateLabel(date)}</div>
            <div className="text-[11px] text-mute mt-0.5">
              {meals.length} refeição{meals.length !== 1 ? 'ões' : ''}
              {totals.protein_g > 0 && ` · ${Math.round(totals.protein_g)}g prot`}
              {totals.water_ml > 0 && ` · ${(totals.water_ml / 1000).toFixed(1)}L água`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasFlags && (
            <span className="text-warning text-[18px]">⚠️</span>
          )}
          <svg
            className={`w-4 h-4 text-stone transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-hairline-strong pt-4 space-y-2">
          <MealTimeline meals={meals} totals={meals.length > 0 ? totals : null} />

          {negativeFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-mute mr-1">Flags:</span>
              {negativeFlags.map(f => {
                const flag = ALL_FLAGS[f]
                return (
                  <span key={f} className="text-warning text-[12px] font-bold">
                    {flag?.emoji} {flag?.label ?? f}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Log({ user }) {
  const dates = getDateRange(14)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-mute mb-1">Histórico</div>
          <h1 className="text-[24px] font-bold text-on-dark">Registro Diário</h1>
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-2">
        {dates.map(date => (
          <DayRecord key={date} date={date} user={user} />
        ))}
      </div>
    </div>
  )
}
