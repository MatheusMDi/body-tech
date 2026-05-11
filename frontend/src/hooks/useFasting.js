import { useState, useEffect, useContext } from 'react'
import { getFastingState } from '../lib/utils.js'
import { SettingsContext } from '../contexts/SettingsContext.jsx'

function getFastingOptions(settings) {
  if (!settings) return {}
  return { fastStartHour: settings.fastStartHour, fastEndHour: settings.fastEndHour }
}

export function useFasting() {
  // SettingsContext may not be available in some call sites — graceful fallback
  let settings = null
  try {
    const ctx = useContext(SettingsContext)
    settings = ctx?.settings ?? null
  } catch {}

  const options = getFastingOptions(settings)
  const [state, setState] = useState(() => getFastingState(new Date(), options))

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getFastingState(new Date(), options))
    }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.fastStartHour, settings?.fastEndHour])

  return state
}
