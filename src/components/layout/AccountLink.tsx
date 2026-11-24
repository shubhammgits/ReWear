"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { hasSupabase } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

/** "Sign in" or "My bookings", depending on whether someone is signed in */
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!hasSupabase) return;
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = sb.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}

export function AccountLink({ className }: { className?: string }) {
  const signedIn = useSignedIn();
  if (!hasSupabase) return null;
  return (
    <Link
      href={signedIn ? "/bookings" : "/login"}
      className={cn("inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-ink/75 transition-colors hover:text-plum", className)}
    >
      <UserRound className="h-4 w-4" aria-hidden />
      {signedIn ? "My bookings" : "Sign in"}
    </Link>
  );
}
