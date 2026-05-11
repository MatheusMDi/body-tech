import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

// Predefined workout templates — defined here since cyclePresets.js
// does not export PREDEFINED_WORKOUT_TEMPLATES yet.
const PREDEFINED_WORKOUT_TEMPLATES = [
  {
    id: 'preset_fran',
    name: 'Fran',
    format: 'for_time',
    description: '21-15-9 Thrusters + Pull-ups',
    exercises: [
      { id: 'cf_str_thruster', name: 'Thruster', category: 'crossfit', subcategory: 'strength', reps: '21-15-9' },
      { id: 'cf_gym_kipping_pull_up', name: 'Kipping Pull-up', category: 'crossfit', subcategory: 'gymnastics', reps: '21-15-9' },
    ],
  },
  {
    id: 'preset_cindy',
    name: 'Cindy',
    format: 'amrap',
    description: '20min AMRAP: 5 Pull-ups + 10 Push-ups + 15 Squats',
    exercises: [
      { id: 'cf_gym_kipping_pull_up', name: 'Kipping Pull-up', category: 'crossfit', subcategory: 'gymnastics', reps: '5' },
      { id: 'cf_gym_push_up', name: 'Push-up', category: 'crossfit', subcategory: 'gymnastics', reps: '10' },
      { id: 'cf_gym_air_squat', name: 'Air Squat', category: 'crossfit', subcategory: 'gymnastics', reps: '15' },
    ],
  },
  {
    id: 'preset_murph',
    name: 'Murph',
    format: 'for_time',
    description: '1mi Run + 100 Pull-ups + 200 Push-ups + 300 Squats + 1mi Run',
    exercises: [
      { id: 'cf_mono_running', name: 'Running', category: 'crossfit', subcategory: 'monostructural', reps: '1 mile' },
      { id: 'cf_gym_kipping_pull_up', name: 'Kipping Pull-up', category: 'crossfit', subcategory: 'gymnastics', reps: '100' },
      { id: 'cf_gym_push_up', name: 'Push-up', category: 'crossfit', subcategory: 'gymnastics', reps: '200' },
      { id: 'cf_gym_air_squat', name: 'Air Squat', category: 'crossfit', subcategory: 'gymnastics', reps: '300' },
    ],
  },
  {
    id: 'preset_grace',
    name: 'Grace',
    format: 'for_time',
    description: '30 Clean and Jerks (60/43kg) for time',
    exercises: [
      { id: 'cf_oly_clean_and_jerk', name: 'Clean and Jerk', category: 'crossfit', subcategory: 'olympic', reps: '30' },
    ],
  },
  {
    id: 'preset_tabata_core',
    name: 'Tabata Core',
    format: 'tabata',
    description: '4 exercícios Tabata: Sit-up, Push-up, Squat, Burpee',
    exercises: [
      { id: 'cf_gym_abmat_sit_up', name: 'Abmat Sit-up', category: 'crossfit', subcategory: 'gymnastics', rounds: '8', workSeconds: '20', restSeconds: '10' },
      { id: 'cf_gym_push_up', name: 'Push-up', category: 'crossfit', subcategory: 'gymnastics', rounds: '8', workSeconds: '20', restSeconds: '10' },
      { id: 'cf_gym_air_squat', name: 'Air Squat', category: 'crossfit', subcategory: 'gymnastics', rounds: '8', workSeconds: '20', restSeconds: '10' },
      { id: 'cf_gym_burpee', name: 'Burpee', category: 'crossfit', subcategory: 'gymnastics', rounds: '8', workSeconds: '20', restSeconds: '10' },
    ],
  },
  {
    id: 'preset_push_pull',
    name: 'Push & Pull',
    format: 'strength',
    description: 'Supino + Remada — séries clássicas de força',
    exercises: [
      { id: 'wb_chest_supino_reto_barra', name: 'Supino Reto Barra', category: 'strength_training', subcategory: 'chest', sets: [{ reps: '8', weight: '' }, { reps: '8', weight: '' }, { reps: '8', weight: '' }] },
      { id: 'wb_back_remada_curvada_barra', name: 'Remada Curvada Barra', category: 'strength_training', subcategory: 'back', sets: [{ reps: '8', weight: '' }, { reps: '8', weight: '' }, { reps: '8', weight: '' }] },
    ],
  },
]

const FORMAT_LABELS = {
  amrap:           'AMRAP',
  emom:            'EMOM',
  for_time:        'For Time',
  rounds_for_time: 'Rounds for Time',
  chipper:         'Chipper',
  tabata:          'Tabata',
  strength:        'Séries',
  drop_set:        'Drop Set',
  superset:        'Superset',
  pyramid:         'Pirâmide',
  custom:          'Personalizado',
}

const FORMAT_COLORS = {
  amrap:           '#f59e0b',
  emom:            '#3b82f6',
  for_time:        '#ef4444',
  rounds_for_time: '#f97316',
  chipper:         '#8b5cf6',
  tabata:          '#ec4899',
  strength:        '#76b900',
  drop_set:        '#10b981',
  superset:        '#06b6d4',
  pyramid:         '#6366f1',
  custom:          '#9ca3af',
}

function FormatBadge({ format }) {
  if (!format) return null
  return (
    <span
      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm"
      style={{
        background: `${FORMAT_COLORS[format] ?? '#9ca3af'}22`,
        color: FORMAT_COLORS[format] ?? '#9ca3af',
        border: `1px solid ${FORMAT_COLORS[format] ?? '#9ca3af'}44`,
      }}
    >
      {FORMAT_LABELS[format] ?? format}
    </span>
  )
}

function TemplateCard({ template, onSelect, onDelete, canDelete }) {
  const exerciseCount = (template.exercises ?? []).length

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <FormatBadge format={template.format} />
          </div>
          <p
            className="text-[15px] font-bold"
            style={{ color: 'var(--theme-text)' }}
          >
            {template.name}
          </p>
          {template.description && (
            <p
              className="text-[12px] mt-0.5 line-clamp-2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {template.description}
            </p>
          )}
          <p
            className="text-[11px] mt-1"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}
          </p>
        </div>

        {canDelete && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(template)
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity active:opacity-60 shrink-0"
            style={{
              background: 'rgba(201,64,64,0.1)',
              color: '#c94040',
              border: '1px solid rgba(201,64,64,0.2)',
            }}
            aria-label="Excluir template"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <button
        className="btn-primary w-full"
        style={{ fontSize: '14px', height: '38px' }}
        onClick={() => onSelect(template)}
      >
        Usar template
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-3 w-16 rounded mb-2" style={{ background: 'var(--theme-surface-soft)' }} />
      <div className="h-4 w-36 rounded mb-1" style={{ background: 'var(--theme-surface-soft)' }} />
      <div className="h-3 w-52 rounded mb-3" style={{ background: 'var(--theme-surface-soft)' }} />
      <div className="h-9 w-full rounded-xl" style={{ background: 'var(--theme-surface-soft)' }} />
    </div>
  )
}

export default function WorkoutTemplates({ userId, onSelect }) {
  const [userTemplates, setUserTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('user')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)

    supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setUserTemplates(data ?? [])
        }
        setLoading(false)
      })
  }, [userId])

  async function handleDelete(template) {
    if (!window.confirm(`Excluir o template "${template.name}"?`)) return
    setDeleting(template.id)
    const { error: err } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', template.id)
      .eq('user_id', userId)
    if (!err) {
      setUserTemplates((prev) => prev.filter((t) => t.id !== template.id))
    }
    setDeleting(null)
  }

  const tabs = [
    { id: 'user',      label: 'Meus templates' },
    { id: 'predefined', label: 'Pré-definidos' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Templates
        </p>
        <h2 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Escolher Template
        </h2>
      </div>

      {/* Tabs */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--theme-border)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 text-[13px] font-bold transition-colors"
              style={{
                color: isActive ? '#76b900' : 'var(--theme-text-muted)',
                borderBottom: isActive ? '2px solid #76b900' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* User templates */}
      {activeTab === 'user' && (
        <>
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}
          {!loading && error && (
            <div className="card p-4 text-center" style={{ color: '#ef4444' }}>
              <p className="text-[14px]">Erro ao carregar templates.</p>
            </div>
          )}
          {!loading && !error && userTemplates.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-[15px] font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
                Nenhum template salvo
              </p>
              <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
                Salve seus treinos favoritos como template para reutilizá-los facilmente.
              </p>
            </div>
          )}
          {!loading && !error && userTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
              onDelete={handleDelete}
              canDelete
            />
          ))}
        </>
      )}

      {/* Predefined templates */}
      {activeTab === 'predefined' && (
        <div className="flex flex-col gap-3">
          {PREDEFINED_WORKOUT_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
              canDelete={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
