import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import { supabase } from '../lib/supabase.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { todayDateString } from '../lib/utils.js'

export default function MeasureModal({ userId, onClose }) {
  const { showToast } = useToast()
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [abdomen, setAbdomen] = useState('')
  const [notes, setNotes] = useState('')
  const [lastMeasure, setLastMeasure] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setLastMeasure(data))
  }, [userId])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('body_metrics').upsert({
      user_id: userId,
      measured_at: todayDateString(),
      weight_kg: parseFloat(weight) || null,
      waist_cm: parseFloat(waist) || null,
      abdomen_cm: parseFloat(abdomen) || null,
      notes: notes || null,
    }, { onConflict: 'user_id,measured_at' })

    const weightDelta = lastMeasure?.weight_kg && weight
      ? (parseFloat(weight) - lastMeasure.weight_kg).toFixed(1)
      : null

    const deltaMsg = weightDelta
      ? ` · ${parseFloat(weightDelta) > 0 ? '▲' : '▼'} ${Math.abs(weightDelta)}kg`
      : ''

    showToast(`📏 Medidas salvas${deltaMsg}`, parseFloat(weightDelta) <= 0 ? 'success' : 'info')
    setLoading(false)
    onClose()
  }

  const weightDiff = lastMeasure?.weight_kg && weight
    ? parseFloat(weight) - lastMeasure.weight_kg
    : null

  function daysSince(dateStr) {
    if (!dateStr) return null
    return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000)
  }

  const days = daysSince(lastMeasure?.measured_at)

  return (
    <Modal title="📏 Medidas Corporais" onClose={onClose}>
      {lastMeasure && (
        <div
          className="rounded-sm px-4 py-3 mb-4 text-[13px] border"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-soft)' }}
        >
          <div className="text-theme-faint text-[11px] uppercase tracking-wide mb-1">Última medida · {days}d atrás</div>
          <div className="flex gap-4 text-theme font-bold">
            {lastMeasure.weight_kg && <span>{lastMeasure.weight_kg}kg</span>}
            {lastMeasure.waist_cm && <span>{lastMeasure.waist_cm}cm cintura</span>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">Peso (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="0.0" min="30" max="300" step="0.1" className="input-field" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">Cintura (cm)</label>
            <input type="number" value={waist} onChange={e => setWaist(e.target.value)}
              placeholder="0.0" min="40" max="200" step="0.5" className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">Circunferência abdominal (cm)</label>
          <input type="number" value={abdomen} onChange={e => setAbdomen(e.target.value)}
            placeholder="0.0" min="40" max="200" step="0.5" className="input-field" />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">Observação (opcional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Ex: em jejum, manhã..." className="input-field" />
        </div>

        {weightDiff !== null && (
          <div className={`text-[13px] font-bold ${weightDiff <= 0 ? 'text-primary' : 'text-error'}`}>
            {weightDiff > 0 ? '▲' : '▼'} {Math.abs(weightDiff).toFixed(1)}kg desde a última medida
            {days ? ` (${days} dias atrás)` : ''}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Salvando...' : 'Salvar Medidas'}
        </button>
      </form>
    </Modal>
  )
}
