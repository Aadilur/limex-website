"use client";

import { useEffect, useState } from "react";

import { ActionButton, LogoLockup } from "./ui";
import { defaultLandingContent, getPublicLanding, withLandingFallback } from "@/lib/landing-api";
import { getPublicContactSettings } from "@/lib/contact-api";
import type { PublicContactSettings } from "@/lib/contact-types";
import type { FooterContent } from "@/lib/landing-types";

export function SiteFooter({ content }: { content?: FooterContent }) {
  const [footer, setFooter] = useState<FooterContent>(content ?? defaultLandingContent.footer);
  const [contact, setContact] = useState<PublicContactSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!content) {
      void getPublicLanding()
        .then((landing) => {
          if (!cancelled) setFooter(withLandingFallback(landing).footer);
        })
        .catch(() => {
          // Keep the bundled footer available when the API is unavailable.
        });
    }
    void getPublicContactSettings().then((settings) => {
      if (!cancelled) setContact(settings);
    }).catch(() => {
      // Keep landing footer details available when contact settings are unavailable.
    });

    return () => {
      cancelled = true;
    };
  }, [content]);

  const contactEmail = contact?.email || footer.contactEmail;
  const contactPhone = contact?.phone || footer.contactPhone;
  const contactLocation = contact?.address || footer.location;

  return (
    <footer className="min-h-0 rounded-panel-mobile bg-navy px-page-gutter pb-section-y-lg pt-section-y-lg text-white lg:min-h-[440px] lg:rounded-panel lg:px-page-gutter-lg lg:pb-6" aria-label="Footer">
      <div className="flex flex-col items-start justify-between gap-section-gap lg:flex-row">
        <div>
          <LogoLockup light className="w-[178px] min-w-[178px]" />
          <p className="mt-cluster-sm text-footer text-soft-muted">{footer.tagline}</p>
        </div>
        <ActionButton href={footer.ctaHref} variant="white" arrow="none" className="mt-cluster-lg min-h-button-lg w-full max-w-[250px] justify-center text-body-sm lg:mt-px lg:w-[170px]">{footer.ctaLabel}</ActionButton>
      </div>
      <h2 className="mt-section-gap-xl max-w-[660px] font-brand text-section-title-mobile lg:mt-section-gap-lg lg:text-section-title">{footer.title}</h2>
      <div className="mt-section-gap-xl h-px bg-[#33384d]" />
      <div className="mt-section-y grid grid-cols-1 gap-y-section-gap-lg sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1.7fr] lg:gap-7">
        {footer.columns.filter((column) => column.isVisible).map((column) => (
          <div className="flex flex-col gap-cluster-sm" key={column.id}>
            <h3 className="mb-cluster-sm text-micro font-bold uppercase tracking-eyebrow text-soft-muted">{column.title}</h3>
            {column.links.filter((link) => link.isVisible).map((link) => <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href={link.href} key={link.id}>{link.label}</a>)}
          </div>
        ))}
        <div className="flex flex-col gap-cluster-sm pl-0 lg:pl-5">
          <h3 className="mb-cluster-sm text-micro font-bold uppercase tracking-eyebrow text-soft-muted">{footer.contactTitle}</h3>
          <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          {contactPhone ? <a className="text-footer text-white transition-colors hover:text-[#fac7cc]" href={`tel:${contactPhone}`}>{contactPhone}</a> : null}
          <span className="text-footer text-soft-muted">{contactLocation}</span>
        </div>
      </div>
      <div className="mt-section-y-xl flex flex-col items-start justify-between gap-cluster-lg border-t border-[#33384d] pt-cluster-lg text-body-xs text-soft-muted lg:flex-row lg:items-center">
        <span>{footer.copyright}</span>
        <div className="flex gap-cluster-lg">
          {footer.legalLinks.filter((link) => link.isVisible).map((link) => <a className="transition-colors hover:text-white" href={link.href} key={link.id}>{link.label}</a>)}
        </div>
      </div>
    </footer>
  );
}
