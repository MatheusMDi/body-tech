import { useState, useEffect, useCallback } from 'react'
import CycleSelector from '../components/cycles/CycleSelector.jsx'
import CalorieCalculator from '../components/cycles/CalorieCalculator.jsx'
import CycleConfig from '../components/cycles/CycleConfig.jsx'
import CycleCard from '../components/cycles/CycleCard.jsx'
import CycleReport from '../components/cycles/CycleReport.jsx'
import CycleHistory from '../components/cycles/CycleHistory.jsx'
import CycleTemplates from '../components/cycles/CycleTemplates.jsx'
import { getActiveCycle, endCycle, startCycle, cancelCycle } from '../services/cycles.js'
import { useSettings } from '../contexts/SettingsContext.jsx'

// State machine:
// 'dashboard' | 'select_type' | 'calculator' | 'configure' | 'report' | 'history' | 'templates'

export default function Cycles({ user }) {
  const { profile } = useSettings()

  const [view, setView] = useState('dashboard')
  const [activeCycle, setActiveCycle] = useState(null)
  const [loadingCycle, setLoadingCycle] = useState(true)
  const [cycleError, setCycleError] = useState(null)

  // Wizard state
  const [selectedType, setSelectedType] = useState(null)
  const [confirmedMacros, setConfirmedMacros] = useState(null)

  // Saving / ending
  const [saving, setSaving] = useState(false)
  const [ending, setEnding] = useState(false)

  // Report state
  const [endedCycle, setEndedCycle] = useState(null)

  const fetchActive = useCallback(async () => {
    setLoadingCycle(true)
    setCycleError(null)
    try {
      const cycle = await getActiveCycle(user.id)
      setActiveCycle(cycle)
    } catch (e) {
      setCycleError('Não foi possível carregar o ciclo ativo.')
    } finally {
      setLoadingCycle(false)
    }
  }, [user.id])

  useEffect(() => {
    fetchActive()
  }, [fetchActive])

  // --- Wizard handlers ---

  function handleSelectType(cycleType) {
    setSelectedType(cycleType)
    setView('calculator')
  }

  function handleConfirmMacros(macros) {
    setConfirmedMacros(macros)
    setView('configure')
  }

  async function handleSaveCycle(config) {
    setSaving(true)
    setCycleError(null)
    try {
      const cycle = await startCycle(user.id, config)
      setActiveCycle(cycle)
      setView('dashboard')
      setSelectedType(null)
      setConfirmedMacros(null)
    } catch (e) {
      setCycleError('Não foi possível iniciar o ciclo. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEndCycle() {
    if (!activeCycle) return
    setEnding(true)
    setCycleError(null)
    try {
      const updated = await endCycle(activeCycle.id, {})
      setEndedCycle(updated)
      setActiveCycle(null)
      setView('report')
    } catch (e) {
      setCycleError('Não foi possível encerrar o ciclo.')
    } finally {
      setEnding(false)
    }
  }

  async function handleCancelCycle() {
    if (!activeCycle) return
    setEnding(true)
    setCycleError(null)
    try {
      await cancelCycle(activeCycle.id)
      setActiveCycle(null)
      await fetchActive()
    } catch (e) {
      setCycleError('Não foi possível cancelar o ciclo.')
    } finally {
      setEnding(false)
    }
  }

  function handleTemplateSelect(template) {
    // Pre-fill wizard from template
    setSelectedType(template.cycle_type)
    if (template.calorie_goal) {
      setConfirmedMacros({
        calorieGoal: template.calorie_goal,
        proteinGoalG: template.protein_goal_g ?? null,
        carbGoalG: template.carb_goal_g ?? null,
        fatGoalG: template.fat_goal_g ?? null,
      })
      setView('configure')
    } else {
      setView('calculator')
    }
  }

  function resetWizard() {
    setSelectedType(null)
    setConfirmedMacros(null)
    setView('dashboard')
  }

  // ---- Render helpers ----

  const pageWrapper = (children) => (
    <div style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      {children}
    </div>
  )

  // --- Select type view ---
  if (view === 'select_type') {
    return pageWrapper(
      <div>
        <button
          onClick={resetWizard}
          className="flex items-center gap-1 text-[13px] mb-5"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          ← Voltar
        </button>
        <CycleSelector onSelect={handleSelectType} />
      </div>
    )
  }

  // --- Calculator view ---
  if (view === 'calculator') {
    return pageWrapper(
      <CalorieCalculator
        profile={profile}
        cycleType={selectedType}
        onConfirm={handleConfirmMacros}
        onBack={() => setView('select_type')}
      />
    )
  }

  // --- Configure view ---
  if (view === 'configure') {
    return pageWrapper(
      <CycleConfig
        userId={user.id}
        cycleType={selectedType}
        macros={confirmedMacros}
        onSave={handleSaveCycle}
        onBack={() => setView('calculator')}
        saving={saving}
      />
    )
  }

  // --- Report view ---
  if (view === 'report' && endedCycle) {
    return pageWrapper(
      <CycleReport
        report={endedCycle.report}
        cycle={endedCycle}
        onNewCycle={() => { setEndedCycle(null); setView('select_type') }}
        onClose={() => { setEndedCycle(null); setView('dashboard') }}
      />
    )
  }

  // --- History view ---
  if (view === 'history') {
    return pageWrapper(
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setView('dashboard')}
            className="text-[13px]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            ← Voltar
          </button>
          <h2 className="text-[18px] font-bold" style={{ color: 'var(--theme-text)' }}>
            Histórico de ciclos
          </h2>
        </div>
        <CycleHistory userId={user.id} />
      </div>
    )
  }

  // --- Templates view ---
  if (view === 'templates') {
    return pageWrapper(
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setView('dashboard')}
            className="text-[13px]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            ← Voltar
          </button>
          <h2 className="text-[18px] font-bold" style={{ color: 'var(--theme-text)' }}>
            Modelos de ciclo
          </h2>
        </div>
        <CycleTemplates userId={user.id} onSelect={handleTemplateSelect} />
      </div>
    )
  }

  // --- Dashboard (default) ---
  return pageWrapper(
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Ciclos
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
          Gerencie seus ciclos de protocolo
        </p>
      </div>

      {cycleError && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-[13px]"
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#ef4444',
          }}
        >
          {cycleError}
        </div>
      )}

      {loadingCycle ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--theme-text-faint)' }}>
            Carregando…
          </p>
        </div>
      ) : activeCycle ? (
        /* Active cycle section */
        <div className="space-y-4">
          <CycleCard
            cycle={activeCycle}
            onEnd={handleEndCycle}
            onCancel={handleCancelCycle}
          />

          {ending && (
            <p className="text-[13px] text-center" style={{ color: 'var(--theme-text-muted)' }}>
              Processando…
            </p>
          )}

          {/* Secondary actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setView('history')}
              className="btn-outline-dark flex-1 text-[13px]"
            >
              Ver histórico
            </button>
            <button
              onClick={() => setView('templates')}
              className="btn-outline-dark flex-1 text-[13px]"
            >
              Ver modelos
            </button>
          </div>
        </div>
      ) : (
        /* No active cycle */
        <div className="space-y-5">
          {/* Empty state */}
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--theme-text)' }}>
              Nenhum ciclo ativo
            </p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--theme-text-muted)' }}>
              Inicie um ciclo para começar a rastrear seu progresso.
            </p>
            <button
              onClick={() => setView('select_type')}
              className="btn-primary w-full"
            >
              Iniciar novo ciclo
            </button>
          </div>

          {/* Quick nav */}
          <div className="flex gap-3">
            <button
              onClick={() => setView('templates')}
              className="btn-outline-dark flex-1 text-[13px]"
            >
              Ver modelos
            </button>
          </div>

          {/* History section */}
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--theme-text-faint)' }}
            >
              Histórico
            </p>
            <CycleHistory userId={user.id} />
          </div>

          {/* Templates section */}
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--theme-text-faint)' }}
            >
              Modelos
            </p>
            <CycleTemplates userId={user.id} onSelect={handleTemplateSelect} />
          </div>
        </div>
      )}
    </div>
  )
}
