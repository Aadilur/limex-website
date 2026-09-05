import { resolvePageSettings, resolveTemplateText, type DocumentTemplateDraft, type TemplateBlock, type TemplateValues } from "@/lib/document-templates";

const fontSizeClass = {
  small: "text-[10px] leading-[1.65]",
  body: "text-[12px] leading-[1.75]",
  subtitle: "text-[16px] leading-[1.45]",
  title: "text-[22px] leading-[1.25]",
  large: "text-[22px] leading-[1.25]",
} as const;

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function formattedClass(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>) {
  return `${fontSizeClass[block.fontSize]} ${alignClass[block.align]} ${block.bold ? "font-bold" : "font-normal"} ${block.italic ? "italic" : "not-italic"}`.trim();
}

function RenderBlock({ block, template, values, showLabels }: { block: TemplateBlock; template: DocumentTemplateDraft; values: TemplateValues; showLabels: boolean }) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = resolveTemplateText(block.text, values, template.fields, showLabels);
    if (block.type === "title") return <h1 className={`mb-5 ${formattedClass(block)}`}>{text}</h1>;
    if (block.type === "heading") return <h2 className={`mb-2.5 mt-5 ${formattedClass(block)}`}>{text}</h2>;
    return <p className={`mb-3 whitespace-pre-wrap break-words ${formattedClass(block)}`}>{text}</p>;
  }

  if (block.type === "field") {
    const field = template.fields.find((item) => item.key === block.fieldKey);
    const text = values[block.fieldKey]?.trim() || (showLabels ? `[${field?.label ?? block.fieldKey}]` : "");
    return <p className="mb-3 whitespace-pre-wrap break-words text-[12px] leading-[1.75]">{text}</p>;
  }

  if (block.type === "spacer") return <div aria-hidden="true" style={{ height: `${Math.min(240, Math.max(4, block.height))}px` }} />;
  if (block.type === "signature") return <div className="mt-8 grid max-w-[280px] gap-1 border-t border-[#2b2927] pt-2 text-[12px] leading-[1.5]"><span>{resolveTemplateText(block.label, values, template.fields, showLabels)}</span><span className="text-[#69635d]">Signature / stamp</span><span className="text-[#69635d]">Date: __________________</span></div>;
  return null;
}

function RenderPageBlocks({ blocks, template, values, showLabels }: { blocks: TemplateBlock[]; template: DocumentTemplateDraft; values: TemplateValues; showLabels: boolean }) {
  const groups: TemplateBlock[][] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.type === "signature" && last?.[0]?.type === "signature") last.push(block);
    else groups.push([block]);
  }
  return <>{groups.map((group, index) => group.length > 1 ? <div className="grid grid-cols-2 gap-x-6" key={`signature-row-${index}`}>{group.map((block) => <RenderBlock block={block} template={template} values={values} showLabels={showLabels} key={block.id} />)}</div> : <RenderBlock block={group[0]} template={template} values={values} showLabels={showLabels} key={group[0].id} />)}</>;
}

export function DocumentTemplatePaper({ template, values = {}, showLabels = true, compact = false }: { template: DocumentTemplateDraft; values?: TemplateValues; showLabels?: boolean; compact?: boolean }) {
  return <div className={`min-w-0 ${compact ? "space-y-3" : "space-y-4"}`.trim()}>{template.pages.map((page, index) => {
    const pageSettings = resolvePageSettings(template, page);
    const legal = pageSettings.paperSize === "LEGAL";
    const pageAspect = legal ? "216 / 356" : "210 / 297";
    const fontFamily = pageSettings.fontFamily === "sans" ? "Arial, Helvetica, sans-serif" : "Georgia, \"Times New Roman\", serif";
    return <article className="relative mx-auto block w-full max-w-full overflow-hidden bg-white text-[#25221f] shadow-[0_10px_28px_rgba(57,48,41,0.1)] ring-1 ring-[#e1dbd2]" style={{ aspectRatio: pageAspect, paddingTop: `${pageSettings.marginTop + pageSettings.stampGap}mm`, paddingRight: `${pageSettings.marginRight}mm`, paddingBottom: `${pageSettings.marginBottom}mm`, paddingLeft: `${pageSettings.marginLeft}mm`, fontFamily }} key={page.id} data-template-paper data-page-title={page.title}>
      <div className="h-full min-h-0 overflow-hidden"><div className="min-h-full min-w-0"><RenderPageBlocks blocks={page.blocks} template={template} values={values} showLabels={showLabels} /></div></div>
      {pageSettings.showPageNumbers ? <span className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-[#928980]">{index + 1} / {template.pages.length}</span> : null}
    </article>;
  })}</div>;
}
