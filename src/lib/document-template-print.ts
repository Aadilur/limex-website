import { resolveTemplateText, splitTemplatePages, type DocumentTemplateDraft, type TemplateBlock, type TemplateValues } from "./document-templates";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function styleFor(block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>) {
  const sizes = { small: "10px", body: "12px", large: "20px" } as const;
  return `font-size:${sizes[block.fontSize]};line-height:1.75;text-align:${block.align};font-weight:${block.bold ? 700 : 400};font-style:${block.italic ? "italic" : "normal"};white-space:pre-wrap;overflow-wrap:anywhere;`;
}

function blockHtml(block: TemplateBlock, template: DocumentTemplateDraft, values: TemplateValues) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = escapeHtml(resolveTemplateText(block.text, values, template.fields, false));
    const style = styleFor(block);
    if (block.type === "title") return `<h1 style="${style}margin:0 0 18px;">${text}</h1>`;
    if (block.type === "heading") return `<h2 style="${style}margin:20px 0 10px;">${text}</h2>`;
    return `<p style="${style}margin:0 0 12px;">${text}</p>`;
  }
  if (block.type === "field") {
    const text = values[block.fieldKey]?.trim() || "";
    return `<p style="font-size:12px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 12px;">${escapeHtml(text)}</p>`;
  }
  if (block.type === "spacer") return `<div style="height:${Math.min(240, Math.max(4, block.height))}px;"></div>`;
  if (block.type === "signature") return `<div style="margin-top:48px;max-width:280px;border-top:1px solid #2b2927;padding-top:8px;font-size:11px;line-height:1.5;"><div>${escapeHtml(resolveTemplateText(block.label, values, template.fields, false))}</div><div style="color:#69635d;">Signature / stamp</div><div style="color:#69635d;">Date: __________________</div></div>`;
  return "";
}

export function renderTemplatePrintHtml(template: DocumentTemplateDraft, values: TemplateValues) {
  const pages = splitTemplatePages(template.blocks);
  const legal = template.settings.paperSize === "LEGAL";
  const pageWidth = legal ? "216mm" : "210mm";
  const pageHeight = legal ? "356mm" : "297mm";
  const pagePadding = `${template.settings.marginTop + template.settings.stampGap}mm ${template.settings.marginRight}mm ${template.settings.marginBottom}mm ${template.settings.marginLeft}mm`;
  const pageNumbers = template.settings.showPageNumbers;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(template.title)}</title><style>
    @page{size:${pageWidth} ${pageHeight};margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#f1eee9;color:#25221f;font-family:Georgia,"Times New Roman",serif}
    .template-page{position:relative;width:${pageWidth};min-height:${pageHeight};margin:0 auto 12mm;padding:${pagePadding};background:#fff;page-break-after:always;overflow:hidden}
    .template-page:last-child{page-break-after:auto}
    .page-number{position:absolute;bottom:7mm;left:0;right:0;text-align:center;color:#928980;font:10px/1.2 Arial,sans-serif}
    @media print{html,body{background:#fff}.template-page{margin:0;box-shadow:none}}
  </style></head><body>${pages.map((page, index) => `<section class="template-page">${page.map((block) => blockHtml(block, template, values)).join("")}${pageNumbers ? `<div class="page-number">${index + 1} / ${pages.length}</div>` : ""}</section>`).join("")}</body></html>`;
}
