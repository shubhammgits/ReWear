import { supabaseService } from "@/lib/supabase/server";

export interface Person {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "renter" | "lender" | "admin";
  joined: string;
  lastSignIn: string | null;
  blocked: boolean;
  bookings: number;
  /** Paid bookings that weren't cancelled */
  spent: number;
  /** False once they have a paid booking (even if cancelled later), which is kept for the records */
  deletable: boolean;
}

/** Every account with its profile and booking totals. Admin only: callers must check requireAdmin() first. */
export async function listPeople(): Promise<Person[]> {
  const db = supabaseService();
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const [{ data: profiles }, { data: bookings }] = await Promise.all([
    db.from("profiles").select("id, full_name, phone, role"),
    db.from("bookings").select("renter_id, status, total").in("status", ["confirmed", "handed_over", "returned", "cancelled"]),
  ]);
  const profileOf = new Map((profiles ?? []).map((p) => [p.id, p]));
  const stats = new Map<string, { bookings: number; spent: number }>();
  for (const b of bookings ?? []) {
    const s = stats.get(b.renter_id) ?? { bookings: 0, spent: 0 };
    s.bookings++;
    if (b.status !== "cancelled") s.spent += b.total;
    stats.set(b.renter_id, s);
  }
  // Bookings with money involved are kept for the records; unpaid attempts are not
  const hasAny = new Set((bookings ?? []).map((b) => b.renter_id));

  return users
    .map((u) => {
      const p = profileOf.get(u.id);
      const s = stats.get(u.id) ?? { bookings: 0, spent: 0 };
      return {
        id: u.id,
        email: u.email ?? "",
        name: p?.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? null,
        phone: p?.phone ?? null,
        role: (p?.role ?? "renter") as Person["role"],
        joined: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
        blocked: Boolean(u.banned_until && new Date(u.banned_until).getTime() > Date.now()),
        bookings: s.bookings,
        spent: s.spent,
        deletable: !hasAny.has(u.id),
      };
    })
    .sort((a, b) => b.joined.localeCompare(a.joined));
}
