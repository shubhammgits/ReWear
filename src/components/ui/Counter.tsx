"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/utils";

/**
 * Counts up to `value` once it scrolls into view; re-tweens when value changes.
 * The server HTML (and any no-JS / failed-hydration render) shows the final value; the client
 * only rewinds to 0 for counters still below the fold, so nothing visibly jumps.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const current = useRef(value);

  // On mount, rewind off-screen counters so they can count up when reached
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) {
      current.current = 0;
      setDisplay(0);
    }
    // Mount-only: later value changes tween from the current number
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        current.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${formatNumber(value)}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {formatNumber(display)}
        {suffix}
      </span>
    </span>
  );
}
