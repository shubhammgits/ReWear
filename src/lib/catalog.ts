/**
 * The outfit catalogue. With Supabase configured, it lists the live outfits from the database
 * (only those with at least one photo). Without it, the bundled sample outfits are shown.
 */
import { allItems } from "./api";
import { site } from "./site";
import type { Item, OccasionName, Size } from "./types";
import { hasSupabase, photoUrl } from "./supabase/env";
import { supabasePublic } from "./supabase/server";

export interface OutfitRow {
  id: string;
  slug: string;
  lender_id: string;
  name: string;
  category: "Indian" | "Western";
  type: string;
  occasions: string[];
  size: Size;
  measurements: string | null;
  description: string;
  fabric: string | null;
  color: string | null;
  price_4h: number;
  price_day: number;
  price_3days: number;
  cleaning_fee: number;
  status: "draft" | "live" | "paused" | "retired";
  featured: boolean;
  created_at: string;
  outfit_photos?: { path: string; alt: string; position: number }[];
}

export const OUTFIT_COLUMNS = "*, outfit_photos(path, alt, position)";

export function toItem(o: OutfitRow): Item {
  const photos = [...(o.outfit_photos ?? [])].sort((a, b) => a.position - b.position);
  return {
    id: o.slug,
    outfitId: o.id,
    name: o.name,
    category: o.category,
    type: o.type,
    occasions: o.occasions as OccasionName[],
    size: o.size,
    city: site.city,
    rating: 0,
    reviewsCount: 0,
    images: photos.map((p) => photoUrl(p.path)),
    imageAlt: photos[0]?.alt || o.name,
    description: o.description,
    fabric: o.fabric || "Ask us",
    color: o.color || "See photos",
    pricing: { per4h: o.price_4h, perDay: o.price_day, per3Days: o.price_3days },
    cleaningFee: o.cleaning_fee,
    lenderId: o.lender_id,
    featured: o.featured,
    measurements: o.measurements || undefined,
  };
}

export async function getCatalog(): Promise<Item[]> {
  if (!hasSupabase) return allItems();
  const { data, error } = await supabasePublic()
    .from("outfits")
    .select(OUTFIT_COLUMNS)
    .eq("status", "live")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    // Show an empty shop rather than an error page; the next refresh (within a minute) tries again
    console.error("Couldn't load outfits:", error.message);
    return [];
  }
  return (data as OutfitRow[]).map(toItem).filter((i) => i.images.length > 0);
}

export async function getCatalogItem(slug: string): Promise<Item | undefined> {
  return (await getCatalog()).find((i) => i.id === slug);
}

export function similarTo(item: Item, items: Item[], limit = 4): Item[] {
  return items
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: i.occasions.filter((o) => item.occasions.includes(o)).length + (i.category === item.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.i);
}
