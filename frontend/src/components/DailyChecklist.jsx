import { useSettings } from '../contexts/SettingsContext.jsx'
import { CHECKLIST_ITEMS } from '../lib/constants.js'

export default function DailyChecklist({ checklist, onMarkTreino, onMarkCaminhada, completedCount, totalCount }) {
  const { settings } = useSettings()
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--theme-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-faint)' }}>
            Checklist Hoje
          </span>
          <span className="text-primary font-bold text-[13px]">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#76b900' : pct >= 60 ? '#c06010' : '#c94040' }}
          />
        </div>
      </div>

      <div>
        {CHECKLIST_ITEMS.map((item, i) => {
          const done = checklist[item.id]
          const isManual = !item.auto
          const isLast = i === CHECKLIST_ITEMS.length - 1

          return (
            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: isLast ? 'none' : '1px solid var(--theme-border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[18px]">{item.emoji}</span>
                <div>
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: done ? '#76b900' : 'var(--theme-text)' }}
                  >
                    {item.label}
                  </div>
                  {item.id === 'agua' && (
                    <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
                      Meta: {settings.waterGoalL.toFixed(1)}L
                    </div>
                  )}
                  {item.id === 'proteina' && (
                    <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
                      Meta: {settings.proteinGoalG}g
                    </div>
                  )}
                  {item.weekly && (
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--theme-text-faint)' }}>
                      1x/semana
                    </div>
                  )}
                </div>
              </div>

              {isManual ? (
                <button
                  onClick={() => {
                    if (item.id === 'treino')   onMarkTreino(!done)
                    if (item.id === 'caminhada') onMarkCaminhada(!done)
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: done ? '#76b900' : 'transparent',
                    border: `2px solid ${done ? '#76b900' : 'var(--theme-border)'}`,
                  }}
                >
                  {done && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="#000" fill="none" strokeWidth={3}>
                      <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    backgroundColor: done ? '#76b900' : 'transparent',
                    border: `2px solid ${done ? '#76b900' : 'var(--theme-border)'}`,
                  }}
                >
                  {done && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="#000" fill="none" strokeWidth={3}>
                      <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
