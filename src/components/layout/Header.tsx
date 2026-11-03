"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useLenis } from "@/components/providers/SmoothScroll";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/list-your-clothes", label: "Lend & earn" },
  { href: "/dashboard", label: "Dashboard" },
];

// Pages that already have their own bottom bar, or where "Rent an outfit" is the page itself
const noMobileCTA = ["/browse", "/item", "/list-your-clothes"];

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center font-display text-2xl font-semibold tracking-tight", className)}
      aria-label="ReWear home"
    >
      Re<span className="italic text-plum">Wear</span>
      <span className="text-gold">.</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setPastHero(y > 480);
    setHidden(y > prev && y > 320 && !open);
  });

  useEffect(() => setOpen(false), [pathname]);

  // Full-screen menu: lock the page behind it, close on Escape, move focus in and back out
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    lenis?.stop();
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      root.classList.remove("menu-open");
      lenis?.start();
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open, lenis]);

  const showCTA = pastHero && !open && !noMobileCTA.some((p) => pathname.startsWith(p));

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
        className="fixed inset-x-0 top-0 z-50 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-5 transition-all duration-500",
            scrolled && !open ? "bg-ivory/80 shadow-soft ring-1 ring-ink/5 backdrop-blur-xl" : "bg-transparent"
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
                    "relative inline-flex h-11 items-center rounded-full px-4 text-sm font-medium transition-colors hover:text-plum",
                    active ? "text-plum" : "text-ink/75"
                  )}
                >
                  {l.label}
                  {active && <motion.span layoutId="nav-dot" className="absolute inset-x-4 bottom-1.5 h-px bg-plum" />}
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
            ref={toggleRef}
            className="relative z-10 grid h-11 w-11 place-items-center rounded-full md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu: a full-screen sheet under the header bar */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            // Transform, not clip-path: an animated clip-path stuck fully clipped in WebKit
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-ivory px-6 pt-[calc(6rem+env(safe-area-inset-top))] md:hidden"
          >
            <nav aria-label="Mobile" className="flex-1">
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-line"
                  >
                    <Link
                      href={l.href}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className="flex min-h-16 items-center justify-between py-3 font-display text-[clamp(2rem,9vw,2.75rem)] leading-none"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                      <ArrowRight className="h-5 w-5 text-plum" aria-hidden />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pb-safe sticky bottom-0 grid gap-3 bg-ivory pt-6"
            >
              <Button href="/browse" size="lg" className="w-full" magnetic={false}>
                Rent an outfit <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/list-your-clothes" variant="secondary" size="lg" className="w-full" magnetic={false}>
                Earn from your wardrobe
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky mobile CTA: appears after the hero, hides while the menu is open */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pb-safe fixed inset-x-0 bottom-0 z-40 px-4 pt-3 md:hidden"
          >
            <Link
              href="/browse"
              className="flex h-14 items-center justify-between rounded-full bg-plum pl-6 pr-2 text-ivory shadow-lift"
            >
              <span className="font-medium">Rent an outfit</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ivory/15">
                <ArrowRight className="h-5 w-5" aria-hidden />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
