"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { OCCASIONS, SIZES, allItems, content } from "@/lib/api";
import type { Item, OccasionName, Size } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickView } from "@/components/product/QuickView";
import { Slider } from "@/components/ui/Slider";

type Duration = "4h" | "day" | "3days";
type Sort = "popular" | "price-asc" | "price-desc" | "rating";

const durationLabel: Record<Duration, string> = { "4h": "4 hours", day: "1 day", "3days": "3 days" };
const priceFor = (i: Item, d: Duration) => (d === "4h" ? i.pricing.per4h : d === "day" ? i.pricing.perDay : i.pricing.per3Days);
const MAX_PRICE = 5000;

export function BrowseClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [occasions, setOccasions] = useState<OccasionName[]>(
    (params.get("occasion")?.split(",").filter((o) => OCCASIONS.includes(o as OccasionName)) as OccasionName[]) ?? []
  );
  const [sizes, setSizes] = useState<Size[]>((params.get("size")?.split(",") as Size[]) ?? []);
  const [city, setCity] = useState(params.get("city") ?? "");
  const [duration, setDuration] = useState<Duration>((params.get("d") as Duration) || "day");
  const [maxPrice, setMaxPrice] = useState(Number(params.get("max")) || MAX_PRICE);
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) || "popular");
  const [quick, setQuick] = useState<Item | null>(null);
  const [drawer, setDrawer] = useState(false);

  // Keep the URL shareable
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (occasions.length) sp.set("occasion", occasions.join(","));
    if (sizes.length) sp.set("size", sizes.join(","));
    if (city) sp.set("city", city);
    if (duration !== "day") sp.set("d", duration);
    if (maxPrice < MAX_PRICE) sp.set("max", String(maxPrice));
    if (sort !== "popular") sp.set("sort", sort);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, occasions, sizes, city, duration, maxPrice, sort, pathname, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allItems().filter(
      (i) =>
        (!q || [i.name, i.type, i.color, i.category, i.city].some((f) => f.toLowerCase().includes(q))) &&
        (!occasions.length || i.occasions.some((o) => occasions.includes(o))) &&
        (!sizes.length || sizes.includes(i.size)) &&
        (!city || i.city === city) &&
        priceFor(i, duration) <= maxPrice
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => priceFor(a, duration) - priceFor(b, duration));
    if (sort === "price-desc") sorted.sort((a, b) => priceFor(b, duration) - priceFor(a, duration));
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "popular") sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
    return sorted;
  }, [query, occasions, sizes, city, duration, maxPrice, sort]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const activeCount = occasions.length + sizes.length + (city ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0);
  const reset = () => {
    setOccasions([]);
    setSizes([]);
    setCity("");
    setMaxPrice(MAX_PRICE);
    setQuery("");
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
      active ? "bg-plum text-ivory ring-plum" : "bg-ivory text-ink/80 ring-ink/10 hover:ring-ink/30"
    );

  const filters = (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Occasion</legend>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button key={o} aria-pressed={occasions.includes(o)} onClick={() => setOccasions((l) => toggle(l, o))} className={chip(occasions.includes(o))}>
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Size</legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} aria-pressed={sizes.includes(s)} onClick={() => setSizes((l) => toggle(l, s))} className={cn(chip(sizes.includes(s)), "w-12 px-0")}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="city" className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          City
        </label>
        <select
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-12 w-full rounded-full bg-ivory px-5 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-plum"
        >
          <option value="">All cities</option>
          {content.cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Rental duration</legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(durationLabel) as Duration[]).map((d) => (
            <button key={d} aria-pressed={duration === d} onClick={() => setDuration(d)} className={cn(chip(duration === d), "px-2")}>
              {durationLabel[d]}
            </button>
          ))}
        </div>
      </fieldset>
      <Slider
        id="max-price"
        label={`Max price / ${durationLabel[duration]}`}
        value={maxPrice}
        min={200}
        max={MAX_PRICE}
        step={100}
        onChange={setMaxPrice}
        format={(v) => (v >= MAX_PRICE ? "Any" : formatINR(v))}
      />
      {activeCount > 0 && (
        <button onClick={reset} className="text-sm font-semibold text-plum underline-offset-4 hover:underline">
          Clear all filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28">
      {/* Toolbar */}
      <div className="sticky top-20 z-30 -mx-2 mb-10 flex flex-wrap items-center gap-3 rounded-full bg-ivory/85 p-2 shadow-soft ring-1 ring-ink/5 backdrop-blur-xl">
        <label className="relative flex min-w-[200px] flex-1 items-center">
          <span className="sr-only">Search outfits</span>
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lehenga, blazer, red, Mumbai…"
            className="h-11 w-full rounded-full bg-transparent pl-11 pr-4 text-sm placeholder:text-muted focus:outline-none"
          />
        </label>
        <button
          onClick={() => setDrawer(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-sand px-4 text-sm font-semibold lg:hidden"
          aria-expanded={drawer}
          aria-controls="filter-drawer"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters {activeCount > 0 && <span className="rounded-full bg-plum px-2 text-xs text-ivory">{activeCount}</span>}
        </button>
        <label className="flex items-center gap-2 pr-2 text-sm">
          <span className="hidden text-muted sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-11 rounded-full bg-sand px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-plum"
            aria-label="Sort results"
          >
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-44">{filters}</div>
        </aside>

        <div>
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "look" : "looks"} · prices shown per {durationLabel[duration]}
          </p>
          <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            <AnimatePresence mode="popLayout">
              {results.map((item, i) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.03 }}
                >
                  <ProductCard item={item} onQuickView={setQuick} priority={i < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          {results.length === 0 && (
            <div className="rounded-[2rem] bg-sand/60 px-6 py-20 text-center">
              <p className="font-display text-3xl">Nothing fits those filters… yet.</p>
              <p className="mt-2 text-ink/70">Try a different size or city. New closets join every day.</p>
              <button onClick={reset} className="mt-6 rounded-full bg-plum px-6 py-3 text-sm font-semibold text-ivory">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setDrawer(false)} tabIndex={-1} />
            <motion.div
              id="filter-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              data-lenis-prevent
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-ivory p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl">Filters</h2>
                <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-full bg-sand">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {filters}
              <button onClick={() => setDrawer(false)} className="mt-8 h-12 w-full rounded-full bg-plum font-semibold text-ivory">
                Show {results.length} looks
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickView item={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
