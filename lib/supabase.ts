import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

export function getSupabaseErrorMessage(): string | null {
  if (!supabaseUrl) return "Supabase URL is not configured.";
  if (!supabaseAnonKey) return "Supabase Anon Key is not configured.";
  return null;
}

if (!supabase) {
  console.warn(
    "Supabase client not initialized. Check your environment variables.",
  );
}
