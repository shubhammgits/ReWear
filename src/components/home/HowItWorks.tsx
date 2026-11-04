"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CalendarCheck, IndianRupee, PackageCheck, Search, Shirt, Sparkles, Truck } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Eyebrow, RevealText } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const tracks = {
  renter: [
    { icon: Search, title: "Find your look", text: "Filter by occasion, size, city and budget. Every piece is real, measured and photographed by its owner." },
    { icon: CalendarCheck, title: "Pick your hours", text: "Rent for 4 hours, a day or a long weekend. Price, deposit and cleaning fee are all shown upfront." },
    { icon: Truck, title: "Get it delivered", text: "Fresh from professional cleaning, at your door before you need it. Or pick it up nearby." },
    { icon: Sparkles, title: "Shine & return", text: "Wear it, love it, hand it back. No laundry. Your deposit is released within 48 hours." },
  ],
  lender: [
    { icon: Camera, title: "Snap & list", text: "Upload a few photos, add your size and set prices per 4 hours, day or 3 days. Takes 5 minutes." },
    { icon: Shirt, title: "Approve requests", text: "Accept bookings that suit you. Block dates whenever you want the piece for yourself." },
    { icon: PackageCheck, title: "We handle the rest", text: "Pickup, cleaning, delivery and damage protection: all managed by ReWear." },
    { icon: IndianRupee, title: "Get paid", text: "Keep 85% of every rental, paid straight to your bank every week. Your closet, now on payroll." },
  ],
};

type Track = keyof typeof tracks;

export function HowItWorks() {
  const [track, setTrack] = useState<Track>("renter");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hiw-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: ".hiw-steps", start: "top 75%", end: "bottom 45%", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="how-it-works" ref={root} className="relative scroll-mt-24 py-28 sm:py-36" aria-labelledby="hiw-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <RevealText id="hiw-title" text="Two ways to ReWear." className="max-w-xl text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]" />
          </div>

          <div role="tablist" aria-label="Choose your track" className="relative grid w-full grid-cols-2 rounded-full bg-sand p-1.5 sm:inline-grid sm:w-auto sm:self-start lg:self-auto">
            {(["renter", "lender"] as Track[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={track === t}
                aria-controls="hiw-panel"
                onClick={() => setTrack(t)}
                className={cn("relative z-10 min-h-11 rounded-full px-4 py-3 text-sm font-semibold transition-colors sm:px-6", track === t ? "text-ivory" : "text-ink/70 hover:text-ink")}
              >
                {track === t && <motion.span layoutId="hiw-pill" className="absolute inset-0 -z-10 rounded-full bg-plum" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {t === "renter" ? "I want to rent" : "I want to lend"}
              </button>
            ))}
          </div>
        </div>

        <div id="hiw-panel" role="tabpanel" className="hiw-steps relative mt-16">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden h-px bg-line lg:block">
            <div className="hiw-line h-full origin-left bg-gradient-to-r from-plum via-gold to-plum" />
          </div>

          <AnimatePresence mode="wait">
            <motion.ol
              key={track}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ show: { transition: { staggerChildren: 0.09 } }, exit: { transition: { staggerChildren: 0.04 } } }}
            >
              {tracks[track].map((s, i) => (
                <motion.li
                  key={s.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                    exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
                  }}
                  className="relative flex gap-4 sm:block"
                >
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16 bg-ivory shadow-soft ring-1 ring-plum/10">
                    <s.icon className="h-7 w-7 text-plum" strokeWidth={1.5} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 rounded-[var(--radius-card)] bg-ivory p-5 sm:mt-6 sm:h-full sm:p-6 shadow-soft ring-1 ring-ink/5 transition-transform duration-500 hover:-translate-y-1">
                    <span className="font-display text-4xl text-gold-deep sm:text-5xl">0{i + 1}</span>
                    <h3 className="mt-3 text-2xl">{s.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{s.text}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
