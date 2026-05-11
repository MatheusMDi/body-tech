import { ALL_MANUAL_FLAGS } from '../lib/constants.js'

const FLAG_COLOR_MAP = {
  error: 'border-error text-error',
  warning: 'border-warning text-warning',
  success: 'border-primary text-primary',
}

export default function FlagSelector({ selected, onChange }) {
  function toggle(flagId) {
    if (selected.includes(flagId)) {
      onChange(selected.filter(f => f !== flagId))
    } else {
      onChange([...selected, flagId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_MANUAL_FLAGS.map(flag => {
        const active = selected.includes(flag.id)
        const colorClass = FLAG_COLOR_MAP[flag.color] || 'border-hairline-strong text-on-dark-mute'
        return (
          <button
            key={flag.id}
            type="button"
            onClick={() => toggle(flag.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[11px] font-bold uppercase tracking-wide transition-all ${
              active
                ? `${colorClass} bg-surface-elevated`
                : 'border-hairline-strong text-stone bg-transparent'
            }`}
          >
            <span>{flag.emoji}</span>
            <span>{flag.label}</span>
          </button>
        )
      })}
    </div>
  )
}
