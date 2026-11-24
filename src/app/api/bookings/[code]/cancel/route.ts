import { NextResponse, type NextRequest } from "next/server";
import { cancelBooking, type BookingRow } from "@/lib/bookings";
import { cancellationRefund } from "@/lib/policy";
import { supabaseServer } from "@/lib/supabase/server";

/** A renter cancels their own confirmed booking; the refund follows the published policy */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  // Read through the visitor's own access rules: only their bookings are visible
  const { data: booking } = await sb.from("bookings").select("*").eq("code", code).eq("renter_id", user.id).single<BookingRow>();
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "confirmed") return NextResponse.json({ error: "This booking can't be cancelled online. Message us on WhatsApp." }, { status: 409 });

  const r = cancellationRefund(booking);
  try {
    const { refundError } = await cancelBooking(booking.id, { refund: r.amount, lenderAmount: r.rentKept, reason: `Cancelled by renter (${r.rule})` });
    return NextResponse.json({ ok: true, refund: r.amount, refundPending: Boolean(refundError) });
  } catch {
    return NextResponse.json({ error: "This booking can't be cancelled now." }, { status: 409 });
  }
}
