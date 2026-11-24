import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { displayPhone, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach ReWear on WhatsApp or email.",
};

export default function ContactPage() {
  const rows = [
    displayPhone() && { icon: MessageCircle, label: "WhatsApp & phone", value: displayPhone(), href: whatsappLink("Hi ReWear!") },
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: "Address", value: site.address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to a real person." intro="Questions about a rental, a refund or lending your clothes? We usually reply within an hour, 10am to 8pm." />
      <div className="mx-auto max-w-3xl px-6 pb-28">
        <dl className="grid gap-4">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-4 rounded-[var(--radius-card)] bg-sand/60 p-6">
              <r.icon className="mt-1 h-6 w-6 shrink-0 text-plum" strokeWidth={1.5} aria-hidden />
              <div>
                <dt className="text-sm text-muted">{r.label}</dt>
                <dd className="mt-1 text-lg">
                  {r.href ? (
                    <a href={r.href} className="underline-offset-2 hover:text-plum hover:underline" target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {r.value}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{r.value}</span>
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-muted">ReWear is run by {site.legalName}.</p>
      </div>
    </>
  );
}
