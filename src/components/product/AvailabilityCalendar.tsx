"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { clashes, MAX_AHEAD_DAYS, MIN_LEAD_HOURS, type BusyRange } from "@/lib/policy";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Local YYYY-MM-DD (not toISOString, which would shift the day in India before 5:30am) */
export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOf(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fetches when the outfit is booked; refreshes when the tab regains focus or on reload() */
export function useBusy(outfitId?: string) {
  const [busy, setBusy] = useState<BusyRange[] | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!outfitId) return;
    let live = true;
    const load = () =>
      supabaseBrowser()
        .rpc("outfit_busy", { p_outfit: outfitId })
        .then(({ data }) => live && setBusy((data as BusyRange[]) ?? []));
    load();
    window.addEventListener("focus", load);
    return () => {
      live = false;
      window.removeEventListener("focus", load);
    };
  }, [outfitId, tick]);
  return { busy, reload: () => setTick((t) => t + 1) };
}

/**
 * Month view where a day can be picked only if the outfit is free for the whole rental
 * starting that day at the chosen time (cleaning time included).
 */
export function AvailabilityCalendar({
  busy,
  hours,
  time,
  value,
  onChange,
}: {
  busy: BusyRange[] | null;
  hours: number;
  time: string;
  value: string;
  onChange: (day: string) => void;
}) {
  const [month, setMonth] = useState(() => {
    const d = value ? new Date(`${value}T00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const days = useMemo(() => {
    const first = new Date(month);
    const lead = (first.getDay() + 6) % 7; // Monday first
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const earliest = now === null ? Infinity : now + MIN_LEAD_HOURS * 3_600_000;
  const latest = now === null ? 0 : now + MAX_AHEAD_DAYS * 86_400_000;
  const state = (d: Date): "free" | "booked" | "closed" => {
    const start = startOf(isoDay(d), time);
    if (!start || start.getTime() < earliest || start.getTime() > latest) return "closed";
    return busy && clashes(start, hours, busy) ? "booked" : "free";
  };

  const thisMonth = now !== null && month.getFullYear() === new Date(now).getFullYear() && month.getMonth() === new Date(now).getMonth();
  const label = month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl bg-sand/50 p-3 ring-1 ring-ink/10 sm:p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={thisMonth}
          aria-label="Previous month"
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-ivory disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-medium" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Next month"
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-ivory"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div role="grid" aria-label={`Start dates in ${label}`} className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const day = isoDay(d);
          const s = state(d);
          const selected = day === value;
          return (
            <button
              key={day}
              type="button"
              disabled={s !== "free"}
              onClick={() => onChange(day)}
              aria-pressed={selected}
              aria-label={`${d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}${s === "booked" ? ", booked" : s === "closed" ? ", unavailable" : ""}`}
              className={cn(
                "relative grid h-11 place-items-center rounded-xl text-sm transition",
                selected && "bg-plum font-semibold text-ivory",
                !selected && s === "free" && "bg-ivory hover:ring-1 hover:ring-plum",
                s === "booked" && "text-ink/35 line-through decoration-plum/60",
                s === "closed" && "text-ink/25"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-ivory ring-1 ring-ink/15" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-ink/35 line-through decoration-plum/60">12</span> Booked or being cleaned
        </span>
        {busy === null && <span>Checking availability…</span>}
      </p>
    </div>
  );
}
