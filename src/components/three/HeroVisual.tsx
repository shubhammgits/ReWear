"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, Suspense, useEffect, useState } from "react";
import { img, isLowEndDevice } from "@/lib/utils";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <Collage /> });

/** If WebGL or a texture fails, fall back silently to the static collage. */
class SceneBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Collage() {
  const shots = [
    { id: "photo-1583391733956-3750e0ff4e8b", cls: "left-[6%] top-[14%] w-[38%] -rotate-6", alt: "Blush lehenga on a model" },
    { id: "photo-1539008835657-9e8e9680c956", cls: "left-[34%] top-[4%] w-[36%] rotate-2 z-10", alt: "Scarlet satin dress" },
    { id: "photo-1617137968427-85924c800a22", cls: "right-[4%] top-[22%] w-[34%] rotate-6", alt: "Tailored tuxedo" },
  ];
  return (
    <div className="absolute inset-0">
      {shots.map((s, i) => (
        <div
          key={s.id}
          className={`absolute aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-lift ring-4 ring-ivory ${s.cls}`}
          style={{ animation: `float ${6 + i}s ease-in-out ${i * 0.6}s infinite alternate` }}
        >
          <Image src={img(s.id, 600)} alt={s.alt} fill priority={i === 1} sizes="(min-width: 1024px) 18vw, 36vw" className="object-cover" />
        </div>
      ))}
      <style>{`@keyframes float { to { transform: translateY(-14px) } }`}</style>
    </div>
  );
}

/**
 * Shows the static collage first (fast LCP), then swaps in WebGL once the
 * browser is idle — but never on low-end devices or with reduced motion.
 */
export function HeroVisual() {
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    if (isLowEndDevice()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => setUse3D(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative h-full w-full">
      {use3D ? (
        <SceneBoundary fallback={<Collage />}>
          <Suspense fallback={<Collage />}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      ) : (
        <Collage />
      )}
    </div>
  );
}
