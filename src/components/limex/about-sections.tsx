"use client";

import { useState } from "react";

import { reels } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

const approachPoints = [
  "Listen before we advise.",
  "Explain without unnecessary complexity.",
  "Stay close until the work is done.",
];

const teamMembers = [
  {
    initials: "FN",
    name: "Member Name 01",
    role: "FOUNDER AND LEGAL ADVISOR",
    description: "Business setup, long-term clarity, and the decisions that shape your next chapter.",
    color: "#2e6b4f",
    surface: "#d6ebde",
  },
  {
    initials: "CL",
    name: "Member Name 02",
    role: "TAX AND COMPLIANCE ADVISOR",
    description: "Practical filings, clear timelines, and a calmer way to stay compliant.",
    color: "#5c4aa6",
    surface: "#dedbfa",
  },
  {
    initials: "CS",
    name: "Member Name 03",
    role: "CLIENT EXPERIENCE MANAGER",
    description: "The person behind your next clear step, from first question to final handover.",
    color: "#9e5726",
    surface: "#fae5cc",
  },
  {
    initials: "CS",
    name: "Member Name 04",
    role: "CLIENT EXPERIENCE MANAGER",
    description: "A steady point of contact who keeps every follow-up clear and useful.",
    color: "#1f6e70",
    surface: "#d1edeb",
  },
  {
    initials: "CS",
    name: "Member Name 05",
    role: "CLIENT EXPERIENCE MANAGER",
    description: "Support that keeps the details moving while you focus on the work ahead.",
    color: "#b83652",
    surface: "#fcdbe0",
  },
];

export function AboutHero() {
  return (
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.92fr)] lg:items-stretch lg:gap-8" aria-labelledby="about-title">
      <div className="flex min-h-[260px] flex-col items-start justify-center">
        <p className="text-label text-pink">ABOUT US</p>
        <h1 className="mt-2.5 max-w-[760px] text-[clamp(38px,3.7vw,54px)] font-bold leading-[1.06] tracking-[-2.2px] text-ink" id="about-title">
          Clear advice for important business decisions.
        </h1>
        <p className="mt-4 max-w-[650px] text-[15px] leading-[21px] text-muted">
          From registration to compliance, we make the important work feel clear, practical, and manageable.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <ActionButton href="#team" variant="dark" arrow="text" className="min-h-10 w-[132px] px-3.5 text-[11px]">
            Meet the team
          </ActionButton>
          <a className="inline-flex min-h-[30px] items-center rounded-full border border-warm bg-[#f5ede3] px-3 text-[10px] font-[550] leading-4 text-muted transition-colors hover:border-pink/35 hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" href="#approach">
            Our approach
          </a>
        </div>
      </div>

      <aside className="rounded-[26px] border border-white bg-white px-6 py-6 lg:min-h-[246px]" id="approach" aria-labelledby="approach-title">
        <p className="text-[9px] font-bold uppercase tracking-[0.9px] text-pink">OUR APPROACH</p>
        <h2 className="mt-2 text-[20px] font-bold leading-6 tracking-[-0.3px] text-[#393939]" id="approach-title">Practical, human, and involved.</h2>
        <ul className="mt-5 space-y-3">
          {approachPoints.map((point) => (
            <li className="flex items-start gap-2.5 text-[12px] leading-[17px] text-[#393939]" key={point}>
              <span className="mt-0.5 text-[12px] font-bold text-pink" aria-hidden="true">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

const trustMetrics = [
  { value: "5", label: "Core service areas", description: "One place for the important work." },
  { value: "1,200", label: "Clear process", description: "Know what happens next." },
  { value: "100%", label: "Human guidance", description: "A real team behind every step." },
];

export function AboutTrustStrip() {
  return (
    <section className="mt-7 grid gap-5 rounded-[24px] border border-warm bg-white px-5 py-5 lg:mt-8 lg:grid-cols-[240px_repeat(3,minmax(0,1fr))] lg:gap-0 lg:px-6 lg:py-5" aria-label="About Limex trust metrics">
      <div className="flex flex-col justify-center gap-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.9px] text-pink">HOW WE WORK</p>
        <p className="text-[12px] font-[550] leading-4 text-ink">Clear process, practical support.</p>
      </div>
      {trustMetrics.map((metric) => (
        <div className="border-t border-warm pt-4 lg:border-l lg:border-t-0 lg:px-6 lg:pt-0" key={metric.label}>
          <p className="text-[24px] font-bold leading-[29px] tracking-[-0.5px] text-ink">{metric.value}</p>
          <p className="mt-0.5 text-[10px] font-bold leading-[13px] tracking-[0.5px] text-pink">{metric.label}</p>
          <p className="mt-0.5 text-[10px] leading-[13px] text-muted">{metric.description}</p>
        </div>
      ))}
    </section>
  );
}

function TeamMemberCard({ member }: { member: (typeof teamMembers)[number] }) {
  const tone = getToneClasses(member.color, member.surface);

  return (
    <article className="flex min-h-[106px] items-start gap-3 rounded-[16px] bg-[#f8f5f0] p-3 transition-transform duration-200 hover:-translate-y-0.5">
      <div className={["flex size-[62px] shrink-0 flex-col items-center justify-center rounded-[13px]", tone.surface, tone.text].join(" ")} aria-label={member.initials + " profile placeholder"}>
        <span className="text-[18px] font-bold leading-[22px]">{member.initials}</span>
        <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.8px]">PHOTO</span>
      </div>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-[13px] font-bold leading-4 text-ink">{member.name}</h3>
        <p className={["mt-1 text-[8px] font-bold leading-[11px] tracking-[0.6px]", tone.text].join(" ")}>{member.role}</p>
        <p className="mt-1.5 text-[10px] leading-[13px] text-muted">{member.description}</p>
      </div>
    </article>
  );
}

export function AboutTeamSection() {
  return (
    <section className="mt-7 rounded-[28px] border border-warm bg-white p-5 lg:mt-8 lg:p-7" id="team" aria-labelledby="team-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle
          id="team-title"
          eyebrow="THE PEOPLE BEHIND THE PROCESS"
          title="A team that stays close to the work."
          description="Practical guidance from people who care about the details as much as the outcome."
          className="max-w-[680px]"
          size="compact"
        />
        <span className="inline-flex h-[30px] w-max shrink-0 items-center rounded-full border border-warm bg-[#f5ede3] px-3 text-[9px] font-semibold uppercase tracking-[0.55px] text-muted">Profile placeholders</span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {teamMembers.map((member) => <TeamMemberCard key={member.name} member={member} />)}
      </div>
    </section>
  );
}

function AboutReelCard({ reel, selected, onSelect }: { reel: (typeof reels)[number]; selected: boolean; onSelect: () => void }) {
  return (
    <article className={[
      "group relative h-[420px] min-w-[min(306px,calc(100vw-72px))] basis-[min(306px,calc(100vw-72px))] snap-start overflow-hidden rounded-[24px] border bg-[#293a40] transition-transform duration-200 lg:h-[535px] lg:min-w-[306px] lg:basis-[306px] hover:-translate-y-1",
      selected ? "-translate-y-1 border-white/90" : "border-white/35",
    ].join(" ")}>
      <img className={["absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]", selected ? "scale-[1.04]" : ""].join(" ")} src={reel.image} alt="" />
      <div className="absolute inset-x-0 bottom-0 flex min-h-[132px] flex-col justify-end gap-1.5 bg-gradient-to-b from-transparent to-[rgba(18,20,33,0.9)] px-5 pb-5 pt-16 text-[#ffebd7] drop-shadow-[0_1px_12px_rgba(18,20,33,0.32)]">
        <p className="text-[8px] font-bold uppercase tracking-[0.8px] text-[#fac7cc]">VIDEO STORY</p>
        <h3 className="max-w-[250px] text-[16px] font-bold leading-5 tracking-[-0.2px]">{reel.title}</h3>
        <p className="text-[10px] leading-[13px]">{reel.meta}</p>
      </div>
      <button
        className="absolute left-1/2 top-1/2 z-10 grid size-[220px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent transition-transform duration-200 hover:scale-[1.04] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
        type="button"
        aria-label={(selected ? "Pause " : "Play ") + reel.title}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <img className="absolute inset-0 size-full" src="/figma/play-overlay.svg" alt="" aria-hidden="true" />
        <span className="relative z-10 size-[58px] rounded-full bg-[rgba(252,251,250,0.96)] shadow-play" aria-hidden="true" />
        <span className="absolute left-1/2 top-1/2 z-20 h-0 w-0 -translate-y-1/2 translate-x-[-34%] border-y-[12px] border-y-transparent border-l-[18px] border-l-[#17151c]" aria-hidden="true" />
      </button>
    </article>
  );
}

export function AboutReelsSection() {
  const [activeReel, setActiveReel] = useState<number | null>(null);

  return (
    <section className="mt-7 rounded-[28px] bg-transparent p-0 lg:mt-8" aria-labelledby="about-reels-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <SectionTitle
          id="about-reels-title"
          eyebrow="VIDEO REELS"
          title="Stories from the businesses we support."
          description="Optional video stories that make the work feel human."
          className="max-w-none"
          size="compact"
        />
        <span className="inline-flex h-[30px] w-max items-center rounded-full border border-warm bg-[#f5ede3] px-3 text-[9px] font-semibold uppercase tracking-[0.55px] text-muted">Optional reels</span>
      </div>
      <div className="mt-5 flex min-h-0 snap-x snap-proximity gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reels.map((reel, index) => (
          <AboutReelCard key={reel.title} reel={reel} selected={activeReel === index} onSelect={() => setActiveReel((current) => (current === index ? null : index))} />
        ))}
      </div>
    </section>
  );
}

export function AboutContactCta() {
  return (
    <section className="mt-7 flex flex-col gap-5 rounded-[26px] bg-[#14131c] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between lg:mt-8 lg:px-7 lg:py-5" id="contact" aria-labelledby="about-contact-title">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.9px] text-[#fac7cc]">READY TO START?</p>
        <h2 className="mt-1 text-[18px] font-bold leading-6 tracking-[-0.25px]" id="about-contact-title">Let us make the next step simple.</h2>
      </div>
      <ActionButton href="/#contact" variant="white" arrow="text" className="min-h-[42px] w-[176px] shrink-0 text-[11px]">
        Talk to an expert
      </ActionButton>
    </section>
  );
}
