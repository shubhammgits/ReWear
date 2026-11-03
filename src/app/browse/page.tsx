import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BrowseClient } from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse rentals",
  description: "Filter occasion wear by occasion, size, city, price and rental duration.",
};

export default function BrowsePage() {
  return (
    <>
      <PageHeader eyebrow="Browse" title="Find the one for tonight." intro="20 hand-picked looks from verified closets across India. Filter, sort, fall in love." />
      <Suspense fallback={<div className="mx-auto h-[60svh] max-w-7xl px-6" />}>
        <BrowseClient />
      </Suspense>
    </>
  );
}
