"use client";

import { processSteps } from "./data";
import { clientTextClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

const clientMarks = [
  {
    name: "Northstar",
    marks: ["/figma/client-northstar-a.svg", "/figma/client-northstar-b.svg"],
  },
  {
    name: "Sage & Co.",
    marks: ["/figma/client-sage-a.svg", "/figma/client-sage-b.svg"],
  },
  { name: "Aster Labs", marks: ["/figma/client-aster.svg"] },
  { name: "BIZNEST", marks: [] },
  {
    name: "Civic",
    marks: ["/figma/client-civic-a.svg", "/figma/client-civic-b.svg"],
  },
  { name: "Morrow", marks: [] },
];

function ClientMark({ client }: { client: (typeof clientMarks)[number] }) {
  if (client.name === "BIZNEST") {
    return <span className="inline-flex size-6 rounded-[6px] bg-[#c79938] p-[7px]"><span className="size-2.5 rounded-[3px] bg-paper" /></span>;
  }

  if (client.name === "Morrow") {
    return (
      <span className="flex h-7 w-7 items-end gap-1">
        <i className="h-6 w-[5px] rounded-[3px] bg-[#5e578c]" />
        <i className="h-5 w-[5px] rounded-[3px] bg-[#5e578c]" />
        <i className="h-4 w-[5px] rounded-[3px] bg-[#5e578c]" />
      </span>
    );
  }

  const imageClasses = client.name === "Northstar"
    ? ["absolute left-0 top-1 size-6", "absolute left-1.5 top-2.5 size-3"]
    : client.name === "Sage & Co."
      ? ["absolute left-px top-1 h-[13px] w-[22px]", "absolute left-[9px] top-[13px] h-[13px] w-[22px]"]
      : client.name === "Civic"
        ? ["absolute left-0 top-1 size-6", "absolute left-2 top-3 size-2"]
        : ["absolute left-0 top-[5px] size-[22px]"];

  return (
    <span className="relative block size-8 shrink-0">
      {client.marks.map((mark, index) => <img className={`${imageClasses[index] ?? imageClasses[0]} block`} key={mark} src={mark} alt="" aria-hidden="true" />)}
      {client.name === "Aster Labs" ? <span className="absolute left-2 top-[3px] h-[30px] w-[6px] rounded-[3px] bg-[#a64a5c]" aria-hidden="true" /> : null}
    </span>
  );
}

function ClientLogoSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={`flex shrink-0 gap-cluster-lg pr-cluster-lg motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0 ${duplicate ? "motion-reduce:hidden" : ""}`.trim()}
      aria-hidden={duplicate ? "true" : undefined}
    >
      {clientMarks.map((client) => (
        <div className={`flex h-12 w-[145px] shrink-0 items-center gap-cluster-sm overflow-hidden whitespace-nowrap text-body-sm font-display wide:text-card-title ${clientTextClasses[client.name] ?? "text-ink"}`.trim()} key={`${duplicate ? "copy" : "original"}-${client.name}`}>
          <ClientMark client={client} />
          <span>{client.name}</span>
        </div>
      ))}
    </div>
  );
}

export function TrustedClientsSection() {
  return (
    <section className="relative min-h-[160px] bg-page px-page-gutter pb-cluster pt-section-y lg:rounded-panel lg:px-page-gutter-lg lg:pb-cluster lg:pt-6" aria-labelledby="clients-title">
      <h2 className="text-center text-subheading font-brand uppercase tracking-eyebrow text-[#2b5e8c]" id="clients-title">OUR CLIENTS</h2>
      <div className="relative mt-section-gap-lg overflow-hidden px-0.5 pb-1 lg:mt-section-y" aria-label="Our clients">
        <div className="flex w-max motion-safe:animate-client-marquee motion-reduce:w-full motion-reduce:animate-none [will-change:transform]">
          <ClientLogoSet />
          <ClientLogoSet duplicate />
          <ClientLogoSet duplicate />
        </div>
        <span className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-page to-transparent" aria-hidden="true" />
        <span className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-page to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}

export function TrustMetricsSection() {
  const metrics = [
    ["1,200+", "brands assisted"],
    ["4.9/5", "client satisfaction"],
    ["7+ years", "practical guidance"],
    ["24 hrs", "typical response"],
  ];

  return (
    <section className="grid min-h-0 grid-cols-1 gap-section-gap-lg border-t border-[#e0e0e3] bg-page px-page-gutter py-section-y lg:min-h-[132px] lg:grid-cols-[1.3fr_2.7fr] lg:items-center lg:gap-0 lg:px-page-gutter-xl lg:py-0" aria-labelledby="trust-metrics-title">
      <div className="relative flex max-w-[360px] flex-col gap-cluster-xs border-l-2 border-pink pl-cluster-lg">
        <p className="text-overline text-pink">THE LIMEX STANDARD</p>
        <strong className="text-body-sm font-semibold text-[#121729]" id="trust-metrics-title">Trusted support for growing businesses</strong>
        <span className="text-body-xs text-[#616b7d]">Clear guidance, transparent scope and helpful next steps.</span>
      </div>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {metrics.map(([value, label], index) => (
          <div className={`flex min-h-[72px] flex-col border-t border-[#e0e0e3] pt-cluster ${index % 2 === 1 ? "border-l pl-cluster-lg" : ""} ${index >= 2 ? "pt-cluster-lg" : ""} lg:min-h-0 lg:border-t-0 lg:px-[33px] lg:py-0 ${index === 0 ? "lg:border-l-0 lg:pl-0" : "lg:border-l"}`.trim()} key={value}>
            <dt className="order-2 mt-1 text-micro text-[#616b7d]">{label}</dt>
            <dd className="order-1 font-brand text-subheading text-[#121729]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative min-h-0 bg-page px-4 py-8 pb-8 sm:px-page-gutter sm:py-section-y lg:rounded-panel lg:px-section-gutter-lg lg:py-section-y-xl lg:pb-section-y-lg" id="process" aria-labelledby="process-title">
      <SectionTitle
        id="process-title"
        title="From question to completion."
        description="A simple, transparent process that keeps your business moving."
      />
      <div className="mt-section-gap-xl grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-cluster-lg">
        <div className="relative overflow-hidden rounded-[24px] border border-[#ddd9d1] bg-white/55 p-4 shadow-[0_2px_0_rgba(27,34,30,0.02)] sm:p-5 lg:p-6">
          <div className="pointer-events-none absolute bottom-[42px] left-[42px] top-[42px] w-px bg-gradient-to-b from-[#e4cfd8] via-[#d7d5df] to-transparent lg:bottom-auto lg:left-[12%] lg:right-[12%] lg:top-[52px] lg:h-px lg:w-auto lg:bg-gradient-to-r lg:from-[#e4cfd8] lg:via-[#d7d5df] lg:to-transparent" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-4 lg:gap-4">
            {processSteps.map((step) => (
              <article className="relative z-[1] flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center" key={step.number}>
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
        <aside className="relative isolate flex min-h-0 flex-col overflow-hidden rounded-[24px] bg-[#121729] p-5 text-white sm:p-6 lg:min-h-full lg:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full border border-white/[0.08]" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-3">
            <p className="text-overline text-[#a6b8eb]">NEED HELP CHOOSING?</p>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/[0.14] text-icon-action text-[#c4cfe5]" aria-hidden="true">↗</span>
          </div>
          <h3 className="relative mt-cluster-lg font-brand text-subheading">Talk to an expert.</h3>
          <p className="relative mt-cluster-lg text-body-xs leading-relaxed text-[#c4cfe5]">Tell us what you are trying to solve and we will point you in the right direction.</p>
          <ActionButton href="#contact" variant="white" className="relative mt-6 min-h-12 w-full sm:w-max lg:mt-auto lg:w-full">Start a conversation</ActionButton>
        </aside>
      </div>
    </section>
  );
}
