import React, { useState } from 'react'

const RPE_EMOJIS = {
  low:    { emoji: '😴', label: 'Fácil',    range: [1, 3] },
  medium: { emoji: '💪', label: 'Moderado', range: [4, 6] },
  hard:   { emoji: '🔥', label: 'Difícil',  range: [7, 9] },
  max:    { emoji: '💥', label: 'Máximo',   range: [10, 10] },
}

function getRpeEmoji(rpe) {
  if (rpe <= 3) return RPE_EMOJIS.low.emoji
  if (rpe <= 6) return RPE_EMOJIS.medium.emoji
  if (rpe <= 9) return RPE_EMOJIS.hard.emoji
  return RPE_EMOJIS.max.emoji
}

function getRpeLabel(rpe) {
  if (rpe <= 3) return RPE_EMOJIS.low.label
  if (rpe <= 6) return RPE_EMOJIS.medium.label
  if (rpe <= 9) return RPE_EMOJIS.hard.label
  return RPE_EMOJIS.max.label
}

function getResultConfig(format) {
  switch (format) {
    case 'amrap':
      return {
        label: 'Rounds + reps completados',
        placeholder: 'Ex: 5 rounds + 10 reps',
        type: 'text',
      }
    case 'for_time':
    case 'rounds_for_time':
      return {
        label: 'Tempo total (MM:SS)',
        placeholder: 'Ex: 12:45',
        type: 'text',
      }
    case 'tabata':
      return {
        label: 'Rounds completados',
        placeholder: 'Ex: 8',
        type: 'number',
      }
    case 'emom':
      return {
        label: 'Minutos completados',
        placeholder: 'Ex: 20',
        type: 'number',
      }
    case 'chipper':
      return {
        label: 'Tempo total (MM:SS)',
        placeholder: 'Ex: 25:00',
        type: 'text',
      }
    case 'strength':
    case 'drop_set':
    case 'superset':
    case 'pyramid':
      return null // results are captured per-exercise in ExerciseCard
    default:
      return {
        label: 'Resultado',
        placeholder: 'Descreva o resultado...',
        type: 'text',
      }
  }
}

export default function WorkoutResult({ format, exercises, onSave, onCancel, saving }) {
  const [result, setResult]           = useState('')
  const [rpe, setRpe]                 = useState(7)
  const [notes, setNotes]             = useState('')
  const [durationMinutes, setDuration] = useState('')

  const resultConfig = getResultConfig(format)
  const isStrengthFormat = ['strength', 'drop_set', 'superset', 'pyramid'].includes(format)

  function handleSave() {
    onSave({
      result: resultConfig ? result : null,
      rpe,
      notes: notes.trim() || null,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
    })
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Resultado do treino
        </p>
        <p
          className="text-[22px] font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          Como foi?
        </p>
      </div>

      {/* Result field */}
      {resultConfig && (
        <div className="card p-4">
          <label
            className="block text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {resultConfig.label}
          </label>
          <input
            className="input-field"
            type={resultConfig.type}
            placeholder={resultConfig.placeholder}
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      )}

      {/* Strength: show exercise summaries */}
      {isStrengthFormat && exercises.length > 0 && (
        <div className="card p-4">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Resumo dos exercícios
          </p>
          <div className="flex flex-col gap-2">
            {exercises.map((ex, idx) => {
              const sets = ex.sets ?? []
              const setsText = sets.length > 0
                ? sets
                    .filter((s) => s.reps || s.weight)
                    .map((s) => `${s.reps || '?'} × ${s.weight || '?'}kg`)
                    .join(', ')
                : 'Sem séries registradas'
              return (
                <div key={ex.id ?? idx} className="flex items-start justify-between gap-2">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    {ex.name}
                  </span>
                  <span
                    className="text-[12px] text-right shrink-0"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {setsText}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RPE slider */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <label
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Esforço percebido (RPE)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getRpeEmoji(rpe)}</span>
            <span className="text-[20px] font-bold" style={{ color: '#76b900' }}>
              {rpe}
            </span>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: '#76b900' }}
        />
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span
              key={n}
              className="text-[10px] font-bold w-4 text-center"
              style={{
                color: n === rpe ? '#76b900' : 'var(--theme-text-faint)',
              }}
            >
              {n}
            </span>
          ))}
        </div>
        <p
          className="text-center text-[13px] font-bold mt-2"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          {getRpeLabel(rpe)}
        </p>

        {/* RPE legend */}
        <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {Object.values(RPE_EMOJIS).map(({ emoji, label, range }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-base">{emoji}</span>
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: 'var(--theme-text-faint)' }}
              >
                {range[0] === range[1] ? range[0] : `${range[0]}-${range[1]}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="card p-4">
        <label
          className="block text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Duração total (minutos, opcional)
        </label>
        <input
          className="input-field"
          type="number"
          min="1"
          placeholder="Ex: 45"
          value={durationMinutes}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="card p-4">
        <label
          className="block text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Observações (opcional)
        </label>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Como você se sentiu? Algo para ajustar da próxima vez?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ height: 'auto', resize: 'none' }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          className="btn-primary w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar treino'}
        </button>
        <button
          className="btn-outline-dark w-full"
          onClick={onCancel}
          disabled={saving}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
