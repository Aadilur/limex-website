import { tools } from "./data";
import { ActionButton, SectionTitle, WaveLabel } from "./ui";

const toolVisuals: Record<string, { card: string; mark: string; glow: string }> = {
  "VAT calculator": {
    card: "border-[#d7e0d9] bg-[#f5f8f5]",
    mark: "border-[#d5e0d8] bg-[#e8f0e9] text-[#607a69]",
    glow: "bg-[#dce9df]",
  },
  "Income tax estimator": {
    card: "border-[#dedbe4] bg-[#f7f5f9]",
    mark: "border-[#dfdbe7] bg-[#ece9f1] text-[#756b82]",
    glow: "bg-[#e7e1ee]",
  },
  "Deed builder": {
    card: "border-[#e5dcd5] bg-[#f9f6f3]",
    mark: "border-[#e4d9cf] bg-[#f0e6dd] text-[#866e5e]",
    glow: "bg-[#eee0d5]",
  },
};

export function ToolsSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="tools" aria-labelledby="tools-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="tools-title"
          eyebrow="SMART TOOLS"
          title="Move faster with practical tools."
          description="Practical tools for quick business decisions."
        />
        <ActionButton href="/business-tools" variant="light" className="w-max min-w-[170px] lg:mt-1">Explore tools</ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {tools.map((tool) => {
          const visual = toolVisuals[tool.title] ?? toolVisuals["Deed builder"];

          return (
            <article className={`group relative isolate flex min-h-[324px] flex-col overflow-hidden rounded-[26px] border p-card-pad transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(49,42,35,0.07)] ${visual.card}`.trim()} key={tool.title}>
              <div className={`pointer-events-none absolute -right-12 -top-14 size-40 rounded-full opacity-60 blur-2xl ${visual.glow}`.trim()} aria-hidden="true" />
              <div className="relative flex items-center justify-between gap-cluster-sm">
                <span className={`grid size-11 place-items-center rounded-2xl border text-body-sm font-bold ${visual.mark}`.trim()}>{tool.mark}</span>
                <WaveLabel className="text-[#958b80]">{tool.tag}</WaveLabel>
              </div>
              <h3 className="relative mt-cluster-lg font-brand text-subheading text-ink">{tool.title}</h3>
              <p className="relative mt-cluster-xs min-h-[42px] max-w-[360px] text-body-xs text-muted">{tool.description}</p>
              <dl className="relative m-0 mt-auto flex flex-col divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {tool.rows.map(([label, value]) => (
                  <div className="flex min-h-10 items-center justify-between gap-3" key={label}>
                    <dt className="text-meta text-muted">{label}</dt>
                    <dd className="m-0 text-right text-button font-bold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <a className="relative mt-cluster-lg inline-flex w-max items-center gap-cluster-sm border-b border-[#9d948a] pb-1 text-meta font-semibold text-ink transition-colors hover:border-ink hover:text-[#5e554d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={tool.href}>
                {tool.action} <span aria-hidden="true">↗</span>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
