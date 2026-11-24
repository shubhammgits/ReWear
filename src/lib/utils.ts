const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatINR = (n: number) => `₹${inr.format(Math.round(n))}`;
export const formatNumber = (n: number) => inr.format(Math.round(n));

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Build an Unsplash URL from a stored photo id. next/image resizes it further. */
export function img(id: string, w = 1200) {
  if (id.startsWith("http") || id.startsWith("/") || id.startsWith("blob:")) return id;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
}

/** Shared blur placeholder: a 3×4 sand → blush gradient SVG, inline so it costs no request. */
export const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczJyBoZWlnaHQ9JzQnPjxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDI9JzAnIHkyPScxJz48c3RvcCBzdG9wLWNvbG9yPScjZWZlOGRkJy8+PHN0b3Agb2Zmc2V0PScxJyBzdG9wLWNvbG9yPScjZjNkOWQzJy8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB3aWR0aD0nMycgaGVpZ2h0PSc0JyBmaWxsPSd1cmwoI2cpJy8+PC9zdmc+";

/** Heuristic for devices that should skip WebGL / heavy scroll effects. */
export function isLowEndDevice() {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = nav.connection?.saveData === true;
  const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
  const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2;
  return reduced || saveData || lowMem || lowCpu;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Only same-site paths, so a crafted link can't send people to another website after sign-in */
export function safeNext(next?: string | null, fallback = "/bookings") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/** Shared text-input style */
export const field =
  "h-12 w-full rounded-2xl bg-sand/60 px-4 text-base ring-1 ring-ink/10 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-plum";

/** Dates and times always in Indian time, whatever the server's clock zone */
export function formatWhen(d: string | Date, withYear = false) {
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    hour: "numeric",
    minute: "2-digit",
  });
}
