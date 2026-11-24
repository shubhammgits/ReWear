import { NextResponse, type NextRequest } from "next/server";
import { OVERLAP } from "@/lib/bookings";
import type { OutfitRow } from "@/lib/catalog";
import { HOLD_MINUTES, MAX_AHEAD_DAYS, MIN_LEAD_HOURS, TURNAROUND_HOURS } from "@/lib/policy";
import { quote } from "@/lib/pricing";
import { razorpay } from "@/lib/razorpay";
import { razorpayKeyId } from "@/lib/supabase/env";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

const HOUR = 3_600_000;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Indian mobile number as 10 digits, or null */
function mobile(raw: unknown) {
  const d = String(raw ?? "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** Holds the dates for a few minutes and opens a Razorpay order for the total */
export async function POST(request: NextRequest) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return fail("Please sign in to book.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return fail("Bad request");
  const unit = body.unit === "days" ? "days" : body.unit === "hours" ? "hours" : null;
  const amount = Number(body.amount);
  const start = new Date(body.start);
  const phone = mobile(body.phone);
  const name = String(body.name ?? "").trim().slice(0, 80);
  const handover = body.handover === "delivery" ? "delivery" : "pickup";
  const address = String(body.address ?? "").trim().slice(0, 500);

  if (!unit || !Number.isInteger(amount) || (unit === "hours" ? amount < 4 || amount > 24 : amount < 1 || amount > 14)) return fail("Choose a valid duration.");
  if (Number.isNaN(start.getTime())) return fail("Choose a start date and time.");
  if (start.getTime() < Date.now() + MIN_LEAD_HOURS * HOUR) return fail(`Bookings need to start at least ${MIN_LEAD_HOURS} hours from now.`);
  if (start.getTime() > Date.now() + MAX_AHEAD_DAYS * 24 * HOUR) return fail(`You can book up to ${MAX_AHEAD_DAYS} days ahead.`);
  if (!name) return fail("Add your name.");
  if (!phone) return fail("Add a 10-digit mobile number.");
  if (handover === "delivery" && address.length < 10) return fail("Add your full delivery address.");

  const db = supabaseService();
  const { data: outfit } = await db.from("outfits").select("*").eq("id", body.outfitId).eq("status", "live").single<OutfitRow>();
  if (!outfit) return fail("This outfit isn't available to book.", 404);

  // The price is always worked out here, never taken from the browser
  const q = quote({ per4h: outfit.price_4h, perDay: outfit.price_day, per3Days: outfit.price_3days }, amount, unit, outfit.cleaning_fee);
  const ends = new Date(start.getTime() + q.hours * HOUR);
  const blockedUntil = new Date(ends.getTime() + TURNAROUND_HOURS * HOUR);

  // Free this person's own unpaid attempt (e.g. they closed the payment window) and any lapsed holds
  await db.from("bookings").update({ status: "expired" }).eq("renter_id", user.id).eq("outfit_id", outfit.id).eq("status", "pending_payment");
  await db.rpc("expire_stale_holds");

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      outfit_id: outfit.id,
      renter_id: user.id,
      starts_at: start.toISOString(),
      ends_at: ends.toISOString(),
      blocked_until: blockedUntil.toISOString(),
      hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
      rent: q.rental,
      service_fee: q.serviceFee,
      cleaning_fee: q.cleaningFee,
      protection_fee: q.protectionFee,
      total: q.total,
      handover,
      contact_phone: phone,
      address: handover === "delivery" ? address : null,
    })
    .select("id, code")
    .single();
  if (error?.code === OVERLAP) return fail("Someone has just booked these dates. Please pick another time.", 409);
  if (error || !booking) return fail("We couldn't hold these dates. Please try again.", 500);

  let orderId: string;
  try {
    const order = await razorpay().orders.create({
      amount: q.total * 100,
      currency: "INR",
      receipt: booking.code,
      notes: { booking_id: booking.id, outfit: outfit.slug },
    });
    orderId = order.id;
  } catch {
    await db.from("bookings").update({ status: "expired" }).eq("id", booking.id);
    return fail("Payments are not working right now. Please try again in a few minutes.", 502);
  }

  await db.from("payments").insert({ booking_id: booking.id, razorpay_order_id: orderId, amount_paise: q.total * 100 });
  await db.from("profiles").update({ full_name: name, phone }).eq("id", user.id);

  return NextResponse.json({
    code: booking.code,
    orderId,
    amount: q.total * 100,
    keyId: razorpayKeyId,
    holdMinutes: HOLD_MINUTES,
    prefill: { name, email: user.email, contact: `+91${phone}` },
    description: `${outfit.name} · ${q.label}`,
  });
}
