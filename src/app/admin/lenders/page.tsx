import { requireAdmin } from "@/lib/supabase/server";
import { deleteLender, saveLender } from "../actions";
import { ConfirmButton } from "../ConfirmButton";
import { Card, Empty, Field, Notice, btn, input } from "../ui";

interface Lender {
  id: string;
  name: string;
  phone: string | null;
  upi_id: string | null;
  notes: string | null;
}

export default async function LendersPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; edit?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("lenders").select("id, name, phone, upi_id, notes, outfits(count)").order("name");
  const lenders = (data ?? []) as (Lender & { outfits: { count: number }[] })[];
  const editing = lenders.find((l) => l.id === sp.edit);

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="lenders-h">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="lenders-h" className="text-2xl">
              Lenders
            </h2>
            <a href="/admin/export/lenders" className={btn.secondary} download>
              Download Excel
            </a>
          </div>
          {lenders.length === 0 ? (
            <Empty>Add yourself first, then each friend whose clothes you list. Every outfit belongs to a lender.</Empty>
          ) : (
            <ul className="grid gap-3">
              {lenders.map((l) => (
                <li key={l.id}>
                  <Card className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-sm text-muted">
                        {[l.phone, l.upi_id && `UPI ${l.upi_id}`, `${l.outfits[0]?.count ?? 0} outfits`].filter(Boolean).join(" · ")}
                      </p>
                      {l.notes && <p className="mt-1 text-sm text-ink/70">{l.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <a href={`/admin/lenders?edit=${l.id}`} className={btn.secondary}>
                        Edit
                      </a>
                      {(l.outfits[0]?.count ?? 0) === 0 && (
                        <form action={deleteLender}>
                          <input type="hidden" name="id" value={l.id} />
                          <ConfirmButton className={`${btn.secondary} text-red-800`} message={`Delete ${l.name}? This can't be undone.`}>
                            Delete
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="lender-form-h">
          <Card>
            <h2 id="lender-form-h" className="mb-4 text-xl">
              {editing ? `Edit ${editing.name}` : "Add a lender"}
            </h2>
            <form action={saveLender} className="grid gap-4" key={editing?.id ?? "new"}>
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <Field label="Name">
                <input name="name" required defaultValue={editing?.name} className={input} />
              </Field>
              <Field label="Phone">
                <input name="phone" type="tel" defaultValue={editing?.phone ?? ""} className={input} />
              </Field>
              <Field label="UPI ID" hint="Where you send their earnings">
                <input name="upi_id" defaultValue={editing?.upi_id ?? ""} placeholder="name@okhdfcbank" className={input} />
              </Field>
              <Field label="Notes" hint="Private. E.g. agreed payout terms">
                <textarea name="notes" rows={3} defaultValue={editing?.notes ?? ""} className={`${input} h-auto py-2`} />
              </Field>
              <div className="flex gap-2">
                <button className={btn.primary}>{editing ? "Save" : "Add lender"}</button>
                {editing && (
                  <a href="/admin/lenders" className={btn.secondary}>
                    Cancel
                  </a>
                )}
              </div>
            </form>
          </Card>
        </section>
      </div>
    </>
  );
}
