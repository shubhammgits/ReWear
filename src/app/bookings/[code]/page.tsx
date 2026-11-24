import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, MessageCircle } from "lucide-react";
import { statusLabel } from "@/lib/bookings";
import { cancellationRefund } from "@/lib/policy";
import { whatsappLink } from "@/lib/site";
import { requireUser } from "@/lib/supabase/server";
import { formatINR, formatWhen } from "@/lib/utils";
import { MY_COLUMNS, type MyBooking } from "../columns";
import { CancelBooking } from "./CancelBooking";

export const metadata: Metadata = { title: "Booking", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BookingPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ paid?: string; clash?: string }> }) {
  const [{ code }, sp] = await Promise.all([params, searchParams]);
  const { sb, user } = await requireUser(`/bookings/${code}`);
  const { data } = await sb
    .from("bookings")
    .select(`${MY_COLUMNS}, payments(status, refunds(amount_paise, status))`)
    .eq("code", code)
    .eq("renter_id", user.id)
    .single();
  if (!data) notFound();
  const b = data as MyBooking & { payments: { status: string; refunds: { amount_paise: number; status: string }[] }[] };
  const refunds = b.payments.flatMap((p) => p.refunds);
  const refunded = refunds.filter((r) => r.status === "processed").reduce((s, r) => s + r.amount_paise / 100, 0);
  // Started but not yet confirmed by the bank, or being retried by us
  const refunding = refunds.filter((r) => r.status !== "processed").reduce((s, r) => s + r.amount_paise / 100, 0);
  const policy = cancellationRefund(b);

  const rows: [string, number][] = [
    ["Rental", b.rent],
    ["ReWear service fee", b.service_fee],
    ["Professional cleaning", b.cleaning_fee],
    ["Damage protection", b.protection_fee],
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 pb-28 pt-28 sm:pt-36">
      <Link href="/bookings" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink/70 hover:text-plum">
        <ChevronLeft className="h-4 w-4" aria-hidden /> My bookings
      </Link>

      {sp.paid && b.status === "confirmed" && (
        <div role="status" className="mb-8 flex gap-3 rounded-[var(--radius-card)] bg-emerald-50 p-5 text-emerald-950 ring-1 ring-emerald-200">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">You&apos;re booked! Payment received.</p>
            <p className="mt-1 text-sm">We&apos;ll message you on WhatsApp to confirm the {b.handover === "delivery" ? "delivery" : "pickup"} details.</p>
          </div>
        </div>
      )}
      {sp.clash && (
        <div role="alert" className="mb-8 rounded-[var(--radius-card)] bg-blush/60 p-5">
          <p className="font-semibold">Sorry, these dates were taken while your payment was processing.</p>
          <p className="mt-1 text-sm">Your full payment is being refunded automatically. Please pick other dates.</p>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">
        Booking #{b.code} · {statusLabel[b.status]}
      </p>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.2rem)] leading-[1]">
        {b.outfits ? (
          <Link href={`/item/${b.outfits.slug}`} className="hover:text-plum">
            {b.outfits.name}
          </Link>
        ) : (
          "Your outfit"
        )}
      </h1>

      <dl className="mt-8 grid gap-3 rounded-[var(--radius-card)] bg-sand/60 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">{b.handover === "delivery" ? "Delivered by" : "Pick up"}</dt>
          <dd className="mt-1 font-medium">{formatWhen(b.starts_at, true)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Return by</dt>
          <dd className="mt-1 font-medium">{formatWhen(b.ends_at, true)}</dd>
        </div>
        {b.address && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">Delivery address</dt>
            <dd className="mt-1 whitespace-pre-line">{b.address}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-ink/5">
        <dl className="grid gap-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-ink/70">{k}</dt>
              <dd>{formatINR(v)}</dd>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Paid</dt>
            <dd>{formatINR(b.total)}</dd>
          </div>
          {refunded > 0 && (
            <div className="flex justify-between text-emerald-800">
              <dt>Refunded</dt>
              <dd>−{formatINR(refunded)}</dd>
            </div>
          )}
          {refunding > 0 && (
            <div className="flex justify-between text-ink/70">
              <dt>Refund in progress</dt>
              <dd>{formatINR(refunding)}</dd>
            </div>
          )}
        </dl>
        {(refunded > 0 || refunding > 0) && <p className="mt-3 text-xs text-muted">Refunds reach your account in 5–7 working days after they start.</p>}
      </div>

      {b.cancel_reason && <p className="mt-4 text-sm text-muted">{b.cancel_reason}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappLink(`Hi ReWear! About my booking #${b.code}:`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-plum px-6 text-sm font-medium text-ivory hover:bg-plum-deep"
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> Message us
        </a>
        {b.status === "confirmed" && <CancelBooking code={b.code} refund={policy.amount} rule={policy.rule} total={b.total} />}
      </div>
    </div>
  );
}
