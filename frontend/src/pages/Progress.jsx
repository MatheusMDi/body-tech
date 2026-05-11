import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useDashboard } from '../hooks/useDashboard.js'
import { useSleep } from '../hooks/useSleep.js'
import { ProteinWaterChart, BodyMetricsChart } from '../components/ComplianceChart.jsx'
import AchievementsGrid from '../components/AchievementsGrid.jsx'
import { SleepBarChart } from '../components/SleepChart.jsx'
import { todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

const PERIOD_OPTIONS = [7, 30, 60, 90]

function StatCard({ label, value, sub, color }) {
  const textColor = {
    primary: 'text-primary',
    error: 'text-error',
    warning: 'text-warning',
    default: 'text-theme',
  }[color ?? 'primary']

  return (
    <div
      className="rounded-sm p-4 relative overflow-hidden border"
      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
    >
      <div className="corner-square bottom-0 right-0" />
      <div className={`text-[28px] font-bold leading-[1] ${textColor} mb-1`}>{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-theme-faint">{label}</div>
      {sub && <div className="text-[11px] text-theme-faint mt-0.5">{sub}</div>}
    </div>
  )
}

function FlagRow({ label, emoji, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const textColor = color === 'error' ? 'text-error' : color === 'warning' ? 'text-warning' : 'text-theme'
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--theme-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-[16px]">{emoji}</span>
        <span className="text-[14px] text-theme">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-[14px] font-bold ${textColor}`}>{count}x</span>
        <span className="text-[12px] text-theme-faint ml-1">em {total} dias ({pct}%)</span>
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div
      className="rounded-sm overflow-hidden border relative"
      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-theme-faint">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function Progress({ user }) {
  const [period, setPeriod] = useState(30)
  const [metrics, setMetrics] = useState([])
  const { data, loading, refresh } = useDashboard(user?.id, period)
  const { history: sleepHistory } = useSleep(user?.id, todayDateString())

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: true })
      .limit(90)
      .then(({ data: d }) => d && setMetrics(d))
  }, [user?.id])

  // Body progress summary
  const firstWeight = metrics[0]?.weight_kg
  const lastWeight = metrics[metrics.length - 1]?.weight_kg
  const weightLost = firstWeight && lastWeight ? (firstWeight - lastWeight).toFixed(1) : null
  const toGoal = lastWeight ? (lastWeight - PROTOCOL.WEIGHT_GOAL_KG).toFixed(1) : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-1">Dashboard</div>
          <h1 className="text-[24px] font-bold text-theme">Progresso</h1>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => setPeriod(d)}
            className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wide rounded-sm border transition-colors"
            style={{
              backgroundColor: period === d ? 'var(--theme-text)' : 'transparent',
              color: period === d ? 'var(--theme-bg)' : 'var(--theme-text-faint)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-theme-faint text-[14px]">Carregando...</div>
      ) : data ? (
        <>
          {/* Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Streak Atual" value={`${data.streak}d`} sub="dias consecutivos" color="primary" />
            <StatCard label="Streak Máximo" value={`${data.streakMax}d`} sub="recorde histórico" color="default" />
          </div>

          {/* Compliance grid */}
          <SectionCard title="Compliance">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Jejum" value={`${data.compliance.jejum}%`} sub={`${period} dias`} color="primary" />
              <StatCard label="Proteína" value={`${data.compliance.proteina}%`} sub={`meta ${PROTOCOL.PROTEIN_GOAL_G}g`} color="primary" />
              <StatCard label="Água" value={`${data.compliance.agua}%`} sub={`meta ${PROTOCOL.WATER_GOAL_ML / 1000}L`} color="primary" />
              <StatCard label="Treino" value={`${data.compliance.treino}%`} sub="CrossFit" color="primary" />
            </div>
          </SectionCard>

          {/* Protein chart */}
          {data.records?.length > 0 && (
            <SectionCard title="Proteína Diária (g)">
              <ProteinWaterChart records={data.records} />
            </SectionCard>
          )}

          {/* Flag summary */}
          <SectionCard title="Flags Negativas">
            <FlagRow label="Álcool" emoji="🚨" count={data.flags.alcool.count} total={data.flags.alcool.total} color="error" />
            <FlagRow label="Açúcar" emoji="🍬" count={data.flags.acucar.count} total={data.flags.acucar.total} color="error" />
            <FlagRow label="Jejum quebrado" emoji="⚠️" count={data.flags.jejumQuebrado.count} total={data.flags.jejumQuebrado.total} color="warning" />
            <FlagRow label="Sono ruim" emoji="😴" count={data.flags.sonoRuim.count} total={data.flags.sonoRuim.total} color="warning" />
            <FlagRow label="Creatina esquecida" emoji="💊" count={data.flags.creatina.count} total={data.flags.creatina.total} color="warning" />
            <FlagRow label="ZMA esquecido" emoji="💊" count={data.flags.zma.count} total={data.flags.zma.total} color="warning" />
          </SectionCard>
        </>
      ) : null}

      {/* Body progress summary */}
      {metrics.length >= 2 && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Perdidos"
            value={weightLost !== null ? `${parseFloat(weightLost) > 0 ? '▼' : '▲'} ${Math.abs(weightLost)}kg` : '—'}
            sub="vs início"
            color={parseFloat(weightLost) > 0 ? 'primary' : 'error'}
          />
          <StatCard
            label="Para a meta"
            value={toGoal !== null && parseFloat(toGoal) > 0 ? `${toGoal}kg` : '🎯 Meta'}
            sub={`meta ${PROTOCOL.WEIGHT_GOAL_KG}kg`}
            color={parseFloat(toGoal) <= 0 ? 'primary' : 'default'}
          />
        </div>
      )}

      {/* Body metrics chart */}
      {metrics.length > 0 && (
        <SectionCard title="Evolução Corporal">
          <BodyMetricsChart metrics={metrics} weightGoal={PROTOCOL.WEIGHT_GOAL_KG} />
        </SectionCard>
      )}

      {/* Sleep chart */}
      {sleepHistory.length > 1 && (
        <SectionCard title="Sono — Últimas Noites">
          <SleepBarChart history={sleepHistory} />
        </SectionCard>
      )}

      {/* Achievements */}
      <SectionCard title="Conquistas">
        <AchievementsGrid />
      </SectionCard>
    </div>
  )
}
