import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/supabase/env";
import { currentUser } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  if (!hasSupabase) redirect("/");
  if (await currentUser()) redirect(target);
  return (
    <div className="mx-auto max-w-md px-6 pb-28 pt-32 sm:pt-40">
      <h1 className="text-[clamp(2.4rem,6vw,3.6rem)] leading-[1]">Sign in to book.</h1>
      <p className="mt-4 text-ink/70">New here? The same steps create your account. No password needed.</p>
      <LoginForm next={target} initialError={error ? "That sign-in link didn't work. Please try again." : ""} />
    </div>
  );
}
