import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="font-display text-[8rem] leading-none text-plum/20">404</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">This look has left the closet.</h1>
      <p className="mt-4 text-ink/70">The page you&apos;re after was rented out, returned, or never existed. Plenty more where it came from.</p>
      <div className="mt-8">
        <Button href="/browse">Browse outfits</Button>
      </div>
    </section>
  );
}
