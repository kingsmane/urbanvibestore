import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Di luar build Vite (mis. Vitest) konstanta ini tidak terdefinisi.
const url = typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '';
const key = typeof __SUPABASE_PUBLISHABLE_KEY__ !== 'undefined' ? __SUPABASE_PUBLISHABLE_KEY__ : '';

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Klien Supabase (publishable key). Hak akses sepenuhnya diatur RLS di database. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi SUPABASE_PROJECT_URL dan SUPABASE_PUBLISHABLE_KEY di .env.'
    );
  }
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
