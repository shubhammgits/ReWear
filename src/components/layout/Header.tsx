"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/list-your-clothes", label: "Lend & earn" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("font-display text-2xl font-semibold tracking-tight", className)} aria-label="ReWear home">
      Re<span className="italic text-plum">Wear</span>
      <span className="text-gold">.</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > prev && y > 320 && !open);
  });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[90] -translate-y-20 rounded-full bg-plum px-4 py-2 text-sm text-ivory transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6"
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-5 transition-all duration-500",
            scrolled || open ? "bg-ivory/80 shadow-soft ring-1 ring-ink/5 backdrop-blur-xl" : "bg-transparent"
          )}
        >
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-plum",
                    active ? "text-plum" : "text-ink/75"
                  )}
                >
                  {l.label}
                  {active && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-px bg-plum" />}
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:block">
            <Button href="/browse" magnetic>
              Rent an outfit
            </Button>
          </div>
          <button
            className="grid h-11 w-11 place-items-center rounded-full md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto mt-2 max-w-7xl rounded-[1.75rem] bg-ivory/95 p-4 shadow-lift ring-1 ring-ink/5 backdrop-blur-xl md:hidden"
            >
              {links.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={l.href} className="block rounded-2xl px-4 py-3 font-display text-2xl hover:bg-sand" onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 px-1">
                <Button href="/browse" className="w-full" magnetic={false}>
                  Rent
                </Button>
                <Button href="/list-your-clothes" variant="secondary" className="w-full" magnetic={false}>
                  Lend
                </Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
