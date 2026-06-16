import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (id) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (id, changes) => {
    if (!id) throw new Error('No user id');
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('profiles').upsert({ id, ...changes }, { returning: 'representation' });
      if (error) throw error;
      setProfile(data?.[0] ?? data);
      return data;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) return;
      await fetchProfile(userId);
    })();
    return () => { mounted = false; };
  }, [userId, fetchProfile]);

  return { profile, loading, error, fetchProfile, updateProfile };
}
