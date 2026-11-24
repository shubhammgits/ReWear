import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReviewsForItem } from "@/lib/api";
import { getCatalog, getCatalogItem, similarTo } from "@/lib/catalog";
import { onlineBooking } from "@/lib/supabase/env";
import { ItemClient } from "./ItemClient";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getCatalog();
  return items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getCatalogItem(id);
  if (!item) return { title: "Not found" };
  return { title: `${item.name} for rent in ${item.city}`, description: item.description };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await getCatalog();
  const item = items.find((i) => i.id === id);
  if (!item) notFound();
  const reviews = await getReviewsForItem(item.id);
  return <ItemClient item={item} reviews={reviews} similar={similarTo(item, items)} bookable={onlineBooking && Boolean(item.outfitId)} />;
}
