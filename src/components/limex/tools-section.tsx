import { tools } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

export function ToolsSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="tools" aria-labelledby="tools-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="tools-title"
          eyebrow="SMART TOOLS"
          title="Move faster with practical tools."
          description="Quick estimates and ready-to-use builders for everyday business decisions."
        />
        <ActionButton href="/business-tools" variant="light" className="w-max min-w-[190px] lg:mt-1">Explore the toolkit</ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {tools.map((tool) => {
          const tone = getToneClasses(tool.color, tool.surface);

          return (
            <article className="relative flex min-h-[350px] flex-col overflow-hidden rounded-card border border-border bg-white px-card-pad pb-card-pad pt-section-y lg:min-h-[362px]" key={tool.title}>
              <div className={`absolute left-[-1px] right-[-1px] top-0 h-[5px] ${tone.surface}`.trim()} />
              <div className="flex items-center justify-between">
                <span className={`inline-flex size-12 items-center justify-center rounded-2xl text-body-sm font-bold ${tone.text} ${tone.surface}`.trim()}>{tool.mark}</span>
                <span className={`inline-flex min-h-6 items-center rounded-control px-2.5 text-overline ${tone.text} ${tone.surface}`.trim()}>{tool.tag}</span>
              </div>
              <h3 className="mt-cluster-lg font-brand text-subheading text-ink">{tool.title}</h3>
              <p className="mt-cluster-xs min-h-[42px] max-w-[360px] text-body-xs text-muted">{tool.description}</p>
              <div className="my-card-pad h-px bg-border" />
              <dl className="m-0 flex flex-col gap-nav">
                {tool.rows.map(([label, value]) => (
                  <div className="flex items-center justify-between gap-3" key={label}>
                    <dt className="text-meta text-muted">{label}</dt>
                    <dd className="m-0 text-right text-button font-bold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <ActionButton href={tool.href} variant="dark" arrow="none" className="mt-auto min-h-control w-full justify-center">{tool.action}</ActionButton>
            </article>
          );
        })}
      </div>
      <div className="mt-section-gap-lg flex min-h-[72px] flex-col items-start justify-between gap-section-gap-lg rounded-panel-mobile bg-[#f5f5f7] p-card-pad-sm lg:mt-section-gap-lg lg:flex-row lg:items-center lg:gap-cluster-lg lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-cluster-xs">
          <strong className="text-body-xs text-ink">Need another calculator or builder?</strong>
          <span className="text-meta text-muted">Tell us what to automate next. We can shape the toolkit around your workflow.</span>
        </div>
        <ActionButton href="#contact" variant="light" className="w-max min-w-0 lg:w-[238px] lg:min-w-[238px]">Request a tool</ActionButton>
      </div>
    </section>
  );
}
