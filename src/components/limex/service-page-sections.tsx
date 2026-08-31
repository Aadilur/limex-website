"use client";

import { useState } from "react";

import type { ServicePageContent, ServicePriceTier } from "./service-page-data";
import { ActionButton } from "./ui";

export function ServiceHeroSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="bg-page py-2 lg:py-4" aria-labelledby="service-page-title">
      <p className="text-[11px] font-medium leading-5 text-muted">{service.breadcrumb}</p>
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[1.15px] text-[#de5778]">{service.category}</p>
          <h1 className="mt-3 max-w-[690px] text-[clamp(43px,4.2vw,64px)] font-bold leading-[1.02] tracking-[-2.6px] text-ink" id="service-page-title">{service.title}</h1>
          <p className="mt-4 max-w-[620px] text-[17px] leading-7 text-muted lg:text-[19px]">{service.description}</p>
          <ActionButton href="#service-contact" arrow="cta" className="mt-7 min-h-[52px] w-[188px] pl-5 text-[13px]">{service.ctaLabel}</ActionButton>

          <dl className="mt-12 grid max-w-[650px] grid-cols-1 gap-6 border-t border-[#e0dee3] pt-5 sm:grid-cols-3 sm:gap-4">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.9px] text-[#de5778]">Starting price</dt>
              <dd className="mt-1.5 text-[13px] font-semibold leading-5 text-ink">{service.startingPrice}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.9px] text-[#de5778]">Delivery time</dt>
              <dd className="mt-1.5 text-[13px] font-semibold leading-5 text-ink">{service.deliveryTime}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.9px] text-[#de5778]">Service mode</dt>
              <dd className="mt-1.5 text-[13px] font-semibold leading-5 text-ink">{service.serviceMode}</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-[#f4eff9] sm:min-h-[360px]" aria-label={`${service.mediaTitle} media placeholder`}>
          <img className="absolute -right-6 -top-8 size-[180px] animate-hero-float motion-reduce:animate-none" src="/figma/warm-glow.svg" alt="" aria-hidden="true" />
          <img className="absolute bottom-[-10px] left-[-20px] size-[150px] animate-hero-float-reverse motion-reduce:animate-none" src="/figma/cool-glow.svg" alt="" aria-hidden="true" />
          <img className="absolute bottom-[-30px] right-[-10px] size-[115px] animate-hero-float-slow motion-reduce:animate-none" src="/figma/center-glow.svg" alt="" aria-hidden="true" />
          <p className="absolute left-6 top-5 text-[10px] font-bold uppercase tracking-[1px] text-[#de5778]">Media slot</p>
          <div className="absolute left-1/2 top-1/2 w-[min(336px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white px-6 py-8">
            <h2 className="text-[22px] font-bold leading-7 tracking-[-0.35px] text-ink">{service.mediaTitle}</h2>
            <p className="mt-3 text-[12px] leading-[17px] text-muted">{service.mediaDescription}</p>
          </div>
          <p className="absolute bottom-5 right-6 text-[10px] font-medium text-muted">Optional CMS media</p>
        </div>
      </div>
    </section>
  );
}

export function ServiceOverviewSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="mt-14 border-t border-[#e0dee3] bg-page pt-9 lg:mt-16 lg:pt-12" id="service-overview" aria-labelledby="service-overview-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)] lg:gap-14">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[1.15px] text-[#de5778]">{service.overviewEyebrow}</p>
          <h2 className="mt-3 max-w-[760px] text-[clamp(32px,3vw,44px)] font-bold leading-[1.08] tracking-[-1.2px] text-ink" id="service-overview-title">{service.overviewTitle}</h2>
          <p className="mt-3 max-w-[720px] text-[16px] leading-6 text-muted lg:text-[18px]">{service.overviewDescription}</p>

          <article className="mt-9 rounded-[24px] border border-[#e0dee3] bg-white px-6 py-6 lg:px-7 lg:py-7">
            <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#de5778]">{service.contentLabel}</p>
            <h3 className="mt-4 text-[22px] font-bold leading-7 tracking-[-0.5px] text-ink">{service.contentTitle}</h3>
            <p className="mt-3 max-w-[680px] text-[14px] leading-[22px] text-muted">{service.contentDescription}</p>
            <a className="mt-6 inline-flex items-center gap-2 text-[12px] font-bold text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href="#pricing">
              {service.contentLinkLabel} <span className="text-pink" aria-hidden="true">↗</span>
            </a>
          </article>
        </div>

        <aside className="lg:pt-[166px]" aria-label="Service key facts">
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#de5778]">Key facts</p>
          <dl className="mt-4 divide-y divide-[#e0dee3] border-y border-[#e0dee3]">
            {service.facts.map((fact) => (
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-4" key={fact.label}>
                <dt className="text-[11px] leading-[17px] text-muted">{fact.label}</dt>
                <dd className="text-[13px] font-semibold leading-[17px] text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

function PriceCard({ tier }: { tier: ServicePriceTier }) {
  return (
    <article className={`relative flex min-h-[292px] flex-col rounded-[24px] border bg-white p-5 lg:p-6 ${tier.featured ? "border-[#de4d73]" : "border-[#e0dee3]"}`.trim()}>
      {tier.featured ? <span className="absolute left-5 top-4 inline-flex min-h-6 items-center rounded-full bg-[#de4d73] px-3 text-[8px] font-bold uppercase tracking-[0.8px] text-white">Most popular</span> : null}
      <p className={`text-[16px] font-semibold tracking-[-0.2px] ${tier.featured ? "mt-8 text-[#de4d73]" : "text-muted"}`.trim()}>{tier.name}</p>
      <p className="mt-2 text-[24px] font-bold leading-7 tracking-[-0.35px] text-ink">{tier.price}</p>
      <p className="mt-2 text-[12px] leading-[17px] text-muted">{tier.description}</p>
      <ul className="mt-4 flex flex-col gap-2.5 p-0">
        {tier.features.map((feature) => (
          <li className="flex items-center gap-2.5 text-[12px] leading-4 text-ink" key={feature}>
            <span className={`size-1.5 shrink-0 rounded-full ${tier.featured ? "bg-[#de4d73]" : "bg-[#7d7594]"}`.trim()} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <a className={`mt-auto flex min-h-[36px] items-center justify-between rounded-full px-3.5 text-[10px] font-semibold tracking-[0.4px] transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 ${tier.featured ? "bg-[#de4d73] text-white" : "bg-[#f2edf7] text-ink"}`.trim()} href="#service-contact">
        <span>{tier.action}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function ServicePricingSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="mt-14 border-t border-[#e0dee3] bg-page pt-9 lg:mt-16 lg:pt-12" id="pricing" aria-labelledby="service-pricing-title">
      <p className="text-[11px] font-bold uppercase tracking-[1.15px] text-[#de5778]">Optional / pricing</p>
      <h2 className="mt-3 text-[clamp(30px,2.8vw,40px)] font-bold leading-[1.1] tracking-[-1px] text-ink" id="service-pricing-title">Show the right price for this service</h2>
      <p className="mt-3 text-[16px] leading-6 text-muted lg:text-[18px]">Use a starting price, package cards or a custom quote depending on the scope.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {service.pricing.map((tier) => <PriceCard key={tier.name} tier={tier} />)}
      </div>
    </section>
  );
}

export function ServiceFaqSection({ service }: { service: ServicePageContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-14 border-t border-[#e0dee3] bg-page pt-9 lg:mt-16 lg:pt-12" id="service-faq" aria-labelledby="service-faq-title">
      <div className="grid gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.15px] text-[#de5778]">Optional / FAQ</p>
          <h2 className="mt-3 text-[clamp(30px,2.8vw,40px)] font-bold leading-[1.1] tracking-[-1px] text-ink" id="service-faq-title">Common questions</h2>
          <p className="mt-3 max-w-[560px] text-[16px] leading-6 text-muted lg:text-[18px]">A few clear answers before you choose the next step.</p>
          <p className="mt-14 text-[10px] font-bold uppercase tracking-[1px] text-[#de5778]">Content control</p>
          <p className="mt-2 max-w-[460px] text-[13px] leading-5 text-muted">Questions can be added, removed and reordered as the service grows.</p>
        </div>

        <div className="border-y border-[#e0dee3]">
          {service.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `service-faq-answer-${index}`;

            return (
              <div className="border-b border-[#e0dee3] last:border-b-0" key={faq.question}>
                <button
                  className="flex min-h-[76px] w-full items-center justify-between gap-5 border-0 bg-transparent px-0 text-left text-[15px] font-semibold leading-5 text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className={`inline-grid size-8 shrink-0 place-items-center rounded-full text-[20px] font-normal leading-none transition-transform duration-200 ${isOpen ? "bg-[#fce0e3] text-pink rotate-45" : "bg-soft text-muted"}`.trim()} aria-hidden="true">+</span>
                </button>
                <div className={`grid overflow-hidden text-[12px] leading-[18px] text-muted transition-[grid-template-rows,padding] duration-[220ms] ${isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`.trim()} id={answerId} role="region">
                  <div className="min-h-0 overflow-hidden"><p>{faq.answer}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServiceContactSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="mt-14 flex flex-col gap-7 rounded-[24px] bg-navy px-6 py-7 text-white lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-9" id="service-contact" aria-labelledby="service-contact-title">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[1.15px] text-[#fac7cc]">Ready when you are</p>
        <h2 className="mt-3 max-w-[760px] text-[clamp(28px,2.8vw,38px)] font-bold leading-[1.1] tracking-[-0.9px]" id="service-contact-title">Need help choosing the right option?</h2>
        <p className="mt-3 max-w-[680px] text-[15px] leading-6 text-[#c7cfe0]">A short conversation is enough to recommend the right path for {service.title.toLowerCase()}.</p>
      </div>
      <ActionButton href="/#contact" variant="white" arrow="text" className="min-h-[52px] w-[218px] shrink-0 justify-center text-[13px]">Talk to an advisor</ActionButton>
    </section>
  );
}
