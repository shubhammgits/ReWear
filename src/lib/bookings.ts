/** Server-only booking operations: confirming payments, cancelling and refunding. */
import { revalidatePath } from "next/cache";
import { razorpay } from "./razorpay";
import { supabaseService } from "./supabase/server";

export type BookingStatus = "pending_payment" | "confirmed" | "handed_over" | "returned" | "cancelled" | "expired";

export interface BookingRow {
  id: string;
  code: string;
  outfit_id: string;
  renter_id: string;
  starts_at: string;
  ends_at: string;
  blocked_until: string;
  status: BookingStatus;
  hold_expires_at: string | null;
  rent: number;
  service_fee: number;
  cleaning_fee: number;
  protection_fee: number;
  total: number;
  handover: "pickup" | "delivery";
  contact_phone: string;
  address: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
}

export const statusLabel: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  handed_over: "With renter",
  returned: "Returned",
  cancelled: "Cancelled",
  expired: "Not paid",
};

/** Postgres code for the no_double_booking rule */
export const OVERLAP = "23P01";

function freshCalendar(outfitId?: string) {
  revalidatePath("/bookings", "layout");
  revalidatePath("/admin", "layout");
  if (outfitId) revalidatePath("/item/[id]", "page");
}

/**
 * Marks a paid order's booking as confirmed. Safe to call twice (checkout and webhook both do).
 * If the hold had lapsed and someone else took the dates meanwhile, the payment is refunded in full.
 */
export async function confirmPayment(orderId: string, paymentId: string) {
  const db = supabaseService();
  const { data: payment } = await db.from("payments").select("id, booking_id, status, amount_paise").eq("razorpay_order_id", orderId).single();
  if (!payment) throw new Error(`No payment for order ${orderId}`);

  if (payment.status === "created" || payment.status === "failed") {
    await db.from("payments").update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() }).eq("id", payment.id);
  }

  const { data: booking } = await db.from("bookings").select("*").eq("id", payment.booking_id).single<BookingRow>();
  if (!booking) throw new Error("Booking missing");
  if (booking.status !== "pending_payment" && booking.status !== "expired") return { booking, clash: false };

  const { data: updated, error } = await db
    .from("bookings")
    .update({ status: "confirmed", hold_expires_at: null })
    .eq("id", booking.id)
    .in("status", ["pending_payment", "expired"])
    .select("*")
    .single<BookingRow>();

  if (error?.code === OVERLAP) {
    // Paid after the hold ran out, and the dates went to someone else: give everything back
    await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancel_reason: "Dates taken while payment was pending" }).eq("id", booking.id);
    await refundPayment(booking.id, booking.total, "Dates no longer available");
    freshCalendar(booking.outfit_id);
    return { booking: { ...booking, status: "cancelled" as const }, clash: true };
  }
  if (error) throw error;
  freshCalendar(booking.outfit_id);
  return { booking: updated ?? booking, clash: false };
}

/** Refunds part or all of a booking's payment through Razorpay and records it */
export async function refundPayment(bookingId: string, rupees: number, reason: string) {
  if (rupees <= 0) return null;
  const db = supabaseService();
  const { data: payment } = await db
    .from("payments")
    .select("id, razorpay_payment_id, amount_paise, status")
    .eq("booking_id", bookingId)
    .in("status", ["paid", "partially_refunded"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!payment?.razorpay_payment_id) throw new Error("No paid payment to refund");

  const { data: earlier } = await db.from("refunds").select("amount_paise").eq("payment_id", payment.id).neq("status", "failed");
  const already = (earlier ?? []).reduce((s, r) => s + r.amount_paise, 0);
  const paise = Math.min(Math.round(rupees * 100), payment.amount_paise - already);
  if (paise <= 0) return null;

  try {
    const r = await razorpay().payments.refund(payment.razorpay_payment_id, {
      amount: paise,
      speed: "normal",
      notes: { booking_id: bookingId, reason: reason.slice(0, 250) },
    });
    await db.from("refunds").insert({
      payment_id: payment.id,
      razorpay_refund_id: r.id,
      amount_paise: paise,
      reason,
      status: r.status === "processed" ? "processed" : r.status === "failed" ? "failed" : "pending",
    });
    await db
      .from("payments")
      .update({ status: already + paise >= payment.amount_paise ? "refunded" : "partially_refunded" })
      .eq("id", payment.id);
    return r;
  } catch (e) {
    // Kept as a failed refund so the admin panel shows it with a retry button
    await db.from("refunds").insert({ payment_id: payment.id, amount_paise: paise, reason, status: "failed" });
    throw e;
  }
}

/**
 * Cancels a confirmed booking: frees the dates, refunds the renter and records what the lender is owed.
 * Only one caller can win: a second click finds the booking already cancelled.
 */
export async function cancelBooking(bookingId: string, opts: { refund: number; lenderAmount: number; reason: string; from?: BookingStatus[] }) {
  const db = supabaseService();
  const { data: booking } = await db
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancel_reason: opts.reason })
    .eq("id", bookingId)
    .in("status", opts.from ?? ["confirmed"])
    .select("*, outfits(lender_id)")
    .single<BookingRow & { outfits: { lender_id: string } }>();
  if (!booking) throw new Error("This booking can't be cancelled now");

  if (opts.lenderAmount > 0) {
    await db.from("payouts").upsert({ booking_id: booking.id, lender_id: booking.outfits.lender_id, amount: opts.lenderAmount, status: "owed" }, { onConflict: "booking_id" });
  }
  freshCalendar(booking.outfit_id);
  let refundError: string | null = null;
  try {
    await refundPayment(booking.id, opts.refund, opts.reason);
  } catch (e) {
    refundError = e instanceof Error ? e.message : "Refund failed";
  }
  return { booking, refundError };
}
