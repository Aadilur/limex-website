import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  LineRuleType,
  PageNumber,
  PageOrientation,
  PageBreak,
  Packer,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import {
  expandTemplateBlockInstances,
  isTemplateBlockVisible,
  isTemplateFieldVisible,
  resolveBlockFontSize,
  resolveTemplateFieldValue,
  resolvePageSettings,
  resolveTemplateText,
  scaledTemplateFontSizeMetrics,
  templatePaperDimensions,
  type DocumentTemplateDraft,
  type TemplateBlock,
  type TemplateBlockInstance,
  type TemplateField,
  type TemplatePage,
  type TemplateValues,
} from "./document-templates";

const twipsPerPoint = 20;
const pointsPerCssPixel = 0.75;
const documentAccent = "2B2927";
const documentMuted = "69635D";
const documentPageNumber = "928980";

type FormattedBlock = Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" | "field" }>;
type DocxFont = { ascii: string; hAnsi: string; eastAsia: string; cs: string };
type RunStyle = {
  font: DocxFont;
  size: number;
  bold?: boolean;
  boldComplexScript?: boolean;
  italics?: boolean;
  italicsComplexScript?: boolean;
  color?: string;
};
type EmbeddedFont = { name: string; data: Uint8Array };

const alignmentMap = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
} as const;

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const noTableBorders = {
  top: noBorder,
  right: noBorder,
  bottom: noBorder,
  left: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder,
} as const;
const noCellBorders = { top: noBorder, right: noBorder, bottom: noBorder, left: noBorder } as const;

function millimetresToTwips(value: number) {
  return Math.round((value / 25.4) * 1440);
}

function cssPixelsToTwips(value: number) {
  return Math.max(0, Math.round(value * pointsPerCssPixel * twipsPerPoint));
}

function cssPixelsToHalfPoints(value: number) {
  return Math.max(2, Math.round(value * pointsPerCssPixel * 2));
}

function fontFor(family: "serif" | "sans"): DocxFont {
  const latin = family === "sans" ? "Arial" : "Georgia";
  // Kalpurush is the installed Bengali fallback used by the Limex print view.
  // Keeping it on the complex-script slots lets Word render Bengali while
  // preserving the requested Latin serif/sans treatment for English text.
  return { ascii: latin, hAnsi: latin, eastAsia: "Kalpurush", cs: "Kalpurush" };
}

function runStyle(
  block: FormattedBlock,
  template: DocumentTemplateDraft,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
  color?: string,
): RunStyle {
  const metrics = scaledTemplateFontSizeMetrics(resolveBlockFontSize(block, { defaultFontSize }), template.settings.fontScale);
  return {
    font: fontFor(family),
    size: cssPixelsToHalfPoints(metrics.sizePx),
    bold: block.bold,
    boldComplexScript: block.bold,
    italics: block.italic,
    italicsComplexScript: block.italic,
    color: color ?? "25221F",
  };
}

function signatureRunStyle(
  template: DocumentTemplateDraft,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
  color?: string,
): RunStyle {
  const metrics = scaledTemplateFontSizeMetrics(defaultFontSize, template.settings.fontScale);
  return { font: fontFor(family), size: cssPixelsToHalfPoints(metrics.sizePx), color: color ?? "25221F" };
}

function textRuns(text: string, style: RunStyle) {
  const lines = text.split(/\r?\n/);
  return lines.flatMap((line, index) => [
    ...(index ? [new TextRun({ break: 1, ...style })] : []),
    new TextRun({
      text: line,
      language: /[\u0980-\u09ff]/.test(line) ? { value: "bn-BD", eastAsia: "bn-BD", bidirectional: "bn-BD" } : { value: "en-US" },
      ...style,
    }),
  ]);
}

function paragraphFor(
  block: FormattedBlock,
  text: string,
  template: DocumentTemplateDraft,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
) {
  const metrics = scaledTemplateFontSizeMetrics(resolveBlockFontSize(block, { defaultFontSize }), template.settings.fontScale);
  const style = runStyle(block, template, defaultFontSize, family);
  const isTitle = block.type === "title";
  const isHeading = block.type === "heading";
  return new Paragraph({
    style: isTitle ? "Title" : isHeading ? "Heading1" : undefined,
    alignment: alignmentMap[block.align],
    keepNext: isHeading,
    spacing: {
      before: isHeading ? cssPixelsToTwips(20) : 0,
      after: cssPixelsToTwips(isTitle ? 20 : isHeading ? 10 : 12),
      line: Math.round(metrics.lineHeight * 240),
      lineRule: LineRuleType.AUTO,
    },
    children: textRuns(text, style),
  });
}

function signatureParagraphs(
  block: Extract<TemplateBlock, { type: "signature" }>,
  template: DocumentTemplateDraft,
  values: TemplateValues,
  fields: TemplateField[],
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
) {
  const metrics = scaledTemplateFontSizeMetrics(defaultFontSize, template.settings.fontScale);
  const label = resolveTemplateText(block.label, values, fields, false);
  const labelStyle = signatureRunStyle(template, defaultFontSize, family);
  const mutedStyle = signatureRunStyle(template, defaultFontSize, family, documentMuted);
  const spacing = { line: Math.round(metrics.lineHeight * 240), lineRule: LineRuleType.AUTO } as const;
  return [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: documentAccent, space: 6 } },
      spacing: { ...spacing, before: cssPixelsToTwips(20), after: cssPixelsToTwips(2) },
      children: textRuns(label, labelStyle),
    }),
    new Paragraph({ spacing: { ...spacing, after: cssPixelsToTwips(2) }, children: textRuns("Signature / stamp", mutedStyle) }),
    new Paragraph({ spacing, children: textRuns("Date: __________________", mutedStyle) }),
  ];
}

function spacerParagraph(height: number, family: "serif" | "sans") {
  return new Paragraph({
    spacing: { before: cssPixelsToTwips(Math.min(240, Math.max(4, height))), after: 0, line: 20, lineRule: LineRuleType.EXACTLY },
    children: [new TextRun({ text: "\u00a0", font: fontFor(family), size: 2 })],
  });
}

function blockElements(
  instance: TemplateBlockInstance,
  template: DocumentTemplateDraft,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
): Array<Paragraph | Table> {
  const { block, values, fields } = instance;
  if (!isTemplateBlockVisible(block, values)) return [];

  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") {
    const text = resolveTemplateText(block.text, values, fields, false);
    return text.trim() ? [paragraphFor(block, text, template, defaultFontSize, family)] : [];
  }

  if (block.type === "field") {
    const field = fields.find((item) => item.key === block.fieldKey);
    if (field && !isTemplateFieldVisible(field, values)) return [];
    const text = resolveTemplateFieldValue(field, values[block.fieldKey]);
    return text ? [paragraphFor(block, text, template, defaultFontSize, family)] : [];
  }

  if (block.type === "spacer") return [spacerParagraph(block.height, family)];
  if (block.type === "pageBreak") return [new Paragraph({ children: [new PageBreak()] })];
  return signatureParagraphs(block, template, values, fields, defaultFontSize, family);
}

function signatureTable(
  instances: TemplateBlockInstance[],
  template: DocumentTemplateDraft,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
  contentWidthTwips: number,
) {
  const rows: TableRow[] = [];
  const columnWidthTwips = Math.max(1, Math.floor(contentWidthTwips / 2));
  for (let index = 0; index < instances.length; index += 2) {
    const rowInstances = instances.slice(index, index + 2);
    const cells = rowInstances.map((instance) => new TableCell({
      width: { size: columnWidthTwips, type: WidthType.DXA },
      borders: noCellBorders,
      margins: { top: 0, right: 140, bottom: 0, left: 140, marginUnitType: WidthType.DXA },
      verticalAlign: VerticalAlign.TOP,
      children: blockElements(instance, template, defaultFontSize, family).filter((child): child is Paragraph => child instanceof Paragraph),
    }));
    if (cells.length === 1) cells.push(new TableCell({ width: { size: columnWidthTwips, type: WidthType.DXA }, borders: noCellBorders, margins: { top: 0, right: 140, bottom: 0, left: 140, marginUnitType: WidthType.DXA }, children: [new Paragraph({})] }));
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({
    rows,
    width: { size: contentWidthTwips, type: WidthType.DXA },
    columnWidths: [columnWidthTwips, columnWidthTwips],
    layout: "fixed",
    borders: noTableBorders,
  });
}

function pageElements(
  page: TemplatePage,
  template: DocumentTemplateDraft,
  values: TemplateValues,
  defaultFontSize: ReturnType<typeof resolvePageSettings>["defaultFontSize"],
  family: "serif" | "sans",
  contentWidthTwips: number,
) {
  const groups: TemplateBlockInstance[][] = [];
  for (const block of page.blocks) {
    for (const instance of expandTemplateBlockInstances(template, block, values)) {
      if (!isTemplateBlockVisible(instance.block, instance.values)) continue;
      const last = groups.at(-1);
      if (instance.block.type === "signature" && last?.[0]?.block.type === "signature") last.push(instance);
      else groups.push([instance]);
    }
  }
  return groups.flatMap((group) => group.length > 1 ? [signatureTable(group, template, defaultFontSize, family, contentWidthTwips)] : blockElements(group[0]!, template, defaultFontSize, family));
}

function pageFooter(family: "serif" | "sans") {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: 180, lineRule: LineRuleType.AUTO },
      children: [new TextRun({
        font: fontFor(family),
        size: 18,
        color: documentPageNumber,
        children: ["Page ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
      })],
    })],
  });
}

let kalpurushFontPromise: Promise<Uint8Array | undefined> | undefined;

async function loadKalpurushFont() {
  if (typeof window === "undefined") return undefined;
  kalpurushFontPromise ??= fetch("/fonts/kalpurush.ttf", { cache: "force-cache" })
    .then(async (response) => response.ok ? new Uint8Array(await response.arrayBuffer()) : undefined)
    .catch(() => undefined);
  return kalpurushFontPromise;
}

export function createTemplateDocx(
  template: DocumentTemplateDraft,
  values: TemplateValues = {},
  embeddedFonts: readonly EmbeddedFont[] = [],
) {
  return new Document({
    title: template.title,
    subject: template.description,
    creator: "Limex",
    lastModifiedBy: "Limex",
    description: template.description,
    fonts: embeddedFonts.length ? embeddedFonts.map((font) => ({ name: font.name, data: font.data as unknown as Buffer })) : undefined,
    sections: template.pages.map((page, index) => {
      const settings = resolvePageSettings(template, page);
      const dimensions = templatePaperDimensions[template.settings.paperSize];
      const family = settings.fontFamily;
      const contentWidthTwips = millimetresToTwips(dimensions.widthMm - settings.marginLeft - settings.marginRight);
      return {
        properties: {
          ...(index ? { type: SectionType.NEXT_PAGE } : {}),
          page: {
            size: {
              width: millimetresToTwips(dimensions.widthMm),
              height: millimetresToTwips(dimensions.heightMm),
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: millimetresToTwips(settings.marginTop + settings.stampGap),
              right: millimetresToTwips(settings.marginRight),
              bottom: millimetresToTwips(settings.marginBottom),
              left: millimetresToTwips(settings.marginLeft),
              footer: millimetresToTwips(3),
            },
          },
        },
        footers: settings.showPageNumbers ? { default: pageFooter(family) } : undefined,
        children: pageElements(page, template, values, settings.defaultFontSize, family, contentWidthTwips),
      };
    }),
  });
}

export async function renderTemplateDocx(template: DocumentTemplateDraft, values: TemplateValues = {}) {
  const kalpurush = await loadKalpurushFont();
  return Packer.toBlob(createTemplateDocx(template, values, kalpurush ? [{ name: "Kalpurush", data: kalpurush }] : []));
}
