import supabase from '../supabaseClient';
import type { Client } from '../../types/client';

export async function listClients({ userId, limit = 50, offset = 0 } = {}) {
  if (!userId) return { data: [], error: 'No userId' };
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);
  return { data, error };
}

export async function createClient(client: Partial<Client>) {
  const { data, error } = await supabase.from('clients').insert(client).select();
  return { data, error };
}

export async function updateClient(id: string, changes: Partial<Client>) {
  const { data, error } = await supabase.from('clients').update(changes).eq('id', id).select();
  return { data, error };
}

export async function deleteClient(id: string) {
  const { data, error } = await supabase.from('clients').delete().eq('id', id);
  return { data, error };
}

export default { listClients, createClient, updateClient, deleteClient };
