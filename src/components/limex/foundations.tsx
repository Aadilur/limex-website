"use client";

import { processSteps } from "./data";
import { clientTextClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { ClientsContent, MetricsContent, ProcessContent } from "@/lib/landing-types";

function ClientLogoSet({ logos, duplicate = false }: { logos: ClientsContent["logos"]; duplicate?: boolean }) {
function ClientLogoSet({
  logos,
  duplicate = false,
}: {
  logos: ClientsContent["logos"];
  duplicate?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 gap-cluster-lg pr-cluster-lg motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0 ${duplicate ? "motion-reduce:hidden" : ""}`.trim()}
      className={`flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0 ${duplicate ? "motion-reduce:hidden" : ""}`.trim()}
      aria-hidden={duplicate ? "true" : undefined}
    >
      {logos.filter((logo) => logo.isVisible).map((client) => (
        <div className="flex h-9 w-[128px] shrink-0 items-center gap-cluster-xs overflow-hidden whitespace-nowrap text-body-xs font-display wide:text-body-sm" style={{ color: client.textColor || clientTextClasses[client.name] }} key={`${duplicate ? "copy" : "original"}-${client.id}`}>
          <span className="flex h-8 shrink-0 items-center overflow-hidden">
            {client.logoUrl ? <img className="h-7 w-auto object-contain" src={client.logoUrl} alt="" aria-hidden="true" /> : <span className="text-[10px] font-bold tracking-[0.04em]">{client.name.slice(0, 2).toUpperCase()}</span>}
          </span>
          <span>{client.name}</span>
        </div>
      ))}
      {logos
        .filter((logo) => logo.isVisible)
        .map((client) => {
          const textColor =
            client.textColor ||
            (client.name ? clientTextClasses[client.name] : undefined) ||
            "#071b3d";

          return (
            <div
              className="flex h-9 w-auto shrink-0 items-center gap-2 whitespace-nowrap text-body-xs font-display wide:text-body-sm"
              style={{ color: textColor }}
              key={`${duplicate ? "copy" : "original"}-${client.id}`}
            >
              {client.logoUrl ? (
                <span className="flex h-8 shrink-0 items-center">
                  <img
                    className="h-7 w-auto max-h-7 max-w-[160px] object-contain"
                    src={client.logoUrl}
                    alt={client.name || "Client logo"}
                    aria-hidden={!client.name}
                  />
                </span>
              ) : client.name ? (
                <span className="flex h-8 shrink-0 items-center">
                  <span className="grid size-7 place-items-center rounded-md bg-[#071b3d]/5 text-[10px] font-bold tracking-[0.04em]">
                    {(client.name || "?").slice(0, 2).toUpperCase()}
                  </span>
                </span>
              ) : null}
              {client.name ? (
                <span className="font-medium tracking-tight">
                  {client.name}
                </span>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}

export function TrustedClientsSection({ content = defaultLandingContent.clients }: { content?: ClientsContent }) {
  return (
    <section className="relative flex min-w-0 flex-col bg-page px-page-gutter py-5 lg:rounded-panel lg:px-page-gutter-lg lg:py-5" aria-labelledby="clients-title">
      <div className="flex shrink-0 min-w-0 flex-col gap-cluster">
        <h2 className="shrink-0 text-center font-brand text-heading-mobile font-bold text-[#2b5e8c] lg:text-heading" id="clients-title">{content.title}</h2>
        <div className="relative flex min-h-0 items-end overflow-hidden px-0.5 pb-1" aria-label="Our clients">
          <div className="flex w-max motion-safe:animate-client-marquee motion-reduce:w-full motion-reduce:animate-none [will-change:transform]">
            <ClientLogoSet logos={content.logos} />
            <ClientLogoSet logos={content.logos} duplicate />
            <ClientLogoSet logos={content.logos} duplicate />
          </div>
          <span className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-page to-transparent" aria-hidden="true" />
          <span className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-page to-transparent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export function TrustMetricsSection({ content = defaultLandingContent.metrics }: { content?: MetricsContent }) {
  const metrics = content.items.filter((item) => item.isVisible);

  return (
    <section className="mt-clients-to-metrics border-t border-[#e0e0e3] bg-page px-page-gutter py-2 lg:mt-clients-to-metrics-lg lg:min-h-[96px] lg:px-page-gutter-xl lg:py-cluster-sm" aria-label="The Limex standard">
      <h2 className="sr-only">{content.title}</h2>
      <dl className="grid grid-cols-2 gap-x-cluster-lg gap-y-1 text-center lg:grid-cols-4 lg:gap-0">
        {metrics.map((metric, index) => (
          <div className={`flex min-h-[40px] flex-col items-center justify-center px-2 text-center ${index >= 2 ? "border-t border-[#e0e0e3] pt-2" : ""} ${index % 2 === 1 ? "border-l border-[#e0e0e3]" : ""} lg:min-h-[56px] lg:border-l lg:border-t-0 lg:px-cluster-lg lg:py-0 ${index === 0 ? "lg:border-l-0" : ""}`.trim()} key={metric.id}>
            <dt className="order-2 mt-0 text-micro text-[#616b7d] lg:mt-1">{metric.label}</dt>
            <dd className="order-1 font-brand text-subheading-mobile text-[#071b3d] lg:text-subheading">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HowItWorksSection({ content = defaultLandingContent.process }: { content?: ProcessContent }) {
  return (
    <section className="relative min-h-0 bg-page px-page-gutter py-8 pb-8 sm:px-page-gutter sm:py-section-y lg:rounded-panel lg:px-section-gutter-lg lg:py-section-y-xl lg:pb-section-y-lg" id="process" aria-labelledby="process-title">
      <SectionTitle
        id="process-title"
        title={content.title}
        description={content.description}
      />
      <div className="mt-section-gap-xl grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-cluster-lg">
        <div className="relative overflow-hidden rounded-[24px] border border-[#ddd9d1] bg-white/55 p-4 shadow-[0_2px_0_rgba(27,34,30,0.02)] sm:p-5 lg:p-6">
          <div className="pointer-events-none absolute bottom-[42px] left-[42px] top-[42px] w-px bg-gradient-to-b from-[#e4cfd8] via-[#d7d5df] to-transparent lg:bottom-auto lg:left-[12%] lg:right-[12%] lg:top-[52px] lg:h-px lg:w-auto lg:bg-gradient-to-r lg:from-[#e4cfd8] lg:via-[#d7d5df] lg:to-transparent" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-4 lg:gap-4">
            {content.items.filter((step) => step.isVisible).map((step) => (
              <article className="relative z-[1] flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center" key={step.id}>
                <div className="relative grid size-[52px] shrink-0 place-items-center lg:size-[56px]">
                  <img className="absolute inset-0 size-full" src="/figma/step-circle.svg" alt="" aria-hidden="true" />
                  <span className="relative text-button font-bold text-pink">{step.number}</span>
                </div>
                <div className="min-w-0 pt-0.5 lg:mt-6 lg:pt-0">
                  <h3 className="max-w-[220px] text-body-sm font-bold leading-snug text-ink lg:mx-auto lg:max-w-[170px]">{step.title}</h3>
                  <p className="mt-1 max-w-[300px] text-body-xs leading-relaxed text-[#575761] lg:mx-auto lg:max-w-[175px] lg:text-meta">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="relative isolate flex min-h-0 flex-col overflow-hidden rounded-[24px] bg-[#071b3d] p-5 text-white sm:p-6 lg:min-h-full lg:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full border border-white/[0.08]" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-3">
            <p className="text-overline text-[#a6b8eb]">{content.helperEyebrow}</p>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/[0.14] text-icon-action text-[#c4cfe5]" aria-hidden="true">↗</span>
          </div>
          <h3 className="relative mt-cluster-lg font-brand text-subheading">{content.helperTitle}</h3>
          <p className="relative mt-cluster-lg text-body-xs leading-relaxed text-[#c4cfe5]">{content.helperDescription}</p>
          <ActionButton href={content.helperCtaHref} variant="white" className="relative mt-6 min-h-12 w-full sm:w-max lg:mt-auto lg:w-full">{content.helperCtaLabel}</ActionButton>
        </aside>
      </div>
    </section>
  );
}
