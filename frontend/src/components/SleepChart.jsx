import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-hairline-strong rounded-sm px-3 py-2 text-[12px]">
      <div className="text-mute mb-1">{label}</div>
      <div className="font-bold text-on-dark">{payload[0]?.value}h</div>
      {payload[0]?.payload?.quality && (
        <div className="text-mute">Qualidade: {'⭐'.repeat(payload[0].payload.quality)}</div>
      )}
    </div>
  )
}

export function SleepBarChart({ history }) {
  const data = [...history]
    .reverse()
    .slice(0, 7)
    .map(h => ({
      date: new Date(h.log_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
      horas: h.hours_slept,
      quality: h.quality,
    }))

  const barColor = (value) => {
    if (value >= 7) return '#76b900'
    if (value >= 6) return '#df6500'
    return '#e52020'
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#5e5e5e" />
        <XAxis dataKey="date" tick={{ fill: '#757575', fontSize: 10 }} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fill: '#757575', fontSize: 10 }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={7} stroke="#76b900" strokeDasharray="4 2" label={{ value: '7h', fill: '#76b900', fontSize: 10 }} />
        <Bar
          dataKey="horas"
          radius={[1, 1, 0, 0]}
          fill="#76b900"
          // Color per bar based on value
          label={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
