import supabase from '../supabaseClient';
import type { Invoice } from '../../types/invoice';

export async function listInvoices({ userId, limit = 50, offset = 0 } = {}) {
  if (!userId) return { data: [], error: 'No userId' };
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error };
}

export async function getInvoice(id) {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
  return { data, error };
}

export async function createInvoice(invoice: Partial<Invoice>) {
  const { data, error } = await supabase.from('invoices').insert(invoice).select();
  return { data, error };
}

export async function updateInvoice(id: string, changes: Partial<Invoice>) {
  const { data, error } = await supabase.from('invoices').update(changes).eq('id', id).select();
  return { data, error };
}

export async function deleteInvoice(id: string) {
  const { data, error } = await supabase.from('invoices').delete().eq('id', id);
  return { data, error };
}

export default { listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };
