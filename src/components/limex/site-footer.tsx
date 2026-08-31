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
  "VAT calculator": "/#tools",
  "Income tax estimator": "/#tools",
  "Deed builder": "/#tools",
};

export function SiteFooter() {
  return (
    <footer className="min-h-0 rounded-[20px] bg-navy px-5 pb-5 pt-7 text-white lg:min-h-[440px] lg:rounded-[28px] lg:px-[42px] lg:pb-6 lg:pt-[34px]" aria-label="Footer">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <div>
          <LogoLockup light className="w-[178px] min-w-[178px]" />
          <p className="mt-1.5 text-[12px] leading-4 text-soft-muted">Business, made clearer.</p>
        </div>
        <ActionButton href="/#contact" variant="white" arrow="none" className="mt-0 min-h-[52px] w-[170px] justify-center text-[14px] lg:mt-px">Talk to an expert</ActionButton>
      </div>
      <h2 className="mt-[30px] max-w-[660px] text-[28px] font-bold leading-[34px] tracking-[-0.55px] lg:mt-[35px] lg:text-[31px] lg:leading-[38px]">Make the next move with confidence.</h2>
      <div className="mt-[30px] h-px bg-[#33384d]" />
      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-[26px] lg:grid-cols-[1fr_1fr_1.4fr_1.7fr] lg:gap-7">
        {footerColumns.map((column) => (
          <div className="flex flex-col gap-[11px]" key={column.title}>
            <h3 className="mb-1.5 text-[10px] font-bold leading-[13px] tracking-[1.2px] text-soft-muted">{column.title}</h3>
            {column.links.map((link) => <a className="text-[12px] font-[550] leading-4 text-white transition-colors hover:text-[#fac7cc]" href={footerHref[link] ?? "#top"} key={link}>{link}</a>)}
          </div>
        ))}
        <div className="flex flex-col gap-[11px] pl-0 lg:pl-5">
          <h3 className="mb-1.5 text-[10px] font-bold leading-[13px] tracking-[1.2px] text-soft-muted">CONTACT</h3>
          <a className="text-[12px] font-[550] leading-4 text-white transition-colors hover:text-[#fac7cc]" href="mailto:hello@yourbrand.com">hello@yourbrand.com</a>
          <a className="text-[12px] font-[550] leading-4 text-white transition-colors hover:text-[#fac7cc]" href="tel:+8801000000000">+880 1XXX XXXXXX</a>
          <span className="text-[12px] font-[550] leading-4 text-soft-muted">Dhaka, Bangladesh</span>
        </div>
      </div>
      <div className="mt-[38px] flex flex-col items-start justify-between gap-5 border-t border-[#33384d] pt-5 text-[10px] leading-[14px] text-soft-muted lg:flex-row lg:items-center">
        <span>© 2026 Limex</span>
        <div className="flex gap-6">
          <a className="transition-colors hover:text-white" href="/#top">Privacy</a>
          <a className="transition-colors hover:text-white" href="/#top">Terms</a>
        </div>
      </div>
    </footer>
  );
}
