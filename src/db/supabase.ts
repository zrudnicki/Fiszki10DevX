import { createClient, type SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn("Missing Supabase env vars in DEV:", { supabaseUrl, hasAnonKey: !!supabaseAnonKey });
  }
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export properly typed client
export type SupabaseClient = BaseSupabaseClient<Database>;

// Export types
export type { User, Session } from "@supabase/supabase-js";
export type { Database };
