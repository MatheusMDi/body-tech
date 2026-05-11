import { useState, useEffect } from 'react'
import { getFastingState } from '../lib/utils.js'

export function useFasting() {
  const [state, setState] = useState(() => getFastingState())

  useEffect(() => {
    // Update every 30 seconds
    const interval = setInterval(() => {
      setState(getFastingState())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return state
}
