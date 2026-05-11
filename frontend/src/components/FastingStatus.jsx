import { useFasting } from '../hooks/useFasting.js'
import { useSettings } from '../contexts/SettingsContext.jsx'
import { formatDuration } from '../lib/utils.js'

export default function FastingStatus() {
  const fasting = useFasting()
  const { settings } = useSettings()

  const isEating = fasting.isEating
  const progress = fasting.fastingProgressPct
  const durationH = fasting.durationH ?? settings.fastStartHour > settings.fastEndHour
    ? 24 - settings.fastStartHour + settings.fastEndHour
    : settings.fastEndHour - settings.fastStartHour

  const eatDurationH = 24 - durationH

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        borderRadius: '16px',
      }}
    >
      {/* Colored top strip */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: isEating ? '#76b900' : 'var(--theme-border)' }}
      >
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${isEating
              ? ((eatDurationH * 60 - fasting.minutesUntilTransition) / (eatDurationH * 60)) * 100
              : progress}%`,
            backgroundColor: isEating ? '#76b900' : '#c94040',
          }}
        />
      </div>

      <div className="px-5 pt-4 pb-3">
        {/* State badge */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isEating ? '#76b900' : '#c94040' }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            {isEating ? 'Janela Alimentar' : 'Jejum Ativo'}
          </span>
        </div>

        <div
          className="text-[28px] font-bold mb-4"
          style={{ color: isEating ? '#76b900' : 'var(--theme-text)' }}
        >
          {isEating ? 'Janela Aberta' : 'Jejum Ativo'}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-text-faint)' }}>
              {isEating ? 'Janela fecha em' : 'Próxima refeição em'}
            </div>
            <div className="text-[20px] font-bold" style={{ color: 'var(--theme-text)' }}>
              {formatDuration(fasting.minutesUntilTransition)}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
              {fasting.nextTransitionLabel}
            </div>
          </div>

          {!isEating && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-text-faint)' }}>
                Jejum ativo há
              </div>
              <div className="text-[20px] font-bold" style={{ color: 'var(--theme-text)' }}>
                {formatDuration(fasting.fastingElapsedMinutes)}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
                Meta: {durationH}h
              </div>
            </div>
          )}

          {isEating && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-text-faint)' }}>
                Janela alimentar
              </div>
              <div className="text-[20px] font-bold" style={{ color: 'var(--theme-text)' }}>
                {settings.fastEndTime?.slice(0,5)} → {settings.fastStartTime?.slice(0,5)}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
                {eatDurationH}h de janela
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
