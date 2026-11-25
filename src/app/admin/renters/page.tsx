import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { formatINR, formatWhen } from "@/lib/utils";
import { ConfirmButton } from "../ConfirmButton";
import { deleteUser, setUserBlocked, setUserRole } from "../actions";
import { Badge, Card, Empty, Notice, btn, input } from "../ui";
import { listPeople } from "./people";

export default async function RentersPage({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { user: me } = await requireAdmin();
  const all = await listPeople();
  const q = (sp.q ?? "").trim().toLowerCase();
  const people = q ? all.filter((p) => [p.name, p.email, p.phone].some((v) => v?.toLowerCase().includes(q))) : all;
  const small = "inline-flex min-h-9 items-center rounded-full px-3 text-xs font-medium ring-1 ring-inset ring-ink/20 hover:ring-ink/50";

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Renters</h2>
          <p className="text-sm text-muted">
            Everyone who has signed up: {all.length} {all.length === 1 ? "account" : "accounts"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={sp.q} placeholder="Name, email or phone" aria-label="Search renters" className={`${input} w-56 pl-9`} />
          </form>
          <a href="/admin/export/renters" className={btn.secondary} download>
            Download Excel
          </a>
        </div>
      </div>

      {people.length === 0 ? (
        <Empty>{q ? "No one matches that search." : "No one has signed up yet."}</Empty>
      ) : (
        <ul className="grid gap-3">
          {people.map((p) => {
            const self = p.id === me.id;
            return (
              <li key={p.id}>
                <Card className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {p.name || "No name yet"}
                      {p.role === "admin" && <Badge tone="plum">admin</Badge>}
                      {p.blocked && <Badge tone="red">blocked</Badge>}
                      {self && <Badge>you</Badge>}
                    </p>
                    <p className="break-all text-sm text-ink/80">{p.email}</p>
                    <p className="text-sm text-muted">
                      {[p.phone, `joined ${formatWhen(p.joined)}`, p.lastSignIn && `last sign-in ${formatWhen(p.lastSignIn)}`].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-sm">
                      {p.bookings} {p.bookings === 1 ? "booking" : "bookings"}
                      {p.spent > 0 && ` · spent ${formatINR(p.spent)}`}
                    </p>
                  </div>
                  {!self && (
                    <div className="flex flex-wrap gap-2">
                      <form action={setUserRole}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="role" value={p.role === "admin" ? "renter" : "admin"} />
                        <ConfirmButton
                          className={small}
                          message={p.role === "admin" ? `Remove admin rights from ${p.email}?` : `Make ${p.email} an admin? They'll see all bookings and customer details.`}
                        >
                          {p.role === "admin" ? "Remove admin" : "Make admin"}
                        </ConfirmButton>
                      </form>
                      <form action={setUserBlocked}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="block" value={p.blocked ? "0" : "1"} />
                        <ConfirmButton className={small} message={p.blocked ? `Let ${p.email} sign in again?` : `Block ${p.email}? They won't be able to sign in.`}>
                          {p.blocked ? "Unblock" : "Block"}
                        </ConfirmButton>
                      </form>
                      {p.deletable && (
                        <form action={deleteUser}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton className={`${small} text-red-800 ring-red-300`} message={`Delete ${p.email}'s account permanently? This can't be undone.`}>
                            Delete
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted">
        Accounts with bookings can&apos;t be deleted, because booking and payment records must be kept for tax purposes. Block them instead.
      </p>
    </>
  );
}
