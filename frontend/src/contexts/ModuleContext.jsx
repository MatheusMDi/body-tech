import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const ModuleContext = createContext(null)

const DEFAULT_ACTIVE_MODULES = ['fasting', 'nutrition', 'sleep', 'water', 'workout', 'weight', 'supplements', 'rules', 'score']

export function ModuleProvider({ userId, children }) {
  const [activeModules, setActiveModules] = useState(DEFAULT_ACTIVE_MODULES)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('active_modules')
      .eq('id', userId)
      .single()
    if (data?.active_modules?.length > 0) {
      setActiveModules(data.active_modules)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  function isModuleActive(moduleId) {
    if (!moduleId) return true
    return activeModules.includes(moduleId)
  }

  return (
    <ModuleContext.Provider value={{ activeModules, isModuleActive, loading, refresh: fetch }}>
      {children}
    </ModuleContext.Provider>
  )
}

export function useModules() {
  const ctx = useContext(ModuleContext)
  if (!ctx) {
    // Graceful fallback when not wrapped in provider
    return {
      activeModules: DEFAULT_ACTIVE_MODULES,
      isModuleActive: () => true,
      loading: false,
    }
  }
  return ctx
}
