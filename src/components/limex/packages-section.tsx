import { packages } from "./data";
import { ActionButton, SectionTitle, WaveLabel } from "./ui";

const featuredPackageTitle = "Company setup";

const packageVisuals: Record<string, { card: string; label: string; number: string; glow: string; marker: string }> = {
  "Company setup": {
    card: "border-[#d8cdbf] bg-[#f7f3ec]",
    label: "text-[#756354]",
    number: "border-[#d8cbbb] bg-[#fbfaf7] text-[#8a7667]",
    glow: "bg-[#eadbca]",
    marker: "border-[#c9af96] bg-[#eee1d3] text-[#806a58]",
  },
  "Compliance care": {
    card: "border-[#dcd8e2] bg-[#f6f4f8]",
    label: "text-[#756b82]",
    number: "border-[#ddd8e5] bg-[#fcfbfd] text-[#867c92]",
    glow: "bg-[#e6e0ed]",
    marker: "border-[#c8bdd6] bg-[#ede8f2] text-[#766986]",
  },
  "Trademark support": {
    card: "border-[#e3d7d9] bg-[#f8f2f3]",
    label: "text-[#896e75]",
    number: "border-[#e4d8db] bg-[#fdfafb] text-[#947b81]",
    glow: "bg-[#edd9dd]",
    marker: "border-[#d4b9bd] bg-[#f1e5e7] text-[#896c73]",
  },
};

export function PackagesSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="packages" aria-labelledby="packages-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="packages-title"
          eyebrow="PACKAGES"
          title="Choose a clear starting point."
          description="Simple packages for common needs. Custom support when needed."
        />
        <div className="flex flex-col items-start gap-cluster-sm sm:flex-row sm:items-center lg:shrink-0 lg:pt-1">
          <strong className="text-body-xs text-ink">Need a tailored plan?</strong>
          <ActionButton href="#contact" variant="light" className="w-full min-w-0 border-[#cec6bc] bg-[#f8f6f2] sm:w-max">Request custom quote</ActionButton>
        </div>
      </div>

      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {packages.map((item, index) => {
          const isFeatured = item.title === featuredPackageTitle;
          const visual = packageVisuals[item.title] ?? packageVisuals[featuredPackageTitle];

          return (
            <article className={`group relative isolate flex min-h-[348px] flex-col overflow-hidden rounded-[26px] border p-card-pad transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(49,42,35,0.08)] ${visual.card} ${isFeatured ? "ring-1 ring-inset ring-white/80" : ""}`.trim()} key={item.title}>
              <div className={`pointer-events-none absolute -right-14 -top-16 size-44 rounded-full opacity-60 blur-2xl ${visual.glow}`.trim()} aria-hidden="true" />
              <div className="relative flex items-center justify-between gap-cluster-sm">
                <WaveLabel className={visual.label}>{isFeatured ? "RECOMMENDED" : item.tag}</WaveLabel>
                <span className={`grid size-8 place-items-center rounded-full border text-meta font-semibold ${visual.number}`.trim()} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="relative mt-cluster-lg min-h-[70px]">
                <h3 className="font-brand text-subheading text-ink">{item.title}</h3>
                <p className="mt-cluster-xs line-clamp-1 text-body-xs text-muted">{item.description}</p>
              </div>
              <div className="relative mt-auto border-t border-black/[0.08] pt-cluster-lg">
                <span className="text-overline text-[#958b80]">FROM</span>
                <strong className="mt-1 block font-brand text-section-title text-ink">{item.price.replace(/^From\s+/i, "")}</strong>
              </div>
              <ul className="relative m-0 mt-cluster flex list-none flex-col divide-y divide-black/[0.07] border-t border-black/[0.07] p-0">
                {item.features.map((feature) => (
                  <li className="flex min-h-9 items-center gap-cluster-sm text-meta font-text text-[#4f4a44]" key={feature}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${visual.marker}`.trim()} aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a className="relative mt-cluster-lg inline-flex w-max items-center gap-cluster-sm border-b border-[#9d948a] pb-1 text-meta font-semibold text-ink transition-colors hover:border-ink hover:text-[#5e554d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href="#contact">
                View package <span aria-hidden="true">↗</span>
              </a>
            </article>
          );
        })}
      </div>

    </section>
  );
}
