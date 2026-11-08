import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BrowseClient, BrowseFromURL } from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse rentals",
  description: "Filter occasion wear by occasion, size, city, price and rental duration.",
};

export default function BrowsePage() {
  return (
    <>
      <PageHeader eyebrow="Browse" title="Find the one for tonight." intro="20 hand picked looks from verified closets across India. Filter, sort, fall in love." />
      {/* The static HTML carries the unfiltered grid (so its first photos preload and paint early);
          the client then swaps in the same component seeded from the URL's filters */}
      <Suspense fallback={<BrowseClient initial={{}} />}>
        <BrowseFromURL />
      </Suspense>
    </>
  );
}
