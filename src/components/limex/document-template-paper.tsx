import { resolveTemplateText, splitTemplatePages, type DocumentTemplateDraft, type TemplateBlock, type TemplateValues } from "@/lib/document-templates";

const fontSizeClass = {
  small: "text-[10px] leading-[1.65]",
  body: "text-[12px] leading-[1.75]",
  large: "text-[20px] leading-[1.3]",
} as const;

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function blockText(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>, values: TemplateValues, template: DocumentTemplateDraft) {
  return resolveTemplateText(block.text, values, template.fields, true);
}

function formattedClass(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>) {
  return `${fontSizeClass[block.fontSize]} ${alignClass[block.align]} ${block.bold ? "font-bold" : "font-normal"} ${block.italic ? "italic" : "not-italic"}`.trim();
}

function RenderBlock({ block, template, values, showLabels }: { block: TemplateBlock; template: DocumentTemplateDraft; values: TemplateValues; showLabels: boolean }) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = showLabels ? blockText(block, values, template) : resolveTemplateText(block.text, values, template.fields, false);
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
  if (block.type === "signature") return <div className="mt-12 grid max-w-[280px] gap-1 border-t border-[#2b2927] pt-2 text-[11px] leading-[1.5]"><span>{resolveTemplateText(block.label, values, template.fields, showLabels)}</span><span className="text-[#69635d]">Signature / stamp</span><span className="text-[#69635d]">Date: __________________</span></div>;
  return null;
}

export function DocumentTemplatePaper({ template, values = {}, showLabels = true, compact = false }: { template: DocumentTemplateDraft; values?: TemplateValues; showLabels?: boolean; compact?: boolean }) {
  const pages = splitTemplatePages(template.blocks);
  const legal = template.settings.paperSize === "LEGAL";
  const pageAspect = legal ? "216 / 356" : "210 / 297";
  const pagePaddingTop = template.settings.marginTop + template.settings.stampGap;
  const pagePaddingRight = template.settings.marginRight;
  const pagePaddingBottom = template.settings.marginBottom;
  const pagePaddingLeft = template.settings.marginLeft;

  return <div className={`space-y-4 ${compact ? "text-[11px]" : ""}`.trim()}>{pages.map((page, index) => <article className="relative mx-auto w-full overflow-hidden bg-white text-[#25221f] shadow-[0_10px_28px_rgba(57,48,41,0.1)] ring-1 ring-[#e1dbd2]" style={{ aspectRatio: pageAspect, minHeight: compact ? "450px" : "520px", paddingTop: `${pagePaddingTop}mm`, paddingRight: `${pagePaddingRight}mm`, paddingBottom: `${pagePaddingBottom}mm`, paddingLeft: `${pagePaddingLeft}mm` }} key={`${index}-${page[0]?.id ?? "empty"}`} data-template-paper>
    <div className="h-full min-h-0 overflow-hidden"><div className="min-h-full">{page.map((block) => <RenderBlock block={block} template={template} values={values} showLabels={showLabels} key={block.id} />)}</div></div>
    {template.settings.showPageNumbers ? <span className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-[#928980]">{index + 1} / {pages.length}</span> : null}
  </article>)}</div>;
}
