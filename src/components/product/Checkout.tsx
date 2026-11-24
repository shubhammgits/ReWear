"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import type { DurationUnit, Item } from "@/lib/types";
import type { Quote } from "@/lib/pricing";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn, field, formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Me = { email: string; name: string; phone: string } | null;

/** Contact details, handover choice and the Razorpay payment for one booking */
export function Checkout({
  item,
  start,
  unit,
  amount,
  q,
  blocked,
  onDatesChanged,
  onPaying,
}: {
  item: Item;
  start: Date | null;
  unit: DurationUnit;
  amount: number;
  q: Quote;
  /** Why the chosen time can't be booked, if it can't */
  blocked: string;
  /** Re-reads the calendar after a hold is placed, released or lost to someone else */
  onDatesChanged: () => void;
  onPaying: (open: boolean) => void;
}) {
  const router = useRouter();
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [handover, setHandover] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return setMe(null);
      const { data: p } = await sb.from("profiles").select("full_name, phone").eq("id", user.id).single();
      setMe({ email: user.email ?? "", name: p?.full_name ?? "", phone: p?.phone ?? "" });
      setName(p?.full_name ?? (user.user_metadata?.full_name as string) ?? "");
      setPhone(p?.phone ?? "");
    });
  }, []);

  // Frees the dates held for an unfinished payment, then shows the calendar without that hold
  const release = (code: string) => {
    onPaying(false);
    return fetch(`/api/bookings/${code}/release`, { method: "POST" }).finally(onDatesChanged);
  };

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!start || blocked) return;
    setError("");
    setBusy("Holding your dates…");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outfitId: item.outfitId, start: start.toISOString(), unit, amount, name, phone, handover, address }),
    });
    const order = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setBusy("");
      setError(order.error);
      if (res.status === 409) onDatesChanged();
      return;
    }

    setBusy("Opening secure payment…");
    onPaying(true);
    if (!(await loadRazorpay()) || !window.Razorpay) {
      setBusy("");
      setError("The payment window didn't load. Check your connection and try again.");
      release(order.code);
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: "INR",
      name: "ReWear",
      description: order.description,
      prefill: order.prefill,
      notes: { booking: order.code },
      theme: { color: "#4b1d3f" },
      handler: async (r: RazorpayResponse) => {
        setBusy("Confirming your booking…");
        const v = await fetch("/api/bookings/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
        const out = await v.json().catch(() => ({}));
        if (!v.ok) {
          setBusy("");
          setError(out.error || "We couldn't confirm the payment. Message us with your booking number " + order.code);
          return;
        }
        router.push(`/bookings/${out.code}${out.clash ? "?clash=1" : "?paid=1"}`);
      },
      modal: {
        ondismiss: () => {
          setBusy("");
          release(order.code);
        },
      },
    });
    rzp.on("payment.failed", (r) => setError(`Payment failed: ${r.error?.description ?? "please try another method"}. You can try again.`));
    rzp.open();
  }

  if (me === undefined) return <div className="mt-6 h-14 animate-pulse rounded-full bg-sand" aria-hidden />;

  if (me === null) {
    return (
      <div className="mt-6">
        <Button href={`/login?next=${encodeURIComponent(`/item/${item.id}#book`)}`} className="w-full" size="lg" magnetic={false}>
          Sign in to book · {formatINR(q.total)}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">Takes 30 seconds with a code sent to your email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-ink/70">Your name</span>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-ink/70">Mobile (for WhatsApp updates)</span>
          <input required type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className={field} />
        </label>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm text-ink/70">How do you want it?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["pickup", "Pick up", "Free"],
              ["delivery", "Delivery", "Courier fee, told before booking"],
            ] as const
          ).map(([v, label, sub]) => (
            <label
              key={v}
              className={cn(
                "flex min-h-14 cursor-pointer flex-col justify-center rounded-2xl px-4 py-2 ring-1 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-plum",
                handover === v ? "bg-ink text-ivory ring-ink" : "ring-ink/15 hover:ring-ink/40"
              )}
            >
              <input type="radio" name="handover" value={v} checked={handover === v} onChange={() => setHandover(v)} className="sr-only" />
              <span className="text-sm font-semibold">{label}</span>
              <span className={cn("text-xs", handover === v ? "text-ivory/70" : "text-muted")}>{sub}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {handover === "delivery" && (
        <label className="block">
          <span className="mb-2 block text-sm text-ink/70">Delivery address</span>
          <textarea required minLength={10} rows={3} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} className={`${field} h-auto py-3`} />
        </label>
      )}

      {blocked && (
        <p role="alert" className="rounded-2xl bg-blush/60 p-4 text-sm">
          {blocked}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!!busy || !start || !!blocked} magnetic={false}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
        {busy || `Pay ${formatINR(q.total)}`}
      </Button>
      {error && (
        <p role="alert" className="rounded-2xl bg-blush/60 p-4 text-sm">
          {error}
        </p>
      )}
      <p className="text-center text-xs text-muted">
        UPI, cards and netbanking via Razorpay. Free cancellation up to 72 hours before pickup.{" "}
        <Link href="/refunds" className="underline underline-offset-2">
          Refund policy
        </Link>
        <br />
        Signed in as {me.email}
      </p>
    </form>
  );
}
