import React from 'react'

const CROSSFIT_FORMATS = new Set(['amrap', 'emom', 'for_time', 'rounds_for_time', 'chipper'])
const STRENGTH_FORMATS = new Set(['strength', 'drop_set', 'superset', 'pyramid'])

function RemoveButton({ onClick, label = 'Remover', small = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg transition-opacity active:opacity-60 ${small ? 'w-7 h-7' : 'w-8 h-8'}`}
      style={{
        background: 'rgba(201,64,64,0.1)',
        color: '#c94040',
        border: '1px solid rgba(201,64,64,0.2)',
      }}
      aria-label={label}
    >
      <svg
        width={small ? 12 : 14}
        height={small ? 12 : 14}
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

/* ─── CrossFit layout ─────────────────────────────────────── */
function CrossfitFields({ format, data, onChange }) {
  const isTabata = format === 'tabata'

  if (isTabata) {
    return (
      <div className="flex gap-2 mt-3">
        <div className="flex-1">
          <label
            className="block text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Rounds
          </label>
          <input
            className="input-field"
            type="number"
            min="1"
            placeholder="8"
            value={data.rounds ?? ''}
            onChange={(e) => onChange({ ...data, rounds: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label
            className="block text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Work (s)
          </label>
          <input
            className="input-field"
            type="number"
            min="1"
            placeholder="20"
            value={data.workSeconds ?? ''}
            onChange={(e) => onChange({ ...data, workSeconds: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label
            className="block text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Rest (s)
          </label>
          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="10"
            value={data.restSeconds ?? ''}
            onChange={(e) => onChange({ ...data, restSeconds: e.target.value })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <label
        className="block text-[11px] font-bold uppercase tracking-widest mb-1"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Reps (ex: 21-15-9)
      </label>
      <input
        className="input-field"
        type="text"
        placeholder="21-15-9 ou 10"
        value={data.reps ?? ''}
        onChange={(e) => onChange({ ...data, reps: e.target.value })}
      />
    </div>
  )
}

/* ─── Strength set row ────────────────────────────────────── */
function SetRow({ set, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[12px] font-bold w-5 text-center shrink-0"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        {index + 1}
      </span>
      <input
        className="input-field"
        type="number"
        min="1"
        placeholder="Reps"
        value={set.reps ?? ''}
        onChange={(e) => onChange({ ...set, reps: e.target.value })}
        style={{ height: '38px', fontSize: '14px' }}
      />
      <input
        className="input-field"
        type="number"
        min="0"
        step="0.5"
        placeholder="kg"
        value={set.weight ?? ''}
        onChange={(e) => onChange({ ...set, weight: e.target.value })}
        style={{ height: '38px', fontSize: '14px' }}
      />
      <RemoveButton onClick={onRemove} label="Remover série" small />
    </div>
  )
}

/* ─── Strength layout ─────────────────────────────────────── */
function StrengthFields({ data, onChange }) {
  const sets = data.sets && data.sets.length > 0
    ? data.sets
    : [{ reps: '', weight: '' }]

  function updateSet(index, updated) {
    const newSets = sets.map((s, i) => (i === index ? updated : s))
    onChange({ ...data, sets: newSets })
  }

  function addSet() {
    onChange({ ...data, sets: [...sets, { reps: '', weight: '' }] })
  }

  function removeSet(index) {
    if (sets.length <= 1) return
    onChange({ ...data, sets: sets.filter((_, i) => i !== index) })
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <label
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Séries
        </label>
        <div
          className="flex gap-4 text-[11px] font-bold uppercase tracking-widest pr-8"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          <span className="w-16 text-center">Reps</span>
          <span className="w-16 text-center">kg</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {sets.map((set, i) => (
          <SetRow
            key={i}
            set={set}
            index={i}
            onChange={(updated) => updateSet(i, updated)}
            onRemove={() => removeSet(i)}
          />
        ))}
      </div>
      <button
        onClick={addSet}
        className="mt-2 w-full py-2 text-[13px] font-bold rounded-lg transition-opacity active:opacity-60"
        style={{
          background: 'rgba(118,185,0,0.08)',
          color: '#76b900',
          border: '1px dashed rgba(118,185,0,0.4)',
        }}
      >
        + Adicionar série
      </button>
    </div>
  )
}

/* ─── Custom layout ────────────────────────────────────────── */
function CustomFields({ data, onChange }) {
  return (
    <div className="mt-3">
      <label
        className="block text-[11px] font-bold uppercase tracking-widest mb-1"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        Observações
      </label>
      <textarea
        className="input-field"
        rows={3}
        placeholder="Descreva como realizar o exercício..."
        value={data.notes ?? ''}
        onChange={(e) => onChange({ ...data, notes: e.target.value })}
        style={{ height: 'auto', resize: 'none' }}
      />
    </div>
  )
}

/* ─── Main ExerciseCard ────────────────────────────────────── */
export default function ExerciseCard({ exercise, format, onChange, onRemove }) {
  function handleChange(updated) {
    onChange({ ...exercise, ...updated })
  }

  return (
    <div
      className="card p-4"
      style={{ marginBottom: '8px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-[15px] font-bold truncate"
            style={{ color: 'var(--theme-text)' }}
          >
            {exercise.name}
          </p>
          {exercise.subcategory && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-faint)' }}
            >
              {exercise.subcategory}
            </span>
          )}
        </div>
        <RemoveButton onClick={onRemove} label="Remover exercício" />
      </div>

      {/* Format-specific fields */}
      {CROSSFIT_FORMATS.has(format) && (
        <CrossfitFields format={format} data={exercise} onChange={handleChange} />
      )}
      {STRENGTH_FORMATS.has(format) && (
        <StrengthFields data={exercise} onChange={handleChange} />
      )}
      {format === 'custom' && (
        <CustomFields data={exercise} onChange={handleChange} />
      )}
    </div>
  )
}
