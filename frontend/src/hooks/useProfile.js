import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  async function updateProfile(fields) {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId)
      .select()
      .single()
    if (data) setProfile(data)
    return data
  }

  return { profile, loading, updateProfile, refresh: fetch }
}
