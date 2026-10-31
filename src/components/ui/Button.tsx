"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold";

const styles: Record<Variant, string> = {
  primary: "bg-plum text-ivory hover:bg-plum-deep shadow-soft",
  secondary: "bg-transparent text-ink ring-1 ring-inset ring-ink/20 hover:ring-ink/50 hover:bg-ink/[0.03]",
  ghost: "bg-ivory/10 text-ivory ring-1 ring-inset ring-ivory/30 hover:bg-ivory/20 backdrop-blur",
  gold: "bg-gold text-ink hover:brightness-105 shadow-soft",
};

interface Props {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  magnetic?: boolean;
  size?: "md" | "lg";
  ariaLabel?: string;
}

/** Pill button with an optional magnetic pull toward the pointer. */
export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  magnetic = true,
  size = "md",
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-[background-color,box-shadow,filter] duration-300 disabled:cursor-not-allowed disabled:opacity-50",
    size === "lg" ? "h-14 px-8 text-base" : "h-12 px-6 text-sm",
    styles[variant],
    className
  );

  const inner = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className="inline-block">
      {href ? (
        <Link href={href} className={cls} aria-label={ariaLabel}>
          {inner}
        </Link>
      ) : (
        <button type={type} onClick={onClick} className={cls} disabled={disabled} aria-label={ariaLabel}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
