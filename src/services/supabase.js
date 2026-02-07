import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseUrl.startsWith('https://') || !supabaseAnonKey) {
    console.error('MISSING OR INVALID SUPABASE CONFIGURATION. Please check your .env file.')
}

// Ensure the client doesn't crash the whole app if values are missing
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

