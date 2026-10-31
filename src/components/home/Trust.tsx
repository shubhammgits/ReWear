"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight, CreditCard, Shield, Sparkles, Star } from "lucide-react";
import { allReviews } from "@/lib/api";
import { img } from "@/lib/utils";
import { Eyebrow, FadeIn, RevealText } from "@/components/ui/Reveal";

const pillars = [
  { icon: BadgeCheck, title: "Verified profiles", text: "Every lender and renter is ID-verified with Aadhaar-backed KYC before their first booking." },
  { icon: Shield, title: "Damage protection", text: "Minor stains, loose threads and lost buttons are on us. Lenders are covered up to ₹25,000 per item." },
  { icon: Sparkles, title: "Professional cleaning", text: "Partner studios steam, clean and inspect every piece between rentals. Always fresh, never 'worn-in'." },
  { icon: CreditCard, title: "Secure payments", text: "UPI, cards and netbanking via RBI-compliant gateways. Deposits are held, never spent." },
];

export function Trust() {
  const reviews = allReviews();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const go = useCallback((d: number) => setIndex((i) => (i + d + reviews.length) % reviews.length), [reviews.length]);

  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(t);
  }, [paused, reduce, go]);

  const r = reviews[index];

  return (
    <section id="trust" className="scroll-mt-24 py-28 sm:py-36" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <Eyebrow>Trust, built in</Eyebrow>
          <RevealText id="trust-title" text="Borrow boldly. We've got you covered." className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]" />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div className="group h-full rounded-[var(--radius-card)] bg-sand/60 p-7 ring-1 ring-ink/5 transition-colors duration-500 hover:bg-plum hover:text-ivory">
                <p.icon className="h-8 w-8 text-plum transition-colors group-hover:text-gold" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-6 text-2xl">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed opacity-75">{p.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div
          className="mt-20 grid gap-10 rounded-[2rem] bg-ivory p-6 shadow-soft ring-1 ring-ink/5 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Renter reviews"
        >
          <div className="flex items-center gap-6 lg:flex-col lg:items-start">
            <p className="font-display text-7xl text-plum">4.9</p>
            <div>
              <div className="flex gap-0.5" aria-label="Average rating 4.9 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" aria-hidden />
                ))}
              </div>
              <p className="mt-1 text-sm text-muted">from 18,240 verified rentals</p>
            </div>
          </div>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                aria-live="polite"
              >
                <blockquote className="font-display text-[clamp(1.4rem,2.6vw,2.2rem)] leading-snug">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image src={img(r.avatar, 120)} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-sm text-muted">
                      {r.city} · rented for a {r.occasion.toLowerCase()}
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => go(-1)} aria-label="Previous review" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-ink hover:text-ivory">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button onClick={() => go(1)} aria-label="Next review" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-ink hover:text-ivory">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <div className="ml-3 flex gap-1.5" aria-hidden>
                {reviews.map((rv, i) => (
                  <span key={rv.id} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-plum" : "w-1.5 bg-ink/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
