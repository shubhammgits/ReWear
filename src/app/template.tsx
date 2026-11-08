"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The curtain only plays on client-side navigations. On the first (server-rendered)
// load it would cover the page until hydration finishes, hurting perceived speed and LCP.
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const play = hasNavigated && !reduce;

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <>
      {play && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] origin-top bg-plum"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      {/* No transform on the page wrapper — it would break GSAP pinning (position: fixed) */}
      {children}
    </>
  );
}
