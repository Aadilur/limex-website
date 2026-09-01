import { footerColumns } from "./data";
import { ActionButton, LogoLockup } from "./ui";

const footerHref: Record<string, string> = {
  "Startup & license": "/#packages",
  "VAT & tax": "/#packages",
  Trademark: "/services/trademark-registration",
  Compliance: "/#services",
  "About us": "/about",
  Blog: "/blog",
  Contact: "/#contact",
  "VAT calculator": "/business-tools#vat-calculator",
  "Income tax estimator": "/business-tools#tax-calculator",
  "Deed builder": "/business-tools",
};

export function SiteFooter() {
  return (
    <footer className="min-h-0 rounded-panel-mobile bg-navy px-page-gutter pb-section-y-lg pt-section-y-lg text-white lg:min-h-[440px] lg:rounded-panel lg:px-page-gutter-lg lg:pb-6" aria-label="Footer">
      <div className="flex flex-col items-start justify-between gap-section-gap lg:flex-row">
        <div>
          <LogoLockup light className="w-[178px] min-w-[178px]" />
          <p className="mt-cluster-sm text-footer text-soft-muted">Business, made clearer.</p>
        </div>
        <ActionButton href="/#contact" variant="white" arrow="none" className="mt-cluster-lg min-h-button-lg w-full max-w-[250px] justify-center text-body-sm lg:mt-px lg:w-[170px]">Talk to an expert</ActionButton>
      </div>
      <h2 className="mt-section-gap-xl max-w-[660px] font-brand text-section-title-mobile lg:mt-section-gap-lg lg:text-section-title">Make the next move with confidence.</h2>
      <div className="mt-section-gap-xl h-px bg-[#33384d]" />
      <div className="mt-section-y grid grid-cols-1 gap-y-section-gap-lg sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1.7fr] lg:gap-7">
        {footerColumns.map((column) => (
          <div className="flex flex-col gap-cluster-sm" key={column.title}>
            <h3 className="mb-cluster-sm text-micro font-bold uppercase tracking-eyebrow text-soft-muted">{column.title}</h3>
            {column.links.map((link) => <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href={footerHref[link] ?? "#top"} key={link}>{link}</a>)}
          </div>
        ))}
        <div className="flex flex-col gap-cluster-sm pl-0 lg:pl-5">
          <h3 className="mb-cluster-sm text-micro font-bold uppercase tracking-eyebrow text-soft-muted">CONTACT</h3>
          <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href="mailto:hello@yourbrand.com">hello@yourbrand.com</a>
          <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href="tel:+8801000000000">+880 1XXX XXXXXX</a>
          <span className="text-footer text-soft-muted">Dhaka, Bangladesh</span>
        </div>
      </div>
      <div className="mt-section-y-xl flex flex-col items-start justify-between gap-cluster-lg border-t border-[#33384d] pt-cluster-lg text-body-xs text-soft-muted lg:flex-row lg:items-center">
        <span>© 2026 Limex</span>
        <div className="flex gap-cluster-lg">
          <a className="transition-colors hover:text-white" href="/#top">Privacy</a>
          <a className="transition-colors hover:text-white" href="/#top">Terms</a>
        </div>
      </div>
    </footer>
  );
}
