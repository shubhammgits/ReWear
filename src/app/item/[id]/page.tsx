import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItem, getItems, getLender, getReviewsForItem, getSimilarItems } from "@/lib/api";
import { ItemClient } from "./ItemClient";

export async function generateStaticParams() {
  const items = await getItems();
  return items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: "Not found" };
  return { title: `${item.name} for rent in ${item.city}`, description: item.description };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();
  const [lender, reviews] = await Promise.all([getLender(item.lenderId), getReviewsForItem(item.id)]);
  return <ItemClient item={item} lender={lender} reviews={reviews} similar={getSimilarItems(item)} />;
}
