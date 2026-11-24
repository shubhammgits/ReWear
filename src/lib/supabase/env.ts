/** Supabase is optional: without these settings the site falls back to the bundled sample catalogue. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

/** Online checkout needs both a database and Razorpay keys */
export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
export const onlineBooking = hasSupabase && Boolean(razorpayKeyId);

/** Shown only once Google sign-in is set up in Supabase (see README) */
export const googleSignIn = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "on";

export function photoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/outfit-photos/${path}`;
}
