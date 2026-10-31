"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { allItems } from "@/lib/api";
import { quote } from "@/lib/pricing";
import type { DurationUnit } from "@/lib/types";
import { cn, img } from "@/lib/utils";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Eyebrow, RevealText } from "@/components/ui/Reveal";
import { PriceBreakdown } from "@/components/product/PriceBreakdown";

const picks = ["rw-001", "rw-002", "rw-003", "rw-006"];

export function PriceCalculator() {
  const options = allItems().filter((i) => picks.includes(i.id));
  const [itemId, setItemId] = useState(options[0].id);
  const [unit, setUnit] = useState<DurationUnit>("hours");
  const [amount, setAmount] = useState(6);
  const item = options.find((o) => o.id === itemId)!;
  const q = quote(item.pricing, amount, unit, item.cleaningFee, item.deposit);

  const switchUnit = (u: DurationUnit) => {
    setUnit(u);
    setAmount(u === "hours" ? 6 : 2);
  };

  return (
    <section className="bg-blush/40 py-28 sm:py-36" aria-labelledby="calc-title">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <Eyebrow>Honest pricing</Eyebrow>
          <RevealText id="calc-title" text="Know the price before you fall in love." className="text-[clamp(2.4rem,5vw,4.2rem)] leading-[1]" />
          <p className="mt-6 max-w-md text-lg text-ink/70">
            Slide to your plans. Rent only the hours you need. No hidden fees, ever: cleaning is included and your deposit comes back.
          </p>
          <fieldset className="mt-10">
            <legend className="mb-3 text-sm font-medium text-ink/70">Try it with</legend>
            <div className="flex flex-wrap gap-3">
              {options.map((o) => (
                <label
                  key={o.id}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium ring-1 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-plum",
                    o.id === itemId ? "bg-ink text-ivory ring-ink" : "bg-ivory ring-ink/10 hover:ring-ink/30"
                  )}
                >
                  <input type="radio" name="calc-item" value={o.id} checked={o.id === itemId} onChange={() => setItemId(o.id)} className="sr-only" />
                  <span className="relative h-9 w-9 overflow-hidden rounded-full">
                    <Image src={img(o.images[0], 100)} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  {o.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <motion.div
          layout
          className="rounded-[2rem] bg-ivory p-6 shadow-lift ring-1 ring-ink/5 sm:p-10"
        >
          <div role="radiogroup" aria-label="Duration unit" className="inline-flex rounded-full bg-sand p-1">
            {(["hours", "days"] as DurationUnit[]).map((u) => (
              <button
                key={u}
                role="radio"
                aria-checked={unit === u}
                onClick={() => switchUnit(u)}
                className={cn("relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors", unit === u ? "text-ivory" : "text-ink/70")}
              >
                {unit === u && <motion.span layoutId="calc-unit" className="absolute inset-0 -z-0 rounded-full bg-plum" />}
                <span className="relative">By {u}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <Slider
              id="calc-duration"
              label="How long do you need it?"
              value={amount}
              min={unit === "hours" ? 4 : 1}
              max={unit === "hours" ? 24 : 7}
              step={unit === "hours" ? 2 : 1}
              onChange={setAmount}
              format={(v) => (unit === "hours" ? `${v} hrs` : `${v} ${v === 1 ? "day" : "days"}`)}
            />
            <p className="mt-2 text-xs text-muted">
              {unit === "hours" ? "Minimum 4 hours. Extra hours are 40% cheaper." : "3+ days unlock bundle pricing."}
            </p>
          </div>

          <div className="mt-8">
            <PriceBreakdown q={q} />
          </div>

          <Button href={`/item/${item.id}`} className="mt-8 w-full" size="lg">
            Book {item.name.split(" ").slice(-1)[0].toLowerCase()} for {q.label}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
