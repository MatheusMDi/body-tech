import { useState } from 'react'
import Modal from '../Modal.jsx'
import { PREDEFINED_RULES, PREDEFINED_BONUSES } from '../../services/rules.js'

export default function RulesCatalog({ existingKeys, onAdd, onClose }) {
  const [tab, setTab] = useState('restrictions')
  const [adding, setAdding] = useState(null)

  const categories = {
    restrictions: PREDEFINED_RULES.filter(r => r.type === 'restriction'),
    habits:       PREDEFINED_RULES.filter(r => r.type === 'habit'),
    bonuses:      PREDEFINED_BONUSES,
  }

  async function handleAdd(rule) {
    if (existingKeys.includes(rule.key)) return
    setAdding(rule.key)
    await onAdd(rule)
    setAdding(null)
  }

  return (
    <Modal title="Catálogo de Regras" onClose={onClose}>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-soft)' }}>
        {[
          { key: 'restrictions', label: 'Restrições' },
          { key: 'habits',       label: 'Hábitos' },
          { key: 'bonuses',      label: 'Bônus' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
            style={{
              backgroundColor: tab === t.key ? 'var(--theme-surface)' : 'transparent',
              color: tab === t.key ? '#76b900' : 'var(--theme-text-faint)',
              border: tab === t.key ? '1px solid var(--theme-border)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
        {categories[tab].map(rule => {
          const already = existingKeys.includes(rule.key)
          return (
            <div
              key={rule.key}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: already ? 'rgba(118,185,0,0.07)' : 'var(--theme-surface)',
                border: `1px solid ${already ? '#76b900' : 'var(--theme-border)'}`,
                opacity: already ? 0.6 : 1,
              }}
            >
              <span className="text-[20px]">{rule.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--theme-text)' }}>{rule.name}</div>
                <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
                  +{rule.points_on_success} pts{rule.type !== 'bonus' ? ` / -${rule.points_on_failure} pts` : ''}
                </div>
              </div>
              <button
                onClick={() => handleAdd(rule)}
                disabled={already || adding === rule.key}
                className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
                style={{
                  backgroundColor: already ? 'transparent' : '#76b900',
                  color: already ? 'var(--theme-text-faint)' : '#000',
                  opacity: adding === rule.key ? 0.6 : 1,
                }}
              >
                {already ? '✓' : adding === rule.key ? '...' : 'Adicionar'}
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
