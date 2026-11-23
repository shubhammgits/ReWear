/**
 * Launch settings. Set these in Vercel (Project → Settings → Environment Variables)
 * or in a local .env.local, then redeploy. See .env.example.
 */
export const site = {
  /** The one city ReWear serves right now */
  city: process.env.NEXT_PUBLIC_CITY || "your city",
  /** WhatsApp Business number with country code, digits only, e.g. 919876543210 */
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, ""),
};

/** wa.me link that opens a chat with ReWear, message pre-filled */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
