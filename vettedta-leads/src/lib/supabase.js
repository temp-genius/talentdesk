import { createClient } from '@supabase/supabase-js'

// Edge Function/REST/Auth URLs are all resolved as relative paths against
// this value (e.g. new URL('functions/v1', supabaseUrl)). A stray trailing
// slash is harmless, but a stray trailing path segment (e.g. someone pastes
// the REST URL "https://ref.supabase.co/rest/v1" instead of the project URL)
// silently breaks that resolution — so strip whitespace and any path/query
// down to just the origin before handing it to the client.
function normaliseSupabaseUrl(value) {
  if (!value) return value
  try {
    return new URL(value.trim()).origin
  } catch {
    return value.trim()
  }
}

const supabaseUrl = normaliseSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill in your Supabase project credentials.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
