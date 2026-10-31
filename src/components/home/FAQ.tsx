"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { content } from "@/lib/api";
import { Eyebrow, RevealText } from "@/components/ui/Reveal";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-28 sm:py-36" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow>Questions</Eyebrow>
          <RevealText id="faq-title" text="Good questions, straight answers." className="text-[clamp(2.4rem,5vw,4rem)] leading-[1]" />
          <p className="mt-6 max-w-sm text-ink/70">
            Still curious? Our closet concierges reply on WhatsApp in under 10 minutes, 9am–11pm.
          </p>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {content.faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <h3 className="font-sans">
                  <button
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium transition-colors hover:text-plum sm:text-xl"
                  >
                    {f.q}
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${isOpen ? "bg-plum text-ivory" : "bg-sand"}`}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 leading-relaxed text-ink/70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
