import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { CYCLE_TYPES, PREDEFINED_CYCLE_TEMPLATES } from '../../constants/cyclePresets.js'

function TypeBadge({ cycleType }) {
  const ct = CYCLE_TYPES.find((c) => c.id === cycleType)
  if (!ct) return null
  return (
    <span
      className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
    >
      {ct.emoji} {ct.name}
    </span>
  )
}

export default function CycleTemplates({ userId, onSelect }) {
  const [activeTab, setActiveTab] = useState('predefined') // 'mine' | 'predefined'
  const [userTemplates, setUserTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (activeTab !== 'mine') return
    let cancelled = false
    async function fetchUserTemplates() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('cycle_templates')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (!cancelled) {
          if (err) throw err
          setUserTemplates(data ?? [])
        }
      } catch (e) {
        if (!cancelled) setError('Não foi possível carregar seus modelos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUserTemplates()
    return () => { cancelled = true }
  }, [activeTab, userId])

  async function handleDelete(templateId) {
    setDeletingId(templateId)
    try {
      const { error: err } = await supabase
        .from('cycle_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId)
      if (err) throw err
      setUserTemplates((prev) => prev.filter((t) => t.id !== templateId))
    } catch (e) {
      setError('Não foi possível excluir o modelo.')
    } finally {
      setDeletingId(null)
    }
  }

  const tabs = [
    { id: 'predefined', label: 'Pré-definidos' },
    { id: 'mine', label: 'Meus modelos' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex rounded-xl p-1 mb-4"
        style={{ backgroundColor: 'var(--theme-surface-soft)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-sm' : ''
            }`}
            style={activeTab !== tab.id ? { color: 'var(--theme-text-muted)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-3 text-[13px]"
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Predefined templates */}
      {activeTab === 'predefined' && (
        <div className="space-y-3">
          {PREDEFINED_CYCLE_TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>
                    {tmpl.name}
                  </div>
                  {tmpl.description && (
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                      {tmpl.description}
                    </div>
                  )}
                </div>
                <TypeBadge cycleType={tmpl.cycle_type} />
              </div>
              <div className="flex items-center justify-between mt-3">
                {tmpl.duration_weeks && (
                  <span className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
                    {tmpl.duration_weeks} semanas
                  </span>
                )}
                <button
                  onClick={() => onSelect(tmpl)}
                  className="btn-primary text-[13px] py-1.5 px-4 ml-auto"
                >
                  Usar modelo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User templates */}
      {activeTab === 'mine' && (
        <>
          {loading ? (
            <p className="text-[13px] text-center py-6" style={{ color: 'var(--theme-text-muted)' }}>
              Carregando…
            </p>
          ) : userTemplates.length === 0 ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
            >
              <p className="text-[13px]" style={{ color: 'var(--theme-text-faint)' }}>
                Você ainda não tem modelos salvos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userTemplates.map((tmpl) => (
                <div key={tmpl.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>
                        {tmpl.name}
                      </div>
                    </div>
                    <TypeBadge cycleType={tmpl.cycle_type} />
                  </div>
                  {tmpl.duration_weeks && (
                    <div className="text-[12px] mb-2" style={{ color: 'var(--theme-text-faint)' }}>
                      {tmpl.duration_weeks} semanas
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onSelect(tmpl)}
                      className="btn-primary text-[13px] py-1.5 px-4 flex-1"
                    >
                      Usar modelo
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl.id)}
                      disabled={deletingId === tmpl.id}
                      className="btn-outline-dark text-[13px] py-1.5 px-3"
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}
                    >
                      {deletingId === tmpl.id ? '…' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
