import { useState } from 'react'
import WorkoutTracker from '../components/workout/WorkoutTracker.jsx'
import WorkoutHistory from '../components/workout/WorkoutHistory.jsx'
import PRDashboard from '../components/workout/PRDashboard.jsx'
import WorkoutTemplates from '../components/workout/WorkoutTemplates.jsx'

const TABS = [
  { id: 'track',     label: 'Treinar' },
  { id: 'history',   label: 'Histórico' },
  { id: 'prs',       label: 'PRs' },
  { id: 'templates', label: 'Templates' },
]

export default function Workout({ user }) {
  const [view, setView] = useState('track')

  return (
    <div style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Treino
        </h1>
      </div>

      {/* Tab bar */}
      <div
        className="flex rounded-xl p-1 mb-5"
        style={{ backgroundColor: 'var(--theme-surface-soft)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              view === tab.id ? 'bg-primary text-white shadow-sm' : ''
            }`}
            style={view !== tab.id ? { color: 'var(--theme-text-muted)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View content */}
      {view === 'track'     && <WorkoutTracker   user={user} />}
      {view === 'history'   && <WorkoutHistory   user={user} />}
      {view === 'prs'       && <PRDashboard      user={user} />}
      {view === 'templates' && <WorkoutTemplates user={user} />}
    </div>
  )
}
