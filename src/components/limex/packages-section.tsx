import { ActionButton, SectionTitle, WaveLabel } from "./ui";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { PackagesContent } from "@/lib/landing-types";

const packageVisuals: Record<string, { label: string; wave: string; number: string; marker: string }> = {
  "Company setup": {
    label: "text-[#007ea6]",
    wave: "text-[#8bdff2]",
    number: "border-[#c9edf5] bg-[#effbff] text-[#007ea6]",
    marker: "border-[#d8f3fa] bg-[#f7fdff] text-[#007ea6]",
  },
  "Compliance care": {
    label: "text-[#006dce]",
    wave: "text-[#a4ccf2]",
    number: "border-[#d3e6fb] bg-[#f1f7ff] text-[#006dce]",
    marker: "border-[#dcecfb] bg-[#f8fbff] text-[#006dce]",
  },
  "Trademark support": {
    label: "text-brand-blue",
    wave: "text-[#9eb4ff]",
    number: "border-[#d6ddff] bg-[#f2f5ff] text-brand-blue",
    marker: "border-[#e0e6ff] bg-[#fafbff] text-brand-blue",
  },
};

function PackageWave({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-[22px] w-[76px] items-end ${className}`.trim()} aria-hidden="true">
      <svg className="h-[8px] w-full overflow-visible" viewBox="0 0 120 8" preserveAspectRatio="none" fill="none">
        <path d="M1 4C10 1 18 1 27 4S44 7 53 4 70 1 79 4s17 3 26 0 9-2 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

export function PackagesSection({ content = defaultLandingContent.packages }: { content?: PackagesContent }) {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="packages" aria-labelledby="packages-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="packages-title"
          title={content.title}
          description={content.description}
        />
        <div className="flex flex-col items-start gap-cluster-sm sm:flex-row sm:items-center lg:shrink-0 lg:pt-1">
          <strong className="text-body-xs text-ink">{content.customPlanLabel}</strong>
          <ActionButton href={content.customPlanCtaHref} variant="light" className="w-full min-w-0 border-[#cec6bc] bg-[#f8f6f2] sm:w-max">{content.customPlanCtaLabel}</ActionButton>
        </div>
      </div>

      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {content.items.filter((item) => item.isVisible).map((item, index) => {
          const isFeatured = item.isFeatured;
          const visual = packageVisuals[item.title] ?? packageVisuals["Company setup"];

          return (
            <article className={`group relative flex min-h-[348px] flex-col overflow-hidden rounded-[24px] border border-[#d9d6cf] bg-[#faf9f6] p-card-pad transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfcac1] hover:shadow-[0_14px_30px_rgba(49,42,35,0.06)] ${isFeatured ? "ring-1 ring-inset ring-[#d8e3da]" : ""}`.trim()} key={item.title}>
              <div className={`relative flex items-center gap-cluster-sm ${isFeatured ? "justify-between" : "justify-end"}`.trim()}>
                {isFeatured ? <WaveLabel className={visual.label}>RECOMMENDED</WaveLabel> : <PackageWave className={visual.wave} />}
                <span className={`grid size-8 place-items-center rounded-full border text-meta font-semibold ${visual.number}`.trim()} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="relative mt-cluster-lg min-h-[70px]">
                <h3 className="font-brand text-subheading text-ink">{item.title}</h3>
                <p className="mt-cluster-xs line-clamp-1 text-body-xs text-muted">{item.description}</p>
              </div>
              <div className="relative mt-auto border-t border-[#e5e1da] pt-cluster-lg">
                <span className="text-overline text-[#958b80]">FROM</span>
                <strong className="mt-1 block font-brand text-section-title text-ink">{item.price.replace(/^From\s+/i, "")}</strong>
              </div>
              <ul className="relative m-0 mt-cluster flex list-none flex-col divide-y divide-[#e9e5de] border-t border-[#e5e1da] p-0">
                {item.features.map((feature) => (
                  <li className="flex min-h-9 items-center gap-cluster-sm text-meta font-text text-[#4f4a44]" key={feature}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${visual.marker}`.trim()} aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a className="relative mt-cluster-lg inline-flex w-max items-center gap-cluster-sm border-b border-[#9d948a] pb-1 text-meta font-semibold text-ink transition-colors hover:border-ink hover:text-[#5e554d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={item.href}>
                {item.action} <span aria-hidden="true">↗</span>
              </a>
            </article>
          );
        })}
      </div>

    </section>
  );
}
