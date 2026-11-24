import { Hero } from "@/components/home/Hero";
import { ClosetStory } from "@/components/home/ClosetStory";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Occasions } from "@/components/home/Occasions";
import { Featured } from "@/components/home/Featured";
import { PriceCalculator } from "@/components/home/PriceCalculator";
import { EarnSection } from "@/components/home/EarnSection";
import { Trust } from "@/components/home/Trust";
import { Impact } from "@/components/home/Impact";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 60;

export default async function Home() {
  const items = await getCatalog();
  return (
    <>
      <Hero />
      <ClosetStory />
      <HowItWorks />
      <Occasions />
      <Featured items={items} />
      <PriceCalculator items={items} />
      <EarnSection />
      <Trust />
      <Impact />
      <FAQ />
      <FinalCTA />
    </>
  );
}
