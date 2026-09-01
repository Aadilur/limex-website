import { packages } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

export function PackagesSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="packages" aria-labelledby="packages-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="packages-title"
          eyebrow="PACKAGES"
          title="Choose a clear starting point."
          description="Simple packages for common needs, with custom support when your scope is different."
        />
        <p className="pt-0 text-left text-micro font-semibold text-muted lg:pt-section-gap-lg lg:text-right">Starting prices, managed from the admin panel.</p>
      </div>

      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {packages.map((item) => {
          const tone = getToneClasses(item.color, item.surface);

          return (
            <article className="flex min-h-[350px] flex-col rounded-card border border-border bg-white p-card-pad lg:min-h-[372px]" key={item.title}>
              <span className={`inline-flex min-h-6 w-max items-center rounded-control px-3.5 text-overline ${tone.text} ${tone.surface}`.trim()}>{item.tag}</span>
              <h3 className="mt-section-gap-lg font-brand text-subheading text-ink">{item.title}</h3>
              <p className="mt-cluster-xs text-body-xs text-muted">{item.description}</p>
              <strong className="mt-cluster-lg text-subheading font-bold text-ink">{item.price}</strong>
              <div className="my-card-pad h-px bg-border" />
              <ul className="m-0 flex list-none flex-col gap-cluster p-0">
                {item.features.map((feature) => (
                  <li className="flex items-center gap-cluster-sm text-footer font-text text-ink" key={feature}>
                    <span className="inline-grid size-[18px] shrink-0 place-items-center rounded-full bg-navy text-meta font-bold text-white" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <ActionButton href="#contact" variant="soft" className="mt-auto min-h-[38px] w-[144px]">View details</ActionButton>
            </article>
          );
        })}
      </div>

      <div className="mt-section-gap-lg flex min-h-[76px] flex-col items-start justify-between gap-section-gap-lg rounded-panel-mobile bg-navy p-card-pad-sm lg:mt-section-gap-lg lg:flex-row lg:items-center lg:gap-cluster-lg lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-cluster-xs">
          <strong className="text-body-xs text-white">Need a package built around your business?</strong>
          <span className="text-meta text-[#bdc2d6]">Bundle services, add a builder or request a scope made for you.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="w-max min-w-0 lg:w-[222px] lg:min-w-[222px]">Request custom quote</ActionButton>
      </div>
    </section>
  );
}
