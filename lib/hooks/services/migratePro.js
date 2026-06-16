import supabase from '../../supabaseClient';

// Migrate local `isPro` flag stored in `window.storage` to Supabase `profiles.is_pro`.
export async function migrateLocalIsProToProfile(userId) {
  if (!userId) return false;
  try {
    if (typeof window === 'undefined') return false;
    const entry = await window.storage.get('isPro');
    const localIsPro = entry ? JSON.parse(entry.value) : false;
    if (!localIsPro) return false;
    // upsert profile
    const { data, error } = await supabase.from('profiles').upsert({ id: userId, is_pro: true }, { returning: 'minimal' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('migrateLocalIsProToProfile failed', e);
    return false;
  }
}

export default { migrateLocalIsProToProfile };
