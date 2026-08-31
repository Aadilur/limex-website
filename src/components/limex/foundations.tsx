"use client";

import { useState } from "react";

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

export function TrustedClientsSection() {
  const [offset, setOffset] = useState(0);
  const visibleClients = [...clientMarks.slice(offset), ...clientMarks.slice(0, offset)];

  return (
    <section className="relative min-h-[160px] bg-page px-5 pb-[17px] pt-[23px] lg:rounded-[28px] lg:px-[42px] lg:pb-[18px] lg:pt-6" aria-labelledby="clients-title">
      <h2 className="text-center text-[20px] font-bold leading-4 tracking-[1.8px] text-[#2b5e8c]" id="clients-title">OUR CLIENTS</h2>
      <div className="mt-[27px] flex gap-4 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-[33px] lg:grid lg:grid-cols-6 lg:gap-2.5 lg:overflow-visible lg:pr-[58px]">
        {visibleClients.map((client) => (
          <div className={`flex h-12 min-w-[145px] shrink-0 items-center gap-2.5 overflow-hidden whitespace-nowrap text-[15px] font-bold tracking-[-0.3px] wide:text-[18px] lg:min-w-0 ${clientTextClasses[client.name] ?? "text-ink"}`.trim()} key={client.name}>
            <ClientMark client={client} />
            <span>{client.name}</span>
          </div>
        ))}
      </div>
      <button
        className="absolute bottom-4 right-5 grid size-[38px] place-items-center rounded-full border border-[#e3e0de] bg-white text-[18px] leading-none text-[#121f2e] transition-transform duration-200 hover:translate-x-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 lg:bottom-[18px] lg:right-[42px] lg:size-12 lg:text-[21px]"
        type="button"
        aria-label="Show the next client logos"
        onClick={() => setOffset((current) => (current + 1) % clientMarks.length)}
      >
        →
      </button>
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
    <section className="grid min-h-[180px] grid-cols-1 gap-5 border-t border-[#e0e0e3] bg-page px-5 py-6 lg:min-h-[112px] lg:grid-cols-[1.3fr_2.7fr] lg:gap-0 lg:px-[72px] lg:py-0" aria-label="Trust metrics">
      <div className="flex flex-col gap-[7px]">
        <strong className="text-[13px] leading-[18px] text-[#121729]">Trusted support for growing businesses</strong>
        <span className="text-[11px] leading-4 text-[#616b7d]">Clear guidance, transparent scope and helpful next steps.</span>
      </div>
      <div className="grid grid-cols-2 gap-y-[18px] lg:grid-cols-4 lg:gap-y-0">
        {metrics.map(([value, label], index) => (
          <div className={`min-h-[52px] border-l border-[#e0e0e3] px-2 lg:px-[33px] ${index % 2 === 0 ? "border-l-0" : ""} ${index === 0 ? "lg:border-l-0" : "lg:border-l"}`.trim()} key={value}>
            <strong className="block text-[15px] leading-6 text-[#121729] lg:text-[17px]">{value}</strong>
            <span className="text-[10px] leading-4 text-[#616b7d]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative min-h-0 bg-page px-5 py-7 pb-[26px] lg:min-h-[520px] lg:rounded-[28px] lg:px-14 lg:py-[42px] lg:pb-[38px]" id="process" aria-labelledby="process-title">
      <SectionTitle
        id="process-title"
        eyebrow="HOW IT WORKS"
        title="From question to completion."
        description="A simple, transparent process that keeps your business moving."
      />
      <div className="mt-[34px] flex flex-col gap-[26px] lg:mt-[58px] lg:grid lg:grid-cols-[minmax(0,1fr)_236px] lg:gap-[30px]">
        <div className="relative grid grid-cols-2 gap-x-[18px] gap-y-[30px] lg:grid-cols-4 lg:px-2">
          <div className="absolute left-6 right-[34px] top-[29px] hidden h-0.5 bg-[#d1ccdb] lg:block" aria-hidden="true" />
          {processSteps.map((step) => (
            <article className="relative z-[1]" key={step.number}>
              <div className="relative mx-auto size-[58px]">
                <img className="absolute inset-0 size-full" src="/figma/step-circle.svg" alt="" aria-hidden="true" />
                <span className="absolute inset-0 grid place-items-center text-[12px] font-bold text-pink">{step.number}</span>
              </div>
              <h3 className="mx-auto mt-4 max-w-[190px] text-[14px] font-bold leading-[18px] text-ink lg:mt-7 lg:text-[15px] lg:leading-5">{step.title}</h3>
              <p className="mx-auto max-w-[190px] text-[11px] leading-[15px] text-[#575761] lg:text-[12px] lg:leading-[17px]">{step.description}</p>
            </article>
          ))}
        </div>
        <aside className="min-h-0 rounded-[20px] bg-[#121729] px-6 py-[26px] text-white lg:min-h-[258px]">
          <p className="text-[10px] font-bold tracking-[0.7px] text-[#a6b8eb]">NEED HELP CHOOSING?</p>
          <h3 className="mt-5 text-[24px] font-bold leading-7">Talk to an expert.</h3>
          <p className="my-[27px] text-[12px] leading-[18px] text-[#c4cfe5]">Tell us what you are trying to solve and we will point you in the right direction.</p>
          <ActionButton href="#contact" variant="white" className="w-[178px]">Start a conversation</ActionButton>
        </aside>
      </div>
      <p className="mt-[26px] text-[12px] leading-4 text-[#575761] lg:mt-8">No confusing steps. No unnecessary paperwork. Just a clear path forward.</p>
    </section>
  );
}
