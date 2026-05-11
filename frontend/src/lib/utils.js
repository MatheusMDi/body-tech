import { PROTOCOL } from './constants.js'

/**
 * Returns the current fasting state based on current time.
 * Fasting: 20:00 → 14:00 (18h). Eating: 14:00 → 20:00 (6h).
 */
export function getFastingState(now = new Date()) {
  const hour = now.getHours()
  const minute = now.getMinutes()
  const totalMinutes = hour * 60 + minute

  const windowOpen = PROTOCOL.FASTING_END_HOUR * 60   // 14:00 = 840
  const windowClose = PROTOCOL.FASTING_START_HOUR * 60 // 20:00 = 1200

  const isEating = totalMinutes >= windowOpen && totalMinutes < windowClose

  if (isEating) {
    const minutesUntilClose = windowClose - totalMinutes
    const fastingStartedAt = getYesterday(now)
    fastingStartedAt.setHours(PROTOCOL.FASTING_START_HOUR, 0, 0, 0)
    return {
      state: 'EATING',
      isEating: true,
      minutesUntilTransition: minutesUntilClose,
      nextTransitionLabel: `${formatTime(PROTOCOL.FASTING_START_HOUR, 0)} (fechar janela)`,
      fastingStartedAt,
      fastingElapsedMinutes: 0,
      fastingProgressPct: 0,
    }
  }

  // Currently fasting
  let fastingStartedAt
  if (totalMinutes >= windowClose) {
    // Past 20:00 today
    fastingStartedAt = new Date(now)
    fastingStartedAt.setHours(PROTOCOL.FASTING_START_HOUR, 0, 0, 0)
  } else {
    // Before 14:00 today — fasting started yesterday at 20:00
    fastingStartedAt = getYesterday(now)
    fastingStartedAt.setHours(PROTOCOL.FASTING_START_HOUR, 0, 0, 0)
  }

  const elapsedMs = now - fastingStartedAt
  const elapsedMinutes = Math.floor(elapsedMs / 60000)
  const totalFastMinutes = PROTOCOL.FASTING_DURATION_HOURS * 60

  const nextWindowOpen = new Date(now)
  if (totalMinutes >= windowClose) {
    // Next eating window is tomorrow at 14:00
    nextWindowOpen.setDate(nextWindowOpen.getDate() + 1)
  }
  nextWindowOpen.setHours(PROTOCOL.FASTING_END_HOUR, 0, 0, 0)

  const minutesUntilTransition = Math.max(0, Math.floor((nextWindowOpen - now) / 60000))

  return {
    state: 'FASTING',
    isEating: false,
    minutesUntilTransition,
    nextTransitionLabel: `${formatTime(PROTOCOL.FASTING_END_HOUR, 0)} (abrir janela)`,
    fastingStartedAt,
    fastingElapsedMinutes: Math.min(elapsedMinutes, totalFastMinutes),
    fastingProgressPct: Math.min(100, (elapsedMinutes / totalFastMinutes) * 100),
  }
}

export function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function formatTime(hour, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function getYesterday(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d
}

export function todayDateString(date = new Date()) {
  return date.toISOString().split('T')[0]
}

export function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const day = days[date.getDay()]
  const d = date.getDate()
  const m = date.getMonth() + 1
  return `${day} ${d}/${m}`
}

export function isOutsideWindow(date = new Date()) {
  const state = getFastingState(date)
  return !state.isEating
}

export function formatLoggedAt(isoString) {
  const d = new Date(isoString)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function mlToLiters(ml) {
  return (ml / 1000).toFixed(1)
}

export function pct(value, goal) {
  if (!goal) return 0
  return Math.min(100, Math.round((value / goal) * 100))
}

export function getWeekDates(referenceDate = new Date()) {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate)
    d.setDate(d.getDate() - i)
    dates.push(todayDateString(d))
  }
  return dates
}
