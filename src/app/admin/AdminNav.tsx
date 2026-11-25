"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Today" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/outfits", label: "Outfits" },
  { href: "/admin/lenders", label: "Lenders" },
  { href: "/admin/renters", label: "Renters" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/export", label: "Download data" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 mb-8 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        {tabs.map((t) => {
          const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium ring-1",
                  active ? "bg-ink text-ivory ring-ink" : "ring-ink/15 hover:ring-ink/40"
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
