import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";
import { BrowseClient, BrowseFromURL } from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse rentals",
  description: "Filter occasion wear by occasion, size, city, price and rental duration.",
};

export const revalidate = 60;

export default async function BrowsePage() {
  const items = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Browse" title="Find the one for tonight." intro={`Hand-picked occasion wear in ${site.city}. Pick your dates and book online.`} />
      {/* The static HTML carries the unfiltered grid (so its first photos preload and paint early);
          the client then swaps in the same component seeded from the URL's filters */}
      <Suspense fallback={<BrowseClient items={items} initial={{}} />}>
        <BrowseFromURL items={items} />
      </Suspense>
    </>
  );
}
