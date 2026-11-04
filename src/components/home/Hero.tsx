"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RevealText } from "@/components/ui/Reveal";
import { HeroVisual } from "@/components/three/HeroVisual";

export function Hero() {
  const reduce = useReducedMotion();
  // `slide` skips the opacity fade: the intro paragraph is the mobile LCP element, and an
  // opacity-0 start delays LCP until hydration and the fade finish on slow phones
  const fade = (delay: number, slide = false) => ({
    initial: { opacity: slide ? 1 : 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28" aria-labelledby="hero-title">
      {/* warm backdrop glow */}
      {/* warm backdrop glow: sized in vw so it never pushes past small screens */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-[12vw] top-10 aspect-square w-[clamp(18rem,48vw,39rem)] rounded-full bg-blush/70 blur-3xl" />
        <div className="absolute -left-[12vw] bottom-0 aspect-square w-[clamp(14rem,32vw,26rem)] rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-6 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 py-6 lg:py-0">
          <motion.p {...fade(0.1)} className="mb-6 inline-flex items-center gap-2 rounded-full bg-ivory/80 px-4 py-2 text-sm font-medium text-plum shadow-soft ring-1 ring-plum/10 backdrop-blur">
            <Sparkles className="h-4 w-4 text-gold" aria-hidden />
            Rent by the hour. Lend by the day.
          </motion.p>

          <h1 id="hero-title" className="font-display text-[clamp(2.75rem,min(11vw,17svh),7.5rem)] font-medium leading-[0.92] tracking-[-0.035em]">
            <RevealText as="span" text="Wear more." immediate className="block" delay={0.15} />
            <RevealText as="span" text="Own less." immediate className="block italic text-plum" delay={0.35} />
          </h1>

          <motion.p {...fade(0.6, true)} className="mt-7 max-w-md text-lg leading-relaxed text-ink/70">
            Rent stunning outfits from real closets near you for a few hours or a few days. Or turn the ones you rarely wear into
            monthly income.
          </motion.p>

          <motion.div {...fade(0.75)} className="mt-9 flex flex-wrap gap-3">
            <Button href="/browse" size="lg">
              Rent an outfit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Button>
            <Button href="/list-your-clothes" variant="secondary" size="lg">
              Earn from your wardrobe
            </Button>
          </motion.div>

          <motion.div {...fade(0.9)} className="mt-10 flex items-center gap-4 text-sm text-muted">
            <div className="flex -space-x-2" aria-hidden>
              {["bg-plum", "bg-gold", "bg-blush", "bg-ink"].map((c) => (
                <span key={c} className={`h-8 w-8 rounded-full ring-2 ring-ivory ${c}`} />
              ))}
            </div>
            <p>
              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden /> 4.9
              </span>{" "}
              from 18,000+ rentals across 8 cities
            </p>
          </motion.div>
        </div>

        <div className="relative h-[52svh] min-h-[360px] lg:h-[78svh]">
          <HeroVisual />
        </div>
      </div>

      <motion.a
        href="#idea"
        {...fade(1.2)}
        className="absolute bottom-4 left-1/2 hidden min-h-11 -translate-x-1/2 flex-col items-center justify-center gap-2 p-2 text-xs uppercase tracking-[0.25em] text-muted lg:flex"
      >
        Scroll the story
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden />
      </motion.a>
    </section>
  );
}
