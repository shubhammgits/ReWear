import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { PROTECTION_FEE, SERVICE_FEE_RATE } from "@/lib/pricing";
import { displayPhone, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation & refund policy",
  description: "When you can cancel a ReWear rental and how refunds work.",
};

const fee = `${Math.round(SERVICE_FEE_RATE * 100)}%`;

export default function RefundsPage() {
  return (
    <LegalPage
      title="Cancellation & refunds."
      intro="Plans change. Here is exactly what you get back, and when."
      updated="24 November 2026"
      sections={[
        {
          title: "Cancelling a rental",
          body: (
            <>
              <p>The time is counted from the pickup or delivery time on your booking.</p>
              <ul>
                <li>72 hours or more before pickup: full refund of the rent and the cleaning fee.</li>
                <li>Between 72 and 24 hours before pickup: 50% of the rent and the full cleaning fee.</li>
                <li>Less than 24 hours before pickup, or not collecting the outfit: no refund of the rent. The cleaning fee is refunded.</li>
              </ul>
              <p>
                The ReWear service fee ({fee} of the rent) and the damage protection fee (₹{PROTECTION_FEE}) are not refunded, because they cover payment
                processing and the work of holding the outfit for you.
              </p>
            </>
          ),
        },
        {
          title: "If we or the lender cancel",
          body: (
            <p>
              If we cancel your booking for any reason, for example because the outfit was damaged by a previous renter, you get a full refund of
              everything you paid, including all fees.
            </p>
          ),
        },
        {
          title: "If the outfit is not as described",
          body: (
            <p>
              Check the outfit when you collect it. If it is damaged, unclean, or clearly different from its listing, tell us before you take it and we
              will offer another outfit or a full refund.
            </p>
          ),
        },
        {
          title: "How refunds are paid",
          body: (
            <p>
              Refunds go back to the original payment method (UPI, card or netbanking). We start the refund within 2 working days of the
              cancellation. Your bank usually shows it within 5–7 working days after that.
            </p>
          ),
        },
        {
          title: "How to cancel",
          body: (
            <p>
              Cancel from My bookings on the website, or message us on WhatsApp{displayPhone() ? ` at ${displayPhone()}` : ""}
              {site.email ? ` or email ${site.email}` : ""} with your booking number.
            </p>
          ),
        },
      ]}
    />
  );
}
