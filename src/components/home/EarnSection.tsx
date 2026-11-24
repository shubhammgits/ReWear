"use client";

import { useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { lenderEarnings } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import { site } from "@/lib/site";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Eyebrow, FadeIn, RevealText } from "@/components/ui/Reveal";

export function EarnSection() {
  const [items, setItems] = useState(6);
  const [rentals, setRentals] = useState(2);
  const [price, setPrice] = useState(800);
  const monthly = lenderEarnings(items, rentals, price);

  return (
    <section className="surface-dark relative overflow-hidden bg-ink py-28 text-ivory sm:py-36" aria-labelledby="earn-title">
      <div aria-hidden className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full bg-plum/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow light>For lenders</Eyebrow>
          <RevealText id="earn-title" text="Your clothes can earn for you." className="text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]" />
          <p className="mt-6 max-w-md text-lg text-ivory/70">
            That lehenga from your cousin&apos;s wedding could be paying for your next holiday. Lend it to ReWear: we photograph it, find
            renters in {site.city}, and handle payments, handover and cleaning.
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm text-ivory/70">
            <TrendingUp className="h-4 w-4 text-gold" aria-hidden />
            You keep 100% of the price you set. Renters pay our fee on top.
          </p>
        </div>

        <FadeIn>
          <div className="rounded-[2rem] bg-ivory/[0.06] p-6 ring-1 ring-ivory/10 backdrop-blur sm:p-10">
            <h3 className="text-2xl">Estimate your monthly earnings</h3>
            <div className="mt-8 space-y-8">
              <Slider id="earn-items" dark label="Outfits you'd list" value={items} min={1} max={30} onChange={setItems} />
              <Slider id="earn-rentals" dark label="Rentals per outfit / month" value={rentals} min={1} max={8} onChange={setRentals} />
              <Slider id="earn-price" dark label="Average rental price" value={price} min={200} max={3000} step={50} onChange={setPrice} format={formatINR} />
            </div>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-ivory/10 pt-6">
              <div aria-live="polite">
                <p className="text-sm text-ivory/60">You could earn</p>
                <p className="font-display text-5xl text-gold">
                  {formatINR(monthly)}
                  <span className="font-sans text-base text-ivory/60"> /month</span>
                </p>
                <p className="mt-1 text-xs text-ivory/70">
                  {items} × {rentals} × {formatINR(price)}, what you earn at your own price. An estimate, not a promise
                </p>
              </div>
              <Button href="/list-your-clothes" variant="gold" size="lg">
                List your clothes <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
