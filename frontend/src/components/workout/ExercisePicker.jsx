import React, { useState, useMemo } from 'react'
import {
  EXERCISE_LIBRARY,
  EXERCISE_CATEGORIES,
  searchExercises,
} from '../../constants/exercises.js'

const MAIN_CATEGORIES = ['crossfit', 'strength_training', 'functional']

const CF_SUBCATEGORY_MAP = {
  olympic:        'LPO',
  gymnastics:     'Ginástico',
  strength:       'Força',
  monostructural: 'Monoestrutural',
}

function SubcategoryBadge({ label }) {
  if (!label) return null
  return (
    <span
      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ml-2 shrink-0"
      style={{
        background: 'var(--theme-surface-soft)',
        color: 'var(--theme-text-muted)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {label}
    </span>
  )
}

function ExerciseRow({ exercise, onSelect }) {
  const subcategoryLabel = useMemo(() => {
    if (!exercise.subcategory) return null
    if (exercise.category === 'crossfit') {
      return CF_SUBCATEGORY_MAP[exercise.subcategory] ?? exercise.subcategory
    }
    const catMeta = EXERCISE_CATEGORIES[exercise.category]
    if (catMeta?.subcategories?.[exercise.subcategory]) {
      return catMeta.subcategories[exercise.subcategory]
    }
    return exercise.subcategory
  }, [exercise])

  return (
    <button
      onClick={() => onSelect(exercise)}
      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors active:opacity-70"
      style={{ borderBottom: '1px solid var(--theme-border)' }}
    >
      <span
        className="text-[15px] font-medium truncate"
        style={{ color: 'var(--theme-text)' }}
      >
        {exercise.name}
      </span>
      <SubcategoryBadge label={subcategoryLabel} />
    </button>
  )
}

export default function ExercisePicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('crossfit')
  const [activeCFSubcat, setActiveCFSubcat] = useState('olympic')
  const [activeSTSubcat, setActiveSTSubcat] = useState('chest')
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('crossfit')

  const trimmed = query.trim()

  const searchResults = useMemo(() => {
    if (!trimmed) return []
    return searchExercises(trimmed)
  }, [trimmed])

  const browsedExercises = useMemo(() => {
    if (trimmed) return []
    if (activeCategory === 'functional') {
      const lib = EXERCISE_LIBRARY.functional
      return lib.map((ex) => ({ ...ex, category: 'functional', subcategory: null }))
    }
    if (activeCategory === 'crossfit') {
      const lib = EXERCISE_LIBRARY.crossfit[activeCFSubcat] ?? []
      return lib.map((ex) => ({ ...ex, category: 'crossfit', subcategory: activeCFSubcat }))
    }
    if (activeCategory === 'strength_training') {
      const lib = EXERCISE_LIBRARY.strength_training[activeSTSubcat] ?? []
      return lib.map((ex) => ({ ...ex, category: 'strength_training', subcategory: activeSTSubcat }))
    }
    return []
  }, [trimmed, activeCategory, activeCFSubcat, activeSTSubcat])

  const displayedExercises = trimmed ? searchResults : browsedExercises
  const noResults = trimmed && searchResults.length === 0

  function handleSelect(exercise) {
    onSelect({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      subcategory: exercise.subcategory ?? null,
    })
  }

  function handleCustomSubmit() {
    if (!customName.trim()) return
    onSelect({
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      subcategory: null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--theme-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <h2
            className="text-[18px] font-bold flex-1"
            style={{ color: 'var(--theme-text)' }}
          >
            Escolher Exercício
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity active:opacity-60"
            style={{
              background: 'var(--theme-surface-soft)',
              color: 'var(--theme-text-muted)',
            }}
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <input
          className="input-field"
          placeholder="Buscar exercício..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Body */}
      {!trimmed && (
        <>
          {/* Main category tabs */}
          <div
            className="flex gap-2 px-4 py-3 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--theme-border)' }}
          >
            {MAIN_CATEGORIES.map((catKey) => {
              const meta = EXERCISE_CATEGORIES[catKey]
              const isActive = activeCategory === catKey
              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors"
                  style={{
                    background: isActive ? '#76b900' : 'var(--theme-surface-soft)',
                    color: isActive ? '#fff' : 'var(--theme-text-muted)',
                    border: `1px solid ${isActive ? '#76b900' : 'var(--theme-border)'}`,
                  }}
                >
                  {meta.icon} {meta.label}
                </button>
              )
            })}
          </div>

          {/* CrossFit subcategory pills */}
          {activeCategory === 'crossfit' && (
            <div
              className="flex gap-2 px-4 py-2 overflow-x-auto"
              style={{ borderBottom: '1px solid var(--theme-border)' }}
            >
              {Object.entries(CF_SUBCATEGORY_MAP).map(([key, label]) => {
                const isActive = activeCFSubcat === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCFSubcat(key)}
                    className="shrink-0 px-3 py-1 rounded-full text-[12px] font-bold transition-colors"
                    style={{
                      background: isActive ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface)',
                      color: isActive ? '#76b900' : 'var(--theme-text-muted)',
                      border: `1px solid ${isActive ? '#76b900' : 'var(--theme-border)'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Musculação subcategory pills */}
          {activeCategory === 'strength_training' && (
            <div
              className="flex gap-2 px-4 py-2 overflow-x-auto"
              style={{ borderBottom: '1px solid var(--theme-border)' }}
            >
              {Object.entries(EXERCISE_CATEGORIES.strength_training.subcategories).map(([key, label]) => {
                const isActive = activeSTSubcat === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSTSubcat(key)}
                    className="shrink-0 px-3 py-1 rounded-full text-[12px] font-bold transition-colors"
                    style={{
                      background: isActive ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface)',
                      color: isActive ? '#76b900' : 'var(--theme-text-muted)',
                      border: `1px solid ${isActive ? '#76b900' : 'var(--theme-border)'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* No results — custom exercise option */}
      {noResults && !showCustom && (
        <div className="px-4 py-6 text-center">
          <p
            className="text-[14px] mb-4"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Nenhum exercício encontrado para "{trimmed}"
          </p>
          <button
            onClick={() => {
              setCustomName(trimmed)
              setShowCustom(true)
            }}
            className="btn-primary"
          >
            + Criar exercício personalizado
          </button>
        </div>
      )}

      {/* Custom exercise inline form */}
      {showCustom && (
        <div className="px-4 py-4 card mx-4 mt-4">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Exercício personalizado
          </p>
          <div className="flex flex-col gap-3">
            <input
              className="input-field"
              placeholder="Nome do exercício"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <select
              className="input-field"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              style={{ background: 'var(--theme-input-bg)', color: 'var(--theme-text)' }}
            >
              <option value="crossfit">CrossFit</option>
              <option value="strength_training">Musculação</option>
              <option value="functional">Funcional</option>
            </select>
            <div className="flex gap-2">
              <button
                className="btn-outline-dark flex-1"
                onClick={() => setShowCustom(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleCustomSubmit}
                disabled={!customName.trim()}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise list */}
      {!showCustom && (
        <div>
          {displayedExercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} onSelect={handleSelect} />
          ))}
          {trimmed && searchResults.length > 0 && (
            <div className="px-4 pt-3 pb-2">
              <button
                onClick={() => {
                  setCustomName(trimmed)
                  setShowCustom(true)
                }}
                className="w-full py-3 text-[14px] font-bold rounded-xl transition-opacity active:opacity-60"
                style={{
                  background: 'var(--theme-surface-soft)',
                  color: 'var(--theme-text-muted)',
                  border: '1px dashed var(--theme-border)',
                }}
              >
                + Exercício personalizado: "{trimmed}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
