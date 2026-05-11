import { formatLoggedAt } from '../lib/utils.js'
import { FLAGS } from '../lib/constants.js'

const ALL_FLAGS = { ...FLAGS.AUTO, ...FLAGS.MANUAL }

function FlagChip({ flagId }) {
  const flag = ALL_FLAGS[flagId]
  if (!flag) return <span className="badge-tag">{flagId}</span>

  const colorMap = {
    error: 'border-error text-error',
    warning: 'border-warning text-warning',
    success: 'border-primary text-primary',
    mute: 'border-hairline-strong text-stone',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-sm text-[10px] font-bold uppercase ${colorMap[flag.color] || 'border-hairline-strong text-stone'}`}>
      {flag.emoji} {flag.label}
    </span>
  )
}

export default function MealTimeline({ meals, totals }) {
  if (!meals || meals.length === 0) {
    return (
      <div className="card-dark border border-hairline-strong rounded-sm px-6 py-8 text-center">
        <div className="text-[32px] mb-2">🍽️</div>
        <div className="text-stone text-[14px]">Nenhuma refeição registrada hoje</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {meals.map((meal, i) => {
        const mealFlags = meal.meal_flags?.map(f => f.flag) ?? []
        const hasNegativeFlag = mealFlags.some(f => ['ALCOOL', 'ACUCAR', 'ULTRAPROCESSADO', 'FORA_DA_JANELA'].includes(f))

        return (
          <div
            key={meal.id}
            className={`card-dark border rounded-sm p-4 relative overflow-hidden ${
              hasNegativeFlag ? 'border-warning' : 'border-hairline-strong'
            }`}
          >
            {i === 0 && <div className="corner-square top-0 left-0" />}

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-[13px]">{formatLoggedAt(meal.logged_at)}</span>
                {meal.is_outside_window && (
                  <span className="badge-tag border border-warning text-warning">Fora da janela</span>
                )}
              </div>
            </div>

            <div className="text-on-dark text-[15px] font-bold mb-2">{meal.description}</div>

            <div className="flex gap-4 text-[12px] text-stone mb-2">
              {meal.protein_g > 0 && (
                <span className="text-primary">🥩 {meal.protein_g}g proteína</span>
              )}
              {meal.water_ml > 0 && (
                <span className="text-link-blue">💧 {meal.water_ml}ml água</span>
              )}
            </div>

            {mealFlags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {mealFlags.map(f => <FlagChip key={f} flagId={f} />)}
              </div>
            )}
          </div>
        )
      })}

      {/* Daily totals */}
      {totals && (
        <div className="card-dark border border-primary rounded-sm px-4 py-3 flex gap-6">
          <div className="text-[12px]">
            <span className="text-mute uppercase tracking-wide text-[10px] font-bold block">Total Proteína</span>
            <span className="text-primary font-bold text-[18px]">{Math.round(totals.protein_g)}g</span>
          </div>
          <div className="text-[12px]">
            <span className="text-mute uppercase tracking-wide text-[10px] font-bold block">Total Água</span>
            <span className="text-on-dark font-bold text-[18px]">{(totals.water_ml / 1000).toFixed(1)}L</span>
          </div>
        </div>
      )}
    </div>
  )
}
