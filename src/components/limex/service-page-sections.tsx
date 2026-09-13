"use client";

import { useState } from "react";

import type { ServicePageContent, ServicePriceTier } from "./service-page-data";
import type { PublicContactSettings } from "@/lib/contact-types";
import { getTool, toolHref } from "@/lib/business-tools";
import { ContactModal } from "./contact-section";
import { ToolWorkspace } from "./tool-workspace";
import { ActionButton, Breadcrumbs, WaveLabel } from "./ui";
import { blogRichTextClass } from "./blog-rich-text";
import { SanitizedRichText } from "./sanitized-rich-text";

function externalLinkProps(href: string) {
  return /^https?:\/\//i.test(href) ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

function serviceWhatsAppUrl(contact: PublicContactSettings | null | undefined, message: string) {
  if (!contact?.whatsappUrl) return null;
  try {
    const url = new URL(contact.whatsappUrl);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return contact.whatsappUrl;
  }
}

const serviceUi = {
  en: {
    switchLabel: "বাংলা",
    mediaSlot: "Media slot",
    optionalMedia: "Optional CMS media",
    startingPrice: "Starting price",
    deliveryTime: "Delivery time",
    serviceMode: "Service mode",
    keyFacts: "Key facts",
    relatedOptions: "Related options",
    helpfulTools: "Helpful tools",
    pricingEyebrow: "Optional / pricing",
    pricingTitle: "Show the right price for this service",
    pricingDescription: "Use a starting price, package cards or a custom quote depending on the scope.",
    mostPopular: "Most popular",
    faqEyebrow: "Optional / FAQ",
    faqTitle: "Common questions",
    faqDescription: "A few clear answers before you choose the next step.",
    contentControl: "Content control",
    contentControlDescription: "Questions can be added, removed and reordered as the service grows.",
    readyEyebrow: "Ready when you are",
    contactTitle: "Need help choosing the right option?",
    contactDescription: "A short conversation is enough to recommend the right path for",
    contactButton: "Talk to an advisor",
    bookNow: "Book now",
    whatsappNow: "Discuss on WhatsApp",
  },
  bn: {
    switchLabel: "English",
    mediaSlot: "মিডিয়া স্লট",
    optionalMedia: "ঐচ্ছিক CMS মিডিয়া",
    startingPrice: "প্রাথমিক মূল্য",
    deliveryTime: "সময় লাগতে পারে",
    serviceMode: "সেবার মাধ্যম",
    keyFacts: "গুরুত্বপূর্ণ তথ্য",
    relatedOptions: "সম্পর্কিত সেবা",
    helpfulTools: "সহায়ক টুল",
    pricingEyebrow: "ঐচ্ছিক / মূল্য",
    pricingTitle: "এই সেবার জন্য সঠিক মূল্য নির্ধারণ করুন",
    pricingDescription: "কাজের পরিধি অনুযায়ী প্রাথমিক মূল্য, প্যাকেজ বা কাস্টম কোট ব্যবহার করুন।",
    mostPopular: "জনপ্রিয় প্যাকেজ",
    faqEyebrow: "ঐচ্ছিক / প্রশ্নোত্তর",
    faqTitle: "সাধারণ প্রশ্ন",
    faqDescription: "পরবর্তী ধাপ বেছে নেওয়ার আগে কয়েকটি পরিষ্কার উত্তর।",
    contentControl: "কনটেন্ট নিয়ন্ত্রণ",
    contentControlDescription: "সেবা বাড়ার সঙ্গে প্রশ্ন যোগ, বাদ ও সাজানো যাবে।",
    readyEyebrow: "আপনি প্রস্তুত হলে",
    contactTitle: "সঠিক সেবা বেছে নিতে সাহায্য চান?",
    contactDescription: "আপনার জন্য উপযুক্ত পথ ঠিক করতে একটি সংক্ষিপ্ত কথোপকথনই যথেষ্ট—",
    contactButton: "পরামর্শ নিন",
    bookNow: "এখনই বুক করুন",
    whatsappNow: "WhatsApp-এ আলোচনা করুন",
  },
} as const;

const richTextClass = "blog-rich-text text-body-lg text-muted [&_a]:font-semibold [&_a]:text-pink [&_a]:underline [&_a]:decoration-pink/30 [&_a]:underline-offset-2 [&_blockquote]:my-cluster [&_blockquote]:border-l-2 [&_blockquote]:border-pink [&_blockquote]:pl-cluster [&_h2]:mt-section-gap-lg [&_h2]:font-brand [&_h2]:text-section-title [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-section-gap [&_h3]:font-brand [&_h3]:text-subheading-mobile [&_h3]:font-bold [&_h3]:text-ink [&_img]:my-cluster [&_img]:max-w-full [&_img]:rounded-card [&_img]:object-contain [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ol_li]:list-decimal [&_p+p]:mt-cluster [&_strong]:font-bold [&_ul]:my-cluster [&_ol]:my-cluster";

function RichTextContent({ id, html, fallback, className = richTextClass }: { id?: string; html?: string; fallback: string; className?: string }) {
  return <SanitizedRichText id={id} html={html} fallback={fallback} className={className.includes("blog-rich-text") ? className : `blog-rich-text ${className}`} />;
}

export function ServiceHeroSection({ service }: { service: ServicePageContent }) {
  const locale = service.locale ?? "en";
  const ui = serviceUi[locale];
  const breadcrumbItems = service.breadcrumbItems ?? service.breadcrumb.split(/\s*\/\s*/).filter(Boolean).map((label, index, labels) => ({
    label: label.trim(),
    href: index === 0 ? "/" : index < labels.length - 1 ? locale === "bn" ? "/bn/services" : "/services" : undefined,
  }));

  return (
    <section className="bg-page py-cluster-sm lg:py-cluster" aria-labelledby="service-page-title">
      <div className="flex flex-wrap items-center justify-between gap-cluster">
        <Breadcrumbs items={breadcrumbItems} />
        <a className="shrink-0 text-button font-semibold text-pink transition-colors hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" href={locale === "bn" ? `/services/${service.slug}` : `/bn/services/${service.slug}`}>{ui.switchLabel}</a>
      </div>
      <div className="mt-section-gap-xl grid gap-section-gap lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-section-gap-xl">
        <div className="min-w-0">
          <p className="text-overline text-[#0055ff]">{service.category}</p>
          <h1 className="mt-cluster max-w-[690px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-page-title">{service.title}</h1>
          <p className="mt-cluster max-w-[620px] text-body-lg text-muted">{service.description}</p>
          <div className="mt-section-gap-lg flex flex-wrap items-center gap-cluster">
            <ActionButton href="#service-contact" arrow="cta" className="min-h-button-lg w-[188px] pl-5 text-body-xs">{service.ctaLabel}</ActionButton>
            {service.destination && service.destination.type !== "DETAIL" && service.destination.type !== "CONTACT" ? <a className="inline-flex min-h-control items-center gap-cluster-sm rounded-pill px-3 text-button font-semibold text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={service.destination.href} target={service.destination.isExternal ? "_blank" : undefined} rel={service.destination.isExternal ? "noreferrer" : undefined}>{service.destination.label}<span className="text-pink" aria-hidden="true">↗</span></a> : null}
          </div>

          <dl className="mt-section-gap-xl grid max-w-[650px] grid-cols-1 gap-section-gap border-t border-[#e0dee3] pt-card-pad-sm sm:grid-cols-3 sm:gap-cluster">
            <div>
              <dt className="text-overline text-[#0055ff]">{ui.startingPrice}</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.startingPrice}</dd>
            </div>
            <div>
              <dt className="text-overline text-[#0055ff]">{ui.deliveryTime}</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.deliveryTime}</dd>
            </div>
            <div>
              <dt className="text-overline text-[#0055ff]">{ui.serviceMode}</dt>
              <dd className="mt-cluster-xs text-body-xs font-semibold text-ink">{service.serviceMode}</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-panel bg-[#f4eff9] sm:min-h-[360px]" aria-label={service.mediaTitle}>
          {service.mediaUrl?.trim() ? <img className="absolute inset-0 size-full object-cover" src={service.mediaUrl} alt={service.mediaAlt || service.mediaTitle} /> : null}
          <img className={`absolute -right-6 -top-8 size-[180px] animate-hero-float motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()} src="/figma/warm-glow.svg" alt="" aria-hidden="true" />
          <img className={`absolute bottom-[-10px] left-[-20px] size-[150px] animate-hero-float-reverse motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()} src="/figma/cool-glow.svg" alt="" aria-hidden="true" />
          <img className={`absolute bottom-[-30px] right-[-10px] size-[115px] animate-hero-float-slow motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()} src="/figma/center-glow.svg" alt="" aria-hidden="true" />
          {!service.mediaUrl?.trim() ? <p className="absolute left-6 top-5 text-overline text-[#0055ff]">{ui.mediaSlot}</p> : null}
          <div className={`absolute left-1/2 top-1/2 w-[min(336px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 rounded-card px-card-pad py-section-y ${service.mediaUrl?.trim() ? "bg-navy/85 text-white" : "bg-white"}`.trim()}>
            <h2 className={`font-brand text-section-title ${service.mediaUrl?.trim() ? "text-white" : "text-ink"}`.trim()}>{service.mediaTitle}</h2>
            <p className={`mt-cluster text-body-xs ${service.mediaUrl?.trim() ? "text-white/75" : "text-muted"}`.trim()}>{service.mediaDescription}</p>
          </div>
          {!service.mediaUrl?.trim() ? <p className="absolute bottom-5 right-6 text-micro font-medium text-muted">{ui.optionalMedia}</p> : null}
        </div>
      </div>
    </section>
  );
}

export function ServiceOverviewSection({ service }: { service: ServicePageContent }) {
  const ui = serviceUi[service.locale ?? "en"];
  const overviewHtml = service.overviewHtml?.trim();
  const keyFactsLabel = service.keyFactsLabel?.trim() || ui.keyFacts;
  const relatedOptionsLabel = service.relatedOptionsLabel?.trim() || ui.relatedOptions;
  const toolsEyebrow = service.toolsEyebrow?.trim() || ui.helpfulTools;
  const toolsTitle = service.toolsTitle?.trim() || "Keep the next step close at hand.";
  const toolsDescription = service.toolsDescription?.trim() || "Link a calculator or document builder that helps customers move forward.";
  const helpfulTools = (service.tools ?? []).flatMap((slug) => {
    const tool = getTool(slug);
    return tool ? [tool] : [];
  });
  const calculatorTools = helpfulTools.filter((tool) => tool.group === "calculator");
  const builderTools = helpfulTools.filter((tool) => tool.group === "builder");

  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="service-overview" aria-labelledby="service-overview-title">
      <div className={`grid gap-section-gap ${service.facts.length ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)] lg:gap-section-gap-xl" : ""}`.trim()}>
        <div className="min-w-0">
          {overviewHtml ? <RichTextContent id="service-overview-title" html={overviewHtml} fallback="" className={blogRichTextClass} /> : <>
            <p className="text-overline text-[#0055ff]">{service.overviewEyebrow}</p>
            <h2 className="mt-cluster max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-overview-title">{service.overviewTitle}</h2>
            <RichTextContent html={service.overviewDescriptionHtml} fallback={service.overviewDescription} className={`${richTextClass} mt-cluster max-w-[720px]`} />

            <article className="mt-section-gap-lg rounded-nav border border-[#e0dee3] bg-white px-card-pad py-card-pad lg:px-section-y lg:py-section-y">
              <p className="text-overline text-[#0055ff]">{service.contentLabel}</p>
              <h3 className="mt-cluster font-brand text-section-title text-ink">{service.contentTitle}</h3>
              <RichTextContent html={service.contentDescriptionHtml} fallback={service.contentDescription} className={`${richTextClass} mt-cluster max-w-[680px] text-body-sm`} />
              {service.contentLinkLabel ? <a className="mt-section-gap-lg inline-flex items-center gap-cluster-sm text-button font-bold text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={service.contentLinkHref || "#pricing"} {...externalLinkProps(service.contentLinkHref || "#pricing")}>
                {service.contentLinkLabel} <span className="text-pink" aria-hidden="true">↗</span>
              </a> : null}
            </article>

            {service.benefits?.length ? (
            <div className="mt-section-gap-lg grid gap-cluster sm:grid-cols-2">
              {service.benefits.map((benefit) => <p className="flex items-start gap-cluster-sm text-body-sm text-ink" key={benefit}><span className="mt-2 size-2 shrink-0 rounded-full bg-[#0055ff]" aria-hidden="true" />{benefit}</p>)}
            </div>
            ) : null}

            {service.steps?.length ? (
            <div className="mt-section-gap-xl grid gap-cluster sm:grid-cols-3">
              {service.steps.map((step, index) => <div className="border-t border-[#e0dee3] pt-cluster" key={`${step.title}-${index}`}><span className="text-overline text-[#0055ff]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-cluster-xs font-brand text-subheading-mobile text-ink">{step.title}</h3><p className="mt-cluster-xs text-body-xs text-muted">{step.description}</p></div>)}
            </div>
            ) : null}
          </>}

        </div>

        {service.facts.length ? <aside className="lg:pt-[166px]" aria-label="Service key facts">
          <p className="text-overline text-[#0055ff]">{keyFactsLabel}</p>
          <dl className="mt-cluster divide-y divide-[#e0dee3] border-y border-[#e0dee3]">
            {service.facts.map((fact) => (
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-cluster py-4" key={fact.label}>
                <dt className="text-meta text-muted">{fact.label}</dt>
                <dd className="text-body-xs font-semibold text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside> : null}
      </div>

      {service.relatedLinks?.length ? (
        <div className="mt-section-gap-xl border-t border-[#e0dee3] pt-section-y">
          <p className="text-overline text-[#0055ff]">{relatedOptionsLabel}</p>
          <div className="mt-cluster flex flex-wrap gap-2">
            {service.relatedLinks.map((link) => <a className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-white px-3.5 text-button font-semibold text-ink ring-1 ring-[#e0dee3] transition-colors hover:text-pink hover:ring-[#0055ff]/40" href={link.href} {...externalLinkProps(link.href)} key={link.id}>{link.label}<span className="text-pink" aria-hidden="true">↗</span></a>)}
          </div>
        </div>
      ) : null}

      {helpfulTools.length ? (
        <div className="mt-section-gap-xl border-t border-[#e0dee3] pt-section-y">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-overline text-[#0055ff]">{toolsEyebrow}</p>
              <h3 className="mt-cluster font-brand text-section-title text-ink">{toolsTitle}</h3>
            </div>
            <span className="text-micro font-semibold text-muted">{helpfulTools.length}</span>
          </div>
          <p className="mt-cluster max-w-[860px] text-body-sm text-muted">{toolsDescription}</p>
          {calculatorTools.length ? (
            <div className="mt-section-gap-lg w-full space-y-section-gap-xl">
              {calculatorTools.map((tool) => <ToolWorkspace embedded key={tool.slug} tool={tool} />)}
            </div>
          ) : null}
          {builderTools.length ? (
            <div className={calculatorTools.length ? "mt-section-gap-xl" : "mt-section-gap-lg"}>
              {calculatorTools.length ? <p className="text-overline text-[#0055ff]">{service.locale === "bn" ? "ডকুমেন্ট বিল্ডার" : "Document builders"}</p> : null}
              <div className="mt-cluster grid gap-cluster sm:grid-cols-2 lg:grid-cols-3">
                {builderTools.map((tool) => (
                  <a className="group flex min-w-0 items-center justify-between gap-cluster rounded-card bg-white px-card-pad-sm py-cluster ring-1 ring-[#e0dee3] transition-colors hover:ring-[#0055ff]/50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={toolHref(tool.slug)} key={tool.slug}>
                    <span className="min-w-0">
                      <span className="block truncate text-body-xs font-semibold text-ink group-hover:text-pink">{tool.title}</span>
                      <span className="mt-cluster-xs block truncate text-micro text-muted">{tool.description}</span>
                    </span>
                    <span className="shrink-0 text-pink" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PriceCard({ tier, locale, serviceTitle, serviceKey, contact, mostPopularLabel }: { tier: ServicePriceTier; locale: "en" | "bn"; serviceTitle: string; serviceKey?: string; contact?: PublicContactSettings | null; mostPopularLabel: string }) {
  const ui = serviceUi[locale];
  const whatsappHref = serviceWhatsAppUrl(contact, `Hello Limex, I’d like to discuss ${serviceTitle}${tier.name ? ` · ${tier.name}` : ""}.`);

  return (
    <article className={`relative flex min-h-[292px] flex-col rounded-nav border bg-white p-card-pad ${tier.featured ? "border-[#0055ff]" : "border-[#e0dee3]"}`.trim()}>
      {tier.featured ? <WaveLabel className="absolute left-5 top-4 text-[#0055ff]">{mostPopularLabel}</WaveLabel> : null}
      <p className={`text-body font-semibold ${tier.featured ? "mt-8 text-[#0055ff]" : "text-muted"}`.trim()}>{tier.name}</p>
      <p className="mt-cluster-sm font-brand text-section-title text-ink">{tier.price}</p>
      <p className="mt-cluster-sm text-body-xs text-muted">{tier.description}</p>
      <ul className="mt-cluster flex flex-col gap-cluster-sm p-0">
        {tier.features.map((feature) => (
          <li className="flex items-center gap-cluster-sm text-footer text-ink" key={feature}>
            <span className={`size-1.5 shrink-0 rounded-full ${tier.featured ? "bg-[#0055ff]" : "bg-[#7d7594]"}`.trim()} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto grid gap-2 pt-5">
        <ContactModal
          serviceKey={serviceKey ?? serviceTitle}
          initialMessage={`I’m interested in ${serviceTitle}${tier.name ? ` · ${tier.name}` : ""}.`}
          variant={tier.featured ? "dark" : "soft"}
          buttonClassName="min-h-control-sm w-full justify-between px-3.5 text-micro"
          buttonLabel={tier.action || ui.bookNow}
        />
        {whatsappHref ? <a className="inline-flex min-h-control-sm items-center justify-between gap-2 rounded-pill px-3.5 text-micro font-semibold text-[#006dce] ring-1 ring-[#b9ddff] transition-colors hover:bg-[#e8f3ff] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={whatsappHref} target="_blank" rel="noreferrer">
          <span className="flex min-w-0 items-center gap-2"><img className="size-4 shrink-0" src="/figma/whatsapp-dot.svg" alt="" aria-hidden="true" /><span className="truncate">{tier.whatsappLabel || ui.whatsappNow}</span></span>
          <span aria-hidden="true">↗</span>
        </a> : null}
      </div>
    </article>
  );
}

export function ServicePricingSection({ service, contact }: { service: ServicePageContent; contact?: PublicContactSettings | null }) {
  if (!service.pricing.length) return null;
  const locale = service.locale ?? "en";
  const ui = serviceUi[locale];
  const pricingEyebrow = service.pricingEyebrow?.trim() || ui.pricingEyebrow;
  const pricingTitle = service.pricingTitle?.trim() || ui.pricingTitle;
  const pricingDescription = service.pricingDescription?.trim() || ui.pricingDescription;
  const mostPopularLabel = service.mostPopularLabel?.trim() || ui.mostPopular;

  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="pricing" aria-labelledby="service-pricing-title">
      <p className="text-overline text-[#0055ff]">{pricingEyebrow}</p>
          <h2 className="mt-cluster font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-pricing-title">{pricingTitle}</h2>
      <p className="mt-cluster text-body-lg text-muted">{pricingDescription}</p>
      <div className="mt-section-gap-lg grid gap-cluster lg:grid-cols-3">
        {service.pricing.map((tier) => <PriceCard key={tier.name} tier={tier} locale={locale} serviceTitle={service.title} serviceKey={service.serviceKey} contact={contact} mostPopularLabel={mostPopularLabel} />)}
      </div>
    </section>
  );
}

export function ServiceFaqSection({ service }: { service: ServicePageContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ui = serviceUi[service.locale ?? "en"];
  const faqEyebrow = service.faqEyebrow?.trim() || ui.faqEyebrow;
  const faqTitle = service.faqTitle?.trim() || ui.faqTitle;
  const faqDescription = service.faqDescription?.trim() || ui.faqDescription;
  const faqSupportLabel = service.faqSupportLabel?.trim() || ui.contentControl;
  const faqSupportDescription = service.faqSupportDescription?.trim() || ui.contentControlDescription;

  if (!service.faqs.length) return null;

  return (
    <section className="mt-section-gap-xl border-t border-[#e0dee3] bg-page pt-section-y lg:mt-section-gap-xl lg:pt-section-y-xl" id="service-faq" aria-labelledby="service-faq-title">
      <div className="grid gap-section-gap lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-section-gap-xl">
        <div>
          <p className="text-overline text-[#0055ff]">{faqEyebrow}</p>
          <h2 className="mt-cluster font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="service-faq-title">{faqTitle}</h2>
          <p className="mt-cluster max-w-[560px] text-body-lg text-muted">{faqDescription}</p>
          <p className="mt-section-gap-xl text-overline text-[#0055ff]">{faqSupportLabel}</p>
          <p className="mt-cluster-sm max-w-[460px] text-body-xs text-muted">{faqSupportDescription}</p>
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

export function ServiceContactSection({ service, contact }: { service: ServicePageContent; contact?: PublicContactSettings | null }) {
  const ui = serviceUi[service.locale ?? "en"];
  const contactEyebrow = service.contactEyebrow?.trim() || ui.readyEyebrow;
  const contactTitle = service.contactTitle?.trim() || ui.contactTitle;
  const contactDescription = service.contactDescription?.trim() || ui.contactDescription;
  const contactButtonLabel = service.contactButtonLabel?.trim() || ui.contactButton;
  const whatsappHref = serviceWhatsAppUrl(contact, `Hello Limex, I’d like to discuss ${service.title}.`);

  return (
    <section className="mt-section-gap-xl flex flex-col gap-section-gap-lg rounded-nav bg-navy px-card-pad py-section-y text-white lg:mt-section-gap-xl lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-section-y-xl" id="service-contact" aria-labelledby="service-contact-title">
      <div>
        <p className="text-overline text-brand-cyan">{contactEyebrow}</p>
        <h2 className="mt-cluster max-w-[760px] font-brand text-page-title max-lg:text-page-title-mobile" id="service-contact-title">{contactTitle}</h2>
        <p className="mt-cluster max-w-[680px] text-body-sm text-[#c7cfe0]">{contactDescription} {service.title.toLowerCase()}.</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
        <ContactModal serviceKey={service.serviceKey ?? service.title} initialMessage={`I’m interested in ${service.title}.`} variant="white" buttonClassName="min-h-button-lg min-w-[218px] justify-center text-body-xs" buttonLabel={contactButtonLabel} />
        {whatsappHref ? <a className="inline-flex min-h-button-lg min-w-[218px] items-center justify-center gap-2 rounded-pill border border-white/35 px-4 text-button font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white/60 focus-visible:outline-offset-3" href={whatsappHref} target="_blank" rel="noreferrer"><img className="size-4" src="/figma/whatsapp-dot.svg" alt="" aria-hidden="true" />{ui.whatsappNow}<span aria-hidden="true">↗</span></a> : null}
      </div>
    </section>
  );
}
