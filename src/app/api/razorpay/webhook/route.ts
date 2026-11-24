import { NextResponse, type NextRequest } from "next/server";
import { confirmPayment } from "@/lib/bookings";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { supabaseService } from "@/lib/supabase/server";

/**
 * Razorpay calls this after payments and refunds, so bookings are confirmed even if the
 * renter closed the browser before the checkout finished. Set it up in the Razorpay
 * dashboard (Settings → Webhooks) with RAZORPAY_WEBHOOK_SECRET; see README.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") || "")) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const p = event.payload.payment.entity;
      if (p.order_id) await confirmPayment(p.order_id, p.id);
    } else if (event.event === "payment.failed") {
      const p = event.payload.payment.entity;
      await supabaseService().from("payments").update({ status: "failed" }).eq("razorpay_order_id", p.order_id).eq("status", "created");
    } else if (event.event === "refund.processed" || event.event === "refund.failed") {
      const r = event.payload.refund.entity;
      await supabaseService()
        .from("refunds")
        .update({ status: event.event === "refund.processed" ? "processed" : "failed" })
        .eq("razorpay_refund_id", r.id);
    }
  } catch (e) {
    // A 500 makes Razorpay retry later
    console.error("webhook", event.event, e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
