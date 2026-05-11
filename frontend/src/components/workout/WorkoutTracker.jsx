import React, { useState, useCallback } from 'react'
import FormatSelector from './FormatSelector.jsx'
import ExercisePicker from './ExercisePicker.jsx'
import ExerciseCard from './ExerciseCard.jsx'
import WorkoutResult from './WorkoutResult.jsx'
import PRCelebration from './PRCelebration.jsx'
import WorkoutTemplates from './WorkoutTemplates.jsx'
import {
  saveWorkoutSession,
  checkForPR,
  savePR,
  extractBestWeightFromSets,
} from '../../services/workouts.js'

const STRENGTH_FORMATS = new Set(['strength', 'drop_set', 'superset', 'pyramid'])

// ─── Step indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'format', label: 'Formato' },
  { id: 'build',  label: 'Exercícios' },
  { id: 'result', label: 'Resultado' },
]

function StepIndicator({ currentStep }) {
  const stepIds = STEPS.map((s) => s.id)
  const currentIdx = stepIds.indexOf(currentStep)
  if (currentIdx === -1) return null

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentIdx
        const isCurrent = idx === currentIdx
        return (
          <React.Fragment key={step.id}>
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black transition-all"
              style={{
                background: isCurrent ? '#76b900' : isDone ? 'rgba(118,185,0,0.3)' : 'var(--theme-surface-soft)',
                color: isCurrent ? '#fff' : isDone ? '#76b900' : 'var(--theme-text-faint)',
                border: `1.5px solid ${isCurrent ? '#76b900' : isDone ? 'rgba(118,185,0,0.5)' : 'var(--theme-border)'}`,
              }}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 h-px"
                style={{
                  background: idx < currentIdx ? 'rgba(118,185,0,0.4)' : 'var(--theme-border)',
                  minWidth: 12,
                  maxWidth: 24,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Back button ─────────────────────────────────────────────────────────────

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 transition-opacity active:opacity-60"
      style={{ color: 'var(--theme-text-muted)' }}
      aria-label="Voltar"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M11 14L6 9l5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[14px] font-medium">Voltar</span>
    </button>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function TrackerHeader({ step, onBack }) {
  const showBack = step !== 'format' && step !== 'done'

  return (
    <div
      className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: 'var(--theme-bg)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      <div className="w-20">
        {showBack && <BackButton onClick={onBack} />}
      </div>
      <h1
        className="text-[16px] font-black tracking-tight flex-1 text-center"
        style={{ color: 'var(--theme-text)' }}
      >
        Registrar Treino
      </h1>
      <div className="w-20 flex justify-end">
        <StepIndicator currentStep={step} />
      </div>
    </div>
  )
}

// ─── Format step ─────────────────────────────────────────────────────────────

function FormatStep({ selectedFormat, onSelectFormat, onUseTemplate }) {
  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <FormatSelector selectedFormat={selectedFormat} onChange={onSelectFormat} />

      <div
        className="flex items-center gap-3"
        style={{ color: 'var(--theme-text-faint)' }}
      >
        <div className="flex-1 h-px" style={{ background: 'var(--theme-border)' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest">ou</span>
        <div className="flex-1 h-px" style={{ background: 'var(--theme-border)' }} />
      </div>

      <button
        className="btn-outline-dark w-full flex items-center justify-center gap-2"
        onClick={onUseTemplate}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Usar template
      </button>
    </div>
  )
}

// ─── Build step ──────────────────────────────────────────────────────────────

function BuildStep({
  format,
  workoutName,
  onChangeName,
  exercises,
  onChangeExercise,
  onRemoveExercise,
  onAddExercise,
  onNext,
  showPicker,
  onOpenPicker,
  onClosePicker,
}) {
  return (
    <div className="flex flex-col gap-4 px-4 py-5 pb-10">
      {/* Workout name */}
      <div>
        <label
          className="block text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Nome do treino
        </label>
        <input
          className="input-field"
          placeholder="Ex: Força + Ginástico"
          value={workoutName}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </div>

      {/* Format badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Formato:
        </span>
        <span
          className="text-[11px] font-black uppercase px-2 py-0.5 rounded-sm"
          style={{
            background: 'rgba(118,185,0,0.12)',
            color: '#76b900',
            border: '1px solid rgba(118,185,0,0.3)',
          }}
        >
          {format}
        </span>
      </div>

      {/* Exercise cards */}
      {exercises.length > 0 && (
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Exercícios ({exercises.length})
          </p>
          {exercises.map((ex, idx) => (
            <ExerciseCard
              key={ex._uid ?? ex.id ?? idx}
              exercise={ex}
              format={format}
              onChange={(updated) => onChangeExercise(idx, updated)}
              onRemove={() => onRemoveExercise(idx)}
            />
          ))}
        </div>
      )}

      {/* Add exercise button */}
      <button
        onClick={onOpenPicker}
        className="w-full py-3 rounded-xl text-[14px] font-bold transition-opacity active:opacity-60 flex items-center justify-center gap-2"
        style={{
          background: 'rgba(118,185,0,0.08)',
          color: '#76b900',
          border: '1px dashed rgba(118,185,0,0.4)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Adicionar exercício
      </button>

      {/* Next button */}
      {exercises.length > 0 && (
        <button
          className="btn-primary w-full"
          onClick={onNext}
        >
          Próximo →
        </button>
      )}

      {/* Exercise picker modal */}
      {showPicker && (
        <ExercisePicker
          onSelect={(exercise) => {
            onAddExercise(exercise)
            onClosePicker()
          }}
          onClose={onClosePicker}
        />
      )}
    </div>
  )
}

// ─── Main WorkoutTracker ──────────────────────────────────────────────────────

export default function WorkoutTracker({ userId, onComplete }) {
  const [step, setStep]             = useState('format')  // 'format' | 'template' | 'build' | 'result' | 'done'
  const [format, setFormat]         = useState(null)
  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises]   = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState(null)
  const [prs, setPrs]               = useState([])          // discovered PRs
  const [prIndex, setPrIndex]       = useState(0)           // which PR we're celebrating
  const [sessionId, setSessionId]   = useState(null)

  // ── Uid helper ──────────────────────────────────────────────────────────────
  function withUid(exercise) {
    return { ...exercise, _uid: `${exercise.id}_${Date.now()}_${Math.random()}` }
  }

  // ── Format selection ────────────────────────────────────────────────────────
  function handleSelectFormat(fmt) {
    setFormat(fmt)
  }

  function handleFormatNext() {
    if (format) setStep('build')
  }

  // ── Template selection ──────────────────────────────────────────────────────
  function handleSelectTemplate(template) {
    setFormat(template.format)
    setWorkoutName(template.name ?? '')
    const exs = (template.exercises ?? []).map(withUid)
    setExercises(exs)
    setStep('build')
  }

  // ── Exercise management ──────────────────────────────────────────────────────
  function handleAddExercise(exercise) {
    setExercises((prev) => [...prev, withUid(exercise)])
  }

  function handleChangeExercise(index, updated) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)))
  }

  function handleRemoveExercise(index) {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async ({ result, rpe, notes, durationMinutes }) => {
    if (!userId || !format) return
    setSaving(true)
    setSaveError(null)

    try {
      // 1. Save session
      const session = await saveWorkoutSession({
        userId,
        format,
        name: workoutName || null,
        exercises,
        result,
        rpe,
        notes,
        durationMinutes,
      })
      setSessionId(session.id)

      // 2. Check for PRs in strength exercises
      const discoveredPRs = []

      if (STRENGTH_FORMATS.has(format)) {
        for (const ex of exercises) {
          const bestWeight = extractBestWeightFromSets(ex.sets)
          if (!bestWeight) continue

          const { isPR, previous } = await checkForPR({
            userId,
            exerciseName: ex.name,
            value: bestWeight.value,
            unit: bestWeight.unit,
          })

          if (isPR) {
            try {
              await savePR({
                userId,
                exerciseName: ex.name,
                value: bestWeight.value,
                unit: bestWeight.unit,
                category: ex.category ?? null,
                workoutSessionId: session.id,
              })

              const improvement = previous
                ? `${(bestWeight.value - parseFloat(previous.value)).toFixed(1)}${bestWeight.unit}`
                : null

              discoveredPRs.push({
                exercise: ex.name,
                value: bestWeight.value,
                unit: bestWeight.unit,
                improvement,
              })
            } catch (_) {
              // Non-fatal: ignore PR save errors
            }
          }
        }
      }

      if (discoveredPRs.length > 0) {
        setPrs(discoveredPRs)
        setPrIndex(0)
        setStep('done')
      } else {
        setStep('done')
      }
    } catch (err) {
      setSaveError(err.message ?? 'Erro ao salvar treino')
    } finally {
      setSaving(false)
    }
  }, [userId, format, workoutName, exercises])

  // ── PR cycling ──────────────────────────────────────────────────────────────
  function handlePRClose() {
    if (prIndex + 1 < prs.length) {
      setPrIndex((i) => i + 1)
    } else {
      handleFinish()
    }
  }

  // ── Finish ──────────────────────────────────────────────────────────────────
  function handleFinish() {
    onComplete?.()
    // Reset state
    setStep('format')
    setFormat(null)
    setWorkoutName('')
    setExercises([])
    setPrs([])
    setPrIndex(0)
    setSessionId(null)
    setSaveError(null)
  }

  // ── Back logic ──────────────────────────────────────────────────────────────
  function handleBack() {
    if (step === 'template') setStep('format')
    else if (step === 'build') setStep('format')
    else if (step === 'result') setStep('build')
  }

  // ── "Done" step without PRs ──────────────────────────────────────────────────
  const currentPR = prs[prIndex]

  if (step === 'done' && currentPR) {
    return (
      <PRCelebration
        exercise={currentPR.exercise}
        value={currentPR.value}
        unit={currentPR.unit}
        improvement={currentPR.improvement}
        onClose={handlePRClose}
      />
    )
  }

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 bg-theme overflow-y-auto flex flex-col items-center justify-center px-6 text-center">
        <div
          className="animate-scale-up flex flex-col items-center gap-5"
        >
          <div className="text-[72px]">🎉</div>
          <div>
            <p
              className="text-[13px] font-bold uppercase tracking-widest mb-1"
              style={{ color: 'rgba(118,185,0,0.7)' }}
            >
              Treino concluído
            </p>
            <h1
              className="text-[32px] font-black"
              style={{ color: 'var(--theme-text)' }}
            >
              Ótimo trabalho!
            </h1>
          </div>
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-[15px]">
            Seu treino foi salvo com sucesso.
          </p>
          <button
            className="btn-primary px-10 mt-2"
            onClick={handleFinish}
          >
            Concluir
          </button>
        </div>
      </div>
    )
  }

  // ── Template browser ─────────────────────────────────────────────────────────
  if (step === 'template') {
    return (
      <div className="fixed inset-0 z-50 bg-theme overflow-y-auto">
        <TrackerHeader step="format" onBack={() => setStep('format')} />
        <div className="px-4 py-5">
          <WorkoutTemplates userId={userId} onSelect={handleSelectTemplate} />
        </div>
      </div>
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-theme overflow-y-auto">
      <TrackerHeader step={step} onBack={handleBack} />

      {/* Format step */}
      {step === 'format' && (
        <div className="flex flex-col">
          <FormatStep
            selectedFormat={format}
            onSelectFormat={handleSelectFormat}
            onUseTemplate={() => setStep('template')}
          />
          {format && (
            <div className="px-4 pb-8">
              <button className="btn-primary w-full" onClick={handleFormatNext}>
                Continuar →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Build step */}
      {step === 'build' && (
        <BuildStep
          format={format}
          workoutName={workoutName}
          onChangeName={setWorkoutName}
          exercises={exercises}
          onChangeExercise={handleChangeExercise}
          onRemoveExercise={handleRemoveExercise}
          onAddExercise={handleAddExercise}
          onNext={() => setStep('result')}
          showPicker={showPicker}
          onOpenPicker={() => setShowPicker(true)}
          onClosePicker={() => setShowPicker(false)}
        />
      )}

      {/* Result step */}
      {step === 'result' && (
        <div className="px-4 py-5">
          {saveError && (
            <div
              className="mb-4 p-3 rounded-xl text-[13px]"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {saveError}
            </div>
          )}
          <WorkoutResult
            format={format}
            exercises={exercises}
            onSave={handleSave}
            onCancel={() => setStep('build')}
            saving={saving}
          />
        </div>
      )}
    </div>
  )
}
