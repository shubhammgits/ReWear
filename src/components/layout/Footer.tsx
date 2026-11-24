"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
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

const policies = [
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
  ["Cancellation & refunds", "/refunds"],
  ["Pickup & delivery", "/delivery"],
  ["Contact", "/contact"],
];

export function Footer() {
  return (
    <footer className="surface-dark relative overflow-hidden bg-ink text-ivory">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-10 pt-20 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo className="text-ivory [&_span:first-child]:text-blush" />
          <p className="mt-4 max-w-sm text-ivory/65">
            Occasion wear on rent in {site.city}. Wear more, own less, and let your wardrobe pay its own rent.
          </p>
          <div className="mt-8 max-w-sm">
            <p className="text-sm font-medium text-ivory/90">New outfits and weekend availability, straight to WhatsApp.</p>
            <a
              href={whatsappLink("Hi ReWear! Please send me your new outfit drops.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-11 items-center gap-1 rounded-full bg-gold px-5 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Get drops on WhatsApp <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
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
        <p>© {new Date().getFullYear()} ReWear. Made with love (and lots of coffee) in India.</p>
        <nav aria-label="Policies" className="flex flex-wrap gap-x-4">
          {policies.map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center transition hover:text-ivory sm:min-h-0">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
