import { requireAdmin } from "@/lib/supabase/server";
import { formatINR, formatWhen } from "@/lib/utils";
import { markPayoutPaid } from "../actions";
import { Card, Empty, Notice, btn, input } from "../ui";

interface Payout {
  id: string;
  amount: number;
  status: "owed" | "paid" | "void";
  paid_at: string | null;
  reference: string | null;
  lenders: { id: string; name: string; upi_id: string | null } | null;
  bookings: { code: string; ends_at: string; outfits: { name: string } | null } | null;
}

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb
    .from("payouts")
    .select("id, amount, status, paid_at, reference, lenders(id, name, upi_id), bookings(code, ends_at, outfits(name))")
    .order("created_at", { ascending: false })
    .limit(200);
  const payouts = (data ?? []) as unknown as Payout[];
  const owed = payouts.filter((p) => p.status === "owed");
  const paid = payouts.filter((p) => p.status === "paid").slice(0, 30);

  // One line per lender: how much to send them in total
  const byLender = new Map<string, { name: string; upi: string | null; total: number }>();
  for (const p of owed) {
    const key = p.lenders?.id ?? "?";
    const cur = byLender.get(key) ?? { name: p.lenders?.name ?? "?", upi: p.lenders?.upi_id ?? null, total: 0 };
    cur.total += p.amount;
    byLender.set(key, cur);
  }

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Owed to lenders</h2>
        <a href="/admin/export/payouts" className={btn.secondary} download>
          Download Excel
        </a>
      </div>
      <p className="mt-1 text-sm text-muted">
        A payout appears when an outfit is returned (the full rent) or when a renter cancels late (the rent they forfeit). Send it by UPI, then
        mark it paid with the reference.
      </p>
      {owed.length === 0 ? (
        <Empty>Nothing owed right now.</Empty>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            {[...byLender.values()].map((l) => (
              <Card key={l.name} className="min-w-48">
                <p className="text-sm text-muted">{l.name}</p>
                <p className="font-display text-2xl">{formatINR(l.total)}</p>
                <p className="text-xs text-muted">{l.upi ? `UPI ${l.upi}` : "No UPI ID saved"}</p>
              </Card>
            ))}
          </div>
          <ul className="mt-6 grid gap-3">
            {owed.map((p) => (
              <li key={p.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {formatINR(p.amount)} to {p.lenders?.name}
                    </p>
                    <p className="text-sm text-muted">
                      #{p.bookings?.code} · {p.bookings?.outfits?.name} · ended {p.bookings && formatWhen(p.bookings.ends_at)}
                    </p>
                  </div>
                  <form action={markPayoutPaid} className="flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="reference" required placeholder="UPI reference" className={`${input} w-44`} aria-label="UPI or bank reference" />
                    <button className={btn.primary}>Mark paid</button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {paid.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl">Recently paid</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {paid.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {formatINR(p.amount)} to {p.lenders?.name} · #{p.bookings?.code}
                </span>
                <span className="text-muted">
                  {p.paid_at && formatWhen(p.paid_at)} · ref {p.reference}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
