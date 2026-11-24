import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { BOOKING_COLUMNS } from "./bookings/columns";
import { BookingAdminCard, type AdminBooking } from "./bookings/BookingAdminCard";
import { Card, Empty, Notice } from "./ui";

const DAY = 86_400_000;

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const soon = new Date(Date.now() + 2 * DAY).toISOString();
  const [{ data: handovers }, { data: returns }, { data: owed }, { count: failed }, { count: live }] = await Promise.all([
    sb.from("bookings").select(BOOKING_COLUMNS).eq("status", "confirmed").lte("starts_at", soon).order("starts_at"),
    sb.from("bookings").select(BOOKING_COLUMNS).eq("status", "handed_over").order("ends_at"),
    sb.from("payouts").select("amount").eq("status", "owed"),
    sb.from("refunds").select("id", { count: "exact", head: true }).eq("status", "failed"),
    sb.from("outfits").select("id", { count: "exact", head: true }).eq("status", "live"),
  ]);
  const owedTotal = (owed ?? []).reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Live outfits</p>
          <p className="font-display text-3xl">{live ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Out with renters</p>
          <p className="font-display text-3xl">{returns?.length ?? 0}</p>
        </Card>
        <Link href="/admin/payouts">
          <Card className="h-full hover:ring-ink/30">
            <p className="text-sm text-muted">Owed to lenders</p>
            <p className="font-display text-3xl">{formatINR(owedTotal)}</p>
          </Card>
        </Link>
        <Link href="/admin/bookings?view=cancelled">
          <Card className={failed ? "h-full bg-red-50 ring-red-300" : "h-full"}>
            <p className="text-sm text-muted">Failed refunds</p>
            <p className="font-display text-3xl">{failed ?? 0}</p>
          </Card>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Hand over in the next 2 days</h2>
        <div className="mt-4 grid gap-3">
          {handovers?.length ? (
            (handovers as AdminBooking[]).map((b) => <BookingAdminCard key={b.id} b={b} back="/admin" />)
          ) : (
            <Empty>No handovers coming up.</Empty>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Waiting to come back</h2>
        <div className="mt-4 grid gap-3">
          {returns?.length ? (
            (returns as AdminBooking[]).map((b) => <BookingAdminCard key={b.id} b={b} back="/admin" />)
          ) : (
            <Empty>Nothing out right now.</Empty>
          )}
        </div>
      </section>
    </>
  );
}
