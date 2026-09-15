"use client";

import { useEffect, useState } from "react";

import type {
  ServicePageContent,
  ServicePriceTier,
  ServiceRelatedOption,
} from "./service-page-data";
import type { PublicContactSettings } from "@/lib/contact-types";
import { getPublicContactSettings } from "@/lib/contact-api";
import { getTool, toolHref } from "@/lib/business-tools";
import { ContactModal } from "./contact-section";
import { ToolWorkspace } from "./tool-workspace";
import { ActionButton, Breadcrumbs, WaveLabel } from "./ui";
import { blogRichTextClass } from "./blog-rich-text";
import { SanitizedRichText } from "./sanitized-rich-text";

function externalLinkProps(href: string) {
  return /^https?:\/\//i.test(href)
    ? { target: "_blank" as const, rel: "noreferrer" }
    : {};
}

function serviceWhatsAppUrl(
  contact: PublicContactSettings | null | undefined,
  message: string,
) {
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
    mediaSlot: "Media slot",
    optionalMedia: "Optional CMS media",
    startingPrice: "Starting price",
    deliveryTime: "Delivery time",
    serviceMode: "Service mode",
    keyFacts: "Key facts",
    relatedOptions: "Related options",
    relatedOptionsTitle: "Explore related services & options",
    relatedOptionsDescription:
      "Complementary filings, legal protections, and licenses commonly needed alongside this service.",
    exploreOption: "Explore service",
    helpfulTools: "Helpful tools",
    pricingEyebrow: "Optional / pricing",
    pricingTitle: "Show the right price for this service",
    pricingDescription:
      "Use a starting price, package cards or a custom quote depending on the scope.",
    mostPopular: "Most popular",
    faqEyebrow: "Optional / FAQ",
    faqTitle: "Common questions",
    faqDescription: "A few clear answers before you choose the next step.",
    contentControl: "Content control",
    contentControlDescription:
      "Questions can be added, removed and reordered as the service grows.",
    readyEyebrow: "Ready when you are",
    contactTitle: "Need help choosing the right option?",
    contactDescription:
      "A short conversation is enough to recommend the right path for",
    contactButton: "Talk to an advisor",
    bookNow: "Book now",
    whatsappNow: "Discuss on WhatsApp",
    directPhone: "Call directly",
    directEmail: "Email our team",
    guarantee1Title: "Zero Hidden Charges",
    guarantee1Desc:
      "100% transparent government fees and fixed service rates upfront.",
    guarantee2Title: "Official Documentation",
    guarantee2Desc:
      "Verified original certificates, registration numbers & sealed chalans.",
    guarantee3Title: "Dedicated Dhaka Advisor",
    guarantee3Desc:
      "One-on-one expert guidance in Dhaka from document filing to delivery.",
    responseTime: "Typical response within 2 business hours (10 AM – 7 PM BST)",
    bottomReassurance:
      "Zero hidden charges · Original government receipts · Typical response within 2 business hours",
    preferChat: "Prefer instant messaging?",
    formEyebrow: "Direct Service Enquiry",
    formTitle: "Get started today",
    formDescription:
      "Leave your details and requirements. Our corporate desk will follow up promptly.",
    formSubmitLabel: "Submit enquiry",
  },
  bn: {
    mediaSlot: "মিডিয়া স্লট",
    optionalMedia: "ঐচ্ছিক CMS মিডিয়া",
    startingPrice: "প্রাথমিক মূল্য",
    deliveryTime: "সময় লাগতে পারে",
    serviceMode: "সেবার মাধ্যম",
    keyFacts: "গুরুত্বপূর্ণ তথ্য",
    relatedOptions: "সম্পর্কিত সেবা",
    relatedOptionsTitle: "প্রাসঙ্গিক সেবা ও অপশনসমূহ",
    relatedOptionsDescription:
      "আপনার ব্যবসার জন্য প্রয়োজনীয় অন্যান্য সংশ্লিষ্ট লাইসেন্স ও আইনি সেবা।",
    exploreOption: "সেবাটি দেখুন",
    helpfulTools: "সহায়ক টুল",
    pricingEyebrow: "ঐচ্ছিক / মূল্য",
    pricingTitle: "এই সেবার জন্য সঠিক মূল্য নির্ধারণ করুন",
    pricingDescription:
      "কাজের পরিধি অনুযায়ী প্রাথমিক মূল্য, প্যাকেজ বা কাস্টম কোট ব্যবহার করুন।",
    mostPopular: "জনপ্রিয় প্যাকেজ",
    faqEyebrow: "ঐচ্ছিক / প্রশ্নোত্তর",
    faqTitle: "সাধারণ প্রশ্ন",
    faqDescription: "পরবর্তী ধাপ বেছে নেওয়ার আগে কয়েকটি পরিষ্কার উত্তর।",
    contentControl: "কনটেন্ট নিয়ন্ত্রণ",
    contentControlDescription:
      "সেবা বাড়ার সঙ্গে প্রশ্ন যোগ, বাদ ও সাজানো যাবে।",
    readyEyebrow: "আপনি প্রস্তুত হলে",
    contactTitle: "সঠিক সেবা বেছে নিতে সাহায্য চান?",
    contactDescription:
      "আপনার জন্য উপযুক্ত পথ ঠিক করতে একটি সংক্ষিপ্ত কথোপকথনই যথেষ্ট—",
    contactButton: "পরামর্শ নিন",
    bookNow: "এখনই বুক করুন",
    whatsappNow: "WhatsApp-এ আলোচনা করুন",
    directPhone: "সরাসরি কল করুন",
    directEmail: "ইমেইল পাঠান",
    guarantee1Title: "কোনো লুকানো চার্জ নেই",
    guarantee1Desc: "১০০% স্বচ্ছ সরকারি চালান এবং নির্ধারিত সার্ভিস ফি হিসাব।",
    guarantee2Title: "অফিসিয়াল ডকুমেন্টস",
    guarantee2Desc:
      "মূল যাচাইকৃত সার্টিফিকেট, লাইসেন্স নম্বর ও সিলমোহরযুক্ত চালান।",
    guarantee3Title: "ডেডিকেটেড পরামর্শক",
    guarantee3Desc:
      "আবেদন থেকে ডেলিভারি পর্যন্ত ঢাকায় আপনার ফাইলে সার্বক্ষণিক সহযোগিতা।",
    responseTime:
      "সাধারণত ২ কার্যঘন্টার মধ্যে উত্তর দেওয়া হয় (সকাল ১০টা – সন্ধ্যা ৭টা BST)",
    bottomReassurance:
      "কোনো লুকানো চার্জ নেই · মূল সরকারি চালান · সাধারণত ২ কার্যঘন্টার মধ্যে উত্তর দেওয়া হয়",
    preferChat: "সরাসরি চ্যাট করতে চান?",
    formEyebrow: "সরাসরি আবেদন",
    formTitle: "আজই শুরু করুন",
    formDescription:
      "আপনার ব্যবসার তথ্য ও প্রয়োজনীয়তা জানান। আমাদের দল দ্রুত যোগাযোগ করবে।",
    formSubmitLabel: "আবেদন পাঠান",
  },
} as const;

const richTextClass = blogRichTextClass;

function RichTextContent({
  id,
  html,
  fallback,
  className = richTextClass,
}: {
  id?: string;
  html?: string;
  fallback: string;
  className?: string;
}) {
  return (
    <SanitizedRichText
      id={id}
      html={html}
      fallback={fallback}
      className={
        className.includes("blog-rich-text")
          ? className
          : `blog-rich-text ${className}`
      }
    />
  );
}

export function ServiceHeroSection({
  service,
}: {
  service: ServicePageContent;
}) {
  const locale = service.locale ?? "en";
  const ui = serviceUi[locale];
  const breadcrumbItems =
    service.breadcrumbItems ??
    service.breadcrumb
      .split(/\s*\/\s*/)
      .filter(Boolean)
      .map((label, index, labels) => ({
        label: label.trim(),
        href:
          index === 0
            ? "/"
            : index < labels.length - 1
              ? locale === "bn"
                ? "/bn/services"
                : "/services"
              : undefined,
      }));

  return (
    <section
      className="bg-page py-cluster-sm lg:py-cluster"
      aria-labelledby="service-page-title"
    >
      <Breadcrumbs items={breadcrumbItems} />
      <div className="mt-section-gap-lg grid gap-section-gap lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-section-gap-xl">
        <div className="min-w-0">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
              {service.category}
            </span>
          </div>
          <h1
            className="max-w-[690px] font-brand text-[32px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-page-title-mobile lg:text-page-title"
            id="service-page-title"
          >
            {service.title}
          </h1>
          <p className="mt-3.5 max-w-[620px] text-body leading-[1.6] text-muted sm:text-body-lg">
            {service.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-cluster sm:mt-8">
            <ContactModal
              serviceKey={service.serviceKey ?? service.title}
              serviceSlug={service.slug}
              initialMessage={
                locale === "bn"
                  ? `আমি ${service.title} সংক্রান্ত সেবা নিতে আগ্রহী।`
                  : `Hello, I'd like to discuss ${service.title}.`
              }
              variant="dark"
              arrow="cta"
              buttonClassName="min-h-button-lg w-full justify-between pl-5 text-body-xs shadow-[0_4px_14px_rgba(0,85,255,0.18)] sm:w-[188px]"
              buttonLabel={service.ctaLabel}
            />
            {service.destination &&
            service.destination.type !== "DETAIL" &&
            service.destination.type !== "CONTACT" ? (
              <a
                className="inline-flex min-h-control w-full items-center justify-center gap-cluster-sm rounded-full border border-[#d8d3c7] bg-page px-5 text-button font-semibold text-ink transition-all hover:border-[#0055ff] hover:text-[#0055ff] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:w-auto"
                href={service.destination.href}
                target={service.destination.isExternal ? "_blank" : undefined}
                rel={service.destination.isExternal ? "noreferrer" : undefined}
              >
                {service.destination.label}
                <span className="text-pink" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : null}
          </div>

          <dl className="mt-7 grid max-w-[650px] grid-cols-1 gap-2 rounded-[20px] border border-[#d8d3c7] bg-page p-2.5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#d8d3c7] sm:p-5">
            <div className="flex items-center justify-between rounded-[12px] border border-[#d8d3c7]/60 px-4 py-3 sm:block sm:rounded-none sm:border-0 sm:px-4 sm:py-0 sm:first:pl-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
                {ui.startingPrice}
              </dt>
              <dd className="text-[15px] font-bold tracking-tight text-ink sm:mt-1 sm:text-[17px]">
                {service.startingPrice}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[#d8d3c7]/60 px-4 py-3 sm:block sm:rounded-none sm:border-0 sm:px-4 sm:py-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
                {ui.deliveryTime}
              </dt>
              <dd className="text-[15px] font-bold tracking-tight text-ink sm:mt-1 sm:text-[17px]">
                {service.deliveryTime}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[#d8d3c7]/60 px-4 py-3 sm:block sm:rounded-none sm:border-0 sm:px-4 sm:py-0 sm:last:pr-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
                {ui.serviceMode}
              </dt>
              <dd className="text-[15px] font-bold tracking-tight text-ink sm:mt-1 sm:text-[17px]">
                {service.serviceMode}
              </dd>
            </div>
          </dl>
        </div>

        <div
          className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-[#d8d3c7] bg-gradient-to-br from-[#f2efe9] via-[#ebe8e1] to-[#e5e1d9] shadow-[0_12px_40px_rgba(7,27,61,0.04)] sm:min-h-[380px]"
          aria-label={service.mediaTitle}
        >
          {service.mediaUrl?.trim() ? (
            <img
              className="absolute inset-0 size-full object-cover"
              src={service.mediaUrl}
              alt={service.mediaAlt || service.mediaTitle}
            />
          ) : null}
          <img
            className={`absolute -right-6 -top-8 size-[180px] animate-hero-float motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()}
            src="/figma/warm-glow.svg"
            alt=""
            aria-hidden="true"
          />
          <img
            className={`absolute bottom-[-10px] left-[-20px] size-[150px] animate-hero-float-reverse motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()}
            src="/figma/cool-glow.svg"
            alt=""
            aria-hidden="true"
          />
          <img
            className={`absolute bottom-[-30px] right-[-10px] size-[115px] animate-hero-float-slow motion-reduce:animate-none ${service.mediaUrl?.trim() ? "opacity-25" : ""}`.trim()}
            src="/figma/center-glow.svg"
            alt=""
            aria-hidden="true"
          />
          {!service.mediaUrl?.trim() ? (
            <span className="absolute left-6 top-5 inline-flex items-center gap-1.5 rounded-full border border-[#d8d3c7] bg-page/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff] shadow-sm backdrop-blur-sm">
              {ui.mediaSlot}
            </span>
          ) : null}
          <div
            className={`absolute left-1/2 top-1/2 w-[calc(100%-32px)] sm:w-[min(340px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[#d8d3c7] p-5 sm:p-6 shadow-[0_16px_36px_rgba(7,27,61,0.06)] backdrop-blur-md ${service.mediaUrl?.trim() ? "bg-navy/85 text-white" : "bg-page/95 text-ink"}`.trim()}
          >
            <h2
              className={`font-brand text-[20px] sm:text-[22px] font-bold leading-[1.2] tracking-tight ${service.mediaUrl?.trim() ? "text-white" : "text-ink"}`.trim()}
            >
              {service.mediaTitle}
            </h2>
            <p
              className={`mt-2 text-[13px] sm:text-body-xs leading-relaxed ${service.mediaUrl?.trim() ? "text-white/75" : "text-muted"}`.trim()}
            >
              {service.mediaDescription}
            </p>
          </div>
          {!service.mediaUrl?.trim() ? (
            <p className="absolute bottom-4 right-6 text-[11px] font-semibold text-muted/80">
              {ui.optionalMedia}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ServiceOverviewSection({
  service,
}: {
  service: ServicePageContent;
}) {
  const ui = serviceUi[service.locale ?? "en"];
  const overviewHtml = service.overviewHtml?.trim();
  const keyFactsLabel = service.keyFactsLabel?.trim() || ui.keyFacts;
  const relatedOptionsEyebrow =
    service.relatedOptionsLabel?.trim() || ui.relatedOptions;
  const relatedOptionsTitle =
    service.relatedOptionsTitle?.trim() || ui.relatedOptionsTitle;
  const relatedOptionsDescription =
    service.relatedOptionsDescription?.trim() || ui.relatedOptionsDescription;
  const resolvedRelatedOptions: ServiceRelatedOption[] =
    service.relatedOptions && service.relatedOptions.length > 0
      ? service.relatedOptions
      : service.relatedLinks && service.relatedLinks.length > 0
        ? service.relatedLinks.map((link) => ({
            title: link.label,
            description: link.description || "",
            href: link.href,
            icon: link.icon || "briefcase",
            actionLabel: ui.exploreOption,
            badge: undefined,
          }))
        : [];
  const toolsEyebrow = service.toolsEyebrow?.trim() || ui.helpfulTools;
  const toolsTitle =
    service.toolsTitle?.trim() || "Keep the next step close at hand.";
  const toolsDescription =
    service.toolsDescription?.trim() ||
    "Link a calculator or document builder that helps customers move forward.";
  const helpfulTools = (service.tools ?? []).flatMap((slug) => {
    const tool = getTool(slug);
    return tool ? [tool] : [];
  });
  const calculatorTools = helpfulTools.filter(
    (tool) => tool.group === "calculator",
  );
  const builderTools = helpfulTools.filter((tool) => tool.group === "builder");

  return (
    <section
      className="mt-12 border-t border-[#e5e0d6] bg-page pt-10 lg:mt-20 lg:pt-16"
      id="service-overview"
      aria-labelledby="service-overview-title"
    >
      <div
        className={`grid gap-8 ${service.facts.length ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)] lg:gap-12 lg:items-start" : ""}`.trim()}
      >
        <div className="min-w-0">
          {overviewHtml ? (
            <RichTextContent
              id="service-overview-title"
              html={overviewHtml}
              fallback=""
              className={blogRichTextClass}
            />
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                {service.overviewEyebrow}
              </span>
              <h2
                className="mt-3 max-w-[760px] font-brand text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-page-title-mobile lg:text-page-title"
                id="service-overview-title"
              >
                {service.overviewTitle}
              </h2>
              <RichTextContent
                html={service.overviewDescriptionHtml}
                fallback={service.overviewDescription}
                className={`${richTextClass} mt-4 max-w-[720px]`}
              />

              <article className="mt-8 rounded-[20px] border border-[#d8d3c7] bg-page p-6 sm:p-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                  {service.contentLabel}
                </span>
                <h3 className="mt-2 font-brand text-[22px] font-bold text-ink">
                  {service.contentTitle}
                </h3>
                <RichTextContent
                  html={service.contentDescriptionHtml}
                  fallback={service.contentDescription}
                  className={`${richTextClass} mt-3 max-w-[680px] text-body-sm`}
                />
              </article>

              {service.benefits?.length ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <div
                      className="flex items-start gap-3 rounded-[16px] border border-[#d8d3c7] bg-page p-4"
                      key={benefit}
                    >
                      <span
                        className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0055ff]/10 text-[#0055ff]"
                        aria-hidden="true"
                      >
                        <svg
                          className="size-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="text-body-sm font-medium text-ink">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {service.steps?.length ? (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {service.steps.map((step, index) => (
                    <div
                      className="rounded-[18px] border border-[#d8d3c7] bg-page p-5"
                      key={`${step.title}-${index}`}
                    >
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#0055ff]/10 text-xs font-bold text-[#0055ff]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-3 font-brand text-[17px] font-bold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-body-xs leading-relaxed text-muted">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        {service.facts.length ? (
          <aside
            className="lg:sticky lg:top-24 h-fit"
            aria-label="Service key facts"
          >
            <div className="rounded-[22px] border border-[#d8d3c7] bg-page p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full bg-[#0055ff]"
                  aria-hidden="true"
                />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                  {keyFactsLabel}
                </p>
              </div>
              <dl className="mt-4 divide-y divide-[#d8d3c7]/60">
                {service.facts.map((fact) => (
                  <div
                    className="flex items-baseline justify-between gap-3 py-3"
                    key={fact.label}
                  >
                    <dt className="pr-2 text-[13px] font-medium text-[#53657b]">
                      {fact.label}
                    </dt>
                    <dd className="max-w-[55%] shrink-0 break-words text-right text-[14px] font-bold text-ink">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        ) : null}
      </div>

      {resolvedRelatedOptions.length ? (
        <div className="mt-12 border-t border-[#d8d3c7] pt-8 lg:mt-16 lg:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                {relatedOptionsEyebrow}
              </p>
              <h3 className="mt-2 font-brand text-[24px] font-bold text-ink sm:text-[28px] lg:text-section-title">
                {relatedOptionsTitle}
              </h3>
            </div>
            <span className="rounded-full border border-[#d8d3c7] bg-page px-3 py-1 text-xs font-bold text-muted">
              {resolvedRelatedOptions.length}{" "}
              {resolvedRelatedOptions.length === 1
                ? service.locale === "bn"
                  ? "টি অপশন"
                  : "option"
                : service.locale === "bn"
                  ? "টি অপশন"
                  : "options"}
            </span>
          </div>
          {relatedOptionsDescription ? (
            <p className="mt-2.5 max-w-[860px] text-body-sm text-muted">
              {relatedOptionsDescription}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {resolvedRelatedOptions.map((option, idx) => {
              const actionText = option.actionLabel?.trim() || ui.exploreOption;

              return (
                <a
                  className="group relative flex flex-col justify-between rounded-[20px] border border-[#ded9cf] bg-page p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#0055ff] hover:shadow-[0_12px_24px_rgba(7,27,61,0.06)] sm:p-5"
                  href={option.href}
                  key={`related-opt-${idx}-${option.title}`}
                  {...externalLinkProps(option.href)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="flex min-w-0 items-start gap-2.5 font-brand text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-[#0055ff] sm:text-[16px]">
                        <span
                          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0055ff]/10 text-[11px] font-bold tabular-nums text-[#0055ff] transition-colors group-hover:bg-[#0055ff]/15"
                          aria-hidden="true"
                        >
                          {idx + 1}
                        </span>
                        <span>{option.title}</span>
                      </h4>
                      {option.badge ? (
                        <span className="rounded-full border border-[#dcd7cc] bg-page/90 px-2.5 py-0.5 text-[10px] font-semibold text-muted sm:text-[11px]">
                          {option.badge}
                        </span>
                      ) : null}
                    </div>

                    {option.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted sm:text-[12.5px]">
                        {option.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-1">
                    <span className="inline-flex w-fit items-center gap-1.5 px-0 text-[11px] font-semibold text-ink transition-colors group-hover:text-[#0055ff] sm:text-xs">
                      <span>{actionText}</span>
                      <span
                        className="text-[13px] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {helpfulTools.length ? (
        <div className="mt-12 border-t border-[#e5e0d6] pt-8 lg:mt-16 lg:pt-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                {toolsEyebrow}
              </p>
              <h3 className="mt-2 font-brand text-[24px] font-bold text-ink lg:text-section-title">
                {toolsTitle}
              </h3>
            </div>
            <span className="rounded-full border border-[#d8d3c7] bg-page px-3 py-1 text-xs font-bold text-muted">
              {helpfulTools.length}{" "}
              {helpfulTools.length === 1 ? "tool" : "tools"}
            </span>
          </div>
          <p className="mt-2.5 max-w-[860px] text-body-sm text-muted">
            {toolsDescription}
          </p>
          {calculatorTools.length ? (
            <div className="mt-8 w-full space-y-8">
              {calculatorTools.map((tool) => (
                <ToolWorkspace embedded key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : null}
          {builderTools.length ? (
            <div className={calculatorTools.length ? "mt-10" : "mt-8"}>
              {calculatorTools.length ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
                  {service.locale === "bn"
                    ? "ডকুমেন্ট বিল্ডার"
                    : "Document builders"}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {builderTools.map((tool) => (
                  <a
                    className="group flex min-w-0 items-center justify-between gap-4 rounded-[18px] border border-[#d8d3c7] bg-page p-4 transition-all hover:-translate-y-0.5 hover:border-[#0055ff]/40 sm:rounded-[20px] sm:p-5"
                    href={toolHref(tool.slug)}
                    key={tool.slug}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body-xs font-bold text-ink group-hover:text-pink">
                        {tool.title}
                      </span>
                      <span className="mt-1 block truncate text-[12px] text-muted">
                        {tool.description}
                      </span>
                    </span>
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f6f4ee] text-xs font-bold text-pink transition-colors group-hover:bg-[#0055ff] group-hover:text-white"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
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

function PriceCard({
  tier,
  locale,
  serviceTitle,
  serviceKey,
  contact,
  mostPopularLabel,
}: {
  tier: ServicePriceTier;
  locale: "en" | "bn";
  serviceTitle: string;
  serviceKey?: string;
  contact?: PublicContactSettings | null;
  mostPopularLabel: string;
}) {
  const ui = serviceUi[locale];
  const whatsappHref = serviceWhatsAppUrl(
    contact,
    `Hello Limex, I’d like to discuss ${serviceTitle}${tier.name ? ` · ${tier.name}` : ""}.`,
  );

  return (
    <article
      className={`relative flex min-h-[320px] flex-col rounded-[24px] p-6 sm:p-7 transition-all ${
        tier.featured
          ? "border-2 border-[#0055ff] bg-page shadow-[0_12px_32px_rgba(0,85,255,0.06)]"
          : "border border-[#d8d3c7] bg-page hover:border-[#b8b2a4]"
      }`.trim()}
    >
      {tier.featured ? (
        <WaveLabel className="absolute left-6 top-5 text-[#0055ff]">
          {mostPopularLabel}
        </WaveLabel>
      ) : null}
      <p
        className={`text-body font-bold ${tier.featured ? "mt-7 text-[#0055ff]" : "text-[#53657b]"}`.trim()}
      >
        {tier.name}
      </p>
      <p className="mt-2 font-brand text-[28px] font-bold text-ink sm:text-section-title">
        {tier.price}
      </p>
      <p className="mt-2 text-body-xs leading-relaxed text-muted">
        {tier.description}
      </p>
      <ul className="mt-6 flex flex-col gap-3 p-0">
        {tier.features.map((feature) => (
          <li
            className="flex items-center gap-2.5 text-footer font-medium text-ink"
            key={feature}
          >
            <svg
              className={`size-4 shrink-0 ${tier.featured ? "text-[#0055ff]" : "text-[#64748b]"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto grid gap-2.5 pt-6">
        <ContactModal
          serviceKey={serviceKey ?? serviceTitle}
          initialMessage={`I’m interested in ${serviceTitle}${tier.name ? ` · ${tier.name}` : ""}.`}
          variant={tier.featured ? "dark" : "soft"}
          buttonClassName="min-h-[46px] w-full justify-center rounded-full px-4 text-xs font-bold shadow-sm"
          buttonLabel={tier.action || ui.bookNow}
        />
        {whatsappHref ? (
          <a
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#008cff]/30 bg-[#f0f7ff] px-4 text-xs font-bold text-[#006dce] transition-colors hover:bg-[#e0efff] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="size-4 shrink-0"
              src="/figma/whatsapp-dot.svg"
              alt=""
              aria-hidden="true"
            />
            <span className="truncate">
              {tier.whatsappLabel || ui.whatsappNow}
            </span>
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function ServicePricingSection({
  service,
  contact,
}: {
  service: ServicePageContent;
  contact?: PublicContactSettings | null;
}) {
  if (!service.pricing.length) return null;
  const locale = service.locale ?? "en";
  const ui = serviceUi[locale];
  const pricingEyebrow = service.pricingEyebrow?.trim() || ui.pricingEyebrow;
  const pricingTitle = service.pricingTitle?.trim() || ui.pricingTitle;
  const pricingDescription =
    service.pricingDescription?.trim() || ui.pricingDescription;
  const mostPopularLabel = service.mostPopularLabel?.trim() || ui.mostPopular;

  return (
    <section
      className="mt-12 border-t border-[#e5e0d6] bg-page pt-10 lg:mt-20 lg:pt-16"
      id="pricing"
      aria-labelledby="service-pricing-title"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
        {pricingEyebrow}
      </span>
      <h2
        className="mt-3 max-w-[760px] font-brand text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-page-title-mobile lg:text-page-title"
        id="service-pricing-title"
      >
        {pricingTitle}
      </h2>
      <p className="mt-3 max-w-[640px] text-body leading-relaxed text-muted sm:text-body-lg">
        {pricingDescription}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {service.pricing.map((tier) => (
          <PriceCard
            key={tier.name}
            tier={tier}
            locale={locale}
            serviceTitle={service.title}
            serviceKey={service.serviceKey}
            contact={contact}
            mostPopularLabel={mostPopularLabel}
          />
        ))}
      </div>
    </section>
  );
}

export function ServiceFaqSection({
  service,
}: {
  service: ServicePageContent;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ui = serviceUi[service.locale ?? "en"];
  const faqEyebrow = service.faqEyebrow?.trim() || ui.faqEyebrow;
  const faqTitle = service.faqTitle?.trim() || ui.faqTitle;
  const faqDescription = service.faqDescription?.trim() || ui.faqDescription;
  const faqSupportLabel = service.faqSupportLabel?.trim() || ui.contentControl;
  const faqSupportDescription =
    service.faqSupportDescription?.trim() || ui.contentControlDescription;

  if (!service.faqs.length) return null;

  return (
    <section
      className="mt-12 border-t border-[#e5e0d6] bg-page pt-10 lg:mt-20 lg:pt-16"
      id="service-faq"
      aria-labelledby="service-faq-title"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:items-start">
        <div className="lg:sticky lg:top-24 h-fit">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
            {faqEyebrow}
          </span>
          <h2
            className="mt-3 font-brand text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-page-title-mobile lg:text-page-title"
            id="service-faq-title"
          >
            {faqTitle}
          </h2>
          <p className="mt-3 max-w-[520px] text-body leading-relaxed text-muted sm:text-body-lg">
            {faqDescription}
          </p>
          <div className="mt-8 rounded-[20px] border border-[#d8d3c7] bg-page p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
              {faqSupportLabel}
            </p>
            <p className="mt-1.5 text-body-xs leading-relaxed text-muted">
              {faqSupportDescription}
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {service.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `service-faq-answer-${index}`;

            return (
              <div
                className="rounded-[20px] border border-[#d8d3c7] bg-page p-5 transition-colors hover:border-[#b8b2a4]"
                key={faq.question}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-0 text-left font-brand text-[17px] font-bold text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="leading-snug">{faq.question}</span>
                  <span
                    className={`inline-grid size-8 shrink-0 place-items-center rounded-full text-[18px] font-medium transition-all duration-200 ${isOpen ? "bg-[#0055ff] text-white rotate-45 shadow-sm" : "border border-[#d8d3c7] bg-page text-[#53657b]"}`.trim()}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden text-[14.5px] leading-[1.65] text-[#53657b] transition-[grid-template-rows,padding] duration-[220ms] ${isOpen ? "grid-rows-[1fr] pt-3.5 mt-3.5 border-t border-[#d8d3c7]/60" : "grid-rows-[0fr]"}`.trim()}
                  id={answerId}
                  role="region"
                >
                  <div className="min-h-0 overflow-hidden">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServiceContactSection({
  service,
  contact,
}: {
  service: ServicePageContent;
  contact?: PublicContactSettings | null;
}) {
  const [contactDetails, setContactDetails] =
    useState<PublicContactSettings | null>(contact ?? null);

  useEffect(() => {
    if (contact) {
      setContactDetails(contact);
      return;
    }
    let cancelled = false;
    void getPublicContactSettings()
      .then((settings) => {
        if (!cancelled) setContactDetails(settings);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contact]);

  const locale = service.locale ?? "en";
  const ui = serviceUi[locale];
  const contactEyebrow = service.contactEyebrow?.trim() || ui.readyEyebrow;
  const contactTitle = service.contactTitle?.trim() || ui.contactTitle;
  const contactDescription =
    service.contactDescription?.trim() || ui.contactDescription;
  const contactButtonLabel =
    service.contactButtonLabel?.trim() || ui.contactButton;

  const whatsappHref = serviceWhatsAppUrl(
    contactDetails,
    `Hello Limex, I’d like to discuss ${service.title}.`,
  );

  return (
    <section
      className="relative mt-12 scroll-mt-24 rounded-[24px] border border-[#d8d3c7] bg-page p-6 sm:rounded-[28px] sm:p-10 lg:mt-20 lg:p-12"
      id="service-contact"
      aria-labelledby="service-contact-title"
    >
      <span
        id="contact"
        className="relative -top-28 block pointer-events-none"
        aria-hidden="true"
      />
      <div className="mx-auto flex max-w-[680px] flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">
          {contactEyebrow}
        </span>
        <h2
          className="mt-3.5 font-brand text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] lg:text-[36px]"
          id="service-contact-title"
        >
          {contactTitle}
        </h2>
        <p className="mt-3 text-body leading-relaxed text-muted sm:text-body-lg">
          {contactDescription}{" "}
          <strong className="font-semibold text-ink">
            {service.title.toLowerCase()}
          </strong>
          .
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ContactModal
            serviceKey={service.serviceKey ?? service.title}
            serviceSlug={service.slug}
            initialMessage={
              locale === "bn"
                ? `আমি ${service.title} সংক্রান্ত সেবা নিতে আগ্রহী।`
                : `Hello, I'd like to discuss ${service.title}.`
            }
            variant="dark"
            arrow="cta"
            buttonClassName="min-h-button-lg w-full justify-between pl-6 pr-5 text-body-xs shadow-[0_4px_14px_rgba(0,85,255,0.18)] sm:w-auto sm:min-w-[200px]"
            buttonLabel={contactButtonLabel}
          />
          {whatsappHref ? (
            <a
              className="inline-flex min-h-button-lg w-full items-center justify-center gap-2 rounded-full border border-[#d8d3c7] bg-page px-5 text-body-xs font-semibold text-ink transition-colors hover:border-[#0055ff] hover:text-[#0055ff] sm:w-auto"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="size-4"
                src="/figma/whatsapp-dot.svg"
                alt=""
                aria-hidden="true"
              />
              <span>{ui.whatsappNow}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>

        <p className="mt-5 text-[13px] leading-relaxed text-muted">
          {ui.bottomReassurance}
        </p>
      </div>
    </section>
  );
}
