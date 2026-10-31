import type { Metadata } from "next";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your rentals and lender earnings on ReWear.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
