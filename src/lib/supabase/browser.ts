"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | undefined;

/** One shared client per tab; it keeps the sign-in session in cookies the server can read */
export function supabaseBrowser() {
  return (client ??= createBrowserClient(supabaseUrl, supabaseAnonKey));
}
