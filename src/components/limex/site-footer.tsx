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
    <footer className="min-h-0 rounded-panel-mobile bg-navy px-page-gutter pb-page-gutter pt-section-y text-white lg:min-h-[440px] lg:rounded-panel lg:px-page-gutter-lg lg:pb-6 lg:pt-section-y-lg" aria-label="Footer">
      <div className="flex flex-col items-start justify-between gap-section-gap lg:flex-row">
        <div>
          <LogoLockup light className="w-[178px] min-w-[178px]" />
          <p className="mt-cluster-sm text-footer text-soft-muted">Business, made clearer.</p>
        </div>
        <ActionButton href="/#contact" variant="white" arrow="none" className="mt-0 min-h-button-lg w-[170px] justify-center text-body-sm lg:mt-px">Talk to an expert</ActionButton>
      </div>
      <h2 className="mt-section-gap-lg max-w-[660px] font-brand text-section-title lg:mt-section-gap-lg">Make the next move with confidence.</h2>
      <div className="mt-section-gap-lg h-px bg-[#33384d]" />
      <div className="mt-section-y grid grid-cols-2 gap-x-5 gap-y-section-gap lg:grid-cols-[1fr_1fr_1.4fr_1.7fr] lg:gap-7">
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
      <div className="mt-section-y-xl flex flex-col items-start justify-between gap-5 border-t border-[#33384d] pt-5 text-micro text-soft-muted lg:flex-row lg:items-center">
        <span>© 2026 Limex</span>
        <div className="flex gap-6">
          <a className="transition-colors hover:text-white" href="/#top">Privacy</a>
          <a className="transition-colors hover:text-white" href="/#top">Terms</a>
        </div>
      </div>
    </footer>
  );
}
