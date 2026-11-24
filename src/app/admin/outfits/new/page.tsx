import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { OutfitForm } from "../OutfitForm";
import { Empty, Notice } from "../../ui";

export default async function NewOutfitPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const { data: lenders } = await sb.from("lenders").select("id, name").order("name");

  return (
    <>
      <Notice error={sp.error} />
      <h2 className="mb-4 text-2xl">New outfit</h2>
      {lenders?.length ? (
        <OutfitForm lenders={lenders} />
      ) : (
        <Empty>
          Every outfit needs an owner. <Link href="/admin/lenders" className="text-plum underline">Add a lender first</Link>.
        </Empty>
      )}
    </>
  );
}
