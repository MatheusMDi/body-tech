export default function RuleCard({ rule, dailyStatus, onToggle, onEdit, onDelete }) {
  const statusColors = {
    completed: '#76b900',
    failed:    '#c94040',
    skipped:   'var(--theme-text-faint)',
  }

  const color = statusColors[dailyStatus] ?? 'var(--theme-border)'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: `1px solid ${dailyStatus ? color : 'var(--theme-border)'}`,
        opacity: dailyStatus === 'skipped' ? 0.5 : 1,
      }}
    >
      <span className="text-[20px] shrink-0">{rule.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--theme-text)' }}>
          {rule.name}
        </div>
        <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
          {rule.type === 'bonus'
            ? `+${rule.points_on_success}pts`
            : `+${rule.points_on_success} / -${rule.points_on_failure}pts`
          }
        </div>
      </div>

      {onToggle && (
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onToggle('completed')}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[14px]"
            style={{
              backgroundColor: dailyStatus === 'completed' ? '#76b900' : 'var(--theme-surface-soft)',
              border: `1px solid ${dailyStatus === 'completed' ? '#76b900' : 'var(--theme-border)'}`,
            }}
            title="Cumpri"
          >
            ✓
          </button>
          {rule.type !== 'bonus' && (
            <button
              onClick={() => onToggle('failed')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[14px]"
              style={{
                backgroundColor: dailyStatus === 'failed' ? '#c94040' : 'var(--theme-surface-soft)',
                border: `1px solid ${dailyStatus === 'failed' ? '#c94040' : 'var(--theme-border)'}`,
              }}
              title="Quebrei"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--theme-text-faint)', backgroundColor: 'var(--theme-surface-soft)' }}
        >
          ✎
        </button>
      )}
    </div>
  )
}
