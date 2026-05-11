import { useState } from 'react'
import Modal from './Modal.jsx'
import { useWater } from '../hooks/useWater.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { formatLoggedAt, todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

const QUICK_OPTIONS = [250, 500, 750, 1000]

export default function WaterModal({ userId, onClose }) {
  const { entries, total, addWater, deleteWater, editWater } = useWater(userId, todayDateString())
  const { showToast } = useToast()
  const [customMl, setCustomMl] = useState('')
  const [editId, setEditId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleQuick(ml) {
    setLoading(true)
    await addWater(ml)
    showToast(`+${ml}ml de água registrado`, 'success')
    setLoading(false)
  }

  async function handleCustom(e) {
    e.preventDefault()
    const ml = parseInt(customMl)
    if (!ml || ml <= 0) return
    setLoading(true)
    await addWater(ml)
    showToast(`+${ml}ml de água registrado`, 'success')
    setCustomMl('')
    setLoading(false)
  }

  async function handleEdit(id) {
    const ml = parseInt(editValue)
    if (!ml || ml <= 0) return
    await editWater(id, ml)
    setEditId(null)
    setEditValue('')
    showToast('Entrada atualizada', 'success')
  }

  async function handleDelete(id) {
    await deleteWater(id)
    showToast('Entrada removida', 'info')
  }

  const pct = Math.min(100, Math.round((total / PROTOCOL.WATER_GOAL_ML) * 100))
  const barColor = pct >= 100 ? '#76b900' : pct >= 50 ? '#df6500' : '#e52020'

  return (
    <Modal title="💧 Água" onClose={onClose}>
      {/* Progress summary */}
      <div className="mb-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[28px] font-bold text-theme">{(total / 1000).toFixed(1)}L</span>
          <span className="text-theme-faint text-[13px]">meta {PROTOCOL.WATER_GOAL_ML / 1000}L · {pct}%</span>
        </div>
        <div className="h-2 rounded-none overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Quick buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {QUICK_OPTIONS.map(ml => (
          <button
            key={ml}
            onClick={() => handleQuick(ml)}
            disabled={loading}
            className="py-3 border rounded-sm text-[13px] font-bold transition-colors active:bg-primary active:text-surface-dark"
            style={{ borderColor: '#76b900', color: '#76b900', backgroundColor: 'transparent' }}
          >
            +{ml >= 1000 ? '1L' : `${ml}ml`}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <form onSubmit={handleCustom} className="flex gap-2 mb-5">
        <input
          type="number"
          value={customMl}
          onChange={e => setCustomMl(e.target.value)}
          placeholder="ml personalizado"
          min="1"
          max="3000"
          step="50"
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary px-4 whitespace-nowrap">
          Adicionar
        </button>
      </form>

      {/* Today's entries */}
      {entries.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-2">Hoje</div>
          <div className="space-y-1">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-3 py-2 rounded-sm border"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-soft)' }}
              >
                {editId === entry.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="input-field flex-1 h-8 text-[13px] py-1"
                      autoFocus
                    />
                    <button onClick={() => handleEdit(entry.id)} className="text-primary font-bold text-[12px]">OK</button>
                    <button onClick={() => setEditId(null)} className="text-theme-faint text-[12px]">✕</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-[14px] font-bold text-theme">{entry.water_ml}ml</span>
                      <span className="text-[11px] text-theme-faint ml-2">{formatLoggedAt(entry.logged_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditId(entry.id); setEditValue(String(entry.water_ml)) }} className="text-theme-faint text-[12px] p-1">✏️</button>
                      <button onClick={() => handleDelete(entry.id)} className="text-error text-[12px] p-1">🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
