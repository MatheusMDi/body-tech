import { useState } from 'react'
import Modal from './Modal.jsx'
import { useSleep } from '../hooks/useSleep.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { todayDateString } from '../lib/utils.js'

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-[28px] transition-transform active:scale-110 ${star <= value ? 'opacity-100' : 'opacity-30'}`}
        >
          ⭐
        </button>
      ))}
    </div>
  )
}

export default function SleepModal({ userId, onClose }) {
  const { entry, history, saveSleep, avgHours } = useSleep(userId, todayDateString())
  const { showToast } = useToast()

  const [hours, setHours] = useState(entry?.hours_slept ? String(entry.hours_slept) : '')
  const [quality, setQuality] = useState(entry?.quality ?? 3)
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const h = parseFloat(hours)
    if (!h || h <= 0 || h > 24) return

    setLoading(true)
    await saveSleep({ hours_slept: h, quality, notes: notes || null })
    showToast(h < 7 ? '😴 Sono registrado — abaixo de 7h' : '😴 Sono registrado', h < 7 ? 'warning' : 'success')
    setLoading(false)
    onClose()
  }

  // Correlation insight
  const insight = avgHours !== null && avgHours < 6.5
    ? 'Nos dias com sono <6h, sua proteína tende a ser menor.'
    : null

  return (
    <Modal title="😴 Sono" onClose={onClose}>
      {entry && (
        <div className="border border-primary rounded-sm px-4 py-3 mb-4 text-[13px] text-primary font-bold">
          ✅ Sono de hoje já registrado: {entry.hours_slept}h · qualidade {entry.quality}/5
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Horas dormidas
          </label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="7.5"
            min="1" max="24" step="0.5"
            className="input-field text-[22px] font-bold"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Qualidade do sono
          </label>
          <StarRating value={quality} onChange={setQuality} />
          <div className="text-[11px] text-theme-faint mt-1">
            {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][quality]}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Observação (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: acordei 2x, pesadelo..."
            className="input-field"
          />
        </div>

        {insight && (
          <div className="border border-warning rounded-sm px-4 py-3 text-[13px] text-warning">
            💡 {insight}
          </div>
        )}

        {parseFloat(hours) < 7 && hours !== '' && (
          <div className="text-[12px] text-warning font-bold">
            ⚠️ Menos de 7h — flag SONO_RUIM será aplicada automaticamente
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Salvando...' : entry ? 'Atualizar Sono' : 'Registrar Sono'}
        </button>
      </form>

      {/* Last 7 days mini-chart */}
      {history.length > 1 && (
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-2">
            Últimas noites · média {avgHours?.toFixed(1)}h
          </div>
          <div className="flex items-end gap-1 h-12">
            {history.slice(0, 7).reverse().map((h, i) => {
              const pct = Math.min(100, (h.hours_slept / 10) * 100)
              const color = h.hours_slept >= 7 ? '#76b900' : h.hours_slept >= 6 ? '#df6500' : '#e52020'
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div className="w-full rounded-sm" style={{ height: `${pct}%`, backgroundColor: color, minHeight: 4 }} />
                  <div className="text-[8px] text-theme-faint">{h.hours_slept}h</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
