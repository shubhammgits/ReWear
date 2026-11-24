import { PageHeader } from "./PageHeader";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

/** Shared layout for the policy pages: a header, then numbered sections in a readable column. */
export function LegalPage({ title, intro, updated, sections }: { title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHeader eyebrow="Policies" title={title} intro={intro} />
      <div className="mx-auto max-w-3xl px-6 pb-28">
        <p className="text-sm text-muted">Last updated {updated}</p>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="text-2xl">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/80 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
