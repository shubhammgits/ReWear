import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { PROTECTION_FEE, SERVICE_FEE_RATE } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for renting and lending outfits on ReWear.",
};

const fee = `${Math.round(SERVICE_FEE_RATE * 100)}%`;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use."
      intro="The rules for renting and lending on ReWear, in plain words."
      updated="24 November 2026"
      sections={[
        {
          title: "Who we are",
          body: (
            <p>
              ReWear is run by {site.legalName}, based in {site.city}, India. By using this website or booking an outfit, you agree to these terms. You
              must be 18 or older to rent or lend.
            </p>
          ),
        },
        {
          title: "What ReWear does",
          body: (
            <p>
              ReWear lists occasion wear owned by ReWear or by individual lenders, and lets you rent it for a set time. We take payment, arrange
              handover and return, and clean every outfit between rentals. Outfits remain the property of their owners.
            </p>
          ),
        },
        {
          title: "Prices and payment",
          body: (
            <>
              <p>Before you pay, the booking page shows every charge:</p>
              <ul>
                <li>the rent, set by the outfit&apos;s owner;</li>
                <li>a ReWear service fee of {fee} of the rent;</li>
                <li>a cleaning fee;</li>
                <li>a damage protection fee of ₹{PROTECTION_FEE}.</li>
              </ul>
              <p>
                Payments are processed securely by Razorpay. We never see or store your card details. A booking is confirmed only after the payment
                succeeds.
              </p>
            </>
          ),
        },
        {
          title: "Your responsibilities as a renter",
          body: (
            <ul>
              <li>Use the outfit with reasonable care and return it on time, in the bag it came in.</li>
              <li>Do not wash, iron, alter or lend the outfit to anyone else.</li>
              <li>Tell us straight away if anything is damaged or lost.</li>
            </ul>
          ),
        },
        {
          title: "Damage and loss",
          body: (
            <>
              <p>The damage protection fee covers minor wear such as small stains, loose threads and missing buttons. You do not pay extra for these.</p>
              <p>
                For serious damage, such as tears, burns or permanent stains, you pay the reasonable repair cost. If an outfit is lost or cannot be
                repaired, you pay its listed value. We share the handover and return videos and the repair estimate before charging anything.
              </p>
            </>
          ),
        },
        {
          title: "Late returns",
          body: <p>Late returns are charged at the outfit&apos;s hourly or daily rate until it is returned.</p>,
        },
        {
          title: "Cancellations and refunds",
          body: (
            <p>
              Cancellations and refunds follow our{" "}
              <Link href="/refunds" className="text-plum underline underline-offset-2">
                Cancellation &amp; refund policy
              </Link>
              .
            </p>
          ),
        },
        {
          title: "Lending your outfits",
          body: (
            <p>
              Lenders keep 100% of the rent they set. ReWear may decline any outfit, and may remove a listing that no longer meets our quality
              standards. Lenders are paid after the outfit is returned and checked. Payout timing and how damage is handled are agreed in writing
              with each lender.
            </p>
          ),
        },
        {
          title: "Our liability",
          body: (
            <p>
              We describe every outfit as accurately as we can, but sizes and colours can look different in person. If something goes wrong with a
              booking, our liability is limited to the amount you paid for that booking.
            </p>
          ),
        },
        {
          title: "Changes and disputes",
          body: (
            <p>
              We may update these terms; the date at the top shows the latest version. These terms are governed by the laws of India, and any
              dispute is subject to the courts of {site.city}.
            </p>
          ),
        },
      ]}
    />
  );
}
