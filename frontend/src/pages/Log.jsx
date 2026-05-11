import { useState } from 'react'
import MealTimeline from '../components/MealTimeline.jsx'
import { useMeals } from '../hooks/useMeals.js'
import { todayDateString, formatDateLabel } from '../lib/utils.js'
import { FLAGS } from '../lib/constants.js'

const ALL_FLAGS = { ...FLAGS.AUTO, ...FLAGS.MANUAL }

function getDateRange(days = 14) {
  const dates = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(todayDateString(d))
  }
  return dates
}

function DayRecord({ date, user }) {
  const { meals, totals, refresh } = useMeals(user?.id, date)
  const [open, setOpen] = useState(date === todayDateString())

  const allFlags = meals.flatMap(m => m.meal_flags?.map(f => f.flag) ?? [])
  const negativeFlags = [...new Set(allFlags.filter(f => ['ALCOOL', 'ACUCAR', 'ULTRAPROCESSADO', 'FORA_DA_JANELA'].includes(f)))]
  const hasFlags = negativeFlags.length > 0
  const foodMeals = meals.filter(m => !m.is_water)

  return (
    <div
      className="rounded-sm overflow-hidden border"
      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <div className="text-[15px] font-bold text-theme">{formatDateLabel(date)}</div>
          <div className="text-[11px] text-theme-faint mt-0.5">
            {foodMeals.length} refeição{foodMeals.length !== 1 ? 'ões' : ''}
            {totals.protein_g > 0 && ` · ${Math.round(totals.protein_g)}g prot`}
            {totals.water_ml > 0 && ` · ${(totals.water_ml / 1000).toFixed(1)}L água`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasFlags && <span className="text-warning text-[16px]">⚠️</span>}
          <svg
            className={`w-4 h-4 text-theme-faint transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t pt-4 space-y-2" style={{ borderColor: 'var(--theme-border)' }}>
          <MealTimeline
            meals={meals}
            totals={foodMeals.length > 0 ? totals : null}
            userId={user?.id}
            onRefresh={refresh}
          />

          {negativeFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-theme-faint mr-1">Flags:</span>
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
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-1">Histórico</div>
          <h1 className="text-[24px] font-bold text-theme">Registro Diário</h1>
        </div>
      </div>

      <div className="space-y-2">
        {dates.map(date => (
          <DayRecord key={date} date={date} user={user} />
        ))}
      </div>
    </div>
  )
}
