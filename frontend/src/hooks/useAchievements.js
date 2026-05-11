import { useState, useEffect, useCallback } from 'react'
import { computeAchievementProgress } from '../services/achievements.js'

export function useAchievements(userId) {
  const [achievements, setAchievements] = useState({})
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const data = await computeAchievementProgress(userId)
    setAchievements(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const unlocked = Object.values(achievements).filter(a => a.unlocked)
  const locked = Object.values(achievements).filter(a => !a.unlocked)

  return { achievements, unlocked, locked, loading, refresh: fetch }
}
