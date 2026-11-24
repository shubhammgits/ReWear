import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { statusLabel } from "@/lib/bookings";
import { MY_COLUMNS, type MyBooking } from "./columns";
import { photoUrl } from "@/lib/supabase/env";
import { requireUser } from "@/lib/supabase/server";
import { formatINR, formatWhen } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };
export const dynamic = "force-dynamic";


export default async function MyBookingsPage() {
  const { sb, user, profile } = await requireUser("/bookings");
  const { data } = await sb
    .from("bookings")
    .select(MY_COLUMNS)
    .eq("renter_id", user.id)
    .in("status", ["confirmed", "handed_over", "returned", "cancelled"])
    .order("starts_at", { ascending: false });
  const bookings = (data ?? []) as MyBooking[];
  const now = Date.now();
  const upcoming = bookings.filter((b) => ["confirmed", "handed_over"].includes(b.status) && new Date(b.ends_at).getTime() > now - 86_400_000);
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="mx-auto max-w-3xl px-6 pb-28 pt-32 sm:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(2.4rem,6vw,3.6rem)] leading-[1]">My bookings.</h1>
          <p className="mt-2 text-ink/70">{profile?.full_name ? `${profile.full_name} · ` : ""}{user.email}</p>
        </div>
        <div className="flex gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ring-1 ring-ink/20 hover:ring-ink/50">
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ring-1 ring-ink/20 hover:ring-ink/50">Sign out</button>
          </form>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-12 rounded-[2rem] bg-sand/60 px-6 py-16 text-center">
          <p className="font-display text-3xl">No bookings yet.</p>
          <Button href="/browse" className="mt-6">
            Find an outfit
          </Button>
        </div>
      ) : (
        <>
          <List title="Coming up" items={upcoming} />
          <List title="Past and cancelled" items={past} />
        </>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: MyBooking[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((b) => {
          const cover = [...(b.outfits?.outfit_photos ?? [])].sort((x, y) => x.position - y.position)[0];
          return (
            <li key={b.id}>
              <Link href={`/bookings/${b.code}`} className="flex gap-4 rounded-[var(--radius-card)] bg-ivory p-4 shadow-soft ring-1 ring-ink/5 transition hover:ring-ink/20">
                <span className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-sand">
                  {cover && <Image src={photoUrl(cover.path)} alt="" fill sizes="72px" className="object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{b.outfits?.name}</span>
                  <span className="block text-sm text-ink/70">{formatWhen(b.starts_at)}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {statusLabel[b.status]} · {formatINR(b.total)} · #{b.code}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
