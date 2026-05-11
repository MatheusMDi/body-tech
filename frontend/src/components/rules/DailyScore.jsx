import { useState, useEffect } from 'react'
import { getDailyScore, recalculateDailyScore } from '../../services/scores.js'
import { todayDateString } from '../../lib/utils.js'

export default function DailyScore({ userId }) {
  const [score, setScore] = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    if (!userId) return
    const date = todayDateString()
    getDailyScore(userId, date).then(data => {
      if (data) setScore(data)
      else {
        // Seed initial score
        recalculateDailyScore(userId, date).then(setScore)
      }
    })
  }, [userId])

  if (!score) return null

  const final = score.final_score
  const barColor = final >= 100 ? '#76b900' : final >= 70 ? '#c06010' : '#c94040'
  const barPct   = Math.min(150, Math.max(0, final))

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        borderRadius: '16px',
      }}
    >
      <button
        className="w-full px-5 py-4 text-left"
        onClick={() => setShowBreakdown(v => !v)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-faint)' }}>
            Score do Dia
          </span>
          <span className="font-bold text-[22px]" style={{ color: barColor }}>
            {final}pts
          </span>
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, barPct)}%`, backgroundColor: barColor }}
          />
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            +{score.bonus_points} bônus · -{score.penalty_points} penalidades
          </span>
          <span className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            {showBreakdown ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {showBreakdown && Object.keys(score.breakdown ?? {}).length > 0 && (
        <div className="px-5 pb-4 pt-0 space-y-1" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wide pt-3 mb-2" style={{ color: 'var(--theme-text-faint)' }}>
            Detalhamento
          </div>
          {Object.entries(score.breakdown).map(([name, pts]) => (
            <div key={name} className="flex justify-between">
              <span className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>{name}</span>
              <span
                className="text-[13px] font-bold"
                style={{ color: pts.startsWith('+') ? '#76b900' : '#c94040' }}
              >
                {pts}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
