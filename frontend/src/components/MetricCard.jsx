export default function MetricCard({ label, value, unit, goal, pct, color = 'primary', emoji }) {
  const barColor = color === 'primary' ? 'bg-primary' : color === 'error' ? 'bg-error' : 'bg-primary'

  return (
    <div className="relative card-dark border border-hairline-strong rounded-sm p-4 overflow-hidden">
      <div className="corner-square bottom-0 right-0" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-mute mb-1">
            {emoji && <span className="mr-1">{emoji}</span>}{label}
          </div>
          <div className="text-[28px] font-bold leading-[1] text-on-dark">
            {value}<span className="text-[14px] text-mute ml-1">{unit}</span>
          </div>
        </div>
        {pct !== undefined && (
          <div className="text-[22px] font-bold text-primary">{pct}%</div>
        )}
      </div>

      {goal !== undefined && (
        <>
          <div className="h-1 bg-surface-elevated rounded-none overflow-hidden mb-1">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.min(100, pct ?? 0)}%` }}
            />
          </div>
          <div className="text-[10px] text-stone">Meta: {goal} {unit}</div>
        </>
      )}
    </div>
  )
}
