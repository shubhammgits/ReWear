"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CalendarDays, ChevronLeft, Clock, MapPin, PartyPopper, Ruler, ShieldCheck, Sparkles, Star } from "lucide-react";
import type { DurationUnit, Item, Lender, Review } from "@/lib/types";
import { quote } from "@/lib/pricing";
import { cn, formatINR, img } from "@/lib/utils";
import { Gallery } from "@/components/product/Gallery";
import { PriceBreakdown } from "@/components/product/PriceBreakdown";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FadeIn } from "@/components/ui/Reveal";

const hourOptions = [4, 6, 8, 12];
const dayOptions = [1, 2, 3, 5, 7];

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function ItemClient({ item, lender, reviews, similar }: { item: Item; lender?: Lender; reviews: Review[]; similar: Item[] }) {
  const [unit, setUnit] = useState<DurationUnit>("hours");
  const [amount, setAmount] = useState(4);
  // Dates are set after mount: this page is statically generated, so build-time dates would be stale
  const [date, setDate] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => {
    setDate(tomorrowISO());
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  const [time, setTime] = useState("18:00");
  const [confirmed, setConfirmed] = useState(false);

  const q = quote(item.pricing, amount, unit, item.cleaningFee, item.deposit);

  const returnAt = useMemo(() => {
    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) return "";
    const end = new Date(start.getTime() + q.hours * 3600_000);
    return end.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  }, [date, time, q.hours]);

  const switchUnit = (u: DurationUnit) => {
    setUnit(u);
    setAmount(u === "hours" ? 4 : 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 sm:pt-32">
      <Link href="/browse" className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-plum">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to browse
      </Link>

      {/* minmax(0,…) + min-w-0: the thumbnail scroller must not widen the column past the viewport */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Gallery images={item.images} alt={item.imageAlt} />

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">
            {item.category} · {item.type}
          </p>
          <h1 className="mt-3 text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1]">{item.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/70">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden /> <strong className="text-ink">{item.rating}</strong> ({item.reviewsCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden /> {item.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-4 w-4" aria-hidden /> Size {item.size}
            </span>
          </div>
          <p className="mt-6 max-w-xl leading-relaxed text-ink/80">{item.description}</p>
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-sand/70 p-4">
              <dt className="text-muted">Fabric</dt>
              <dd className="mt-1 font-medium">{item.fabric}</dd>
            </div>
            <div className="rounded-2xl bg-sand/70 p-4">
              <dt className="text-muted">Colour</dt>
              <dd className="mt-1 font-medium">{item.color}</dd>
            </div>
          </dl>

          {/* Booking card */}
          <section aria-labelledby="book-title" className="mt-10 rounded-[2rem] bg-ivory p-6 shadow-lift ring-1 ring-ink/5 sm:p-8">
            <h2 id="book-title" className="text-2xl">
              Book your dates
            </h2>
            <div role="radiogroup" aria-label="Rent by" className="mt-5 inline-flex rounded-full bg-sand p-1">
              {(["hours", "days"] as DurationUnit[]).map((u) => (
                <button
                  key={u}
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => switchUnit(u)}
                  className={cn("relative rounded-full px-5 py-2 text-sm font-semibold", unit === u ? "text-ivory" : "text-ink/70")}
                >
                  {unit === u && <motion.span layoutId="item-unit" className="absolute inset-0 rounded-full bg-plum" />}
                  <span className="relative">By {u}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-sm text-ink/70">
                  <CalendarDays className="h-4 w-4" aria-hidden /> Start date
                </span>
                <input
                  type="date"
                  min={today || undefined}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-sand/60 px-4 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-plum"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-sm text-ink/70">
                  <Clock className="h-4 w-4" aria-hidden /> Pickup / delivery time
                </span>
                <input
                  type="time"
                  step={1800}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-sand/60 px-4 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-plum"
                />
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm text-ink/70">Duration</legend>
              <div className="flex flex-wrap gap-2">
                {(unit === "hours" ? hourOptions : dayOptions).map((n) => (
                  <button
                    key={n}
                    aria-pressed={amount === n}
                    onClick={() => setAmount(n)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
                      amount === n ? "bg-ink text-ivory ring-ink" : "ring-ink/15 hover:ring-ink/40"
                    )}
                  >
                    {unit === "hours" ? `${n} hrs` : `${n} ${n === 1 ? "day" : "days"}`}
                  </button>
                ))}
              </div>
              {returnAt && <p className="mt-3 text-sm text-muted">Return by {returnAt}</p>}
            </fieldset>

            <div className="mt-6">
              <PriceBreakdown q={q} />
            </div>
            <Button onClick={() => setConfirmed(true)} className="mt-6 w-full" size="lg">
              Rent now · {formatINR(q.total)}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Free cancellation up to 24 hours before pickup
            </p>
          </section>

          {lender && (
            <section aria-label="About the lender" className="mt-8 flex gap-4 rounded-[2rem] bg-sand/60 p-6">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                <Image src={img(lender.avatar, 160)} alt={`Portrait of ${lender.name}`} fill sizes="64px" className="object-cover" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-semibold">
                  {lender.name}
                  {lender.verified && <BadgeCheck className="h-4 w-4 text-plum" aria-label="Verified lender" />}
                </p>
                <p className="text-sm text-muted">
                  {lender.city} · ★ {lender.rating} · {lender.rentals} rentals · replies {lender.responseTime}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{lender.bio}</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section aria-labelledby="reviews-title" className="mt-24">
        <h2 id="reviews-title" className="text-[clamp(2rem,4vw,3rem)]">
          What renters said
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((r, i) => (
            <FadeIn key={r.id} delay={i * 0.08}>
              <figure className="h-full rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-ink/5">
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={cn("h-4 w-4", s < r.rating ? "fill-gold text-gold" : "text-ink/20")} aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 leading-relaxed text-ink/85">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 text-sm">
                  <span className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={img(r.avatar, 100)} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-muted">
                      {r.city} · {new Date(r.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </section>

      <section aria-labelledby="similar-title" className="mt-24">
        <h2 id="similar-title" className="text-[clamp(2rem,4vw,3rem)]">
          You might also love
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
          {similar.map((s) => (
            <ProductCard key={s.id} item={s} />
          ))}
        </div>
      </section>

      <Modal open={confirmed} onClose={() => setConfirmed(false)} label="Booking confirmed" className="sm:max-w-md">
        <div className="p-8 text-center sm:p-10">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
              className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/20"
            >
              <PartyPopper className="h-9 w-9 text-plum" aria-hidden />
            </motion.div>
          </AnimatePresence>
          <h2 className="mt-6 text-3xl">You&apos;re booked!</h2>
          <p className="mt-3 text-ink/70">
            {item.name} is yours for {q.label}, starting{" "}
            {date ? new Date(`${date}T${time}`).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "soon"}. We&apos;ll
            WhatsApp you delivery updates.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sand px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-gold" aria-hidden /> Demo mode: no payment was taken
          </p>
          <div className="mt-8 grid gap-2">
            <Button href="/dashboard" className="w-full">
              View in my rentals
            </Button>
            <Button onClick={() => setConfirmed(false)} variant="secondary" className="w-full">
              Keep browsing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
