import { useModules } from '../../contexts/ModuleContext.jsx'

export const CARD_CATALOG = [
  { id: 'card_fasting_timer',  label: 'Timer de Jejum',     icon: '⏱️', size: 'large', module: 'fasting' },
  { id: 'card_today_timeline', label: 'Timeline do Dia',    icon: '📅', size: 'large', module: null },
  { id: 'card_cycle_status',   label: 'Status do Ciclo',    icon: '🎯', size: 'large', module: null },
  { id: 'card_wod_today',      label: 'Treino de Hoje',     icon: '🏋️', size: 'large', module: 'workout' },
  { id: 'card_score_hero',     label: 'Score do Dia',       icon: '🏅', size: 'large', module: 'score' },
  { id: 'card_water',          label: 'Água',               icon: '💧', size: 'small', module: 'water' },
  { id: 'card_protein',        label: 'Proteína',           icon: '🥩', size: 'small', module: 'nutrition' },
  { id: 'card_sleep',          label: 'Sono',               icon: '🌙', size: 'small', module: 'sleep' },
  { id: 'card_streak',         label: 'Sequência',          icon: '🔥', size: 'small', module: null },
  { id: 'card_weight',         label: 'Peso',               icon: '⚖️', size: 'small', module: 'weight' },
  { id: 'card_next_meal',      label: 'Próxima Refeição',   icon: '🍽️', size: 'small', module: 'fasting' },
  { id: 'card_supplements',    label: 'Suplementos',        icon: '💊', size: 'small', module: 'supplements' },
  { id: 'card_rules_today',    label: 'Regras de Hoje',     icon: '📋', size: 'small', module: 'rules' },
  { id: 'card_calories',       label: 'Calorias',           icon: '🔥', size: 'small', module: 'nutrition' },
  { id: 'card_workout_streak', label: 'Streak de Treino',   icon: '🏋️', size: 'small', module: 'workout' },
]

export default function CardCatalog({ onAdd, currentLayout, onClose }) {
  const { isModuleActive } = useModules()

  const currentIds = new Set((currentLayout ?? []).map(c => c.id))
  const available = CARD_CATALOG.filter(c => !currentIds.has(c.id))

  const large = available.filter(c => c.size === 'large')
  const small = available.filter(c => c.size === 'small')

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="mt-auto rounded-t-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--theme-surface)', maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--theme-text)' }}>
            Adicionar card
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {available.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--theme-text-muted)' }}>
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">Todos os cards já estão na home.</p>
            </div>
          ) : (
            <>
              {large.length > 0 && (
                <div className="mb-4">
                  <div
                    className="text-[11px] font-bold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--theme-text-faint)' }}
                  >
                    Largura completa
                  </div>
                  <div className="flex flex-col gap-2">
                    {large.map(card => (
                      <CatalogItem
                        key={card.id}
                        card={card}
                        isModuleActive={isModuleActive}
                        onAdd={onAdd}
                      />
                    ))}
                  </div>
                </div>
              )}

              {small.length > 0 && (
                <div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--theme-text-faint)' }}
                  >
                    Meia largura
                  </div>
                  <div className="flex flex-col gap-2">
                    {small.map(card => (
                      <CatalogItem
                        key={card.id}
                        card={card}
                        isModuleActive={isModuleActive}
                        onAdd={onAdd}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CatalogItem({ card, isModuleActive, onAdd }) {
  const active = isModuleActive(card.module)

  return (
    <button
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-opacity"
      style={{
        backgroundColor: 'var(--theme-surface-soft)',
        opacity: active ? 1 : 0.5,
      }}
      onClick={() => active && onAdd(card.id)}
      disabled={!active}
    >
      <span className="text-2xl">{card.icon}</span>
      <div className="flex-1">
        <div className="text-[14px] font-semibold" style={{ color: 'var(--theme-text)' }}>
          {card.label}
        </div>
        {!active && (
          <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
            Módulo inativo
          </div>
        )}
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: card.size === 'large' ? '#76b90022' : 'var(--theme-border)',
          color: card.size === 'large' ? '#76b900' : 'var(--theme-text-muted)',
        }}
      >
        {card.size === 'large' ? 'LARGO' : 'PEQUENO'}
      </span>
    </button>
  )
}
