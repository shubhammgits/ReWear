import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { OutfitRow } from "@/lib/catalog";
import { requireAdmin } from "@/lib/supabase/server";
import { setOutfitStatus } from "../../actions";
import { Badge, Card, Notice, btn, statusTone } from "../../ui";
import { OutfitForm } from "../OutfitForm";
import { PhotoManager } from "../PhotoManager";

const nextSteps: Record<OutfitRow["status"], { to: OutfitRow["status"]; label: string }[]> = {
  draft: [{ to: "live", label: "Put it live" }],
  live: [
    { to: "paused", label: "Pause bookings" },
    { to: "retired", label: "Retire" },
  ],
  paused: [
    { to: "live", label: "Put it live again" },
    { to: "retired", label: "Retire" },
  ],
  retired: [{ to: "draft", label: "Back to draft" }],
};

export default async function EditOutfitPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { sb } = await requireAdmin();
  const [{ data: outfit }, { data: lenders }, { data: photos }] = await Promise.all([
    sb.from("outfits").select("*").eq("id", id).single<OutfitRow>(),
    sb.from("lenders").select("id, name").order("name"),
    sb.from("outfit_photos").select("id, path, alt, position").eq("outfit_id", id).order("position"),
  ]);
  if (!outfit) notFound();

  return (
    <>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">{outfit.name}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <Badge tone={statusTone[outfit.status]}>{outfit.status}</Badge>
            {outfit.status === "live" && (
              <Link href={`/item/${outfit.slug}`} target="_blank" className="inline-flex items-center gap-1 underline underline-offset-2">
                View on site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {nextSteps[outfit.status].map((s) => (
            <form key={s.to} action={setOutfitStatus}>
              <input type="hidden" name="id" value={outfit.id} />
              <input type="hidden" name="status" value={s.to} />
              <button className={s.to === "live" ? btn.primary : btn.secondary}>{s.label}</button>
            </form>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <h3 className="text-lg">Photos</h3>
        <p className="mt-1 text-sm text-muted">The first photo is the cover. Natural light, full length, front and back, plus a close-up of the work.</p>
        <PhotoManager outfitId={outfit.id} outfitName={outfit.name} photos={photos ?? []} />
      </Card>

      <OutfitForm outfit={outfit} lenders={lenders ?? []} />
    </>
  );
}
