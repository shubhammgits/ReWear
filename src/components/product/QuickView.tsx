"use client";

import Image from "next/image";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import type { Item } from "@/lib/types";
import { lenderById } from "@/lib/api";
import { formatINR, img } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function QuickView({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const lender = item ? lenderById(item.lenderId) : undefined;
  return (
    <Modal open={!!item} onClose={onClose} label={item ? `Quick view: ${item.name}` : "Quick view"}>
      {item && (
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[460px]">
            <Image src={img(item.images[0], 900)} alt={item.imageAlt} fill sizes="(min-width: 640px) 384px, 100vw" className="object-cover sm:rounded-l-[2rem]" />
          </div>
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">
                {item.category} · {item.type}
              </p>
              <h2 className="mt-2 text-3xl leading-tight">{item.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" aria-hidden /> {item.rating} ({item.reviewsCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden /> {item.city}
                </span>
                <span>Size {item.size}</span>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-ink/80">{item.description}</p>
            <ul className="grid grid-cols-3 gap-2 text-center">
              {[
                ["4 hrs", item.pricing.per4h],
                ["1 day", item.pricing.perDay],
                ["3 days", item.pricing.per3Days],
              ].map(([k, v]) => (
                <li key={k} className="rounded-2xl bg-sand px-2 py-3">
                  <span className="block font-display text-lg">{formatINR(v as number)}</span>
                  <span className="text-xs text-muted">{k}</span>
                </li>
              ))}
            </ul>
            {lender && (
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <ShieldCheck className="h-4 w-4 text-plum" aria-hidden /> Lent by {lender.name}
                {lender.verified && " · Verified"}
              </p>
            )}
            <div className="mt-auto">
              <Button href={`/item/${item.id}`} className="w-full">
                See dates & rent <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
