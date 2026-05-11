import { createContext, useContext } from 'react'
import { useUserSettings } from '../hooks/useUserSettings.js'

export const SettingsContext = createContext(null)

export function SettingsProvider({ userId, children }) {
  const { settings, profile, loading, updateSetting, refresh } = useUserSettings(userId)

  return (
    <SettingsContext.Provider value={{ settings, profile, loading, updateSetting, refresh }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
