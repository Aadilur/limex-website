"use client";

import { useState } from "react";

import type { ServicePageContent, ServicePriceTier } from "./service-page-data";
import { ContactModal } from "./contact-section";
import { ActionButton, WaveLabel } from "./ui";

export function ServiceHeroSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="bg-page py-cluster-sm lg:py-cluster" aria-labelledby="service-page-title">
      <p className="text-footer font-text text-muted">{service.breadcrumb}</p>
      <div className="mt-section-gap-xl grid gap-section-gap lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-section-gap-xl">
        <div className="min-w-0">
          <p className="text-overline text-[#de5778]">{service.category}</p>
          <h1 className="mt-cluster max-w-[690px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-page-title">{service.title}</h1>
          <p className="mt-cluster max-w-[620px] text-body-lg text-muted">{service.description}</p>
          <ActionButton href="#service-contact" arrow="cta" className="mt-section-gap-lg min-h-button-lg w-[188px] pl-5 text-body-xs">{service.ctaLabel}</ActionButton>

          <dl className="mt-section-gap-xl grid max-w-[650px] grid-cols-1 gap-section-gap border-t border-[#e0dee3] pt-card-pad-sm sm:grid-cols-3 sm:gap-cluster">
            <div>
              <dt className="text-overline text-[#de5778]">Starting price</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.startingPrice}</dd>
            </div>
            <div>
              <dt className="text-overline text-[#de5778]">Delivery time</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.deliveryTime}</dd>
            </div>
            <div>
              <dt className="text-overline text-[#de5778]">Service mode</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.serviceMode}</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-panel bg-[#f4eff9] sm:min-h-[360px]" aria-label={`${service.mediaTitle} media placeholder`}>
          <img className="absolute -right-6 -top-8 size-[180px] animate-hero-float motion-reduce:animate-none" src="/figma/warm-glow.svg" alt="" aria-hidden="true" />
          <img className="absolute bottom-[-10px] left-[-20px] size-[150px] animate-hero-float-reverse motion-reduce:animate-none" src="/figma/cool-glow.svg" alt="" aria-hidden="true" />
          <img className="absolute bottom-[-30px] right-[-10px] size-[115px] animate-hero-float-slow motion-reduce:animate-none" src="/figma/center-glow.svg" alt="" aria-hidden="true" />
          <p className="absolute left-6 top-5 text-overline text-[#de5778]">Media slot</p>
          <div className="absolute left-1/2 top-1/2 w-[min(336px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 rounded-card bg-white px-card-pad py-section-y">
            <h2 className="font-brand text-section-title text-ink">{service.mediaTitle}</h2>
            <p className="mt-cluster text-body-xs text-muted">{service.mediaDescription}</p>
          </div>
          <p className="absolute bottom-5 right-6 text-micro font-medium text-muted">Optional CMS media</p>
        </div>
      </div>
    </section>
  );
}

export function ServiceOverviewSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="service-overview" aria-labelledby="service-overview-title">
      <div className="grid gap-section-gap lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)] lg:gap-section-gap-xl">
        <div className="min-w-0">
          <p className="text-overline text-[#de5778]">{service.overviewEyebrow}</p>
          <h2 className="mt-cluster max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-overview-title">{service.overviewTitle}</h2>
          <p className="mt-cluster max-w-[720px] text-body-lg text-muted">{service.overviewDescription}</p>

          <article className="mt-section-gap-lg rounded-nav border border-[#e0dee3] bg-white px-card-pad py-card-pad lg:px-section-y lg:py-section-y">
            <p className="text-overline text-[#de5778]">{service.contentLabel}</p>
            <h3 className="mt-cluster font-brand text-section-title text-ink">{service.contentTitle}</h3>
            <p className="mt-cluster max-w-[680px] text-body-sm text-muted">{service.contentDescription}</p>
            <a className="mt-section-gap-lg inline-flex items-center gap-cluster-sm text-button font-bold text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href="#pricing">
              {service.contentLinkLabel} <span className="text-pink" aria-hidden="true">↗</span>
            </a>
          </article>
        </div>

        <aside className="lg:pt-[166px]" aria-label="Service key facts">
          <p className="text-overline text-[#de5778]">Key facts</p>
          <dl className="mt-cluster divide-y divide-[#e0dee3] border-y border-[#e0dee3]">
            {service.facts.map((fact) => (
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-cluster py-4" key={fact.label}>
                <dt className="text-meta text-muted">{fact.label}</dt>
                <dd className="text-body-xs font-semibold text-ink">{fact.value}</dd>
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
    <article className={`relative flex min-h-[292px] flex-col rounded-nav border bg-white p-card-pad ${tier.featured ? "border-[#de4d73]" : "border-[#e0dee3]"}`.trim()}>
      {tier.featured ? <WaveLabel className="absolute left-5 top-4 text-[#de4d73]">Most popular</WaveLabel> : null}
      <p className={`text-body font-semibold ${tier.featured ? "mt-8 text-[#de4d73]" : "text-muted"}`.trim()}>{tier.name}</p>
      <p className="mt-cluster-sm font-brand text-section-title text-ink">{tier.price}</p>
      <p className="mt-cluster-sm text-body-xs text-muted">{tier.description}</p>
      <ul className="mt-cluster flex flex-col gap-cluster-sm p-0">
        {tier.features.map((feature) => (
          <li className="flex items-center gap-cluster-sm text-footer text-ink" key={feature}>
            <span className={`size-1.5 shrink-0 rounded-full ${tier.featured ? "bg-[#de4d73]" : "bg-[#7d7594]"}`.trim()} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <a className={`mt-auto flex min-h-control-sm items-center justify-between rounded-pill px-3.5 text-micro font-semibold transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 ${tier.featured ? "bg-[#de4d73] text-white" : "bg-[#f2edf7] text-ink"}`.trim()} href="#service-contact">
        <span>{tier.action}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function ServicePricingSection({ service }: { service: ServicePageContent }) {
  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="pricing" aria-labelledby="service-pricing-title">
      <p className="text-overline text-[#de5778]">Optional / pricing</p>
          <h2 className="mt-cluster font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-pricing-title">Show the right price for this service</h2>
      <p className="mt-cluster text-body-lg text-muted">Use a starting price, package cards or a custom quote depending on the scope.</p>
      <div className="mt-section-gap-lg grid gap-cluster lg:grid-cols-3">
        {service.pricing.map((tier) => <PriceCard key={tier.name} tier={tier} />)}
      </div>
    </section>
  );
}

export function ServiceFaqSection({ service }: { service: ServicePageContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="service-faq" aria-labelledby="service-faq-title">
      <div className="grid gap-section-gap lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-section-gap-xl">
        <div>
          <p className="text-overline text-[#de5778]">Optional / FAQ</p>
          <h2 className="mt-cluster font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-faq-title">Common questions</h2>
          <p className="mt-cluster max-w-[560px] text-body-lg text-muted">A few clear answers before you choose the next step.</p>
          <p className="mt-section-gap-xl text-overline text-[#de5778]">Content control</p>
          <p className="mt-cluster-sm max-w-[460px] text-body-xs text-muted">Questions can be added, removed and reordered as the service grows.</p>
        </div>

        <div className="border-y border-[#e0dee3]">
          {service.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `service-faq-answer-${index}`;

            return (
              <div className="border-b border-[#e0dee3] last:border-b-0" key={faq.question}>
                <button
                  className="flex min-h-[76px] w-full items-center justify-between gap-cluster-lg border-0 bg-transparent px-0 text-left text-body-sm font-semibold text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className={`inline-grid size-8 shrink-0 place-items-center rounded-full text-icon font-normal ${isOpen ? "bg-[#fce0e3] text-pink" : "bg-soft text-muted"}`.trim()} aria-hidden="true">
                    <span className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`.trim()}>+</span>
                  </span>
                </button>
                <div className={`grid overflow-hidden text-body-xs text-muted transition-[grid-template-rows,padding] duration-[220ms] ${isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`.trim()} id={answerId} role="region">
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
    <section className="mt-section-gap-xl flex flex-col gap-section-gap-lg rounded-nav bg-navy px-card-pad py-section-y text-white lg:mt-section-gap-xl lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-section-y-xl" id="service-contact" aria-labelledby="service-contact-title">
      <div>
        <p className="text-overline text-[#fac7cc]">Ready when you are</p>
        <h2 className="mt-cluster max-w-[760px] font-brand text-page-title max-lg:text-page-title-mobile" id="service-contact-title">Need help choosing the right option?</h2>
        <p className="mt-cluster max-w-[680px] text-body-sm text-[#c7cfe0]">A short conversation is enough to recommend the right path for {service.title.toLowerCase()}.</p>
      </div>
      <ContactModal serviceKey={service.title} variant="white" buttonClassName="min-h-button-lg w-[218px] shrink-0 justify-center text-body-xs" buttonLabel="Talk to an advisor" />
    </section>
  );
}
