import { CYCLE_TYPES } from '../../constants/cyclePresets.js'

export default function CycleSelector({ onSelect }) {
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-4"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Escolha o tipo de ciclo
      </p>

      <div className="grid grid-cols-2 gap-3">
        {CYCLE_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => onSelect(ct.id)}
            className="card text-left p-4 border-2 transition-all duration-150 hover:border-primary active:border-primary hover:bg-primary/5 active:bg-primary/5 focus:outline-none"
            style={{ borderColor: 'var(--theme-border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#76b900'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--theme-border)'
            }}
          >
            <div className="text-2xl mb-2">{ct.emoji}</div>
            <div
              className="font-bold text-[14px] leading-tight mb-1"
              style={{ color: 'var(--theme-text)' }}
            >
              {ct.name}
            </div>
            <div
              className="text-[11px] leading-snug"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {ct.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
