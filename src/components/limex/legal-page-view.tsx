import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SanitizedRichText } from "./sanitized-rich-text";
import { blogRichTextClass } from "./blog-rich-text";
import type { LegalPageData } from "@/lib/legal-types";

function formatLegalDate(isoString?: string) {
  if (!isoString) return "September 2026";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "September 2026";
  }
}

export function LegalPageView({ page }: { page: LegalPageData }) {
  const isPrivacy = page.slug === "privacy";
  const eyebrow = isPrivacy ? "DATA PRIVACY & PROTECTION" : "TERMS OF SERVICE";

  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass}>
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          {/* Header hero */}
          <div className="mx-auto max-w-[880px] pb-8 pt-6 sm:pb-12 sm:pt-10">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-accent" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted sm:text-[12px]">
                {eyebrow}
              </span>
            </div>
            <h1 className="mt-3 font-brand text-[32px] font-medium leading-[1.15] text-ink sm:text-[44px] lg:text-[52px]">
              {page.title}
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-muted sm:text-[15px]">
              Last updated: {formatLegalDate(page.updatedAt)} · Official
              statutory documentation of Limex Consultancy Firm.
            </p>
          </div>

          {/* Body Content Container */}
          <article className="mx-auto max-w-[880px] rounded-[18px] border border-[#e8e4dc] bg-white p-6 shadow-[0_4px_24px_rgba(20,28,45,0.04)] sm:rounded-[24px] sm:p-10 lg:p-14">
            <SanitizedRichText
              html={page.contentHtml}
              className={blogRichTextClass}
            />
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
