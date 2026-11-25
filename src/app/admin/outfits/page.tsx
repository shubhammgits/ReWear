import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { OutfitRow } from "@/lib/catalog";
import { photoUrl } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { Badge, Card, Empty, Notice, btn, statusTone } from "../ui";

export default async function OutfitsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("outfits").select("*, outfit_photos(path, alt, position), lenders(name)").order("created_at", { ascending: false });
  const outfits = (data ?? []) as (OutfitRow & { lenders: { name: string } })[];

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl">Outfits</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/export/outfits" className={btn.secondary} download>
            Download Excel
          </a>
          <Link href="/admin/outfits/new" className={btn.primary}>
            <Plus className="h-4 w-4" aria-hidden /> Add outfit
          </Link>
        </div>
      </div>
      {outfits.length === 0 ? (
        <Empty>No outfits yet. Add a lender first, then your first outfit.</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {outfits.map((o) => {
            const cover = [...(o.outfit_photos ?? [])].sort((a, b) => a.position - b.position)[0];
            return (
              <li key={o.id}>
                <Link href={`/admin/outfits/${o.id}`} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-plum">
                  <Card className="flex gap-4 transition hover:ring-ink/30">
                    <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-sand">
                      {cover && <Image src={photoUrl(cover.path)} alt="" fill sizes="72px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.name}</p>
                      <p className="text-sm text-muted">
                        {o.type} · {o.size} · {o.lenders?.name}
                      </p>
                      <p className="mt-1 text-sm">{formatINR(o.price_day)} / day</p>
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                        {o.featured && <Badge tone="plum">featured</Badge>}
                        {!cover && <Badge tone="red">no photos</Badge>}
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
