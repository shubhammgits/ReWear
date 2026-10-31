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

export default function Home() {
  return (
    <>
      <Hero />
      <ClosetStory />
      <HowItWorks />
      <Occasions />
      <Featured />
      <PriceCalculator />
      <EarnSection />
      <Trust />
      <Impact />
      <FAQ />
      <FinalCTA />
    </>
  );
}
