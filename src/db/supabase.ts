import { createClient, type SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL:", supabaseUrl);
  console.error("Supabase Anon Key:", supabaseAnonKey);
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

console.log("Initializing Supabase with URL:", supabaseUrl);
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export properly typed client
export type SupabaseClient = BaseSupabaseClient<Database>;

// Export types
export type { User, Session } from "@supabase/supabase-js";
export type { Database };
