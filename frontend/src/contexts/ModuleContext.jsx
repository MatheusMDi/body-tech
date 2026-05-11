import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export const ModuleContext = createContext(null)

// All available modules in the application
export const ALL_MODULES = [
  'hydration',
  'nutrition',
  'sleep',
  'measurements',
  'habits',
  'fasting',
  'workout',
  'cycles',
]

const DEFAULT_MODULES = ['hydration', 'nutrition', 'sleep', 'measurements', 'habits']

export function ModuleProvider({ userId, children }) {
  const [activeModules, setActiveModules] = useState(DEFAULT_MODULES)
  const [loading, setLoading] = useState(true)

  const loadModules = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
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

  useEffect(() => {
    loadModules()
  }, [loadModules])

  const isModuleActive = useCallback(
    (moduleId) => {
      if (!moduleId) return true
      return activeModules.includes(moduleId)
    },
    [activeModules],
  )

  const toggleModule = useCallback(
    async (moduleId) => {
      if (!ALL_MODULES.includes(moduleId)) return

      const next = activeModules.includes(moduleId)
        ? activeModules.filter((m) => m !== moduleId)
        : [...activeModules, moduleId]

      setActiveModules(next)

      if (userId) {
        await supabase
          .from('profiles')
          .update({ active_modules: next })
          .eq('id', userId)
      }
    },
    [activeModules, userId],
  )

  return (
    <ModuleContext.Provider
      value={{
        activeModules,
        isModuleActive,
        toggleModule,
        loading,
        refresh: loadModules,
      }}
    >
      {children}
    </ModuleContext.Provider>
  )
}

export function useModules() {
  const ctx = useContext(ModuleContext)
  if (!ctx) throw new Error('useModules must be used within ModuleProvider')
  return ctx
}
