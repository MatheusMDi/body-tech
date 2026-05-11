import { CHECKLIST_ITEMS } from '../lib/constants.js'

export default function DailyChecklist({ checklist, onMarkTreino, onMarkCaminhada, completedCount, totalCount }) {
  return (
    <div className="card-dark border border-hairline-strong rounded-sm overflow-hidden">
      <div className="relative px-6 pt-5 pb-4 border-b border-hairline-strong">
        <div className="corner-square top-0 right-0" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-mute">Checklist Hoje</span>
          <span className="text-primary font-bold text-[14px]">{completedCount}/{totalCount}</span>
        </div>
        <div className="mt-2 h-1 bg-surface-elevated rounded-none overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-hairline-strong">
        {CHECKLIST_ITEMS.map(item => {
          const done = checklist[item.id]
          const isManual = !item.auto

          return (
            <div key={item.id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[16px]">{item.emoji}</span>
                <div>
                  <div className={`text-[14px] font-bold ${done ? 'text-primary' : 'text-on-dark'}`}>
                    {item.label}
                  </div>
                  {item.weekly && (
                    <div className="text-[10px] text-mute uppercase tracking-wide">1x/semana</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isManual && (
                  <button
                    onClick={() => {
                      if (item.id === 'treino') onMarkTreino(!done)
                      if (item.id === 'caminhada') onMarkCaminhada(!done)
                    }}
                    className={`w-6 h-6 border rounded-sm flex items-center justify-center transition-colors ${
                      done
                        ? 'bg-primary border-primary'
                        : 'bg-transparent border-hairline-strong'
                    }`}
                  >
                    {done && (
                      <svg className="w-4 h-4 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
                {!isManual && (
                  <div className={`w-6 h-6 border rounded-sm flex items-center justify-center ${
                    done ? 'bg-primary border-primary' : 'border-hairline-strong'
                  }`}>
                    {done && (
                      <svg className="w-4 h-4 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
