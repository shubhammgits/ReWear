import { NextResponse, type NextRequest } from "next/server";
import { confirmPayment } from "@/lib/bookings";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { supabaseServer } from "@/lib/supabase/server";

/** Called by the checkout window after a successful payment */
export async function POST(request: NextRequest) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = (await request.json().catch(() => ({}))) ?? {};
  if (!orderId || !paymentId || !signature || !verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "We couldn't verify this payment. If money left your account, message us and we'll sort it out." }, { status: 400 });
  }

  try {
    const { booking, clash } = await confirmPayment(orderId, paymentId);
    if (booking.renter_id !== user.id) return NextResponse.json({ error: "Not your booking" }, { status: 403 });
    return NextResponse.json({ code: booking.code, status: booking.status, clash });
  } catch {
    return NextResponse.json({ error: "Your payment went through, but we couldn't update the booking. We'll confirm it with you shortly." }, { status: 500 });
  }
}
