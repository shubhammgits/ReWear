"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

export function CancelBooking({ code, refund, rule, total }: { code: string; refund: number; rule: string; total: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/bookings/${code}/cancel`, { method: "POST" });
    const out = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(out.error || "Couldn't cancel. Please message us.");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex min-h-12 items-center rounded-full px-6 text-sm font-medium ring-1 ring-ink/20 hover:ring-ink/50">
        Cancel booking
      </button>
    );
  }

  return (
    <div className="w-full rounded-[var(--radius-card)] bg-blush/50 p-6">
      <p className="font-semibold">Cancel this booking?</p>
      <p className="mt-2 text-sm text-ink/80">
        You&apos;re cancelling {rule}, so you get back <strong>{formatINR(refund)}</strong> of the {formatINR(total)} you paid. The service fee and damage
        protection fee aren&apos;t refunded.{" "}
        <Link href="/refunds" className="underline underline-offset-2">
          Refund policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={cancel} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-5 text-sm font-medium text-ivory hover:bg-red-800 disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Yes, cancel and refund {formatINR(refund)}
        </button>
        <button onClick={() => setOpen(false)} disabled={busy} className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium ring-1 ring-ink/20">
          Keep my booking
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
