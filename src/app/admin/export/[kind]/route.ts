import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdmin, supabaseService } from "@/lib/supabase/server";
import { statusLabel, type BookingRow } from "@/lib/bookings";
import { listPeople } from "../../renters/people";

export const dynamic = "force-dynamic";

type Cell = string | number | Date | null | undefined;
interface Sheet {
  name: string;
  columns: { header: string; width?: number; money?: boolean; date?: boolean }[];
  rows: Cell[][];
}

const d = (v: string | null | undefined) => (v ? new Date(v) : null);
const inr = (paise: number) => paise / 100;

async function bookingsSheet(): Promise<Sheet> {
  const { data } = await supabaseService()
    .from("bookings")
    .select("*, outfits(name, lenders(name)), profiles(full_name), payments(razorpay_payment_id, status, refunds(amount_paise, status))")
    .order("starts_at", { ascending: false });
  type Row = BookingRow & {
    outfits: { name: string; lenders: { name: string } | null } | null;
    profiles: { full_name: string | null } | null;
    payments: { razorpay_payment_id: string | null; status: string; refunds: { amount_paise: number; status: string }[] }[];
  };
  const emails = new Map((await listPeople()).map((p) => [p.id, p.email]));
  return {
    name: "Bookings",
    columns: [
      { header: "Booking", width: 11 },
      { header: "Status", width: 15 },
      { header: "Outfit", width: 26 },
      { header: "Lender", width: 16 },
      { header: "Renter", width: 18 },
      { header: "Email", width: 26 },
      { header: "Phone", width: 13 },
      { header: "Starts", width: 18, date: true },
      { header: "Ends", width: 18, date: true },
      { header: "Handover", width: 10 },
      { header: "Address", width: 30 },
      { header: "Rent", money: true },
      { header: "Service fee", money: true },
      { header: "Cleaning", money: true },
      { header: "Protection", money: true },
      { header: "Total", money: true },
      { header: "Refunded", money: true },
      { header: "Razorpay payment", width: 22 },
      { header: "Cancel reason", width: 30 },
      { header: "Booked at", width: 18, date: true },
    ],
    rows: ((data ?? []) as Row[]).map((b) => {
      const paid = b.payments.find((p) => p.razorpay_payment_id);
      const refunded = b.payments.flatMap((p) => p.refunds).filter((r) => r.status !== "failed").reduce((s, r) => s + r.amount_paise, 0);
      return [
        b.code,
        statusLabel[b.status],
        b.outfits?.name,
        b.outfits?.lenders?.name,
        b.profiles?.full_name,
        emails.get(b.renter_id),
        b.contact_phone,
        d(b.starts_at),
        d(b.ends_at),
        b.handover,
        b.address,
        b.rent,
        b.service_fee,
        b.cleaning_fee,
        b.protection_fee,
        b.total,
        inr(refunded),
        paid?.razorpay_payment_id,
        b.cancel_reason,
        d(b.created_at),
      ];
    }),
  };
}

async function rentersSheet(): Promise<Sheet> {
  const people = await listPeople();
  return {
    name: "Renters",
    columns: [
      { header: "Name", width: 20 },
      { header: "Email", width: 28 },
      { header: "Phone", width: 13 },
      { header: "Role", width: 9 },
      { header: "Blocked", width: 9 },
      { header: "Paid bookings" },
      { header: "Spent", money: true },
      { header: "Joined", width: 18, date: true },
      { header: "Last sign-in", width: 18, date: true },
    ],
    rows: people.map((p) => [p.name, p.email, p.phone, p.role, p.blocked ? "Yes" : "", p.bookings, p.spent, d(p.joined), d(p.lastSignIn)]),
  };
}

async function lendersSheet(): Promise<Sheet> {
  const db = supabaseService();
  const [{ data: lenders }, { data: payouts }] = await Promise.all([
    db.from("lenders").select("id, name, phone, upi_id, notes, created_at, outfits(count)").order("name"),
    db.from("payouts").select("lender_id, amount, status"),
  ]);
  const sum = (id: string, status: string) => (payouts ?? []).filter((p) => p.lender_id === id && p.status === status).reduce((s, p) => s + p.amount, 0);
  return {
    name: "Lenders",
    columns: [
      { header: "Name", width: 20 },
      { header: "Phone", width: 13 },
      { header: "UPI ID", width: 22 },
      { header: "Outfits" },
      { header: "Owed now", money: true },
      { header: "Paid so far", money: true },
      { header: "Notes", width: 30 },
      { header: "Added", width: 18, date: true },
    ],
    rows: (lenders ?? []).map((l) => [
      l.name,
      l.phone,
      l.upi_id,
      (l.outfits as unknown as { count: number }[])[0]?.count ?? 0,
      sum(l.id, "owed"),
      sum(l.id, "paid"),
      l.notes,
      d(l.created_at),
    ]),
  };
}

async function outfitsSheet(): Promise<Sheet> {
  const { data } = await supabaseService()
    .from("outfits")
    .select("slug, name, category, type, size, status, featured, price_4h, price_day, price_3days, cleaning_fee, created_at, lenders(name), bookings(status)")
    .order("created_at", { ascending: false });
  type Row = {
    slug: string;
    name: string;
    category: string;
    type: string;
    size: string;
    status: string;
    featured: boolean;
    price_4h: number;
    price_day: number;
    price_3days: number;
    cleaning_fee: number;
    created_at: string;
    lenders: { name: string } | null;
    bookings: { status: string }[];
  };
  return {
    name: "Outfits",
    columns: [
      { header: "Name", width: 26 },
      { header: "Lender", width: 16 },
      { header: "Category" },
      { header: "Type", width: 14 },
      { header: "Size" },
      { header: "Status" },
      { header: "Featured" },
      { header: "4 hours", money: true },
      { header: "1 day", money: true },
      { header: "3 days", money: true },
      { header: "Cleaning", money: true },
      { header: "Times rented" },
      { header: "Link", width: 30 },
      { header: "Added", width: 18, date: true },
    ],
    rows: ((data ?? []) as unknown as Row[]).map((o) => [
      o.name,
      o.lenders?.name,
      o.category,
      o.type,
      o.size,
      o.status,
      o.featured ? "Yes" : "",
      o.price_4h,
      o.price_day,
      o.price_3days,
      o.cleaning_fee,
      o.bookings.filter((b) => ["confirmed", "handed_over", "returned"].includes(b.status)).length,
      `/item/${o.slug}`,
      d(o.created_at),
    ]),
  };
}

async function payoutsSheet(): Promise<Sheet> {
  const { data } = await supabaseService()
    .from("payouts")
    .select("amount, status, paid_at, reference, created_at, lenders(name, upi_id), bookings(code, outfits(name))")
    .order("created_at", { ascending: false });
  type Row = {
    amount: number;
    status: string;
    paid_at: string | null;
    reference: string | null;
    created_at: string;
    lenders: { name: string; upi_id: string | null } | null;
    bookings: { code: string; outfits: { name: string } | null } | null;
  };
  return {
    name: "Payouts",
    columns: [
      { header: "Lender", width: 18 },
      { header: "UPI ID", width: 22 },
      { header: "Amount", money: true },
      { header: "Status" },
      { header: "Booking", width: 11 },
      { header: "Outfit", width: 26 },
      { header: "Paid on", width: 18, date: true },
      { header: "Reference", width: 20 },
      { header: "Created", width: 18, date: true },
    ],
    rows: ((data ?? []) as unknown as Row[]).map((p) => [
      p.lenders?.name,
      p.lenders?.upi_id,
      p.amount,
      p.status,
      p.bookings?.code,
      p.bookings?.outfits?.name,
      d(p.paid_at),
      p.reference,
      d(p.created_at),
    ]),
  };
}

const builders: Record<string, () => Promise<Sheet>> = {
  bookings: bookingsSheet,
  renters: rentersSheet,
  lenders: lendersSheet,
  outfits: outfitsSheet,
  payouts: payoutsSheet,
};

function addSheet(wb: ExcelJS.Workbook, s: Sheet) {
  const ws = wb.addWorksheet(s.name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = s.columns.map((c, i) => ({
    header: c.header,
    key: String(i),
    width: c.width ?? (c.money ? 11 : 10),
    // Excel shows dates in the viewer's time zone settings; values are written as Indian time below
    style: c.money ? { numFmt: '"₹"#,##0' } : c.date ? { numFmt: "dd mmm yyyy, hh:mm" } : {},
  }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFAF7F2" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B1D3F" } };
  // Excel has no time zones: shift UTC to Indian time so the sheet shows what people see on the site
  const IST = 330 * 60_000;
  for (const r of s.rows) ws.addRow(r.map((v) => (v instanceof Date ? new Date(v.getTime() + IST) : (v ?? ""))));
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columns.length } };
}

/** /admin/export/bookings (etc.) downloads one sheet; /admin/export/all downloads every sheet in one file */
export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  await requireAdmin();
  const { kind } = await params;
  const kinds = kind === "all" ? Object.keys(builders) : builders[kind] ? [kind] : [];
  if (!kinds.length) return NextResponse.json({ error: "Unknown export" }, { status: 404 });

  const wb = new ExcelJS.Workbook();
  wb.creator = "ReWear";
  for (const s of await Promise.all(kinds.map((k) => builders[k]()))) addSheet(wb, s);
  const buffer = await wb.xlsx.writeBuffer();
  const date = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rewear-${kind}-${date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
