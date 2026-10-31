"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** Splits text into words that rise out of a mask, staggered. */
export function RevealText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
  id,
}: {
  id?: string;
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  /** Animate on mount instead of when scrolled into view */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[Tag];

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } };
  // Transform-only (no opacity) so the headline still counts for LCP while animating
  const word: Variants = {
    hidden: { y: reduce ? 0 : "110%" },
    show: { y: 0, transition: { duration: 0.9, ease } },
  };

  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } };

  return (
    <MotionTag id={id} className={className} initial="hidden" {...trigger} variants={container} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** Generic fade-up on scroll. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, className, light }: { children: React.ReactNode; className?: string; light?: boolean }) {
  return (
    <p
      className={cn(
        "mb-5 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]",
        light ? "text-gold" : "text-plum",
        className
      )}
    >
      <span className={cn("h-px w-8", light ? "bg-gold" : "bg-plum")} aria-hidden />
      {children}
    </p>
  );
}
