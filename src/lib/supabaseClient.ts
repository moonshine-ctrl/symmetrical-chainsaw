import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export function createClientInstance() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// ✅ Tambahan ini penting:
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)

export default supabase
