/** Server-only Razorpay helpers. The key secret never reaches the browser. */
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { razorpayKeyId } from "./supabase/env";

let client: Razorpay | undefined;

export function razorpay() {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeyId || !secret) throw new Error("Razorpay keys are not set");
  return (client ??= new Razorpay({ key_id: razorpayKeyId, key_secret: secret }));
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Proves a checkout success message really came from Razorpay for this order */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Proves a webhook call came from Razorpay */
export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(expected, signature);
}
