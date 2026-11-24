import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-28 sm:px-6 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">Admin</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
