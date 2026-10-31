import { Eyebrow, RevealText } from "./Reveal";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="mx-auto max-w-7xl px-6 pb-10 pt-32 sm:pt-40">
      <Eyebrow>{eyebrow}</Eyebrow>
      <RevealText as="h1" immediate text={title} className="max-w-4xl text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.98]" />
      {intro && <p className="mt-5 max-w-xl text-lg text-ink/70">{intro}</p>}
    </header>
  );
}
