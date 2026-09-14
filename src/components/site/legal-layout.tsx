import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";

export function LegalLayout({
  eyebrow,
  title,
  updatedOn,
  children,
}: {
  eyebrow: string;
  title: string;
  updatedOn: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        <div className="mx-auto max-w-[720px]">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="section-title mt-5">{title}</h1>
          <p className="mt-3 text-[11.5px] text-ink-faint">
            Dernière mise à jour : {updatedOn}
          </p>

          <div className="mt-10 space-y-8">{children}</div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-2.5 space-y-2.5 text-[12.5px] leading-[1.7] text-ink-soft">
        {children}
      </div>
    </section>
  );
}
