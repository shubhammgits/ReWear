/**
 * Data access layer. Everything reads from local JSON today; swap these
 * functions for `fetch()` calls when a real API exists — the signatures
 * (async, typed) already match what a network layer would return.
 */
import itemsData from "@/data/items.json";
import lendersData from "@/data/lenders.json";
import reviewsData from "@/data/reviews.json";
import contentData from "@/data/content.json";
import dashboardData from "@/data/dashboard.json";
import type { Faq, Item, Lender, Occasion, OccasionName, Review, Size } from "./types";

const items = itemsData as Item[];
const lenders = lendersData as Lender[];
const reviews = reviewsData as Review[];

export const content = contentData as {
  occasions: Occasion[];
  faqs: Faq[];
  stats: { label: string; value: number; suffix: string }[];
  cities: string[];
};

export const dashboard = dashboardData;

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
export const OCCASIONS: OccasionName[] = ["Wedding", "Party", "Festival", "Interview", "Photoshoot", "Date night"];

/* Sync getters — handy for client components working off the bundled mock data */
export const allItems = () => items;
export const itemById = (id: string) => items.find((i) => i.id === id);
export const lenderById = (id: string) => lenders.find((l) => l.id === id);
export const allReviews = () => reviews;

/* Async API-shaped versions */
export async function getItems(): Promise<Item[]> {
  return items;
}

export async function getItem(id: string): Promise<Item | undefined> {
  return itemById(id);
}

export async function getFeaturedItems(): Promise<Item[]> {
  return items.filter((i) => i.featured);
}

export async function getLender(id: string): Promise<Lender | undefined> {
  return lenderById(id);
}

export async function getReviewsForItem(id: string): Promise<Review[]> {
  const direct = reviews.filter((r) => r.itemId === id);
  // Pad with general reviews so every item page has social proof in the mock
  return direct.length >= 3 ? direct : [...direct, ...reviews.filter((r) => r.itemId !== id)].slice(0, 3);
}

export function getSimilarItems(item: Item, limit = 4): Item[] {
  return items
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: i.occasions.filter((o) => item.occasions.includes(o)).length + (i.category === item.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.i);
}
