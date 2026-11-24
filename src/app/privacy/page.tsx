import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal data ReWear collects and how it is used.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy."
      intro="We collect only what we need to run your rentals, and we never sell it."
      updated="24 November 2026"
      sections={[
        {
          title: "What we collect",
          body: (
            <ul>
              <li>Account details: your name, email address and, if you sign in with Google, your Google profile name and photo.</li>
              <li>Booking details: the outfits, dates and times you book, and your phone number and address for handover.</li>
              <li>Payment records: amounts, dates and the payment reference from Razorpay. We never receive your card number or UPI PIN.</li>
              <li>For lenders: outfit photos and details, and the bank or UPI details needed to pay you.</li>
            </ul>
          ),
        },
        {
          title: "How we use it",
          body: (
            <ul>
              <li>To confirm, deliver and collect your rentals, and to contact you about them.</li>
              <li>To process payments, refunds and lender payouts.</li>
              <li>To keep records required by law, such as tax records.</li>
            </ul>
          ),
        },
        {
          title: "Who we share it with",
          body: (
            <>
              <p>We share only what each service needs to do its job:</p>
              <ul>
                <li>Razorpay, to process payments and refunds;</li>
                <li>Supabase, which hosts our database and sign-in;</li>
                <li>a delivery provider, if you choose delivery (your name, phone number and address only).</li>
              </ul>
              <p>We do not sell or rent your personal data to anyone.</p>
            </>
          ),
        },
        {
          title: "How long we keep it",
          body: (
            <p>
              We keep booking and payment records for as long as Indian tax law requires. You can ask us to delete your account and other personal
              data at any time.
            </p>
          ),
        },
        {
          title: "Your choices",
          body: (
            <p>
              You can ask to see, correct or delete your personal data by emailing {site.email || "us"}. We reply within 30 days.
            </p>
          ),
        },
        {
          title: "Cookies",
          body: <p>We use only the cookies needed to keep you signed in and to make the site work. We do not use advertising cookies.</p>,
        },
      ]}
    />
  );
}
