import type { BookingRow } from "@/lib/bookings";

export type MyBooking = BookingRow & { outfits: { name: string; slug: string; outfit_photos: { path: string; position: number }[] } | null };
export const MY_COLUMNS = "*, outfits(name, slug, outfit_photos(path, position))";
