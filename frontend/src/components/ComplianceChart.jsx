import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine
} from 'recharts'
import { formatDateLabel } from '../lib/utils.js'

const COLORS = {
  primary: '#76b900',
  error: '#e52020',
  warning: '#df6500',
  mute: '#757575',
  hairline: '#5e5e5e',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-hairline-strong rounded-sm px-3 py-2 text-[12px]">
      <div className="text-mute mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {typeof p.value === 'number' && p.name.includes('kg') ? `${p.value}kg` : p.name.includes('cm') ? `${p.value}cm` : `${p.value}${p.name.includes('L') ? 'L' : 'g'}`}
        </div>
      ))}
    </div>
  )
}

export function ProteinWaterChart({ records }) {
  const data = records.map(r => ({
    date: formatDateLabel(r.date),
    Proteína: Math.round(r.total_protein_g || 0),
    Água: parseFloat(((r.total_water_ml || 0) / 1000).toFixed(1)),
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 2" stroke={COLORS.hairline} />
        <XAxis dataKey="date" tick={{ fill: COLORS.mute, fontSize: 10 }} tickLine={false} />
        <YAxis tick={{ fill: COLORS.mute, fontSize: 10 }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="Proteína" stroke={COLORS.primary} fill="url(#proteinGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BodyMetricsChart({ metrics, weightGoal = 91 }) {
  const data = metrics.map(m => ({
    date: formatDateLabel(m.measured_at),
    Peso: m.weight_kg,
    Cintura: m.waist_cm,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="2 2" stroke={COLORS.hairline} />
        <XAxis dataKey="date" tick={{ fill: COLORS.mute, fontSize: 10 }} tickLine={false} />
        <YAxis tick={{ fill: COLORS.mute, fontSize: 10 }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: COLORS.mute }}
        />
        <ReferenceLine y={weightGoal} stroke={COLORS.primary} strokeDasharray="4 2" label={{ value: `Meta ${weightGoal}kg`, fill: COLORS.primary, fontSize: 10 }} />
        <Line type="monotone" dataKey="Peso" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary, r: 3 }} />
        <Line type="monotone" dataKey="Cintura" stroke={COLORS.warning} strokeWidth={2} dot={{ fill: COLORS.warning, r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
