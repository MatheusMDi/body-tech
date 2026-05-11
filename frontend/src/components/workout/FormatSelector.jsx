import React from 'react'

const FORMATS = [
  { id: 'amrap',           label: 'AMRAP',          emoji: '🔄', desc: 'As Many Rounds As Possible' },
  { id: 'emom',            label: 'EMOM',           emoji: '⏱️', desc: 'Every Minute On the Minute' },
  { id: 'for_time',        label: 'For Time',       emoji: '⚡', desc: 'Complete no menor tempo' },
  { id: 'rounds_for_time', label: 'Rounds for Time',emoji: '🔁', desc: 'X rounds no menor tempo' },
  { id: 'chipper',         label: 'Chipper',        emoji: '🪓', desc: 'Lista longa em sequência' },
  { id: 'tabata',          label: 'Tabata',         emoji: '🔥', desc: '20s on / 10s off' },
  { id: 'strength',        label: 'Séries',         emoji: '💪', desc: 'Séries × Repetições × Carga' },
  { id: 'drop_set',        label: 'Drop Set',       emoji: '📉', desc: 'Carga decrescente' },
  { id: 'superset',        label: 'Superset',       emoji: '🔀', desc: '2+ exercícios sem descanso' },
  { id: 'pyramid',         label: 'Pirâmide',       emoji: '🔼', desc: 'Carga crescente/decrescente' },
  { id: 'custom',          label: 'Personalizado',  emoji: '✏️', desc: 'Estrutura livre' },
]

export default function FormatSelector({ selectedFormat, onChange }) {
  return (
    <div className="w-full">
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Escolha o formato
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FORMATS.map((fmt) => {
          const isSelected = selectedFormat === fmt.id
          return (
            <button
              key={fmt.id}
              onClick={() => onChange(fmt.id)}
              className="card p-4 text-left transition-all duration-150 active:scale-95"
              style={{
                borderColor: isSelected ? '#76b900' : 'var(--theme-border)',
                borderWidth: isSelected ? '2px' : '1px',
                backgroundColor: isSelected
                  ? 'rgba(118,185,0,0.08)'
                  : 'var(--theme-surface)',
              }}
            >
              <div className="text-2xl mb-1">{fmt.emoji}</div>
              <div
                className="text-[14px] font-bold leading-tight mb-0.5"
                style={{ color: isSelected ? '#76b900' : 'var(--theme-text)' }}
              >
                {fmt.label}
              </div>
              <div
                className="text-[11px] leading-tight"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {fmt.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
