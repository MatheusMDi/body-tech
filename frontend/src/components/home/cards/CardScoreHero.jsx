import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { todayDateString } from '../../../lib/utils.js'

function Skeleton() {
  return (
    <div className="card p-4 animate-pulse" style={{ minHeight: 140 }}>
      <div className="h-3 w-20 rounded mb-4" style={{ background: 'var(--theme-border)' }} />
      <div className="h-16 w-16 rounded-full mx-auto mb-2" style={{ background: 'var(--theme-border)' }} />
    </div>
  )
}

function scoreColor(score) {
  if (score >= 100) return '#76b900'
  if (score >= 70) return '#f59e0b'
  return '#ef4444'
}

export default function CardScoreHero({ userId, layout }) {
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayDateString())
        .single()

      if (!cancelled) {
        setScore(data ?? null)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <Skeleton />

  const value = score?.total_score ?? score?.score ?? 0
  const color = scoreColor(value)
  const pct = Math.min(100, Math.max(0, value))

  // SVG ring params
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="card p-4 flex flex-col items-center">
      <div className="w-full flex items-center gap-2 mb-4">
        <span className="text-xl">🏅</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Score de hoje
        </span>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <svg width={120} height={120} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Track */}
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="var(--theme-border)"
            strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <span
            className="text-[36px] font-black tabular-nums leading-none"
            style={{ color }}
          >
            {value}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>pts</span>
        </div>
      </div>

      {score && (
        <div className="mt-3 flex gap-4 text-center">
          {score.compliance_pct != null && (
            <div>
              <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Compliance</div>
              <div className="text-[14px] font-bold" style={{ color: 'var(--theme-text)' }}>
                {Math.round(score.compliance_pct)}%
              </div>
            </div>
          )}
          {score.bonus_points != null && score.bonus_points > 0 && (
            <div>
              <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>Bônus</div>
              <div className="text-[14px] font-bold" style={{ color: '#76b900' }}>
                +{score.bonus_points}
              </div>
            </div>
          )}
        </div>
      )}

      {!score && (
        <p className="mt-3 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Score ainda não calculado
        </p>
      )}
    </div>
  )
}
