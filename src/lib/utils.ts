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
