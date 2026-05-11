import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getOnboardingProgress } from '../services/onboarding.js'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ user, children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    const data = await getOnboardingProgress(user.id)
    setSettings(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { refresh() }, [refresh])

  const isOnboarded = settings?.onboarding_completed === true

  return (
    <OnboardingContext.Provider value={{ settings, loading, isOnboarded, refresh }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => useContext(OnboardingContext)
