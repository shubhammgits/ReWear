import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { Card, btn } from "../ui";

const files = [
  { kind: "all", title: "Everything", text: "All five sheets below in one Excel file. Good for a monthly backup." },
  { kind: "bookings", title: "Bookings", text: "Every paid, cancelled and unpaid booking with dates, renter contact, fees, refunds and Razorpay payment IDs." },
  { kind: "renters", title: "Renters", text: "Everyone who signed up: name, email, phone, bookings and total spent." },
  { kind: "lenders", title: "Lenders", text: "Lenders with UPI IDs, number of outfits, what you owe them and what you've paid." },
  { kind: "outfits", title: "Outfits", text: "Every outfit with prices, status and how many times it was rented." },
  { kind: "payouts", title: "Payouts", text: "Lender payouts, owed and paid, with UPI references. Useful for your accounts." },
];

export default async function ExportPage() {
  await requireAdmin();
  return (
    <>
      <h2 className="text-2xl">Download data</h2>
      <p className="mt-1 text-sm text-muted">Excel files (.xlsx) that open in Excel, Google Sheets or Numbers. They contain customer details: keep them private.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {files.map((f) => (
          <li key={f.kind}>
            <Card className="flex h-full flex-col justify-between gap-4">
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-ink/70">{f.text}</p>
              </div>
              <a href={`/admin/export/${f.kind}`} download className={`${f.kind === "all" ? btn.primary : btn.secondary} self-start`}>
                <Download className="h-4 w-4" aria-hidden /> Download
              </a>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
