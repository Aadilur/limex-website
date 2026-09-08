"use client";

import { useEffect, useRef, useState } from "react";
import { resolveBlockFontSize, resolvePageSettings, resolveTemplateText, templateFontSizeMetrics, templatePaperDimensions, type DocumentTemplateDraft, type TemplateBlock, type TemplateValues } from "@/lib/document-templates";

const cssPixelsPerMillimetre = 96 / 25.4;

function millimetresToPixels(value: number) {
  return value * cssPixelsPerMillimetre;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function formattedClass(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>) {
  return `${alignClass[block.align]} ${block.bold ? "font-bold" : "font-normal"} ${block.italic ? "italic" : "not-italic"}`.trim();
}

function formattedStyle(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" | "field" }>, defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"]) {
  const metrics = templateFontSizeMetrics[resolveBlockFontSize(block, { defaultFontSize })];
  return { fontSize: `${metrics.sizePx}px`, lineHeight: metrics.lineHeight };
}

function RenderBlock({ block, template, values, showLabels, defaultFontSize }: { block: TemplateBlock; template: DocumentTemplateDraft; values: TemplateValues; showLabels: boolean; defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"] }) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = resolveTemplateText(block.text, values, template.fields, showLabels);
    if (block.type === "title") return <h1 className={`mb-5 ${formattedClass(block)}`} style={formattedStyle(block, defaultFontSize)}>{text}</h1>;
    if (block.type === "heading") return <h2 className={`mb-2.5 mt-5 ${formattedClass(block)}`} style={formattedStyle(block, defaultFontSize)}>{text}</h2>;
    return <p className={`mb-3 whitespace-pre-wrap break-words ${formattedClass(block)}`} style={formattedStyle(block, defaultFontSize)}>{text}</p>;
  }

  if (block.type === "field") {
    const field = template.fields.find((item) => item.key === block.fieldKey);
    const text = values[block.fieldKey]?.trim() || (showLabels ? `[${field?.label ?? block.fieldKey}]` : "");
    return <p className="mb-3 whitespace-pre-wrap break-words" style={formattedStyle(block, defaultFontSize)}>{text}</p>;
  }

  if (block.type === "spacer") return <div aria-hidden="true" style={{ height: `${Math.min(240, Math.max(4, block.height))}px` }} />;
  if (block.type === "signature") { const metrics = templateFontSizeMetrics[defaultFontSize]; return <div className="mt-8 grid max-w-[280px] gap-1 border-t border-[#2b2927] pt-2" style={{ fontSize: `${metrics.sizePx}px`, lineHeight: metrics.lineHeight }}><span>{resolveTemplateText(block.label, values, template.fields, showLabels)}</span><span className="text-[#69635d]">Signature / stamp</span><span className="text-[#69635d]">Date: __________________</span></div>; }
  return null;
}

function RenderPageBlocks({ blocks, template, values, showLabels, defaultFontSize }: { blocks: TemplateBlock[]; template: DocumentTemplateDraft; values: TemplateValues; showLabels: boolean; defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"] }) {
  const groups: TemplateBlock[][] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.type === "signature" && last?.[0]?.type === "signature") last.push(block);
    else groups.push([block]);
  }
  return <>{groups.map((group, index) => group.length > 1 ? <div className="grid grid-cols-2 gap-x-6" key={`signature-row-${index}`}>{group.map((block) => <RenderBlock block={block} template={template} values={values} showLabels={showLabels} defaultFontSize={defaultFontSize} key={block.id} />)}</div> : <RenderBlock block={group[0]} template={template} values={values} showLabels={showLabels} defaultFontSize={defaultFontSize} key={group[0].id} />)}</>;
}

export function DocumentTemplatePaper({ template, values = {}, showLabels = true, compact = false }: { template: DocumentTemplateDraft; values?: TemplateValues; showLabels?: boolean; compact?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageDimensions = templatePaperDimensions[template.settings.paperSize];
  const pageWidthPx = millimetresToPixels(pageDimensions.widthMm);
  const pageHeightPx = millimetresToPixels(pageDimensions.heightMm);
  const pageGapPx = compact ? 12 : 16;
  const totalHeightPx = (pageHeightPx * template.pages.length) + (pageGapPx * Math.max(0, template.pages.length - 1));
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const availableWidth = viewport.clientWidth;
      if (availableWidth > 0) setScale(Math.min(1, availableWidth / pageWidthPx));
    };

    updateScale();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateScale);
    observer?.observe(viewport);
    window.addEventListener("resize", updateScale);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [pageWidthPx]);

  return <div ref={viewportRef} className="min-w-0 w-full">
    <div className="relative mx-auto" style={{ width: pageWidthPx * scale, height: totalHeightPx * scale }}>
      <div className="origin-top-left" style={{ width: pageWidthPx, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div className="grid" style={{ rowGap: `${pageGapPx}px` }}>{template.pages.map((page, index) => {
    const pageSettings = resolvePageSettings(template, page);
    const fontFamily = pageSettings.fontFamily === "sans" ? "\"Noto Sans Bengali\", \"Noto Sans\", Arial, Helvetica, sans-serif" : "\"Noto Serif Bengali\", \"Noto Serif\", Kalpurush, Georgia, \"Times New Roman\", serif";
    return <article className="relative mx-auto block overflow-hidden bg-white text-[#25221f] shadow-[0_10px_28px_rgba(57,48,41,0.1)] ring-1 ring-[#e1dbd2]" style={{ width: pageWidthPx, height: pageHeightPx, aspectRatio: `${pageDimensions.widthMm} / ${pageDimensions.heightMm}`, boxSizing: "border-box", paddingTop: `${pageSettings.marginTop + pageSettings.stampGap}mm`, paddingRight: `${pageSettings.marginRight}mm`, paddingBottom: `${pageSettings.marginBottom}mm`, paddingLeft: `${pageSettings.marginLeft}mm`, fontFamily }} key={page.id} data-template-paper data-page-title={page.title}>
      <div className="h-full min-h-0 overflow-hidden"><div className="min-h-full min-w-0"><RenderPageBlocks blocks={page.blocks} template={template} values={values} showLabels={showLabels} defaultFontSize={pageSettings.defaultFontSize} /></div></div>
      {pageSettings.showPageNumbers ? <span className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-[#928980]">{index + 1} / {template.pages.length}</span> : null}
    </article>;
  })}</div>
      </div>
    </div>
  </div>;
}
