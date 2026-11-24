import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";

/** Where Google sign-in and the link in the sign-in email land */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const sb = await supabaseServer();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  return NextResponse.redirect(new URL(error ? `/login?error=1&next=${encodeURIComponent(next)}` : next, url.origin));
}
