"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Images, ZoomIn } from "lucide-react";
import { cn, img } from "@/lib/utils";

const ItemViewer3D = dynamic(() => import("@/components/three/ItemViewer3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Warming up the 3D fitting room…</div>,
});

/**
 * Phones: swipeable snap strip with dots. Desktop: thumbnails + hover lens zoom.
 * Both offer a lazy 3D view. The `sizes` hints make each layout fetch only what it shows.
 */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [mode3D, setMode3D] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  // Only one of the two layouts is visible; mount the WebGL viewer in that one only
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onSwipe = () => {
    const el = strip.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i: number) => {
    const el = strip.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const viewer3D = (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-sand shadow-soft">
      <ItemViewer3D image={img(images[active], 900)} />
    </div>
  );

  return (
    <div className="min-w-0">
      {/* Phones and tablets */}
      <div className="lg:hidden">
        {mode3D && !isDesktop ? (
          viewer3D
        ) : (
          <div
            ref={strip}
            onScroll={onSwipe}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[2rem] bg-sand shadow-soft"
            aria-label="Product images, swipe to see more"
            role="region"
          >
            {images.map((src, i) => (
              <div key={src} className="relative aspect-[3/4] w-full shrink-0 snap-center">
                <Image
                  src={img(src, 1000)}
                  alt={i === 0 ? alt : `${alt}, photo ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 1px, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex" role="tablist" aria-label="Choose image">
            {images.map((src, i) => (
              <button
                key={src}
                role="tab"
                aria-selected={!mode3D && active === i}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => {
                  setMode3D(false);
                  setActive(i);
                  requestAnimationFrame(() => goTo(i));
                }}
                className="grid h-11 w-11 place-items-center"
              >
                <span className={cn("h-2 rounded-full transition-all duration-300", !mode3D && active === i ? "w-6 bg-plum" : "w-2 bg-ink/25")} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setMode3D((m) => !m)}
            aria-pressed={mode3D}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sand px-4 text-sm font-semibold text-plum"
          >
            {mode3D ? <Images className="h-4 w-4" aria-hidden /> : <Box className="h-4 w-4" aria-hidden />}
            {mode3D ? "Photos" : "View in 3D"}
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden min-w-0 gap-4 lg:flex lg:items-start">
        <div className="flex shrink-0 flex-col gap-3" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={!mode3D && active === i}
              aria-label={`Image ${i + 1}`}
              onClick={() => {
                setActive(i);
                setMode3D(false);
              }}
              className={cn(
                "relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
                !mode3D && active === i ? "ring-plum" : "ring-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img(src, 200)} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
          <button
            role="tab"
            aria-selected={mode3D}
            onClick={() => setMode3D(true)}
            className={cn(
              "grid aspect-[3/4] w-20 shrink-0 place-items-center rounded-2xl bg-sand text-xs font-semibold ring-2 transition",
              mode3D ? "text-plum ring-plum" : "text-ink/70 ring-transparent hover:text-plum"
            )}
          >
            <span className="flex flex-col items-center gap-1">
              <Box className="h-5 w-5" aria-hidden /> 3D
            </span>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {mode3D && isDesktop ? (
            viewer3D
          ) : (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-sand shadow-soft">
              <div
                className="relative h-full w-full cursor-zoom-in"
                onPointerMove={onMove}
                onPointerLeave={() => setZoom(null)}
                data-cursor="Zoom"
              >
                <AnimatePresence mode="wait">
                  <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <Image
                      src={img(images[active], 1400)}
                      alt={alt}
                      fill
                      priority={active === 0}
                      sizes="(min-width: 1024px) 45vw, 1px"
                      className="object-cover transition-transform duration-200 ease-out"
                      style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                    />
                  </motion.div>
                </AnimatePresence>
                <span className="pointer-events-none absolute bottom-4 left-4 hidden items-center pointer-fine:inline-flex gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
