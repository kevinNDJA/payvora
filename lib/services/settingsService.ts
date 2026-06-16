import supabase from '../supabaseClient';
import type { Settings } from '../../types/settings';

export async function getSettings(userId: string) {
  if (!userId) return { data: null, error: 'No userId' };
  const { data, error } = await supabase.from('settings').select('*').eq('id', userId).maybeSingle();
  return { data, error };
}

export async function upsertSettings(userId: string, changes: Partial<Settings>) {
  if (!userId) return { data: null, error: 'No userId' };
  const payload = { id: userId, ...changes };
  const { data, error } = await supabase.from('settings').upsert(payload, { returning: 'representation' }).select();
  return { data, error };
}

export async function uploadLogo(userId: string, file) {
  if (!userId || !file) return { error: 'No userId or file' };
  const ext = file.name?.split('.').pop() || 'png';
  const path = `${userId}/logo-${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError };
  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
  const publicUrl = urlData?.publicUrl || null;
  if (publicUrl) {
    await upsertSettings(userId, { logo_url: publicUrl });
  }
  return { data: publicUrl, path };
}

export async function removeLogo(userId: string, publicUrl?: string) {
  if (!userId) return { error: 'No userId' };
  if (!publicUrl) {
    // clear setting only
    await upsertSettings(userId, { logo_url: null });
    return { data: null };
  }
  try {
    const parts = publicUrl.split('/logos/');
    const path = parts.length > 1 ? parts[1].split('?')[0] : null;
    if (path) {
      const { error } = await supabase.storage.from('logos').remove([path]);
      if (error) return { error };
    }
    await upsertSettings(userId, { logo_url: null });
    return { data: null };
  } catch (e) {
    return { error: e };
  }
}

export default { getSettings, upsertSettings, uploadLogo };
