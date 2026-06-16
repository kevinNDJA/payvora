import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  // runtime warning for developers running the frontend without env configured
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. See mon-application/.env.example')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
