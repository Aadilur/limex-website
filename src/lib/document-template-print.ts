import { isTemplateBlockVisible, isTemplateFieldVisible, resolveBlockFontSize, resolvePageSettings, resolveTemplateText, templateFontSizeMetrics, templatePaperDimensions, type DocumentTemplateDraft, type TemplateBlock, type TemplatePage, type TemplateValues } from "./document-templates";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function styleFor(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" | "field" }>, defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"]) {
  const metrics = templateFontSizeMetrics[resolveBlockFontSize(block, { defaultFontSize })];
  return `font-size:${metrics.sizePx}px;line-height:${metrics.lineHeight};text-align:${block.align};font-weight:${block.bold ? 700 : 400};font-style:${block.italic ? "italic" : "normal"};white-space:pre-wrap;overflow-wrap:anywhere;`;
}

function blockHtml(block: TemplateBlock, template: DocumentTemplateDraft, values: TemplateValues, defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"]) {
  if (!isTemplateBlockVisible(block, values)) return "";
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = escapeHtml(resolveTemplateText(block.text, values, template.fields, false));
    if (!text.trim()) return "";
    const style = styleFor(block, defaultFontSize);
    if (block.type === "title") return `<h1 style="${style}margin:0 0 20px;">${text}</h1>`;
    if (block.type === "heading") return `<h2 style="${style}margin:20px 0 10px;">${text}</h2>`;
    return `<p style="${style}margin:0 0 12px;">${text}</p>`;
  }
  if (block.type === "field") { const field = template.fields.find((item) => item.key === block.fieldKey); if (field && !isTemplateFieldVisible(field, values)) return ""; const value = values[block.fieldKey]?.trim() || ""; if (!value) return ""; const style = styleFor(block, defaultFontSize); return `<p style="${style}margin:0 0 12px;">${escapeHtml(value)}</p>`; }
  if (block.type === "spacer") return `<div style="height:${Math.min(240, Math.max(4, block.height))}px;"></div>`;
  if (block.type === "signature") { const metrics = templateFontSizeMetrics[defaultFontSize]; return `<div style="display:grid;row-gap:4px;margin-top:32px;max-width:280px;border-top:1px solid #2b2927;padding-top:8px;font-size:${metrics.sizePx}px;line-height:${metrics.lineHeight};"><div>${escapeHtml(resolveTemplateText(block.label, values, template.fields, false))}</div><div style="color:#69635d;">Signature / stamp</div><div style="color:#69635d;">Date: __________________</div></div>`; }
  return "";
}

function pageBlocksHtml(blocks: TemplateBlock[], template: DocumentTemplateDraft, values: TemplateValues, defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"]) {
  const chunks: TemplateBlock[][] = [];
  for (const block of blocks.filter((item) => isTemplateBlockVisible(item, values))) {
    const last = chunks.at(-1);
    if (block.type === "signature" && last?.[0]?.type === "signature") last.push(block);
    else chunks.push([block]);
  }
  return chunks.map((chunk) => chunk.length > 1 ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px;">${chunk.map((block) => blockHtml(block, template, values, defaultFontSize)).join("")}</div>` : blockHtml(chunk[0], template, values, defaultFontSize)).join("");
}

function pageHtml(page: TemplatePage, index: number, template: DocumentTemplateDraft, values: TemplateValues, totalPages: number, pageWidth: string, pageHeight: string) {
  const settings = resolvePageSettings(template, page);
  const pagePadding = `${settings.marginTop + settings.stampGap}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm`;
  const fontFamily = settings.fontFamily === "sans" ? `"Noto Sans Bengali","Noto Sans",Arial,Helvetica,sans-serif` : `"Noto Serif Bengali","Noto Serif",Kalpurush,Georgia,"Times New Roman",serif`;
  return `<section class="template-page" style="width:${pageWidth};height:${pageHeight};padding:${pagePadding};font-family:${fontFamily};">${pageBlocksHtml(page.blocks, template, values, settings.defaultFontSize)}${settings.showPageNumbers ? `<div class="page-number">${index + 1} / ${totalPages}</div>` : ""}</section>`;
}

export function renderTemplatePrintHtml(template: DocumentTemplateDraft, values: TemplateValues) {
  const pageDimensions = templatePaperDimensions[template.settings.paperSize];
  const pageWidth = `${pageDimensions.widthMm}mm`;
  const pageHeight = `${pageDimensions.heightMm}mm`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(template.title)}</title><style>
    @page{size:${pageWidth} ${pageHeight};margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#f1eee9;color:#25221f}
    .template-page{position:relative;margin:0 auto 12mm;background:#fff;page-break-after:always;overflow:hidden}
    .template-page:last-child{page-break-after:auto}
    .page-number{position:absolute;bottom:3mm;left:0;right:0;text-align:center;color:#928980;font:9px/1.2 Arial,sans-serif}
    @media print{html,body{background:#fff}.template-page{margin:0;box-shadow:none}}
  </style></head><body>${template.pages.map((page, index) => pageHtml(page, index, template, values, template.pages.length, pageWidth, pageHeight)).join("")}</body></html>`;
}
