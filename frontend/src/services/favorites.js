import { supabase } from '../lib/supabase.js'

export async function getFavorites(userId, limit = 5) {
  const { data } = await supabase
    .from('meal_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false })
    .order('last_used_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function upsertFavorite(userId, { description, protein_g, carb_g }) {
  const { data: existing } = await supabase
    .from('meal_favorites')
    .select('id, use_count')
    .eq('user_id', userId)
    .eq('description', description)
    .single()

  if (existing) {
    await supabase
      .from('meal_favorites')
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
        protein_g,
        carb_g,
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('meal_favorites')
      .insert({ user_id: userId, description, protein_g, carb_g, use_count: 1 })
  }
}

export async function deleteFavorite(favoriteId) {
  await supabase.from('meal_favorites').delete().eq('id', favoriteId)
}
