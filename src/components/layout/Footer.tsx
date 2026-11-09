"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "./Header";

const columns = [
  {
    title: "Rent",
    links: [
      ["Browse all", "/browse"],
      ["Wedding wear", "/browse?occasion=Wedding"],
      ["Party looks", "/browse?occasion=Party"],
      ["Interview ready", "/browse?occasion=Interview"],
    ],
  },
  {
    title: "Lend",
    links: [
      ["List your clothes", "/list-your-clothes"],
      ["Earnings dashboard", "/dashboard"],
      ["How payouts work", "/#faq"],
    ],
  },
  {
    title: "ReWear",
    links: [
      ["How it works", "/#how-it-works"],
      ["Trust & safety", "/#trust"],
      ["Our impact", "/#impact"],
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    setState("done");
    setEmail("");
  };

  return (
    <footer className="surface-dark relative overflow-hidden bg-ink text-ivory">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-10 pt-20 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo className="text-ivory [&_span:first-child]:text-blush" />
          <p className="mt-4 max-w-sm text-ivory/65">
            India&apos;s friendliest closet-sharing community. Wear more, own less, and let your wardrobe pay its own rent.
          </p>
          <form onSubmit={submit} className="mt-8 max-w-sm" noValidate>
            <label htmlFor="newsletter" className="text-sm font-medium text-ivory/90">
              Drops, deals & styling notes. Twice a month, never spam.
            </label>
            <div className="mt-3 flex rounded-full bg-ivory/10 p-1.5 ring-1 ring-ivory/15 focus-within:ring-gold">
              <input
                id="newsletter"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState("idle");
                }}
                placeholder="you@email.com"
                aria-invalid={state === "error"}
                aria-describedby="newsletter-msg"
                className="h-11 min-w-0 flex-1 bg-transparent px-4 text-base text-ivory placeholder:text-ivory/60 focus:outline-none"
              />
              <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-gold px-5 text-sm font-semibold text-ink transition hover:brightness-110">
                Join <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div id="newsletter-msg" aria-live="polite" className="mt-2 min-h-5 text-sm">
              <AnimatePresence mode="wait">
                {state === "error" && (
                  <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blush">
                    That email looks a little off. Mind checking it?
                  </motion.p>
                )}
                {state === "done" && (
                  <motion.p key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 text-gold">
                    <Check className="h-4 w-4" aria-hidden /> You&apos;re in. See you in your inbox.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">{c.title}</h2>
              <ul className="mt-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="inline-flex min-h-11 items-center text-ivory/70 transition hover:text-ivory">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[22vw] leading-[0.8] text-ivory/[0.04]">
        ReWear
      </p>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-ivory/10 px-6 pb-28 pt-6 text-xs md:pb-6 text-ivory/60 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} ReWear Technologies. Made with love (and lots of coffee) in India.</p>
        <p>Images via Unsplash · Demo build with mock data</p>
      </div>
    </footer>
  );
}
