"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { googleSignIn } from "@/lib/supabase/env";
import { Button } from "@/components/ui/Button";
import { field } from "@/lib/utils";

export function LoginForm({ next, initialError }: { next: string; initialError: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: callback() },
    });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Too many emails sent. Please wait a few minutes and try again."
          : error.status && error.status >= 500
            ? "Our email service isn't responding right now. Please try again in a few minutes, or message us on WhatsApp."
            : "We couldn't send the email. Check the address and try again."
      );
      return;
    }
    setCode("");
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      setError("That code is wrong or has expired. Check the latest email, or send a new code.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function google() {
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) setError("Google sign-in isn't available right now. Use your email instead.");
  }

  return (
    <div className="mt-10">
      {step === "email" ? (
        <form onSubmit={sendCode} className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm text-ink/70">Email address</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={field}
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={busy} magnetic={false}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} Email me a sign-in code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="grid gap-4">
          <p className="text-ink/80">
            We sent a code to <strong className="break-all">{email}</strong>. It can take a minute; check your spam folder too. You can also tap
            the link in that email.
          </p>
          <label className="block">
            <span className="mb-2 block text-sm text-ink/70">Sign-in code</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              pattern="[0-9]{6,8}"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${field} text-center font-mono text-xl tracking-[0.4em]`}
              autoFocus
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={busy || code.length < 6} magnetic={false}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ArrowRight className="h-5 w-5" aria-hidden />} Sign in
          </Button>
          <button type="button" onClick={() => setStep("email")} className="min-h-11 text-sm text-ink/70 underline underline-offset-2 hover:text-plum">
            Use a different email or send a new code
          </button>
        </form>
      )}

      {googleSignIn && step === "email" && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <Button onClick={google} variant="secondary" size="lg" className="w-full" magnetic={false}>
            Continue with Google
          </Button>
        </>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-2xl bg-blush/60 p-4 text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  );
}
