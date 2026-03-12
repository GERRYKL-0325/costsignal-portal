import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Browser/client-side Supabase client.
 * Uses anon key + RLS — safe to expose.
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client with service_role key.
 * NEVER expose this to the client — only use in server components / API routes.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Type helpers
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_prefix: string;
          key_hash: string;
          created_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
          label: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_prefix: string;
          key_hash: string;
          created_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
          label?: string;
        };
      };
      usage_logs: {
        Row: {
          id: number;
          key_prefix: string;
          user_id: string | null;
          endpoint: string;
          series_requested: string[] | null;
          status_code: number | null;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          key_prefix: string;
          user_id?: string | null;
          endpoint: string;
          series_requested?: string[] | null;
          status_code?: number | null;
          response_time_ms?: number | null;
          created_at?: string;
        };
      };
    };
  };
};
