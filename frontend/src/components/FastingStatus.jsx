import { useFasting } from '../hooks/useFasting.js'
import { formatDuration, formatTime } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

export default function FastingStatus() {
  const fasting = useFasting()

  const isEating = fasting.isEating
  const progress = fasting.fastingProgressPct

  return (
    <div className="relative card-dark border border-hairline-strong rounded-sm overflow-hidden">
      {/* Corner square */}
      <div className="corner-square top-0 left-0" />

      {/* Status header */}
      <div className={`px-6 pt-6 pb-4 border-b border-hairline-strong`}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-3 h-3 rounded-full ${isEating ? 'bg-primary' : 'bg-error'}`} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-mute">
            {isEating ? 'Janela Alimentar' : 'Jejum Ativo'}
          </span>
        </div>
        <div className={`text-[36px] font-bold leading-[1.25] ${isEating ? 'text-primary' : 'text-error'}`}>
          {isEating ? '🟢 JANELA ABERTA' : '🔴 JEJUM ATIVO'}
        </div>
      </div>

      {/* Time info */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-mute mb-1">
            {isEating ? 'Janela fecha em' : 'Próxima refeição em'}
          </div>
          <div className="text-[22px] font-bold text-on-dark">
            {formatDuration(fasting.minutesUntilTransition)}
          </div>
          <div className="text-[12px] text-mute">{fasting.nextTransitionLabel}</div>
        </div>

        {!isEating && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-mute mb-1">
              Jejum ativo há
            </div>
            <div className="text-[22px] font-bold text-on-dark">
              {formatDuration(fasting.fastingElapsedMinutes)}
            </div>
            <div className="text-[12px] text-mute">
              Meta: {PROTOCOL.FASTING_DURATION_HOURS}h
            </div>
          </div>
        )}

        {isEating && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-mute mb-1">
              Janela: 14h → 20h
            </div>
            <div className="text-[22px] font-bold text-on-dark">6h</div>
            <div className="text-[12px] text-mute">de janela alimentar</div>
          </div>
        )}
      </div>

      {/* Progress bar — only shown during fasting */}
      {!isEating && (
        <div className="px-6 pb-5">
          <div className="flex justify-between text-[10px] font-bold uppercase text-mute mb-2">
            <span>Progresso do jejum</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-none overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone mt-1">
            <span>{formatTime(PROTOCOL.FASTING_START_HOUR, 0)}</span>
            <span>{formatTime(PROTOCOL.FASTING_END_HOUR, 0)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
