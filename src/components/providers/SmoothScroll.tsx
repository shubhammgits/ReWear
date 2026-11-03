"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const first = useRef(true);

  // Trigger positions depend on final layout: re-measure once web fonts and late images have landed
  useEffect(() => {
    let cancelled = false;
    const refresh = () => !cancelled && ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    // Native scroll on touch (momentum, address-bar behaviour) and for reduced motion
    const touch = window.matchMedia("(pointer: coarse), (hover: none)").matches;
    if (prefersReducedMotion() || touch) return;

    const instance = new Lenis({ duration: 1.15, smoothWheel: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Reset scroll on route change, then let new pages measure their triggers
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);

  return (
    <LenisContext.Provider value={lenis}>
      {/* "user": with reduced motion, Framer drops transform/layout animation and keeps simple fades */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LenisContext.Provider>
  );
}
