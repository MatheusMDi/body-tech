import { useState } from 'react'

const MODALITIES = ['CrossFit', 'Musculação', 'Funcional', 'Corrida', 'Outro']

export default function OnboardingStep5({ data, onNext, onBack, saving }) {
  const [trains, setTrains] = useState(data.trains ?? false)
  const [modality, setModality] = useState(data.training_modality ?? 'CrossFit')
  const [time, setTime] = useState(data.training_time ?? '18:00')
  const [days, setDays] = useState(data.training_days_per_week ?? 4)

  function handleNext() {
    onNext({
      trains,
      training_modality: trains ? modality : null,
      training_time: trains ? time : null,
      training_days_per_week: trains ? days : null,
    })
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>Atividade física</h2>
        <p className="text-[14px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Ajustaremos seus lembretes conforme seu treino
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[{ label: 'Sim, pratico', val: true }, { label: 'Não pratico', val: false }].map(opt => (
          <button
            key={String(opt.val)}
            onClick={() => setTrains(opt.val)}
            className="px-4 py-3 rounded-sm border text-[14px] font-bold transition-colors"
            style={{
              borderColor: trains === opt.val ? '#76b900' : 'var(--theme-border)',
              backgroundColor: trains === opt.val ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface)',
              color: trains === opt.val ? '#76b900' : 'var(--theme-text-muted)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {trains && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
              Modalidade
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALITIES.map(m => (
                <button
                  key={m}
                  onClick={() => setModality(m)}
                  className="px-3 py-2 rounded-sm border text-[13px] font-bold transition-colors"
                  style={{
                    borderColor: modality === m ? '#76b900' : 'var(--theme-border)',
                    backgroundColor: modality === m ? 'rgba(118,185,0,0.1)' : 'transparent',
                    color: modality === m ? '#76b900' : 'var(--theme-text-muted)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                Horário do treino
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                Dias por semana
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDays(d => Math.max(1, d - 1))}
                  className="w-10 h-10 border rounded-sm font-bold text-[18px] flex items-center justify-center"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                >−</button>
                <span className="font-bold text-[20px] text-primary w-6 text-center">{days}</span>
                <button
                  onClick={() => setDays(d => Math.min(7, d + 1))}
                  className="w-10 h-10 border rounded-sm font-bold text-[18px] flex items-center justify-center"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                >+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="btn-outline-dark flex-1">Voltar</button>
        <button onClick={handleNext} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Salvando...' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
