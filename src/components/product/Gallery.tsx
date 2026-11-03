"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, ZoomIn } from "lucide-react";
import { cn, img } from "@/lib/utils";

const ItemViewer3D = dynamic(() => import("@/components/three/ItemViewer3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Warming up the 3D fitting room…</div>,
});

/** Thumbnails + hover lens zoom (desktop) and an optional lazy 3D view. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [mode3D, setMode3D] = useState(false);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 lg:flex-row lg:items-start">
      <div className="no-scrollbar flex min-w-0 shrink-0 gap-3 overflow-x-auto lg:flex-col" role="tablist" aria-label="Product images">
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

      <div className="relative aspect-[3/4] w-full min-w-0 overflow-hidden rounded-[2rem] bg-sand shadow-soft lg:flex-1">
        {mode3D ? (
          <ItemViewer3D image={img(images[active], 900)} />
        ) : (
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
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-200 ease-out"
                  style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
              </motion.div>
            </AnimatePresence>
            <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
