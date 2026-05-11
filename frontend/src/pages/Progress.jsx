import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useDashboard } from '../hooks/useDashboard.js'
import { ProteinWaterChart, BodyMetricsChart } from '../components/ComplianceChart.jsx'
import { todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

const PERIOD_OPTIONS = [7, 30, 60, 90]

function StatCard({ label, value, sub, color = 'primary' }) {
  const textColor = color === 'primary' ? 'text-primary' : color === 'error' ? 'text-error' : color === 'warning' ? 'text-warning' : 'text-on-dark'
  return (
    <div className="card-dark border border-hairline-strong rounded-sm p-4 relative overflow-hidden">
      <div className="corner-square bottom-0 right-0" />
      <div className={`text-[28px] font-bold leading-[1] ${textColor} mb-1`}>{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-mute">{label}</div>
      {sub && <div className="text-[11px] text-stone mt-0.5">{sub}</div>}
    </div>
  )
}

function FlagRow({ label, emoji, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const textColor = color === 'error' ? 'text-error' : color === 'warning' ? 'text-warning' : 'text-on-dark'

  return (
    <div className="flex items-center justify-between py-3 border-b border-hairline-strong last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[16px]">{emoji}</span>
        <span className="text-[14px] text-on-dark">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-[14px] font-bold ${textColor}`}>{count}x</span>
        <span className="text-[12px] text-mute ml-1">em {total} dias ({pct}%)</span>
      </div>
    </div>
  )
}

function BodyMetricsInput({ userId, onSaved }) {
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('body_metrics').insert({
      user_id: userId,
      measured_at: todayDateString(),
      weight_kg: parseFloat(weight) || null,
      waist_cm: parseFloat(waist) || null,
    })
    setSaving(false)
    setWeight('')
    setWaist('')
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className="card-dark border border-hairline-strong rounded-sm p-5 relative overflow-hidden">
      <div className="corner-square top-0 left-0" />
      <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-4">
        Medidas Semanais
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="50"
            max="200"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={`${PROTOCOL.WEIGHT_GOAL_KG}`}
            className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
            Cintura (cm)
          </label>
          <input
            type="number"
            step="0.5"
            min="50"
            max="200"
            value={waist}
            onChange={e => setWaist(e.target.value)}
            placeholder="88"
            className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
          />
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Salvando...' : 'Salvar Medidas'}
      </button>
    </form>
  )
}

export default function Progress({ user }) {
  const [period, setPeriod] = useState(30)
  const [metrics, setMetrics] = useState([])
  const { data, loading, refresh } = useDashboard(user?.id, period)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: true })
      .limit(90)
      .then(({ data }) => data && setMetrics(data))
  }, [user?.id])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-mute mb-1">Dashboard</div>
          <h1 className="text-[24px] font-bold text-on-dark">Progresso</h1>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => setPeriod(d)}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wide rounded-sm border transition-colors ${
              period === d
                ? 'bg-ink text-on-dark border-ink'
                : 'bg-transparent text-stone border-hairline-strong'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-stone text-[14px]">Carregando...</div>
      ) : data ? (
        <>
          {/* Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Streak Atual" value={`${data.streak}d`} sub="dias consecutivos" color="primary" />
            <StatCard label="Streak Máximo" value={`${data.streakMax}d`} sub="recorde histórico" color="default" />
          </div>

          {/* Compliance grid */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">Compliance</div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Jejum" value={`${data.compliance.jejum}%`} sub={`${period} dias`} color="primary" />
              <StatCard label="Proteína" value={`${data.compliance.proteina}%`} sub={`meta ${PROTOCOL.PROTEIN_GOAL_G}g`} color="primary" />
              <StatCard label="Água" value={`${data.compliance.agua}%`} sub={`meta ${PROTOCOL.WATER_GOAL_ML / 1000}L`} color="primary" />
              <StatCard label="Treino" value={`${data.compliance.treino}%`} sub="CrossFit" color="primary" />
            </div>
          </div>

          {/* Protein/water chart */}
          {data.records?.length > 0 && (
            <div className="card-dark border border-hairline-strong rounded-sm p-4 relative overflow-hidden">
              <div className="corner-square top-0 right-0" />
              <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">Proteína Diária (g)</div>
              <ProteinWaterChart records={data.records} />
            </div>
          )}

          {/* Flag summary */}
          <div className="card-dark border border-hairline-strong rounded-sm overflow-hidden relative">
            <div className="px-5 py-4 border-b border-hairline-strong">
              <div className="text-[11px] font-bold uppercase tracking-widest text-mute">Flags Negativas</div>
            </div>
            <div className="px-5 py-2">
              <FlagRow label="Álcool" emoji="🚨" count={data.flags.alcool.count} total={data.flags.alcool.total} color="error" />
              <FlagRow label="Açúcar" emoji="🍬" count={data.flags.acucar.count} total={data.flags.acucar.total} color="error" />
              <FlagRow label="Jejum quebrado" emoji="⚠️" count={data.flags.jejumQuebrado.count} total={data.flags.jejumQuebrado.total} color="warning" />
              <FlagRow label="Sono ruim" emoji="😴" count={data.flags.sonoRuim.count} total={data.flags.sonoRuim.total} color="warning" />
              <FlagRow label="Creatina esquecida" emoji="💊" count={data.flags.creatina.count} total={data.flags.creatina.total} color="warning" />
              <FlagRow label="ZMA esquecido" emoji="💊" count={data.flags.zma.count} total={data.flags.zma.total} color="warning" />
            </div>
          </div>
        </>
      ) : null}

      {/* Body metrics chart */}
      {metrics.length > 0 && (
        <div className="card-dark border border-hairline-strong rounded-sm p-4 relative overflow-hidden">
          <div className="corner-square top-0 left-0" />
          <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">
            Evolução Corporal
          </div>
          <BodyMetricsChart metrics={metrics} weightGoal={PROTOCOL.WEIGHT_GOAL_KG} />
        </div>
      )}

      {/* Body metrics input */}
      <BodyMetricsInput userId={user?.id} onSaved={() => {
        supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('measured_at', { ascending: true })
          .limit(90)
          .then(({ data: d }) => d && setMetrics(d))
      }} />
    </div>
  )
}
