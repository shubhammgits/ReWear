/** Everything an admin booking card shows, in one query */
export const BOOKING_COLUMNS =
  "*, outfits(name, slug, lenders(name)), profiles(full_name), payments(status, razorpay_payment_id, refunds(id, amount_paise, status))";
