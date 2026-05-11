import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ user, children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, onboarding_completed, onboarding_step')
      .eq('id', user.id)
      .single()
    setProfile(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { refresh() }, [refresh])

  const isOnboarded = profile?.onboarding_completed === true

  return (
    <OnboardingContext.Provider value={{ profile, loading, isOnboarded, refresh }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => useContext(OnboardingContext)
