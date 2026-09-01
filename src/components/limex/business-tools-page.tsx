import { LimitedCompanyCostCalculator, TaxCalculator, VatCalculator } from "./calculator-components";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ActionButton } from "./ui";

const toolLinks = [
  {
    number: "01",
    label: "Limited company",
    title: "Registration cost",
    description: "Capital, location and optional add-ons.",
    href: "#limited-company-calculator",
    tone: "border-[#ebc4c9] bg-[#fbeced] text-[#c74d63]",
  },
  {
    number: "02",
    label: "Personal income",
    title: "Tax calculator",
    description: "Income, investment and source tax.",
    href: "#tax-calculator",
    tone: "border-[#d9cff4] bg-[#f2edfb] text-[#594094]",
  },
  {
    number: "03",
    label: "Invoice totals",
    title: "VAT calculator",
    description: "Inclusive or exclusive VAT breakdowns.",
    href: "#vat-calculator",
    tone: "border-[#b9e1de] bg-[#e9f6f4] text-[#1f6e70]",
  },
] as const;

export function BusinessToolsPage() {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader />
        <div className={pageContentClass}>
          <div className="grid gap-section-gap-lg rounded-panel border border-[#e3ded4] bg-[#f9f8f5] px-page-gutter py-section-y sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end lg:px-10 lg:py-9">
            <div>
              <p className="text-overline text-pink">SMART TOOLS / BANGLADESH</p>
              <h1 className="mt-cluster max-w-[720px] font-brand text-page-title text-[#171a26]">Make the next business decision easier.</h1>
              <p className="mt-cluster max-w-[640px] text-body-sm text-[#6b7487]">Use practical estimates for company registration, personal income tax and VAT invoices before you take the next step.</p>
              <div className="mt-section-gap-lg flex flex-wrap gap-cluster-sm">
                <ActionButton href="#limited-company-calculator" className="min-h-button-lg rounded-control px-4 text-button">Start with company cost</ActionButton>
                <ActionButton href="/#contact" variant="light" className="min-h-button-lg rounded-control px-4 text-button">Talk to an expert</ActionButton>
              </div>
            </div>
            <aside className="rounded-card bg-[#173838] p-card-pad text-white sm:p-card-pad">
              <p className="text-overline text-[#c7e5e0]">ONE TOOLKIT</p>
              <h2 className="mt-cluster-sm font-brand text-subheading">Clear inputs. Useful outputs.</h2>
              <p className="mt-cluster-sm text-meta text-[#c7e5e0]">These are planning estimates. Final government charges and filing rules should be confirmed for your case.</p>
              <div className="mt-section-gap-lg flex flex-wrap gap-cluster-sm text-micro font-semibold text-[#173838]">
                <span className="rounded-pill bg-[#c7e5e0] px-2.5 py-1.5">Live summaries</span>
                <span className="rounded-pill bg-[#c7e5e0] px-2.5 py-1.5">Responsive forms</span>
                <span className="rounded-pill bg-[#c7e5e0] px-2.5 py-1.5">Bangladesh-focused</span>
              </div>
            </aside>
          </div>

          <nav aria-label="Business tool shortcuts" className="mt-cluster grid gap-cluster-sm sm:grid-cols-3">
            {toolLinks.map((tool) => (
              <a className={`group rounded-card border px-card-pad-sm py-cluster transition-transform duration-200 hover:-translate-y-0.5 ${tool.tone}`.trim()} href={tool.href} key={tool.href}>
                <span className="flex items-center justify-between gap-cluster"><span className="text-nav-compact font-bold">{tool.number}</span><span className="text-body transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span></span>
                <strong className="mt-cluster-sm block text-overline">{tool.label}</strong>
                <span className="mt-0.5 block text-body font-semibold text-[#171a26]">{tool.title}</span>
                <span className="mt-1 block text-micro text-[#6b7487]">{tool.description}</span>
              </a>
            ))}
          </nav>

          <div className="mt-cluster lg:mt-cluster-lg">
            <LimitedCompanyCostCalculator />
          </div>

          <div className="mt-cluster grid gap-cluster xl:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)]">
            <TaxCalculator />
            <VatCalculator />
          </div>

          <div className="mt-cluster flex flex-col gap-cluster-sm rounded-card border border-[#e3ded4] bg-white px-card-pad-sm py-card-pad-sm sm:flex-row sm:items-center sm:justify-between sm:px-card-pad">
            <div>
              <p className="text-overline text-pink">NEED A HAND?</p>
              <h2 className="mt-1 font-brand text-subheading text-[#171a26]">Bring your estimate to a Limex advisor.</h2>
              <p className="mt-1 text-meta text-[#6b7487]">We can check the assumptions and help you choose the right filing path.</p>
            </div>
            <ActionButton href="/#contact" variant="dark" className="w-max min-w-[165px] justify-center">Talk to an expert</ActionButton>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
