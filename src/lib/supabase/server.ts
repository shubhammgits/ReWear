import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { hasSupabase, supabaseAnonKey, supabaseUrl } from "./env";

/** Acts as the signed-in visitor, so the database's access rules apply */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component, which can't set cookies; the middleware refreshes them instead
        }
      },
    },
  });
}

/** Full access that skips the access rules. Server only: for payments, holds and refunds. */
export function supabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Read-only public access with no cookies, so pages using it can be cached */
export function supabasePublic() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "renter" | "lender" | "admin";
}

export async function currentUser() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("id, full_name, phone, role").eq("id", user.id).single<Profile>();
  return { user, profile, sb };
}

export async function requireUser(next: string) {
  if (!hasSupabase) notFound(); // accounts aren't set up on this deployment
  const me = await currentUser();
  if (!me) redirect(`/login?next=${encodeURIComponent(next)}`);
  return me;
}

/** Anyone who isn't an admin gets a plain 404, so the admin area isn't advertised */
export async function requireAdmin() {
  if (!hasSupabase) notFound();
  const me = await currentUser();
  if (!me) redirect("/login?next=/admin");
  if (me.profile?.role !== "admin") notFound();
  return me;
}
