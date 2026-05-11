import { PROTOCOL } from './constants.js'

/**
 * Returns the current fasting state.
 * Accepts optional options to override the default protocol hours.
 * This allows per-user customization.
 */
export function getFastingState(now = new Date(), options = {}) {
  const startHour = options.fastStartHour ?? PROTOCOL.FASTING_START_HOUR
  const endHour   = options.fastEndHour   ?? PROTOCOL.FASTING_END_HOUR
  const durationH = computeFastingDuration(startHour, endHour)

  const hour = now.getHours()
  const minute = now.getMinutes()
  const totalMinutes = hour * 60 + minute

  const windowOpen  = endHour * 60    // eating starts
  const windowClose = startHour * 60  // eating ends

  const isEating = totalMinutes >= windowOpen && totalMinutes < windowClose

  if (isEating) {
    const minutesUntilClose = windowClose - totalMinutes
    const fastingStartedAt = getYesterday(now)
    fastingStartedAt.setHours(startHour, 0, 0, 0)
    return {
      state: 'EATING',
      isEating: true,
      minutesUntilTransition: minutesUntilClose,
      nextTransitionLabel: `${pad2(startHour)}:00 (fechar janela)`,
      fastingStartedAt,
      fastingElapsedMinutes: 0,
      fastingProgressPct: 0,
      fastStartHour: startHour,
      fastEndHour: endHour,
      durationH,
    }
  }

  // Currently fasting
  let fastingStartedAt
  if (totalMinutes >= windowClose) {
    fastingStartedAt = new Date(now)
    fastingStartedAt.setHours(startHour, 0, 0, 0)
  } else {
    fastingStartedAt = getYesterday(now)
    fastingStartedAt.setHours(startHour, 0, 0, 0)
  }

  const elapsedMs = now - fastingStartedAt
  const elapsedMinutes = Math.floor(elapsedMs / 60000)
  const totalFastMinutes = durationH * 60

  const nextWindowOpen = new Date(now)
  if (totalMinutes >= windowClose) {
    nextWindowOpen.setDate(nextWindowOpen.getDate() + 1)
  }
  nextWindowOpen.setHours(endHour, 0, 0, 0)

  const minutesUntilTransition = Math.max(0, Math.floor((nextWindowOpen - now) / 60000))

  return {
    state: 'FASTING',
    isEating: false,
    minutesUntilTransition,
    nextTransitionLabel: `${pad2(endHour)}:00 (abrir janela)`,
    fastingStartedAt,
    fastingElapsedMinutes: Math.min(elapsedMinutes, totalFastMinutes),
    fastingProgressPct: Math.min(100, (elapsedMinutes / totalFastMinutes) * 100),
    fastStartHour: startHour,
    fastEndHour: endHour,
    durationH,
  }
}

function computeFastingDuration(startHour, endHour) {
  // If start > end, window crosses midnight: e.g. 20→14 = 18h
  if (startHour > endHour) return 24 - startHour + endHour
  return endHour - startHour
}

function pad2(n) { return String(n).padStart(2, '0') }

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

export function isOutsideWindow(date = new Date(), options = {}) {
  const state = getFastingState(date, options)
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

export function parseTimeToHour(timeStr) {
  if (!timeStr) return null
  const parts = timeStr.split(':')
  return parseInt(parts[0], 10)
}
