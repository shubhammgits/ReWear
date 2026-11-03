"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { img } from "@/lib/utils";

const clothes = [
  { id: "photo-1583391733956-3750e0ff4e8b", alt: "Lehenga", rot: -10 },
  { id: "photo-1539008835657-9e8e9680c956", alt: "Red dress", rot: 8 },
  { id: "photo-1617137968427-85924c800a22", alt: "Tuxedo", rot: 6 },
  { id: "photo-1610030469983-98e550d6193c", alt: "Silk saree", rot: -7 },
  { id: "photo-1520975954732-35dd22299614", alt: "Suede jacket", rot: -4 },
  { id: "photo-1509631179647-0177331693ae", alt: "Black dress", rot: 5 },
];

/**
 * Closet scene: the doors swing open and the clothes fly out to new owners.
 * Layout is three grid rows (headline / closet stage / paragraph) so the photos can only
 * move inside the stage row and never cover copy. Desktop pins and scrubs; smaller screens
 * scrub the same story as the section scrolls into view, without pinning.
 */
export function ClosetStory() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const arch = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".cs-item");

      // Offsets from the closet centre, measured from the stage row so they adapt to any size
      const hanging = (i: number) => ({ x: (i - 2.5) * 12, y: -(arch.current?.offsetHeight ?? 0) * 0.14, rotate: 0, scale: 0.72 });
      const target = (i: number) => {
        const W = stage.current!.clientWidth;
        const H = stage.current!.clientHeight;
        const aw = arch.current!.offsetWidth;
        const ah = arch.current!.offsetHeight;
        const cw = items[i].offsetWidth;
        const ch = items[i].offsetHeight;
        const gutter = (W - aw) / 2;
        const maxY = Math.max(0, (H - ch) / 2 - 20);

        // Wide screens: three photos per side, settled in the gutters beside the closet
        if (gutter >= cw * 1.15 + 24) {
          const side = i % 2 ? 1 : -1;
          const row = Math.floor(i / 2);
          const reach = [0.45, 0.72, 0.38][row];
          return {
            x: side * Math.min(aw / 2 + gutter * reach, W / 2 - cw / 2 - 12),
            y: [-0.85, 0.05, 0.9][row] * maxY,
            rotate: clothes[i].rot,
            scale: 1,
          };
        }
        // Narrow screens: the clothes fan out like a hand of cards across the open closet
        const k = i - 2.5;
        return {
          x: k * Math.min(cw * 0.62, (W - cw - 16) / 5),
          y: Math.min(ah * 0.16, maxY) + Math.abs(k) * 6,
          rotate: k * 7,
          scale: 1,
        };
      };

      const mm = gsap.matchMedia();
      mm.add(
        // The callback only runs while at least one condition matches, so mobile needs its own key
        { isDesktop: "(min-width: 1024px)", isMobile: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { isDesktop, reduce } = ctx.conditions as { isDesktop: boolean; reduce: boolean };

          if (reduce) {
            // No motion: show the finished scene
            gsap.set(".cs-doors", { autoAlpha: 0 });
            gsap.set(".cs-glow", { opacity: 1 });
            items.forEach((el, i) => gsap.set(el, target(i)));
            return;
          }

          items.forEach((el, i) => gsap.set(el, hanging(i)));
          const tl = gsap.timeline({
            scrollTrigger: isDesktop
              ? { trigger: root.current, start: "top top", end: "+=160%", scrub: 0.8, pin: true, invalidateOnRefresh: true }
              : { trigger: root.current, start: "top 80%", end: "top 8%", scrub: 0.6, invalidateOnRefresh: true },
          });

          tl.from(".cs-line-1 .cs-w", { yPercent: 110, stagger: 0.05, duration: 0.4 })
            .to(".cs-door-l", { rotateY: -105, duration: 0.9, ease: "power2.inOut" }, 0.3)
            .to(".cs-door-r", { rotateY: 105, duration: 0.9, ease: "power2.inOut" }, 0.3)
            .to(".cs-doors", { autoAlpha: 0, duration: 0.25 }, 1)
            .to(".cs-glow", { opacity: 1, duration: 0.6 }, 0.6);

          items.forEach((el, i) => {
            tl.to(el, { x: () => target(i).x, y: () => target(i).y, rotate: () => target(i).rotate, scale: 1, duration: 1.1, ease: "power3.out" }, 0.95 + i * 0.08);
          });

          tl.to(".cs-line-1", { opacity: 0.35, duration: 0.3 }, 1.6)
            .from(".cs-line-2 .cs-w", { yPercent: 110, stagger: 0.05, duration: 0.4 }, 1.7)
            .to({}, { duration: 0.3 });
        }
      );
      return () => mm.revert();
    },
    { scope: root }
  );

  const split = (text: string) =>
    text.split(" ").map((w, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span className="cs-w inline-block">{w}&nbsp;</span>
      </span>
    ));

  return (
    <section
      id="idea"
      ref={root}
      className="relative grid min-h-[100svh] grid-rows-[auto_minmax(18rem,1fr)_auto] gap-6 overflow-hidden bg-sand/60 px-6 pb-[clamp(2rem,7svh,4rem)] pt-[clamp(5.5rem,13svh,7.5rem)]"
      aria-labelledby="idea-title"
    >
      <h2 id="idea-title" className="sr-only">
        Your wardrobe sits idle. Someone else needs it tonight.
      </h2>

      {/* Headline row */}
      <div aria-hidden className="pointer-events-none relative z-20 mx-auto max-w-4xl text-center">
        <p className="cs-line-1 font-display text-[clamp(2rem,5vw,4.2rem)] leading-tight">{split("Your wardrobe sits idle.")}</p>
        <p className="cs-line-2 font-display text-[clamp(2rem,5vw,4.2rem)] italic leading-tight text-plum">{split("Someone else needs it tonight.")}</p>
      </div>

      {/* Stage row: the photos only ever move inside this box */}
      <div ref={stage} className="relative z-10 flex min-h-0 items-center justify-center">
        <div ref={arch} className="relative h-full max-h-[30rem] w-[min(70vw,22rem)] [perspective:1400px]">
          {/* Closet interior: warm plum with a gold rail and hangers */}
          <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gradient-to-b from-plum to-plum-deep shadow-lift ring-8 ring-ivory/70">
            <div className="cs-glow absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgb(201_162_75/0.5),transparent_62%)] opacity-40" />
            <div className="absolute inset-x-[14%] top-[22%] h-1 rounded-full bg-gold/80" />
            <div className="absolute inset-x-[22%] top-[22%] flex justify-between" aria-hidden>
              {[0, 1, 2, 3, 4].map((h) => (
                <span key={h} className="mt-1 h-5 w-px bg-gold/50" />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent" />
          </div>

          {clothes.map((c, i) => (
            <div
              key={c.id}
              className="cs-item absolute left-1/2 top-1/2 aspect-[3/4] w-[clamp(5.5rem,12vw,10rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-lift ring-4 ring-ivory"
              style={{ zIndex: 10 + i }}
            >
              <Image src={img(c.id, 400)} alt={c.alt} fill sizes="(min-width: 1024px) 160px, 100px" className="object-cover" />
            </div>
          ))}

          <div className="cs-doors absolute inset-0 z-30 flex [transform-style:preserve-3d]">
            <div className="cs-door-l relative h-full w-1/2 origin-left rounded-l-3xl rounded-tl-[999px] bg-plum shadow-lift [backface-visibility:hidden]">
              <span className="absolute right-4 top-1/2 h-12 w-1.5 rounded-full bg-gold" />
            </div>
            <div className="cs-door-r relative h-full w-1/2 origin-right rounded-r-3xl rounded-tr-[999px] bg-plum-deep shadow-lift [backface-visibility:hidden]">
              <span className="absolute left-4 top-1/2 h-12 w-1.5 rounded-full bg-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Paragraph row */}
      <p className="relative z-20 mx-auto max-w-md text-center text-ink/70">
        The average Indian closet holds 30+ outfits worn fewer than three times. ReWear puts them back where they belong: out.
      </p>
    </section>
  );
}
