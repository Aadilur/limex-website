import { z } from "zod";

export const templatePaperSizes = ["A4", "LEGAL"] as const;
export type TemplatePaperSize = (typeof templatePaperSizes)[number];

export const templateFontSizes = ["small", "body", "subtitle", "title", "large"] as const;
export type TemplateFontSize = (typeof templateFontSizes)[number];

export const templateFontSizeMetrics = {
  small: { sizePx: 10, lineHeight: 1.65 },
  body: { sizePx: 12, lineHeight: 1.75 },
  subtitle: { sizePx: 16, lineHeight: 1.45 },
  title: { sizePx: 22, lineHeight: 1.25 },
  large: { sizePx: 22, lineHeight: 1.25 },
} as const satisfies Record<TemplateFontSize, { sizePx: number; lineHeight: number }>;

export const templatePaperDimensions = {
  A4: { widthMm: 210, heightMm: 297 },
  LEGAL: { widthMm: 216, heightMm: 356 },
} as const;

export const templateFontFamilies = ["serif", "sans"] as const;
export type TemplateFontFamily = (typeof templateFontFamilies)[number];

export const templateFieldTypes = ["text", "textarea", "date", "number", "select", "checkbox"] as const;
export type TemplateFieldType = (typeof templateFieldTypes)[number];

export const templateBlockTypes = ["title", "heading", "paragraph", "field", "spacer", "pageBreak", "signature"] as const;
export type TemplateBlockType = (typeof templateBlockTypes)[number];

const idSchema = z.string().trim().min(1).max(120);
const keySchema = z.string().trim().regex(/^[a-z][a-z0-9_]{1,63}$/, "Use lowercase letters, numbers and underscores.");
const textSchema = (max: number) => z.string().trim().min(1).max(max);
const fontSizeSchema = z.enum(templateFontSizes);

export const templateFieldSchema = z.object({
  id: idSchema,
  key: keySchema,
  label: textSchema(160),
  type: z.enum(templateFieldTypes),
  required: z.boolean().default(false),
  placeholder: z.string().max(240).default(""),
  options: z.array(z.object({ value: textSchema(120), label: textSchema(160) })).max(30).default([]),
});

const formattedBlockSchema = z.object({
  id: idSchema,
  align: z.enum(["left", "center", "right"]).default("left"),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  fontSize: fontSizeSchema.default("body"),
});

export const templateBlockSchema = z.discriminatedUnion("type", [
  formattedBlockSchema.extend({ type: z.literal("title"), text: textSchema(500) }),
  formattedBlockSchema.extend({ type: z.literal("heading"), text: textSchema(500) }),
  formattedBlockSchema.extend({ type: z.literal("paragraph"), text: textSchema(5000) }),
  formattedBlockSchema.extend({ type: z.literal("field"), fieldKey: keySchema }),
  z.object({ id: idSchema, type: z.literal("spacer"), height: z.number().int().min(4).max(240).default(24) }),
  z.object({ id: idSchema, type: z.literal("pageBreak") }),
  z.object({ id: idSchema, type: z.literal("signature"), label: textSchema(240) }),
]);

export const templatePageSettingsSchema = z.object({
  marginTop: z.number().int().min(8).max(60).optional(),
  marginRight: z.number().int().min(8).max(50).optional(),
  marginBottom: z.number().int().min(8).max(60).optional(),
  marginLeft: z.number().int().min(8).max(50).optional(),
  stampGap: z.number().int().min(0).max(80).optional(),
  showPageNumbers: z.boolean().optional(),
  fontFamily: z.enum(templateFontFamilies).optional(),
  defaultFontSize: fontSizeSchema.optional(),
});

export const templatePageSchema = z.object({
  id: idSchema,
  title: textSchema(180),
  settings: templatePageSettingsSchema.default({}),
  blocks: z.array(templateBlockSchema).min(1).max(240),
});

export const templateSettingsSchema = z.object({
  paperSize: z.enum(templatePaperSizes).default("A4"),
  marginTop: z.number().int().min(8).max(60).default(20),
  marginRight: z.number().int().min(8).max(50).default(18),
  marginBottom: z.number().int().min(8).max(60).default(20),
  marginLeft: z.number().int().min(8).max(50).default(18),
  stampGap: z.number().int().min(0).max(80).default(0),
  showPageNumbers: z.boolean().default(true),
  fontFamily: z.enum(templateFontFamilies).default("serif"),
  defaultFontSize: fontSizeSchema.default("body"),
});

const documentTemplateBaseSchema = z.object({
  title: textSchema(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  description: textSchema(500),
  settings: templateSettingsSchema,
  fields: z.array(templateFieldSchema).max(80),
  pages: z.array(templatePageSchema).min(1).max(80),
});

const legacyDocumentTemplateSchema = z.object({
  title: textSchema(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: textSchema(500),
  settings: templateSettingsSchema,
  fields: z.array(templateFieldSchema).max(80),
  blocks: z.array(templateBlockSchema).min(1).max(240),
});

function addReferenceValidation(value: { fields: TemplateField[]; pages: TemplatePage[] }, context: z.RefinementCtx) {
  const seen = new Set<string>();
  for (const [index, field] of value.fields.entries()) {
    if (seen.has(field.key)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["fields", index, "key"], message: "Field keys must be unique." });
    seen.add(field.key);
  }
  for (const [pageIndex, page] of value.pages.entries()) {
    for (const [blockIndex, block] of page.blocks.entries()) {
      if (block.type === "field" && !seen.has(block.fieldKey)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pages", pageIndex, "blocks", blockIndex, "fieldKey"], message: "Choose an existing field for this block." });
    }
  }
}

export const documentTemplateDraftSchema = documentTemplateBaseSchema.superRefine(addReferenceValidation);

export type TemplateField = z.infer<typeof templateFieldSchema>;
export type TemplateBlock = z.infer<typeof templateBlockSchema>;
export type TemplatePageSettings = z.infer<typeof templatePageSettingsSchema>;
export type TemplatePage = z.infer<typeof templatePageSchema>;
export type TemplateSettings = z.infer<typeof templateSettingsSchema>;
export type DocumentTemplateDraft = z.infer<typeof documentTemplateDraftSchema>;

export type DocumentTemplateSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  paperSize: TemplatePaperSize;
  status: "DRAFT" | "PUBLISHED";
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminDocumentTemplate = DocumentTemplateSummary & DocumentTemplateDraft;

export type PublicDocumentTemplate = {
  slug: string;
  title: string;
  description: string;
  settings: TemplateSettings;
  fields: TemplateField[];
  pages: TemplatePage[];
  publishedAt: string;
};

export type TemplateValues = Record<string, string>;

export const defaultTemplateSettings: TemplateSettings = {
  paperSize: "A4",
  marginTop: 20,
  marginRight: 18,
  marginBottom: 20,
  marginLeft: 18,
  stampGap: 18,
  showPageNumbers: true,
  fontFamily: "serif",
  defaultFontSize: "body",
};

const defaultMouBlocks: TemplateBlock[] = [
  { id: "block-title", type: "title", text: "MEMORANDUM OF UNDERSTANDING", align: "center", bold: true, italic: false, fontSize: "title" },
  { id: "block-intro", type: "paragraph", text: "This draft is prepared on {{effective_date}} between {{party_a}} and {{party_b}} for review and discussion.", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-purpose-heading", type: "heading", text: "1. Shared purpose", align: "left", bold: true, italic: false, fontSize: "subtitle" },
  { id: "block-purpose", type: "paragraph", text: "{{purpose}}", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-page-two", type: "pageBreak" },
  { id: "block-responsibilities-heading", type: "heading", text: "2. Responsibilities", align: "left", bold: true, italic: false, fontSize: "subtitle" },
  { id: "block-party-a", type: "paragraph", text: "First party — {{party_a}}\n{{party_a_obligations}}", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-party-b", type: "paragraph", text: "Second party — {{party_b}}\n{{party_b_obligations}}", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-term-heading", type: "heading", text: "3. Duration and milestones", align: "left", bold: true, italic: false, fontSize: "subtitle" },
  { id: "block-term", type: "paragraph", text: "{{term}}", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-page-three", type: "pageBreak" },
  { id: "block-review-heading", type: "heading", text: "4. Review and next steps", align: "left", bold: true, italic: false, fontSize: "subtitle" },
  { id: "block-review", type: "paragraph", text: "This document records the current understanding of the parties. It should be reviewed for applicable law, confidentiality, intellectual property, payment, termination and dispute provisions before signing.", align: "left", bold: false, italic: false, fontSize: "body" },
  { id: "block-signature-a", type: "signature", label: "First party — {{party_a}}" },
  { id: "block-signature-b", type: "signature", label: "Second party — {{party_b}}" },
];

export function createTemplateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function blocksToPages(blocks: TemplateBlock[]): TemplatePage[] {
  const pages: TemplatePage[] = [{ id: "page-1", title: "Page 1", settings: {}, blocks: [] }];
  for (const block of blocks) {
    if (block.type === "pageBreak") {
      if (pages.at(-1)?.blocks.length) pages.push({ id: `page-${pages.length + 1}`, title: `Page ${pages.length + 1}`, settings: {}, blocks: [] });
      continue;
    }
    pages.at(-1)!.blocks.push(block);
  }
  return pages.filter((page) => page.blocks.length > 0);
}

export function flattenTemplatePages(pages: TemplatePage[]): TemplateBlock[] {
  return pages.flatMap((page, index) => [...(index ? [{ id: `page-break-${page.id}`, type: "pageBreak" as const }] : []), ...page.blocks]);
}

export function normalizeDocumentTemplateDraft(input: unknown): DocumentTemplateDraft {
  const candidate = input && typeof input === "object" ? input as Record<string, unknown> : {};
  if (Array.isArray(candidate.pages)) return documentTemplateDraftSchema.parse(input);
  const legacy = legacyDocumentTemplateSchema.parse(input);
  return documentTemplateDraftSchema.parse({ ...legacy, pages: blocksToPages(legacy.blocks) });
}

export const defaultMouTemplate: DocumentTemplateDraft = {
  title: "Memorandum of Understanding",
  slug: "memorandum-of-understanding",
  description: "A clear starting template for recording a shared business understanding.",
  settings: defaultTemplateSettings,
  fields: [
    { id: "field-party-a", key: "party_a", label: "First party", type: "text", required: true, placeholder: "Full legal name", options: [] },
    { id: "field-party-b", key: "party_b", label: "Second party", type: "text", required: true, placeholder: "Full legal name", options: [] },
    { id: "field-date", key: "effective_date", label: "Effective date", type: "date", required: true, placeholder: "", options: [] },
    { id: "field-purpose", key: "purpose", label: "Shared purpose", type: "textarea", required: true, placeholder: "What are the parties working toward?", options: [] },
    { id: "field-party-a-obligations", key: "party_a_obligations", label: "First party responsibilities", type: "textarea", required: true, placeholder: "List the agreed responsibilities.", options: [] },
    { id: "field-party-b-obligations", key: "party_b_obligations", label: "Second party responsibilities", type: "textarea", required: true, placeholder: "List the agreed responsibilities.", options: [] },
    { id: "field-term", key: "term", label: "Duration and milestones", type: "textarea", required: true, placeholder: "State the proposed term and key milestones.", options: [] },
  ],
  pages: blocksToPages(defaultMouBlocks).map((page, index) => ({ ...page, title: ["Overview", "Responsibilities", "Review & signing"][index] ?? page.title })),
};

export function createBlankTemplate(): DocumentTemplateDraft {
  return {
    title: "Untitled template",
    slug: `untitled-template-${Date.now()}`,
    description: "Describe what this template is for.",
    settings: { ...defaultTemplateSettings },
    fields: [],
    pages: [{ id: createTemplateId("page"), title: "Page 1", settings: {}, blocks: [{ id: createTemplateId("block"), type: "paragraph", text: "Start writing your document here.", align: "left", bold: false, italic: false, fontSize: "body" }] }],
  };
}

export function resolveTemplateText(text: string, values: TemplateValues = {}, fields: TemplateField[] = [], showLabels = true) {
  return text.replace(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/gi, (_match, key: string) => {
    const value = values[key]?.trim();
    if (value) return value;
    if (!showLabels) return "";
    return `[${fields.find((field) => field.key === key)?.label ?? key}]`;
  });
}

export function missingTemplateFields(fields: TemplateField[], values: TemplateValues) {
  return fields.filter((field) => field.required && (!values[field.key] || (field.type === "checkbox" && values[field.key] !== "true")));
}

export function resolvePageSettings(template: Pick<DocumentTemplateDraft, "settings">, page: Pick<TemplatePage, "settings">) {
  return {
    paperSize: template.settings.paperSize,
    marginTop: page.settings.marginTop ?? template.settings.marginTop,
    marginRight: page.settings.marginRight ?? template.settings.marginRight,
    marginBottom: page.settings.marginBottom ?? template.settings.marginBottom,
    marginLeft: page.settings.marginLeft ?? template.settings.marginLeft,
    stampGap: page.settings.stampGap ?? template.settings.stampGap,
    showPageNumbers: page.settings.showPageNumbers ?? template.settings.showPageNumbers,
    fontFamily: page.settings.fontFamily ?? template.settings.fontFamily,
    defaultFontSize: page.settings.defaultFontSize ?? template.settings.defaultFontSize,
  };
}

export function resolveBlockFontSize(
  block: Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" | "field" }>,
  settings: Pick<TemplateSettings, "defaultFontSize">,
) {
  return block.fontSize === "body" ? settings.defaultFontSize : block.fontSize;
}
