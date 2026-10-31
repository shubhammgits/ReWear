"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, useTransform } from "framer-motion";
import { Eye, MapPin, Star } from "lucide-react";
import type { Item } from "@/lib/types";
import { formatINR, img } from "@/lib/utils";

export function ProductCard({
  item,
  onQuickView,
  priority = false,
}: {
  item: Item;
  onQuickView?: (item: Item) => void;
  priority?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const glare = useTransform(px, (g) => `radial-gradient(circle at ${g * 100}% 20%, rgba(255,255,255,0.28), transparent 55%)`);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group relative"
    >
      <Link href={`/item/${item.id}`} className="block rounded-[var(--radius-card)]" data-cursor="View">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-sand shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
          <Image
            src={img(item.images[0], 800)}
            alt={item.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="rounded-full bg-ivory/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">
              Size {item.size}
            </span>
            <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
              {item.category}
            </span>
          </div>
        </div>

        <div className="mt-4 px-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg leading-snug text-ink">{item.name}</h3>
            <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
              {item.rating.toFixed(1)}
              <span className="sr-only"> out of 5 from {item.reviewsCount} reviews</span>
            </span>
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {item.city}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-1.5 text-center text-xs">
            {[
              ["4 hrs", item.pricing.per4h],
              ["day", item.pricing.perDay],
              ["3 days", item.pricing.per3Days],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-sand/70 px-1 py-2">
                <dd className="font-semibold text-ink">{formatINR(v as number)}</dd>
                <dt className="text-muted">/ {k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Link>

      {onQuickView && (
        <button
          type="button"
          onClick={() => onQuickView(item)}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3 py-1.5 text-xs font-semibold text-plum opacity-100 shadow-soft backdrop-blur transition-all duration-300 hover:bg-plum hover:text-ivory md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          aria-label={`Quick view ${item.name}`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden /> Quick view
        </button>
      )}
    </motion.article>
  );
}
