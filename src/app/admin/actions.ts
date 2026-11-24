"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelBooking, refundPayment, type BookingRow } from "@/lib/bookings";
import { OCCASIONS, SIZES } from "@/lib/api";
import { cancellationRefund } from "@/lib/policy";
import { requireAdmin, supabaseService } from "@/lib/supabase/server";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Math.round(Number(f.get(k) ?? 0));

function back(path: string, msg: { ok?: string; error?: string }): never {
  const q = new URLSearchParams(msg as Record<string, string>);
  redirect(`${path}${path.includes("?") ? "&" : "?"}${q}`);
}

/** Public pages are cached for a minute; refresh them now so changes show straight away */
function refreshSite() {
  revalidatePath("/", "layout");
}

/* ───────── Lenders ───────── */

export async function saveLender(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const row = { name: str(f, "name"), phone: str(f, "phone") || null, upi_id: str(f, "upi_id") || null, notes: str(f, "notes") || null };
  if (!row.name) back("/admin/lenders", { error: "Add the lender's name." });
  const { error } = id ? await sb.from("lenders").update(row).eq("id", id) : await sb.from("lenders").insert(row);
  if (error) back("/admin/lenders", { error: error.message });
  back("/admin/lenders", { ok: id ? `Saved ${row.name}.` : `Added ${row.name}.` });
}

/* ───────── Outfits ───────── */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function saveOutfit(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const here = id ? `/admin/outfits/${id}` : "/admin/outfits/new";
  const row = {
    name: str(f, "name"),
    lender_id: str(f, "lender_id"),
    category: str(f, "category"),
    type: str(f, "type"),
    occasions: f.getAll("occasions").map(String).filter((o) => (OCCASIONS as string[]).includes(o)),
    size: str(f, "size"),
    measurements: str(f, "measurements") || null,
    description: str(f, "description"),
    fabric: str(f, "fabric") || null,
    color: str(f, "color") || null,
    price_4h: int(f, "price_4h"),
    price_day: int(f, "price_day"),
    price_3days: int(f, "price_3days"),
    cleaning_fee: int(f, "cleaning_fee"),
    featured: f.get("featured") === "on",
    updated_at: new Date().toISOString(),
  };
  if (!row.name || !row.type || !row.lender_id) back(here, { error: "Name, type and owner are required." });
  if (!["Indian", "Western"].includes(row.category) || !(SIZES as string[]).includes(row.size)) back(here, { error: "Choose a category and size." });
  if (!(row.price_4h > 0 && row.price_day >= row.price_4h && row.price_3days >= row.price_day)) {
    back(here, { error: "Prices must go up with time: 4 hours ≤ 1 day ≤ 3 days." });
  }

  if (id) {
    const { error } = await sb.from("outfits").update(row).eq("id", id);
    if (error) back(here, { error: error.message });
    refreshSite();
    back(here, { ok: "Saved." });
  }
  const slug = `${slugify(row.name)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await sb.from("outfits").insert({ ...row, slug, status: "draft" }).select("id").single();
  if (error || !data) back(here, { error: error?.message || "Couldn't save" });
  back(`/admin/outfits/${data.id}`, { ok: "Outfit saved as a draft. Add photos, then put it live." });
}

export async function setOutfitStatus(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const status = str(f, "status");
  if (!["draft", "live", "paused", "retired"].includes(status)) back(`/admin/outfits/${id}`, { error: "Unknown status" });
  if (status === "live") {
    const { count } = await sb.from("outfit_photos").select("id", { count: "exact", head: true }).eq("outfit_id", id);
    if (!count) back(`/admin/outfits/${id}`, { error: "Add at least one photo before putting it live." });
  }
  const { error } = await sb.from("outfits").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) back(`/admin/outfits/${id}`, { error: error.message });
  refreshSite();
  back(`/admin/outfits/${id}`, { ok: status === "live" ? "It's live on the website." : `Status changed to ${status}.` });
}

/** Called by the photo manager after uploads, deletes and reordering */
export async function photosChanged() {
  await requireAdmin();
  refreshSite();
}

/* ───────── Bookings ───────── */

export async function setBookingStage(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const to = str(f, "to");
  const back_ = str(f, "back") || "/admin/bookings";
  const from = to === "handed_over" ? "confirmed" : to === "returned" ? "handed_over" : null;
  if (!from) back(back_, { error: "Unknown step" });

  const { data: b, error } = await sb.from("bookings").update({ status: to }).eq("id", id).eq("status", from).select("*, outfits(lender_id)").single<BookingRow & { outfits: { lender_id: string } }>();
  if (error || !b) back(back_, { error: "That booking has already moved on. Refresh and check." });

  if (to === "returned") {
    // The lender is owed their full rent once the outfit is back
    await sb.from("payouts").upsert({ booking_id: b.id, lender_id: b.outfits.lender_id, amount: b.rent, status: "owed" }, { onConflict: "booking_id" });
  }
  revalidatePath("/bookings", "layout");
  back(back_, { ok: to === "returned" ? `#${b.code} returned. The lender's payout is now in Payouts.` : `#${b.code} marked as handed over.` });
}

export async function adminCancel(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const back_ = str(f, "back") || "/admin/bookings";
  const mode = str(f, "refund");
  const reason = str(f, "reason") || "Cancelled by ReWear";
  const { data: b } = await sb.from("bookings").select("*").eq("id", id).single<BookingRow>();
  if (!b) back(back_, { error: "Booking not found" });

  const policy = cancellationRefund(b);
  const refund = mode === "full" ? b.total : mode === "policy" ? policy.amount : Math.max(0, Math.min(b.total, int(f, "custom")));
  const lenderAmount = mode === "policy" ? policy.rentKept : 0;
  try {
    const { refundError } = await cancelBooking(b.id, { refund, lenderAmount, reason, from: ["confirmed", "handed_over"] });
    if (refundError) back(back_, { error: `Cancelled, but the refund failed: ${refundError}. Retry it from the booking.` });
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // let redirects through
    back(back_, { error: e instanceof Error ? e.message : "Couldn't cancel" });
  }
  back(back_, { ok: `#${b.code} cancelled. Refund of ₹${refund} started.` });
}

export async function retryRefund(f: FormData) {
  await requireAdmin();
  const db = supabaseService();
  const refundId = str(f, "refund_id");
  const back_ = str(f, "back") || "/admin/bookings";
  const { data: r } = await db.from("refunds").select("id, amount_paise, reason, status, payments(booking_id)").eq("id", refundId).single<{ id: string; amount_paise: number; reason: string; status: string; payments: { booking_id: string } }>();
  if (!r || r.status !== "failed") back(back_, { error: "Nothing to retry" });
  await db.from("refunds").delete().eq("id", r.id);
  try {
    await refundPayment(r.payments.booking_id, r.amount_paise / 100, r.reason || "Refund");
  } catch (e) {
    back(back_, { error: `Refund failed again: ${e instanceof Error ? e.message : "unknown error"}` });
  }
  back(back_, { ok: "Refund started." });
}

/* ───────── Payouts ───────── */

export async function markPayoutPaid(f: FormData) {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const reference = str(f, "reference");
  if (!reference) back("/admin/payouts", { error: "Add the UPI or bank reference so you can trace the payment." });
  const { error } = await sb.from("payouts").update({ status: "paid", paid_at: new Date().toISOString(), reference }).eq("id", id).eq("status", "owed");
  if (error) back("/admin/payouts", { error: error.message });
  back("/admin/payouts", { ok: "Marked as paid." });
}
