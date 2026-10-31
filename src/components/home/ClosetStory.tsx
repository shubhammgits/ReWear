"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { img } from "@/lib/utils";

const clothes = [
  { id: "photo-1583391733956-3750e0ff4e8b", alt: "Lehenga", to: [-0.36, -0.26, -14] },
  { id: "photo-1539008835657-9e8e9680c956", alt: "Red dress", to: [0.34, -0.3, 10] },
  { id: "photo-1617137968427-85924c800a22", alt: "Tuxedo", to: [-0.4, 0.2, 8] },
  { id: "photo-1610030469983-98e550d6193c", alt: "Silk saree", to: [0.38, 0.18, -9] },
  { id: "photo-1520975954732-35dd22299614", alt: "Suede jacket", to: [-0.16, 0.34, -5] },
  { id: "photo-1509631179647-0177331693ae", alt: "Black dress", to: [0.17, 0.36, 7] },
] as const;

/** Pinned scene: closet doors swing open on scroll and the clothes fly out to new owners. */
export function ClosetStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", scrub: 0.8, pin: true },
        });
        tl.from(".cs-line-1 span", { yPercent: 110, stagger: 0.05, duration: 0.4 })
          .to(".cs-door-l", { rotateY: -112, duration: 1, ease: "power2.inOut" }, 0.3)
          .to(".cs-door-r", { rotateY: 112, duration: 1, ease: "power2.inOut" }, 0.3)
          .to(".cs-glow", { opacity: 1, duration: 0.6 }, 0.6);

        gsap.utils.toArray<HTMLElement>(".cs-item").forEach((el, i) => {
          const [fx, fy, rot] = clothes[i].to;
          tl.to(
            el,
            {
              x: () => window.innerWidth * fx,
              y: () => window.innerHeight * fy,
              rotate: rot,
              scale: 1,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
            },
            1 + i * 0.08
          );
        });

        tl.to(".cs-line-1", { opacity: 0.25, duration: 0.3 }, 1.6)
          .from(".cs-line-2 span", { yPercent: 110, stagger: 0.05, duration: 0.4 }, 1.7)
          .to({}, { duration: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const split = (text: string) =>
    text.split(" ").map((w, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span className="inline-block">{w}&nbsp;</span>
      </span>
    ));

  return (
    <section id="idea" ref={root} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-sand/60" aria-labelledby="idea-title">
      <h2 id="idea-title" className="sr-only">
        Your wardrobe sits idle. Someone else needs it tonight.
      </h2>

      {/* Copy */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[9vh] z-20 px-6 text-center">
        <p className="cs-line-1 font-display text-[clamp(2rem,5vw,4.2rem)] leading-tight">{split("Your wardrobe sits idle.")}</p>
        <p className="cs-line-2 font-display text-[clamp(2rem,5vw,4.2rem)] italic leading-tight text-plum">{split("Someone else needs it tonight.")}</p>
      </div>

      {/* Closet */}
      <div className="relative mt-24 h-[46vh] w-[min(78vw,380px)] [perspective:1400px]">
        <div className="absolute inset-0 rounded-t-[999px] rounded-b-3xl bg-ink shadow-lift">
          <div className="cs-glow absolute inset-3 rounded-t-[999px] rounded-b-2xl bg-gradient-to-b from-gold/40 via-plum/40 to-ink opacity-0" />
          <div className="absolute inset-x-8 top-[22%] h-1 rounded-full bg-gold/80" />
        </div>

        {clothes.map((c, i) => (
          <div
            key={c.id}
            className="cs-item absolute left-1/2 top-[24%] z-10 -ml-[min(15vw,70px)] aspect-[3/4] w-[min(30vw,140px)] origin-top scale-[0.7] overflow-hidden rounded-2xl shadow-lift ring-4 ring-ivory motion-reduce:hidden"
            style={{ transform: `translateX(${(i - 2.5) * 10}px) scale(0.7)`, zIndex: 10 + i }}
          >
            <Image src={img(c.id, 400)} alt={c.alt} fill sizes="140px" className="object-cover" />
          </div>
        ))}

        <div className="absolute inset-0 z-30 flex [transform-style:preserve-3d] motion-reduce:hidden">
          <div className="cs-door-l relative h-full w-1/2 origin-left rounded-l-3xl rounded-tl-[999px] bg-plum shadow-lift [backface-visibility:hidden]">
            <span className="absolute right-4 top-1/2 h-12 w-1.5 rounded-full bg-gold" />
          </div>
          <div className="cs-door-r relative h-full w-1/2 origin-right rounded-r-3xl rounded-tr-[999px] bg-plum-deep shadow-lift [backface-visibility:hidden]">
            <span className="absolute left-4 top-1/2 h-12 w-1.5 rounded-full bg-gold" />
          </div>
        </div>
      </div>

      <p className="absolute bottom-[7vh] max-w-md px-6 text-center text-ink/70">
        The average Indian closet holds 30+ outfits worn fewer than three times. ReWear puts them back where they belong: out.
      </p>
    </section>
  );
}
