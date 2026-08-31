import { tools } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

export function ToolsSection() {
  return (
    <section className="bg-page px-5 py-7 pb-[26px] lg:rounded-[28px] lg:px-[42px] lg:py-[38px] lg:pb-10" id="tools" aria-labelledby="tools-title">
      <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <SectionTitle
          id="tools-title"
          eyebrow="SMART TOOLS"
          title="Move faster with practical tools."
          description="Quick estimates and ready-to-use builders for everyday business decisions."
        />
        <ActionButton href="/tools" variant="light" className="w-max min-w-[190px] lg:mt-1">Explore the toolkit</ActionButton>
      </div>
      <div className="mt-7 grid grid-cols-1 gap-3.5 lg:mt-[42px] lg:grid-cols-3 lg:gap-6">
        {tools.map((tool) => {
          const tone = getToneClasses(tool.color, tool.surface);

          return (
            <article className="relative flex min-h-[350px] flex-col overflow-hidden rounded-[22px] border border-border bg-white px-[23px] pb-[23px] pt-[27px] lg:min-h-[362px]" key={tool.title}>
              <div className={`absolute left-[-1px] right-[-1px] top-0 h-[5px] ${tone.surface}`.trim()} />
              <div className="flex items-center justify-between">
                <span className={`inline-flex size-12 items-center justify-center rounded-2xl text-[14px] font-bold ${tone.text} ${tone.surface}`.trim()}>{tool.mark}</span>
                <span className={`inline-flex min-h-6 items-center rounded-xl px-2.5 text-[9px] font-[750] tracking-[0.5px] ${tone.text} ${tone.surface}`.trim()}>{tool.tag}</span>
              </div>
              <h3 className="mt-5 text-[21px] font-bold leading-[26px] tracking-[-0.3px] text-ink">{tool.title}</h3>
              <p className="mt-[5px] min-h-[42px] max-w-[360px] text-[13px] leading-[19px] text-muted">{tool.description}</p>
              <div className="my-5 h-px bg-border" />
              <dl className="m-0 flex flex-col gap-[13px]">
                {tool.rows.map(([label, value]) => (
                  <div className="flex items-center justify-between gap-3" key={label}>
                    <dt className="text-[11px] leading-[15px] text-muted">{label}</dt>
                    <dd className="m-0 text-right text-[12px] font-bold leading-4 text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <ActionButton href={`/tools#${tool.title.toLowerCase().includes("vat") ? "vat" : tool.title.toLowerCase().includes("tax") ? "tax" : "limited-company"}`} variant="dark" arrow="none" className="mt-auto min-h-[42px] w-full justify-center">{tool.action}</ActionButton>
            </article>
          );
        })}
      </div>
      <div className="mt-5 flex min-h-[72px] flex-col items-start justify-between gap-3.5 rounded-[20px] bg-[#f5f5f7] p-[17px] lg:mt-[21px] lg:flex-row lg:items-center lg:gap-5 lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-[5px]">
          <strong className="text-[13px] leading-[18px] text-ink">Need another calculator or builder?</strong>
          <span className="text-[11.5px] leading-4 text-muted">Tell us what to automate next. We can shape the toolkit around your workflow.</span>
        </div>
        <ActionButton href="#contact" variant="light" className="w-max min-w-0 lg:w-[238px] lg:min-w-[238px]">Request a tool</ActionButton>
      </div>
    </section>
  );
}
