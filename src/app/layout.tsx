import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ReWear — Wear more. Own less.", template: "%s · ReWear" },
  description:
    "Rent occasion wear by the hour or day from people near you — or list your own clothes and earn. Lehengas, sarees, suits, party dresses and more.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: { title: "ReWear — Wear more. Own less.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  // Lets the page use the full iPhone screen; bars pad themselves with env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* Without JS the scroll reveals never run: show their end state instead of hidden text */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important}[style*="translateY("],[style*="translateX("]{transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <CustomCursor />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
