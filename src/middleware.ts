import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasSupabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/** Keeps the sign-in session fresh on every page that can show who is signed in */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabase) return response;
  // No session cookie, nothing to refresh: skip the network call for anonymous visitors
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return response;

  const sb = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/bookings/:path*", "/login", "/api/bookings/:path*", "/item/:path*"],
};
