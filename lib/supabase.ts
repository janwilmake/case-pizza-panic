import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client. It uses the service-role key, so it must never be
// imported into a Client Component. All DB access goes through the API routes.
// Created lazily so importing this module (e.g. during `next build`) doesn't
// require credentials — they're only needed when a request actually runs.

export const ORDERS_TABLE = "orders";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill them in (see README).",
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
