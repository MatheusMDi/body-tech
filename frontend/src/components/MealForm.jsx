import { useState } from 'react'
import { isOutsideWindow } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'
import FlagSelector from './FlagSelector.jsx'

export default function MealForm({ onSubmit, onCancel, loading }) {
  const [description, setDescription] = useState('')
  const [protein, setProtein] = useState('')
  const [water, setWater] = useState('')
  const [flags, setFlags] = useState([])
  const [step, setStep] = useState('form') // 'form' | 'confirm'

  const outsideWindow = isOutsideWindow()

  function handleSubmit(e) {
    e.preventDefault()
    if (outsideWindow && step === 'form') {
      setStep('confirm')
      return
    }
    submit()
  }

  function submit() {
    const allFlags = outsideWindow ? [...flags, 'FORA_DA_JANELA'] : flags
    onSubmit({
      description,
      protein_g: parseFloat(protein) || 0,
      water_ml: parseFloat(water) || 0,
      flags: allFlags,
      is_outside_window: outsideWindow,
    })
  }

  if (step === 'confirm') {
    return (
      <div className="card-dark border border-error rounded-sm p-6">
        <div className="text-[11px] font-bold uppercase tracking-wide text-error mb-3">⚠️ Atenção</div>
        <p className="text-on-dark text-[15px] mb-1">
          Você está em <strong>jejum ativo</strong>.
        </p>
        <p className="text-on-dark-mute text-[14px] mb-5">
          A janela alimentar abre às {PROTOCOL.FASTING_END_HOUR}:00. Esta refeição será marcada como{' '}
          <span className="text-warning font-bold">FORA_DA_JANELA</span>.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="btn-outline-dark flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-error text-on-dark font-bold text-[16px] py-[11px] rounded-sm"
          >
            {loading ? 'Salvando...' : 'Confirmar mesmo assim'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {outsideWindow && (
        <div className="border border-warning rounded-sm px-4 py-3 text-[13px] text-warning font-bold">
          ⚠️ Jejum ativo — janela abre às {PROTOCOL.FASTING_END_HOUR}:00
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
          Descrição
        </label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Frango + batata doce + salada"
          className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
            Proteína (g)
          </label>
          <input
            type="number"
            value={protein}
            onChange={e => setProtein(e.target.value)}
            placeholder="0"
            min="0"
            max="500"
            className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
            Água (ml)
          </label>
          <input
            type="number"
            value={water}
            onChange={e => setWater(e.target.value)}
            placeholder="0"
            min="0"
            max="5000"
            step="50"
            className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
          Flags
        </label>
        <FlagSelector selected={flags} onChange={setFlags} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline-dark flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Salvando...' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
