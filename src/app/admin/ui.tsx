/** Small building blocks for the admin screens: plain, dense and readable on a phone. */
import { cn } from "@/lib/utils";

export const input =
  "h-11 w-full rounded-xl bg-ivory px-3 text-base ring-1 ring-ink/15 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-plum";

export const btn = {
  primary: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-plum px-5 text-sm font-medium text-ivory hover:bg-plum-deep disabled:opacity-50",
  secondary: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium ring-1 ring-inset ring-ink/20 hover:ring-ink/50",
  danger: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-medium text-ivory hover:bg-red-800",
};

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-ivory p-5 ring-1 ring-ink/10", className)}>{children}</div>;
}

const tones = {
  green: "bg-emerald-100 text-emerald-900",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-900",
  grey: "bg-ink/[0.07] text-ink/70",
  plum: "bg-plum/10 text-plum",
};

export function Badge({ tone = "grey", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

/** Result of the last action, passed back in the URL (?ok= or ?error=) */
export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p role={error ? "alert" : "status"} className={cn("mb-6 rounded-2xl p-4 text-sm", error ? "bg-red-100 text-red-900" : "bg-emerald-100 text-emerald-900")}>
      {error || ok}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-sand/60 p-8 text-center text-ink/70">{children}</p>;
}

export const statusTone = { live: "green", draft: "amber", paused: "grey", retired: "red" } as const;
