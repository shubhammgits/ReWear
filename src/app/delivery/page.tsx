import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pickup & delivery policy",
  description: "How ReWear outfits reach you and come back.",
};

export default function DeliveryPage() {
  return (
    <LegalPage
      title="Pickup & delivery."
      intro={`How your outfit reaches you in ${site.city}, and how it comes back.`}
      updated="24 November 2026"
      sections={[
        {
          title: "Where we deliver",
          body: <p>We currently serve {site.city} only. We do not ship outfits to other cities.</p>,
        },
        {
          title: "Pickup",
          body: (
            <p>
              You can collect the outfit from us at no charge. After booking, we confirm the pickup address and time on WhatsApp. Please bring a photo
              ID the first time you rent.
            </p>
          ),
        },
        {
          title: "Local delivery",
          body: (
            <p>
              If you prefer, we arrange delivery and collection through a local courier app. You pay the courier&apos;s fee, which we tell you before
              it is booked. The outfit reaches you before the start time on your booking.
            </p>
          ),
        },
        {
          title: "Returning the outfit",
          body: (
            <>
              <p>Return the outfit by the end time on your booking, in the garment bag it came in. Please do not wash or iron it; we clean every piece.</p>
              <p>Late returns are charged at the rental&apos;s hourly or daily rate, because another renter may be waiting for it.</p>
            </>
          ),
        },
        {
          title: "Handover checks",
          body: (
            <p>
              We record a short video of the outfit at handover and at return, so its condition is clear to both sides. You are welcome to record
              your own.
            </p>
          ),
        },
      ]}
    />
  );
}
