import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Empty, Notice } from "../ui";
import { BookingAdminCard, type AdminBooking } from "./BookingAdminCard";
import { BOOKING_COLUMNS } from "./columns";

const views = {
  upcoming: { label: "Upcoming", statuses: ["confirmed"], asc: true },
  out: { label: "With renters", statuses: ["handed_over"], asc: true },
  done: { label: "Returned", statuses: ["returned"], asc: false },
  cancelled: { label: "Cancelled", statuses: ["cancelled"], asc: false },
  unpaid: { label: "Unpaid", statuses: ["pending_payment", "expired"], asc: false },
} as const;

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ view?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const view = (sp.view && sp.view in views ? sp.view : "upcoming") as keyof typeof views;
  const { sb } = await requireAdmin();
  const { data } = await sb
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .in("status", [...views[view].statuses])
    .order("starts_at", { ascending: views[view].asc })
    .limit(100);
  const bookings = (data ?? []) as AdminBooking[];
  const back = `/admin/bookings?view=${view}`;

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="mb-5 flex flex-wrap gap-2">
        {Object.entries(views).map(([k, v]) => (
          <Link
            key={k}
            href={`/admin/bookings?view=${k}`}
            aria-current={k === view ? "page" : undefined}
            className={cn("inline-flex min-h-11 items-center rounded-full px-4 text-sm", k === view ? "bg-plum text-ivory" : "bg-sand/70 hover:bg-sand")}
          >
            {v.label}
          </Link>
        ))}
      </div>
      {bookings.length === 0 ? (
        <Empty>Nothing here.</Empty>
      ) : (
        <ul className="grid gap-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <BookingAdminCard b={b} back={back} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
