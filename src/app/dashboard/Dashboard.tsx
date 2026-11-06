"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, IndianRupee, Plus, Shirt, TrendingUp, Wallet } from "lucide-react";
import { dashboard, itemById } from "@/lib/api";
import { cn, formatINR, img } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";

type Tab = "rentals" | "earnings";

const statusStyle: Record<string, string> = {
  upcoming: "bg-gold/20 text-ink",
  active: "bg-plum text-ivory",
  completed: "bg-sand text-ink/70",
  Rented: "bg-plum text-ivory",
  Available: "bg-gold/20 text-ink",
  Cleaning: "bg-blush text-plum-deep",
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("rentals");
  const { user, rentals, earnings } = dashboard;
  const max = Math.max(...earnings.monthly.map((m) => m.amount));
  const total = earnings.monthly.reduce((s, m) => s + m.amount, 0);
  const thisMonth = earnings.monthly[earnings.monthly.length - 1].amount;
  const lastMonth = earnings.monthly[earnings.monthly.length - 2].amount;
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-32 sm:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-plum">Dashboard</p>
          <h1 className="mt-3 text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98]">
            Hey {user.name}, <span className="italic text-plum">looking good.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-ivory py-2 pl-2 pr-5 shadow-soft ring-1 ring-ink/5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/20">
            <Wallet className="h-5 w-5 text-plum" aria-hidden />
          </span>
          <span>
            <span className="block text-xs text-muted">ReWear wallet</span>
            <span className="font-semibold">{formatINR(user.wallet)}</span>
          </span>
        </div>
      </div>

      <div role="tablist" aria-label="Dashboard sections" className="mt-10 inline-flex rounded-full bg-sand p-1.5">
        {(["rentals", "earnings"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={cn("relative rounded-full px-6 py-3 text-sm font-semibold", tab === t ? "text-ivory" : "text-ink/70 hover:text-ink")}
          >
            {tab === t && <motion.span layoutId="dash-tab" className="absolute inset-0 rounded-full bg-plum" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative">{t === "rentals" ? "My rentals" : "My earnings"}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "rentals" ? (
          <motion.section
            key="rentals"
            id="panel-rentals"
            role="tabpanel"
            aria-labelledby="tab-rentals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-10"
          >
            <ul className="grid gap-4">
              {rentals.map((r, i) => {
                const item = itemById(r.itemId);
                if (!item) return null;
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-ivory p-4 shadow-soft ring-1 ring-ink/5 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex items-center gap-4 sm:flex-1">
                      <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl">
                        <Image src={img(item.images[0], 200)} alt={item.imageAlt} fill sizes="80px" className="object-cover" />
                      </span>
                      <div>
                        <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize", statusStyle[r.status])}>{r.status}</span>
                        <h2 className="mt-2 font-display text-xl">{item.name}</h2>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                          <CalendarClock className="h-4 w-4" aria-hidden /> {fmt(r.start)} → {fmt(r.end)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <span className="text-right">
                        <span className="block text-xs text-muted">Booking {r.id.toUpperCase()}</span>
                        <span className="font-display text-2xl">{formatINR(r.total)}</span>
                      </span>
                      <Link
                        href={`/item/${item.id}`}
                        className="inline-flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold ring-1 ring-ink/15 transition hover:bg-ink hover:text-ivory"
                      >
                        {r.status === "completed" ? "Rent again" : "Details"} <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-10 rounded-[2rem] bg-blush/50 p-8 text-center">
              <p className="font-display text-2xl">Wedding season is coming.</p>
              <p className="mt-2 text-ink/70">Book early: the best lehengas go 3 weeks ahead.</p>
              <div className="mt-6">
                <Button href="/browse?occasion=Wedding">Browse wedding edits</Button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="earnings"
            id="panel-earnings"
            role="tabpanel"
            aria-labelledby="tab-earnings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-10 space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: IndianRupee, label: "Earned this month", value: thisMonth, note: `+${growth}% vs last month` },
                { icon: TrendingUp, label: "Last 6 months", value: total, note: `${earnings.listings.reduce((s, l) => s + l.rentals, 0)} rentals` },
                {
                  icon: Wallet,
                  label: "Pending payout",
                  value: earnings.pendingPayout,
                  note: `Lands ${new Date(earnings.nextPayoutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
                },
              ].map((s) => (
                <div key={s.label} className="rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-ink/5">
                  <s.icon className="h-6 w-6 text-gold" aria-hidden />
                  <p className="mt-4 text-sm text-muted">{s.label}</p>
                  <p className="mt-1 font-display text-4xl text-plum">
                    <Counter value={s.value} prefix="₹" duration={1.2} />
                  </p>
                  <p className="mt-1 text-sm text-ink/70">{s.note}</p>
                </div>
              ))}
            </div>

            <div className="surface-dark rounded-[2rem] bg-ink p-6 text-ivory sm:p-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl">Monthly Earnings</h2>
                <p className="text-sm text-ivory/60">After ReWear&apos;s 15% fee</p>
              </div>
              <div className="mt-10 flex h-56 items-end gap-3 sm:gap-6" role="img" aria-label={`Earnings bar chart: ${earnings.monthly.map((m) => `${m.month} ${formatINR(m.amount)}`).join(", ")}`}>
                {earnings.monthly.map((m, i) => (
                  <div key={m.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs text-ivory/0 transition group-hover:text-gold">{formatINR(m.amount)}</span>
                    <motion.div
                      className={cn("w-full rounded-t-xl", i === earnings.monthly.length - 1 ? "bg-gold" : "bg-ivory/25 group-hover:bg-ivory/40")}
                      initial={{ height: 0 }}
                      animate={{ height: `${(m.amount / max) * 100}%` }}
                      transition={{ duration: 0.9, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <span className="text-xs text-ivory/60">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-ivory p-6 shadow-soft ring-1 ring-ink/5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl">Your listings</h2>
                <Button href="/list-your-clothes" magnetic={false}>
                  <Plus className="h-4 w-4" aria-hidden /> List another
                </Button>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="pb-3 font-semibold">Outfit</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Rentals</th>
                      <th className="pb-3 text-right font-semibold">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {earnings.listings.map((l) => {
                      const item = itemById(l.itemId);
                      if (!item) return null;
                      return (
                        <tr key={l.itemId}>
                          <td className="py-3">
                            <Link href={`/item/${item.id}`} className="flex items-center gap-3 hover:text-plum">
                              <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg">
                                <Image src={img(item.images[0], 100)} alt="" fill sizes="40px" className="object-cover" />
                              </span>
                              <span className="font-medium">{item.name}</span>
                            </Link>
                          </td>
                          <td>
                            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusStyle[l.status])}>{l.status}</span>
                          </td>
                          <td className="text-right">
                            <span className="inline-flex items-center gap-1">
                              <Shirt className="h-3.5 w-3.5 text-muted" aria-hidden /> {l.rentals}
                            </span>
                          </td>
                          <td className="text-right font-semibold">{formatINR(l.earned)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
