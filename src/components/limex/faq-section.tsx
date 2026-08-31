"use client";

import { useState } from "react";

import { faqs } from "./data";
import { ActionButton, SectionTitle } from "./ui";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="flex min-h-0 flex-col gap-7 bg-page px-5 py-7 pb-[26px] lg:grid lg:min-h-[620px] lg:grid-cols-[450px_minmax(0,1fr)] lg:gap-[66px] lg:rounded-[28px] lg:px-[42px] lg:py-[38px]" id="faq" aria-labelledby="faq-title">
      <div className="flex flex-col items-start">
        <SectionTitle
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered simply."
          description="Not sure where to begin? Start with a question. We will help you find the right path."
          className="max-w-[450px]"
          size="large"
        />
        <ActionButton href="#contact" variant="dark" className="mt-7 w-[176px] lg:mt-[43px]">Ask an expert</ActionButton>
        <p className="mt-4 text-[11px] font-semibold text-muted lg:mt-5">Usually replies within one business day.</p>
      </div>
      <div className="min-h-0 rounded-[18px] border border-border bg-white px-4 pt-0 lg:min-h-[514px] lg:rounded-3xl lg:px-[22px] lg:pt-1">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;

          return (
            <div className={`${index === faqs.length - 1 ? "" : "border-b border-border"}`.trim()} key={faq.question}>
              <button
                className="flex min-h-[76px] w-full items-center justify-between gap-5 border-0 bg-transparent px-1 text-left text-[14px] font-[550] leading-5 text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 lg:min-h-[89px] lg:text-[15px]"
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{faq.question}</span>
                <span className={`inline-grid size-10 shrink-0 place-items-center rounded-full text-[20px] font-normal leading-none transition-transform duration-200 ${index === 0 || isOpen ? "bg-[#fce0e3] text-pink" : "bg-soft text-muted"} ${isOpen ? "rotate-45" : ""}`.trim()} aria-hidden="true">+</span>
              </button>
              <div className={`grid overflow-hidden px-1 text-[12px] leading-[18px] text-muted transition-[grid-template-rows,padding] duration-[220ms] ${isOpen ? "grid-rows-[1fr] pb-[18px]" : "grid-rows-[0fr]"}`.trim()} id={answerId} role="region">
                <div className="min-h-0 overflow-hidden"><p>{faq.answer}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
