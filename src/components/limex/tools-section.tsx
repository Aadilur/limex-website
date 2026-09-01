import { tools } from "./data";
import { ActionButton, SectionTitle } from "./ui";

const toolVisuals: Record<string, { mark: string }> = {
  "VAT calculator": {
    mark: "border-[#d5e0d8] bg-[#f1f5f1] text-[#607a69]",
  },
  "Income tax estimator": {
    mark: "border-[#dfdbe7] bg-[#f5f3f7] text-[#756b82]",
  },
  "Deed builder": {
    mark: "border-[#e4d9cf] bg-[#f7f3ef] text-[#866e5e]",
  },
};

export function ToolsSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="tools" aria-labelledby="tools-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="tools-title"
          title="Move faster with practical tools."
          description="Practical tools for quick business decisions."
        />
        <ActionButton href="/business-tools" variant="light" className="w-max min-w-[170px] lg:mt-1">Explore tools</ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {tools.map((tool) => {
          const visual = toolVisuals[tool.title] ?? toolVisuals["Deed builder"];

          return (
            <article className="group relative flex min-h-[324px] flex-col overflow-hidden rounded-[24px] border border-[#d9d6cf] bg-[#faf9f6] p-card-pad transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfcac1] hover:shadow-[0_14px_30px_rgba(49,42,35,0.06)]" key={tool.title}>
              <div className="relative flex items-center gap-cluster-sm">
                <span className={`grid size-11 place-items-center rounded-[14px] border text-body-sm font-bold ${visual.mark}`.trim()}>{tool.mark}</span>
              </div>
              <h3 className="relative mt-cluster-lg font-brand text-subheading text-ink">{tool.title}</h3>
              <p className="relative mt-cluster-xs min-h-[42px] max-w-[360px] text-body-xs text-muted">{tool.description}</p>
              <dl className="relative m-0 mt-auto flex flex-col divide-y divide-[#e9e5de] border-y border-[#e5e1da]">
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
