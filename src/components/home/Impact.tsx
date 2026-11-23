"use client";

import { Eyebrow, RevealText } from "@/components/ui/Reveal";

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-24 bg-sand/70 py-28 sm:py-36" aria-labelledby="impact-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <Eyebrow>Our impact</Eyebrow>
            <RevealText id="impact-title" text="Every rental is a garment not made." className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]" />
          </div>
          <p className="max-w-md text-lg text-ink/70 lg:justify-self-end">
            Most occasion outfits are worn once or twice, then live in a cupboard. Renting gives each one many more nights out, and nobody pays
            full price for a single evening.
          </p>
        </div>
      </div>
    </section>
  );
}
