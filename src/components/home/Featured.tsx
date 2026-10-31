"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Item } from "@/lib/types";
import { allItems } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickView } from "@/components/product/QuickView";
import { Button } from "@/components/ui/Button";
import { Eyebrow, RevealText } from "@/components/ui/Reveal";

export function Featured() {
  const [quick, setQuick] = useState<Item | null>(null);
  const items = allItems().filter((i) => i.featured);

  return (
    <section className="py-28 sm:py-36" aria-labelledby="featured-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Trending this week</Eyebrow>
            <RevealText id="featured-title" text="Closets worth borrowing." className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]" />
          </div>
          <Button href="/browse" variant="secondary">
            Browse all 20 looks <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard item={item} onQuickView={setQuick} />
            </motion.div>
          ))}
        </div>
      </div>
      <QuickView item={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
