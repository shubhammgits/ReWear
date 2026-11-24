import Link from "next/link";
import { statusLabel, type BookingRow } from "@/lib/bookings";
import { cancellationRefund } from "@/lib/policy";
import { formatINR, formatWhen } from "@/lib/utils";
import { adminCancel, retryRefund, setBookingStage } from "../actions";
import { Badge, Card, btn, input } from "../ui";

export type AdminBooking = BookingRow & {
  outfits: { name: string; slug: string; lenders: { name: string } | null } | null;
  profiles: { full_name: string | null } | null;
  payments: { status: string; razorpay_payment_id: string | null; refunds: { id: string; amount_paise: number; status: string }[] }[];
};

const tone = { confirmed: "green", handed_over: "plum", returned: "grey", cancelled: "red", expired: "grey", pending_payment: "amber" } as const;

export function BookingAdminCard({ b, back }: { b: AdminBooking; back: string }) {
  const policy = cancellationRefund(b);
  const refunds = b.payments.flatMap((p) => p.refunds);
  const paid = b.payments.find((p) => p.razorpay_payment_id);
  const phone = b.contact_phone;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm">#{b.code}</span>
            <Badge tone={tone[b.status]}>{statusLabel[b.status]}</Badge>
            <Badge>{b.handover === "delivery" ? "Delivery" : "Pickup"}</Badge>
          </p>
          <p className="mt-2 font-semibold">
            {b.outfits ? (
              <Link href={`/item/${b.outfits.slug}`} className="hover:text-plum">
                {b.outfits.name}
              </Link>
            ) : (
              "Outfit"
            )}{" "}
            <span className="font-normal text-muted">· owner {b.outfits?.lenders?.name ?? "?"}</span>
          </p>
          <p className="mt-1 text-sm">
            {formatWhen(b.starts_at)} → {formatWhen(b.ends_at)}
          </p>
          <p className="mt-1 text-sm text-ink/80">
            {b.profiles?.full_name || "Renter"} ·{" "}
            <a href={`https://wa.me/91${phone}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {phone}
            </a>
            {b.address && <span className="block text-muted">{b.address}</span>}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-display text-2xl">{formatINR(b.total)}</p>
          <p className="text-muted">rent {formatINR(b.rent)} to lender</p>
          {paid && <p className="text-xs text-muted">{paid.razorpay_payment_id}</p>}
        </div>
      </div>

      {refunds.length > 0 && (
        <ul className="mt-3 grid gap-1 text-sm">
          {refunds.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              Refund {formatINR(r.amount_paise / 100)} <Badge tone={r.status === "failed" ? "red" : r.status === "processed" ? "green" : "amber"}>{r.status}</Badge>
              {r.status === "failed" && (
                <form action={retryRefund}>
                  <input type="hidden" name="refund_id" value={r.id} />
                  <input type="hidden" name="back" value={back} />
                  <button className="text-sm font-medium text-plum underline underline-offset-2">Retry</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      {b.cancel_reason && <p className="mt-2 text-sm text-muted">{b.cancel_reason}</p>}

      {(b.status === "confirmed" || b.status === "handed_over") && (
        <div className="mt-4 flex flex-wrap items-start gap-2 border-t border-line pt-4">
          <form action={setBookingStage}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="to" value={b.status === "confirmed" ? "handed_over" : "returned"} />
            <button className={btn.primary}>{b.status === "confirmed" ? "Mark handed over" : "Mark returned"}</button>
          </form>
          <details className="group">
            <summary className={`${btn.secondary} cursor-pointer list-none`}>Cancel…</summary>
            <form action={adminCancel} className="mt-3 grid max-w-sm gap-2 rounded-xl bg-sand/60 p-4 text-sm">
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="back" value={back} />
              <label className="flex items-center gap-2">
                <input type="radio" name="refund" value="full" defaultChecked className="accent-plum" /> Full refund {formatINR(b.total)} (we cancelled)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="refund" value="policy" className="accent-plum" /> Policy refund {formatINR(policy.amount)} ({policy.rule})
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="refund" value="custom" className="accent-plum" /> Other amount
                <input name="custom" type="number" min={0} max={b.total} inputMode="numeric" className={`${input} h-9 w-28`} aria-label="Refund amount" />
              </label>
              <input name="reason" placeholder="Reason (the renter may see this)" className={`${input} h-10`} />
              <button className={btn.danger}>Cancel booking and refund</button>
            </form>
          </details>
        </div>
      )}
    </Card>
  );
}
