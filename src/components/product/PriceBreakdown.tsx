"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Quote } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";

function Rolling({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {formatINR(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Live price breakdown shared by the home calculator and the item page. */
export function PriceBreakdown({ q }: { q: Quote }) {
  return (
    <div aria-live="polite">
      <dl className="space-y-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-ink/70">Rental ({q.label})</dt>
          <dd><Rolling value={q.rental} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/70">Professional cleaning</dt>
          <dd><Rolling value={q.cleaningFee} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/70">
            Security deposit <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-ink">refundable</span>
          </dt>
          <dd><Rolling value={q.deposit} /></dd>
        </div>
      </dl>
      <div className="mt-5 flex items-end justify-between border-t border-dashed border-line pt-5">
        <div>
          <p className="text-sm text-ink/70">Pay today</p>
          <p className="text-xs text-muted">You get {formatINR(q.deposit)} back after return</p>
        </div>
        <Rolling value={q.total} className="font-display text-4xl text-plum" />
      </div>
    </div>
  );
}
