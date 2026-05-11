import { useState } from 'react'
import Modal from '../Modal.jsx'

const EMOJIS = ['🚫','✅','💪','🌙','📚','🧘','🚿','👟','📵','📝','🥩','💧','🏃','🤸','⭐','🎯','🔥','💊','🧖','🚶']

export default function CreateRuleModal({ onSave, onClose, initialData }) {
  const [name,    setName]    = useState(initialData?.name     ?? '')
  const [emoji,   setEmoji]   = useState(initialData?.emoji    ?? '🎯')
  const [type,    setType]    = useState(initialData?.type     ?? 'habit')
  const [success, setSuccess] = useState(String(initialData?.points_on_success ?? 5))
  const [failure, setFailure] = useState(String(initialData?.points_on_failure ?? 5))
  const [saving,  setSaving]  = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name: name.trim(),
      emoji,
      type,
      points_on_success: parseInt(success) || 5,
      points_on_failure: type === 'bonus' ? 0 : (parseInt(failure) || 5),
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal title={initialData ? 'Editar regra' : 'Nova regra'} onClose={onClose}>
      <div className="space-y-4">
        {/* Emoji picker */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
            Emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-lg text-[18px] flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: emoji === e ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface-soft)',
                  border: `1px solid ${emoji === e ? '#76b900' : 'var(--theme-border)'}`,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
            Nome da regra *
          </label>
          <input
            className="input-field"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Sem açúcar refinado"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
            Tipo
          </label>
          <div className="flex gap-2">
            {[
              { val: 'restriction', label: 'Restrição' },
              { val: 'habit',       label: 'Hábito' },
              { val: 'bonus',       label: 'Bônus' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setType(opt.val)}
                className="flex-1 py-2 rounded-lg text-[13px] font-bold transition-colors"
                style={{
                  backgroundColor: type === opt.val ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface-soft)',
                  border: `1px solid ${type === opt.val ? '#76b900' : 'var(--theme-border)'}`,
                  color: type === opt.val ? '#76b900' : 'var(--theme-text-muted)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Points */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
              Pts ao cumprir
            </label>
            <input
              type="number" min="1" max="20"
              value={success}
              onChange={e => setSuccess(e.target.value)}
              className="input-field"
            />
          </div>
          {type !== 'bonus' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                Pts ao quebrar
              </label>
              <input
                type="number" min="0" max="20"
                value={failure}
                onChange={e => setFailure(e.target.value)}
                className="input-field"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-outline-dark flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim() || saving} className="btn-primary flex-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
