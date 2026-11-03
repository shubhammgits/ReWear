"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { content } from "@/lib/api";
import { gsap, useGSAP } from "@/lib/gsap";
import { img } from "@/lib/utils";
import { Eyebrow, RevealText } from "@/components/ui/Reveal";

/** Desktop: vertical scroll drives a pinned horizontal track with inner-image parallax. Mobile: native swipe. */
export function Occasions() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth + 48;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".occ-img").forEach((image) => {
          gsap.fromTo(
            image,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: "none",
              scrollTrigger: { trigger: image.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-plum py-24 text-ivory lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0" aria-labelledby="occ-title">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Eyebrow light>Shop by occasion</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealText id="occ-title" text="Whatever tonight is, dress for it." className="max-w-2xl text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]" />
          <p className="max-w-xs text-ivory/70">Six moments, hundreds of looks. Scroll sideways through the season&apos;s most-booked edits.</p>
        </div>
      </div>

      <div
        ref={track}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overscroll-x-contain px-6 lg:mt-14 lg:gap-5 lg:w-max lg:snap-none lg:overflow-visible lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {content.occasions.map((o, i) => (
          <Link
            key={o.name}
            href={`/browse?occasion=${encodeURIComponent(o.name)}`}
            data-cursor="Explore"
            className="group relative aspect-[3/4] w-[78vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-[2rem] sm:w-[42vw] lg:aspect-auto lg:h-[56svh] lg:w-[30vw] lg:max-w-[420px]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={img(o.image, 900)}
                alt={o.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 72vw"
                className="occ-img scale-[1.3] object-cover transition-[filter] duration-700 group-hover:brightness-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            <span className="absolute left-5 top-5 font-display text-sm text-ivory/80">0{i + 1}</span>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-3xl sm:text-4xl">{o.name}</h3>
                <p className="mt-1 text-sm text-ivory/75">{o.tagline}</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ivory text-plum transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
