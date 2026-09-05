"use client";

import { useState } from "react";

import { ActionButton, SectionTitle } from "./ui";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { FaqContent } from "@/lib/landing-types";

export function FaqSection({ content = defaultLandingContent.faq }: { content?: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const visibleFaqs = content.items.filter((faq) => faq.isVisible);

  return (
    <section className="flex min-h-0 flex-col gap-section-y bg-page px-page-gutter pt-section-gap-xl pb-section-y lg:grid lg:grid-cols-[450px_minmax(0,1fr)] lg:gap-section-gap-xl lg:rounded-panel lg:px-page-gutter-lg lg:pt-section-gap-xl lg:pb-section-y-lg" id="faq" aria-labelledby="faq-title">
      <div className="flex flex-col items-start lg:justify-center">
        <SectionTitle
          id="faq-title"
          title={content.title}
          description={content.description}
          className="max-w-[450px]"
          size="large"
        />
        <ActionButton href={content.ctaHref} variant="outline" className="mt-section-y w-[184px] border-[#d4ccc1] bg-[#f7f4ef] lg:mt-section-gap-xl">{content.ctaLabel}</ActionButton>
      </div>
      <div className="relative min-h-0 border-t border-[#ded9d0]">
        <div className="relative flex items-center justify-between border-b border-[#e3e8e3] py-3">
          <span className="text-overline text-[#74877a]">MOST ASKED</span>
          <span className="text-overline text-[#a1ada4]">{visibleFaqs.length} QUESTIONS</span>
        </div>
        {visibleFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;

          return (
            <div className={`${index === visibleFaqs.length - 1 ? "" : "border-b border-[#e3e8e3]"}`.trim()} key={faq.id}>
              <button
                className="flex min-h-[66px] w-full items-center justify-between gap-cluster-lg border-0 bg-transparent text-left text-body-sm font-text text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 lg:min-h-[72px]"
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="flex min-w-0 items-center gap-cluster-lg">
                  <span className="w-7 shrink-0 text-overline text-[#aaa096]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">{faq.question}</span>
                </span>
                <span className={`inline-grid size-8 shrink-0 place-items-center rounded-full border text-icon-sm font-normal transition-all duration-200 ${isOpen ? "border-[#9eb8a5] text-[#597462]" : "border-[#dfe5df] text-[#839087]"} ${isOpen ? "rotate-45" : ""}`.trim()} aria-hidden="true">+</span>
              </button>
              <div className={`grid overflow-hidden text-body-xs leading-relaxed text-muted transition-[grid-template-rows,padding] duration-[220ms] ${isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`.trim()} id={answerId} role="region">
                <div className="min-h-0 overflow-hidden border-l-2 border-[#bfd1c3] pl-9"><p>{faq.answer}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
