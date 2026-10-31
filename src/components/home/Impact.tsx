"use client";

import { Droplets, Leaf, Repeat, Users } from "lucide-react";
import { content } from "@/lib/api";
import { Counter } from "@/components/ui/Counter";
import { Eyebrow, FadeIn, RevealText } from "@/components/ui/Reveal";

const icons = [Repeat, Droplets, Leaf, Users];

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
            A single new lehenga takes around 3,000 litres of water to produce. Sharing one ten times? That&apos;s a lot of rivers left alone.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-line lg:grid-cols-4">
          {content.stats.map((s, i) => {
            const Icon = icons[i];
            return (
              <FadeIn key={s.label} delay={i * 0.08} className="bg-ivory p-6 sm:p-10">
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} aria-hidden />
                <p className="mt-6 font-display text-[clamp(2rem,4vw,3.4rem)] leading-none text-plum">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm text-ink/70">{s.label}</p>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
