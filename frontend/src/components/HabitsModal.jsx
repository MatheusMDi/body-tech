import Modal from './Modal.jsx'
import { useHabits } from '../hooks/useHabits.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { todayDateString } from '../lib/utils.js'

const HABIT_GROUPS = [
  {
    label: 'Suplementos',
    items: [
      { id: 'CREATINA',       emoji: '💊', label: 'Creatina',              positive: true },
      { id: 'ZMA',            emoji: '💊', label: 'ZMA',                   positive: true },
      { id: 'OMEGA3',         emoji: '💊', label: 'Ômega-3',               positive: true },
      { id: 'MULTIVITAMINICO',emoji: '💊', label: 'Multivitamínico',       positive: true },
      { id: 'D3K2',           emoji: '💊', label: 'D3/K2',                 positive: true },
    ],
  },
  {
    label: 'Treino e movimento',
    items: [
      { id: 'TREINO_FEITO',   emoji: '🏋️', label: 'Treino feito',         positive: true },
      { id: 'CAMINHADA_JEJUM',emoji: '🚶', label: 'Caminhada em jejum',    positive: true },
    ],
  },
  {
    label: 'Flags negativas',
    items: [
      { id: 'ALCOOL',         emoji: '🚨', label: 'Álcool',                positive: false },
      { id: 'ACUCAR',         emoji: '🍬', label: 'Açúcar',                positive: false },
      { id: 'ULTRAPROCESSADO',emoji: '🍕', label: 'Ultraprocessado',       positive: false },
    ],
  },
]

export default function HabitsModal({ userId, onClose }) {
  const { isOn, toggleFlag, loading } = useHabits(userId, todayDateString())
  const { showToast } = useToast()

  async function handleToggle(item) {
    await toggleFlag(item.id)
    const nowOn = !isOn(item.id)
    showToast(
      `${item.emoji} ${item.label}: ${nowOn ? 'marcado' : 'desmarcado'}`,
      item.positive ? 'success' : 'warning'
    )
  }

  return (
    <Modal title="✅ Hábitos do Dia" onClose={onClose}>
      <div className="space-y-5">
        {HABIT_GROUPS.map(group => (
          <div key={group.label}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-2">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map(item => {
                const on = isOn(item.id)
                const activeStyle = on
                  ? item.positive
                    ? { backgroundColor: '#76b900', borderColor: '#76b900', color: '#000' }
                    : { backgroundColor: '#e52020', borderColor: '#e52020', color: '#fff' }
                  : { backgroundColor: 'var(--theme-surface-soft)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-3 border rounded-sm text-[13px] font-bold transition-all duration-150 active:scale-95"
                    style={activeStyle}
                  >
                    <span className="text-[18px]">{item.emoji}</span>
                    <span className="leading-tight text-left">{item.label}</span>
                    {on && (
                      <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
