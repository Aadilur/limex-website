import { resolvePageSettings, resolveTemplateText, type DocumentTemplateDraft, type TemplateBlock, type TemplatePage, type TemplateValues } from "./document-templates";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function styleFor(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>) {
  const sizes = { small: "10px", body: "12px", subtitle: "16px", title: "22px", large: "22px" } as const;
  return `font-size:${sizes[block.fontSize]};line-height:1.65;text-align:${block.align};font-weight:${block.bold ? 700 : 400};font-style:${block.italic ? "italic" : "normal"};white-space:pre-wrap;overflow-wrap:anywhere;`;
}

function blockHtml(block: TemplateBlock, template: DocumentTemplateDraft, values: TemplateValues) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = escapeHtml(resolveTemplateText(block.text, values, template.fields, false));
    const style = styleFor(block);
    if (block.type === "title") return `<h1 style="${style}margin:0 0 18px;">${text}</h1>`;
    if (block.type === "heading") return `<h2 style="${style}margin:20px 0 10px;">${text}</h2>`;
    return `<p style="${style}margin:0 0 12px;">${text}</p>`;
  }
  if (block.type === "field") return `<p style="font-size:12px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 12px;">${escapeHtml(values[block.fieldKey]?.trim() || "")}</p>`;
  if (block.type === "spacer") return `<div style="height:${Math.min(240, Math.max(4, block.height))}px;"></div>`;
  if (block.type === "signature") return `<div style="margin-top:32px;max-width:280px;border-top:1px solid #2b2927;padding-top:8px;font-size:12px;line-height:1.5;"><div>${escapeHtml(resolveTemplateText(block.label, values, template.fields, false))}</div><div style="color:#69635d;">Signature / stamp</div><div style="color:#69635d;">Date: __________________</div></div>`;
  return "";
}

function pageBlocksHtml(blocks: TemplateBlock[], template: DocumentTemplateDraft, values: TemplateValues) {
  const chunks: TemplateBlock[][] = [];
  for (const block of blocks) {
    const last = chunks.at(-1);
    if (block.type === "signature" && last?.[0]?.type === "signature") last.push(block);
    else chunks.push([block]);
  }
  return chunks.map((chunk) => chunk.length > 1 ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px;">${chunk.map((block) => blockHtml(block, template, values)).join("")}</div>` : blockHtml(chunk[0], template, values)).join("");
}

function pageHtml(page: TemplatePage, index: number, template: DocumentTemplateDraft, values: TemplateValues, totalPages: number, pageWidth: string, pageHeight: string) {
  const settings = resolvePageSettings(template, page);
  const pagePadding = `${settings.marginTop + settings.stampGap}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm`;
  const fontFamily = settings.fontFamily === "sans" ? "Arial, Helvetica, sans-serif" : `Georgia,"Times New Roman",serif`;
  return `<section class="template-page" style="width:${pageWidth};min-height:${pageHeight};padding:${pagePadding};font-family:${fontFamily};">${pageBlocksHtml(page.blocks, template, values)}${settings.showPageNumbers ? `<div class="page-number">${index + 1} / ${totalPages}</div>` : ""}</section>`;
}

export function renderTemplatePrintHtml(template: DocumentTemplateDraft, values: TemplateValues) {
  const legal = template.settings.paperSize === "LEGAL";
  const pageWidth = legal ? "216mm" : "210mm";
  const pageHeight = legal ? "356mm" : "297mm";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(template.title)}</title><style>
    @page{size:${pageWidth} ${pageHeight};margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#f1eee9;color:#25221f}
    .template-page{position:relative;margin:0 auto 12mm;background:#fff;page-break-after:always;overflow:hidden}
    .template-page:last-child{page-break-after:auto}
    .page-number{position:absolute;bottom:7mm;left:0;right:0;text-align:center;color:#928980;font:10px/1.2 Arial,sans-serif}
    @media print{html,body{background:#fff}.template-page{margin:0;box-shadow:none}}
  </style></head><body>${template.pages.map((page, index) => pageHtml(page, index, template, values, template.pages.length, pageWidth, pageHeight)).join("")}</body></html>`;
}
