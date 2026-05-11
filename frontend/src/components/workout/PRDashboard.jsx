import React, { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis } from 'recharts'
import { supabase } from '../../lib/supabase.js'

const CATEGORY_TABS = [
  { id: 'all',             label: 'Todos' },
  { id: 'crossfit',        label: 'CrossFit LPO' },
  { id: 'gymnastics',      label: 'Ginástico' },
  { id: 'strength_training', label: 'Musculação' },
]

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function PRSparkline({ data }) {
  if (!data || data.length < 2) return null
  const chartData = data.map((d) => ({ v: parseFloat(d.value) || 0, date: d.achieved_at }))
  return (
    <div style={{ width: '80px', height: '32px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{
              background: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              borderRadius: 6,
              padding: '2px 6px',
              fontSize: 11,
            }}
            formatter={(val) => [val, '']}
            labelFormatter={() => ''}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke="#76b900"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: '#76b900' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function PRCard({ exerciseName, records }) {
  const [expanded, setExpanded] = useState(false)

  const sorted = [...records].sort(
    (a, b) => new Date(b.achieved_at) - new Date(a.achieved_at)
  )
  const best = sorted[0]

  return (
    <div className="card p-4">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-bold truncate"
            style={{ color: 'var(--theme-text)' }}
          >
            {exerciseName}
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {formatDate(best?.achieved_at)}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sorted.length > 2 && <PRSparkline data={[...sorted].reverse()} />}
          <div className="text-right">
            <span
              className="text-[20px] font-black"
              style={{ color: '#76b900' }}
            >
              {best?.value}
            </span>
            {best?.unit && (
              <span
                className="text-[12px] font-bold ml-1"
                style={{ color: 'rgba(118,185,0,0.6)' }}
              >
                {best.unit}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              color: 'var(--theme-text-faint)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {expanded && sorted.length > 1 && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid var(--theme-border)' }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Histórico
          </p>
          <div className="flex flex-col gap-1.5">
            {sorted.map((rec, i) => (
              <div key={rec.id ?? i} className="flex items-center justify-between">
                <span
                  className="text-[12px]"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {formatDate(rec.achieved_at)}
                </span>
                <div className="flex items-center gap-1">
                  {i === 0 && (
                    <span className="text-[10px]">🏆</span>
                  )}
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: i === 0 ? '#76b900' : 'var(--theme-text)' }}
                  >
                    {rec.value}
                    {rec.unit && (
                      <span
                        className="text-[11px] font-medium ml-0.5"
                        style={{ color: 'var(--theme-text-muted)' }}
                      >
                        {rec.unit}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex justify-between">
        <div>
          <div className="h-4 w-32 rounded mb-1" style={{ background: 'var(--theme-surface-soft)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'var(--theme-surface-soft)' }} />
        </div>
        <div className="h-6 w-16 rounded" style={{ background: 'var(--theme-surface-soft)' }} />
      </div>
    </div>
  )
}

export default function PRDashboard({ userId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)

    supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setRecords(data ?? [])
        }
        setLoading(false)
      })
  }, [userId])

  // Group by exercise_name
  const grouped = useMemo(() => {
    let filtered = records

    if (activeTab !== 'all') {
      filtered = filtered.filter((r) => r.category === activeTab)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter((r) =>
        (r.exercise_name ?? '').toLowerCase().includes(q)
      )
    }

    return filtered.reduce((acc, rec) => {
      const key = rec.exercise_name ?? 'Desconhecido'
      if (!acc[key]) acc[key] = []
      acc[key].push(rec)
      return acc
    }, {})
  }, [records, activeTab, search])

  const exerciseNames = Object.keys(grouped).sort()

  if (!userId) {
    return (
      <div className="px-4 py-8 text-center">
        <p style={{ color: 'var(--theme-text-muted)' }}>Usuário não identificado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Recordes pessoais
        </p>
        <h2
          className="text-[22px] font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          PRs 🏆
        </h2>
      </div>

      {/* Search */}
      <input
        className="input-field"
        placeholder="Buscar exercício..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors"
              style={{
                background: isActive ? '#76b900' : 'var(--theme-surface-soft)',
                color: isActive ? '#fff' : 'var(--theme-text-muted)',
                border: `1px solid ${isActive ? '#76b900' : 'var(--theme-border)'}`,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="card p-4 text-center" style={{ color: '#ef4444' }}>
          <p className="text-[14px]">Erro ao carregar PRs.</p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>{error}</p>
        </div>
      )}

      {!loading && !error && exerciseNames.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
            {search ? 'Nenhum PR encontrado' : 'Ainda sem recordes'}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
            {search
              ? `Nenhum PR para "${search}"`
              : 'Comece a treinar e registre suas marcas!'}
          </p>
        </div>
      )}

      {!loading && !error && exerciseNames.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {exerciseNames.length} exercício{exerciseNames.length !== 1 ? 's' : ''}
          </p>
          {exerciseNames.map((name) => (
            <PRCard key={name} exerciseName={name} records={grouped[name]} />
          ))}
        </div>
      )}
    </div>
  )
}
