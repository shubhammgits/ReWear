"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RevealText } from "@/components/ui/Reveal";

const words = ["Lehengas", "Tuxedos", "Sarees", "Slip dresses", "Sherwanis", "Blazers", "Gowns", "Anarkalis"];

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-plum py-28 text-ivory sm:py-40" aria-labelledby="cta-title">
      <div aria-hidden className="absolute inset-x-0 top-8 overflow-hidden opacity-20">
        <div className="marquee flex w-max gap-10 whitespace-nowrap font-display text-6xl italic sm:text-8xl">
          {[...words, ...words].map((w, i) => (
            <span key={i}>
              {w} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="relative mx-auto max-w-5xl px-6 pt-16 text-center">
        <RevealText id="cta-title" text="Your next look is already in someone's closet." className="text-[clamp(2.6rem,6.5vw,6rem)] leading-[0.98]" />
        <p className="mx-auto mt-6 max-w-lg text-lg text-ivory/75">Find it in minutes. Or lend yours and make room for something new.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/browse" variant="gold" size="lg">
            Rent an outfit <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/list-your-clothes" variant="ghost" size="lg">
            Earn from your wardrobe
          </Button>
        </div>
      </div>
    </section>
  );
}
