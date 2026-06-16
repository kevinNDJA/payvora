import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

// Lightweight React hook to manage Supabase auth in the frontend.
// Exposes: user, session, loading, error, signUp, signIn, signOut, resetPassword
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // v2: getSession(); older SDKs may differ but this will usually work
        if (supabase.auth && supabase.auth.getSession) {
          const { data } = await supabase.auth.getSession();
          const s = data?.session ?? null;
          if (!mounted) return;
          setSession(s);
          setUser(s?.user ?? null);
        } else if (supabase.auth && supabase.auth.session) {
          // fallback for older SDK
          const s = supabase.auth.session();
          if (!mounted) return;
          setSession(s);
          setUser(s?.user ?? null);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const listener = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        // unsubscribe the listener where supported
        if (listener && listener.subscription && typeof listener.subscription.unsubscribe === "function") {
          listener.subscription.unsubscribe();
        } else if (listener && typeof listener.unsubscribe === "function") {
          listener.unsubscribe();
        }
      } catch {
        // ignore
      }
    };
  }, []);

  const signUp = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.auth.signUp) {
        const res = await supabase.auth.signUp({ email, password });
        return res;
      }
      // fallback
      const res = await supabase.auth.api.signUpWithEmail(email, password);
      return res;
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.auth.signInWithPassword) {
        const res = await supabase.auth.signInWithPassword({ email, password });
        return res;
      }
      // older SDK
      const res = await supabase.auth.signIn({ email, password });
      return res;
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return res;
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.auth.resetPasswordForEmail) {
        const res = await supabase.auth.resetPasswordForEmail(email, options);
        return res;
      }
      // older SDKs may expose a different API
      const res = await supabase.auth.api.resetPasswordForEmail(email);
      return res;
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
