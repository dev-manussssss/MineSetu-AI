/**
 * MineSetu AI — Supabase Client Factory (Server-Side)
 *
 * Provides two client modes:
 * 1. Admin client (service_role key) — for system operations, bypasses RLS.
 * 2. User-scoped client — injects the user's JWT so RLS policies apply.
 *
 * SECURITY: The service_role key must NEVER be exposed to the browser.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns a Supabase admin client that bypasses RLS.
 * Use only for system-level operations (e.g., seed verification, migrations).
 */
export function getAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Ensure these are set in your Vercel environment variables.'
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Returns a Supabase client scoped to the user's JWT.
 * All database queries respect Row-Level Security policies.
 */
export function getUserClient(accessToken: string): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Ensure these are set in your environment variables.'
    );
  }
  const clientOptions: Record<string, any> = {
    auth: { autoRefreshToken: false, persistSession: false },
  };
  if (accessToken && accessToken.trim().length > 0) {
    clientOptions.global = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions);
}
