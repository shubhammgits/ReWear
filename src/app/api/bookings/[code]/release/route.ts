import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

/** Frees the dates straight away when someone closes the payment window without paying */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  await supabaseService().from("bookings").update({ status: "expired" }).eq("code", code).eq("renter_id", user.id).eq("status", "pending_payment");
  return NextResponse.json({ ok: true });
}
