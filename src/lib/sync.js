import { supabase } from './supabase.js';

export async function loadFromCloud(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('profile, sessions')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return { profile: data.profile || {}, sessions: data.sessions || [] };
}

export async function saveToCloud(userId, state) {
  const { error } = await supabase.from('user_data').upsert({
    id: userId,
    profile: state.profile,
    sessions: state.sessions,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[sync] Error guardando en la nube:', error.message);
}
