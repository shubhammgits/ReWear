"use client";

import { CreditCard, Ruler, Shield, Sparkles } from "lucide-react";
import { Eyebrow, FadeIn, RevealText } from "@/components/ui/Reveal";

const pillars = [
  { icon: Ruler, title: "Fit, confirmed", text: "Every piece is measured. We send you the exact measurements on WhatsApp before you pay anything." },
  { icon: Shield, title: "Refundable deposit", text: "Checked on return and refunded by UPI. We only deduct for real damage, at the repair cost, with videos as proof." },
  { icon: Sparkles, title: "Professionally cleaned", text: "Every outfit is dry-cleaned between rentals. The cleaning fee is shown upfront, never a surprise." },
  { icon: CreditCard, title: "Clear payments", text: "Pay by UPI only after we confirm the outfit, dates and total in writing on WhatsApp." },
];

export function Trust() {
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
      </div>
    </section>
  );
}
