import { packages } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

export function PackagesSection() {
  return (
    <section className="bg-page px-5 py-7 pb-[26px] lg:rounded-[28px] lg:px-[42px] lg:py-[38px] lg:pb-10" id="packages" aria-labelledby="packages-title">
      <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <SectionTitle
          id="packages-title"
          eyebrow="PACKAGES"
          title="Choose a clear starting point."
          description="Simple packages for common needs, with custom support when your scope is different."
        />
        <p className="pt-0 text-left text-[10px] font-semibold text-muted lg:pt-[27px] lg:text-right">Starting prices, managed from the admin panel.</p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3.5 lg:mt-[42px] lg:grid-cols-3 lg:gap-6">
        {packages.map((item) => {
          const tone = getToneClasses(item.color, item.surface);

          return (
            <article className="flex min-h-[350px] flex-col rounded-[22px] border border-border bg-white p-[23px] lg:min-h-[372px]" key={item.title}>
              <span className={`inline-flex min-h-6 w-max items-center rounded-xl px-3.5 text-[9px] font-[750] tracking-[0.6px] ${tone.text} ${tone.surface}`.trim()}>{item.tag}</span>
              <h3 className="mt-[22px] text-[21px] font-bold leading-[26px] tracking-[-0.3px] text-ink">{item.title}</h3>
              <p className="mt-[5px] text-[13px] leading-[18px] text-muted">{item.description}</p>
              <strong className="mt-[18px] text-[22px] font-bold leading-[27px] text-ink">{item.price}</strong>
              <div className="my-[20px] h-px bg-border" />
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {item.features.map((feature) => (
                  <li className="flex items-center gap-2.5 text-[12px] font-[550] leading-4 text-ink" key={feature}>
                    <span className="inline-grid size-[18px] shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <ActionButton href="#contact" variant="soft" className="mt-auto min-h-[38px] w-[144px]">View details</ActionButton>
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex min-h-[76px] flex-col items-start justify-between gap-3.5 rounded-[20px] bg-navy p-[17px] lg:mt-[21px] lg:flex-row lg:items-center lg:gap-5 lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-[5px]">
          <strong className="text-[13px] leading-[18px] text-white">Need a package built around your business?</strong>
          <span className="text-[11.5px] leading-4 text-[#bdc2d6]">Bundle services, add a builder or request a scope made for you.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="w-max min-w-0 lg:w-[222px] lg:min-w-[222px]">Request custom quote</ActionButton>
      </div>
    </section>
  );
}
