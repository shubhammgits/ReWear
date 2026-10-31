import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListingForm } from "./ListingForm";

export const metadata: Metadata = {
  title: "List your clothes",
  description: "List your occasion wear on ReWear in four quick steps and start earning.",
};

export default function ListPage() {
  return (
    <>
      <PageHeader eyebrow="Lend & earn" title="Give your wardrobe a second life." intro="Four quick steps. About five minutes. Then your clothes start paying you back." />
      <ListingForm />
    </>
  );
}
