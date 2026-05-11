import { useSleep } from '../../../hooks/useSleep.js'

function qualityEmoji(quality) {
  if (quality >= 4) return '😊'
  if (quality >= 3) return '😐'
  return '😴'
}

export default function CardSleep({ userId, layout }) {
  const { entry, loading } = useSleep(userId)

  if (loading) {
    return (
      <div className="card p-3 animate-pulse" style={{ minHeight: 96 }}>
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
      </div>
    )
  }

  const hours = entry?.hours_slept ?? null
  const quality = entry?.quality ?? null
  const displayHours = hours != null ? hours.toFixed(1) : '—'

  const hoursColor = hours == null
    ? 'var(--theme-text-muted)'
    : hours >= 7
    ? '#76b900'
    : hours >= 6
    ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🌙</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Sono
        </span>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-[22px] font-bold" style={{ color: hoursColor }}>
          {displayHours}
          {hours != null && (
            <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>h</span>
          )}
        </div>
        {quality != null && (
          <span className="text-lg mb-0.5">{qualityEmoji(quality)}</span>
        )}
      </div>

      {hours == null ? (
        <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
          Sem registro hoje
        </div>
      ) : (
        <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
          {hours >= 7 ? 'Boa noite de sono' : hours >= 6 ? 'Poderia ser melhor' : 'Sono insuficiente'}
        </div>
      )}
    </div>
  )
}
