/**
 * Launch settings. Set these in the host's environment variables (or a local .env.local),
 * then redeploy. See .env.example.
 */
export const site = {
  /** The one city ReWear serves right now */
  city: process.env.NEXT_PUBLIC_CITY || "your city",
  /** WhatsApp Business number with country code, digits only, e.g. 919876543210 */
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, ""),
  /** Name of the person or business that runs ReWear, as registered with Razorpay */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "ReWear",
  /** Support email shown on the contact and policy pages */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  /** Full postal address shown on the contact page (Razorpay checks for one) */
  address: process.env.NEXT_PUBLIC_ADDRESS || "",
};

/** wa.me link that opens a chat with ReWear, message pre-filled */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Phone number as people read it, e.g. +91 87430 25203 */
export function displayPhone() {
  const n = site.whatsapp;
  return n.length === 12 && n.startsWith("91") ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : n ? `+${n}` : "";
}
