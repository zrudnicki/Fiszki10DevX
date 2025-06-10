/// <reference types="astro/client" />
import type { User, Session, SupabaseClient } from "./db/supabase";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
    session: Session | null;
    user: User | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
