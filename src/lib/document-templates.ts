import { z } from "zod";

// Keep the template schema independent from the client-only service icon module.
// The server imports this file to validate and render templates during production builds.
const templateIconNames = [
  "building",
  "license",
  "receipt-tax",
  "tax",
  "file-upload",
  "file-download",
  "users-group",
  "factory",
  "shield-check",
  "certificate-2",
  "leaf",
  "plane",
  "world",
  "file-check",
  "package",
  "trademark",
  "copyright",
  "lightbulb",
  "report-money",
  "contract",
  "calculator",
  "language",
  "checklist",
  "briefcase",
] as const;

export const templatePaperSizes = ["A4", "LEGAL", "DEED"] as const;
export type TemplatePaperSize = (typeof templatePaperSizes)[number];

export const templateFontSizes = [
  "legal",
  "small",
  "body",
  "subtitle",
  "title",
  "large",
] as const;
export type TemplateFontSize = (typeof templateFontSizes)[number];

export const templateFontSizeMetrics = {
  // Balanced, legible typography scale for legal instruments, deeds and commercial agreements.
  legal: { sizePx: 13, lineHeight: 1.45 },
  small: { sizePx: 12, lineHeight: 1.5 },
  body: { sizePx: 14, lineHeight: 1.65 },
  subtitle: { sizePx: 18, lineHeight: 1.4 },
  title: { sizePx: 24, lineHeight: 1.25 },
  large: { sizePx: 26, lineHeight: 1.25 },
} as const satisfies Record<
  TemplateFontSize,
  { sizePx: number; lineHeight: number }
>;

export const templateFontSizeLabels: Record<TemplateFontSize, string> = {
  body: "Body · 14px (Standard default)",
  legal: "Legal compact · 13px",
  small: "Small · 12px",
  subtitle: "Subtitle · 18px",
  title: "Title · 24px",
  large: "Large Title · 26px",
};

export const templateFontScaleMin = 75;
export const templateFontScaleMax = 200;
export const templateFontScaleDefault = 100;

export function scaledTemplateFontSizeMetrics(
  fontSize: TemplateFontSize,
  fontScale = templateFontScaleDefault,
) {
  const safeScale = Math.min(
    templateFontScaleMax,
    Math.max(
      templateFontScaleMin,
      Number.isFinite(fontScale) ? fontScale : templateFontScaleDefault,
    ),
  );
  const metrics = templateFontSizeMetrics[fontSize];
  return {
    sizePx: Math.max(8, Math.round((metrics.sizePx * safeScale) / 100)),
    lineHeight: metrics.lineHeight,
  };
}

export const templatePaperDimensions = {
  A4: { widthMm: 210, heightMm: 297 },
  LEGAL: { widthMm: 216, heightMm: 356 },
  // The supplied rental deed uses an 8.5 × 13.5 inch long deed sheet.
  DEED: { widthMm: 216, heightMm: 343 },
} as const;

export const templatePaperSizeLabels: Record<TemplatePaperSize, string> = {
  A4: "A4",
  LEGAL: "Legal",
  DEED: "Deed sheet · 8.5 × 13.5 in",
};

export const templateFontFamilies = ["serif", "sans"] as const;
export type TemplateFontFamily = (typeof templateFontFamilies)[number];

export const templateFieldTypes = [
  "text",
  "textarea",
  "date",
  "number",
  "select",
  "checkbox",
] as const;
export type TemplateFieldType = (typeof templateFieldTypes)[number];

export const templateBlockTypes = [
  "title",
  "heading",
  "paragraph",
  "field",
  "spacer",
  "pageBreak",
  "signature",
] as const;
export type TemplateBlockType = (typeof templateBlockTypes)[number];

const idSchema = z.string().trim().min(1).max(120);
const keySchema = z
  .string()
  .trim()
  .regex(
    /^[a-z][a-z0-9_]{1,63}$/,
    "Use lowercase letters, numbers and underscores.",
  );
const textSchema = (max: number) => z.string().trim().min(1).max(max);
const fontSizeSchema = z.enum(templateFontSizes);

export const templateVisibilityRuleSchema = z.object({
  fieldKey: keySchema,
  values: z.array(z.string().trim().min(1).max(240)).min(1).max(40).optional(),
});

const defaultServiceCta = {
  enabled: false,
  href: "",
  title: "Need help with this service?",
  description:
    "See the service details and next steps before completing this document.",
  linkLabel: "View service page",
} as const;

const serviceCtaSchema = z.object({
  enabled: z.boolean().default(false),
  href: z
    .string()
    .trim()
    .max(240)
    .refine(
      (value) => !value || /^\/services\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Choose a valid internal service page.",
    )
    .default(""),
  title: z.string().trim().min(1).max(140).default(defaultServiceCta.title),
  description: z
    .string()
    .trim()
    .max(240)
    .default(defaultServiceCta.description),
  linkLabel: z
    .string()
    .trim()
    .min(1)
    .max(70)
    .default(defaultServiceCta.linkLabel),
});

export const templateFieldSchema = z.object({
  id: idSchema,
  key: keySchema,
  label: textSchema(160),
  type: z.enum(templateFieldTypes),
  required: z.boolean().default(false),
  placeholder: z.string().max(240).default(""),
  options: z
    .array(z.object({ value: textSchema(120), label: textSchema(160) }))
    .max(30)
    .default([]),
  defaultValue: z.string().max(240).optional(),
  visibleWhen: templateVisibilityRuleSchema.optional(),
});

const templateRepeaterFieldSchema = templateFieldSchema.extend({
  sourceKeyPattern: z
    .string()
    .trim()
    .max(120)
    .refine(
      (value) => value.includes("{index}"),
      "Use {index} in a source key pattern.",
    )
    .optional(),
});

const templateRepeatSchema = z
  .object({
    repeaterKey: keySchema,
    from: z.number().int().min(1).max(80).optional(),
    to: z.number().int().min(1).max(80).optional(),
  })
  .superRefine((value, context) => {
    if (
      value.from !== undefined &&
      value.to !== undefined &&
      value.from > value.to
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "The last item must be at or after the first item.",
      });
    }
  });

const templateRepeaterSchema = z
  .object({
    id: idSchema,
    key: keySchema,
    label: textSchema(160),
    itemLabel: textSchema(100),
    description: z.string().max(240).default(""),
    countFieldKey: keySchema,
    minItems: z.number().int().min(1).max(80).default(1),
    maxItems: z.number().int().min(1).max(80).default(8),
    fields: z.array(templateRepeaterFieldSchema).min(1).max(20),
  })
  .superRefine((value, context) => {
    if (value.minItems > value.maxItems) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxItems"],
        message: "Maximum items must be at least the minimum.",
      });
    }
    const seen = new Set<string>();
    for (const [index, field] of value.fields.entries()) {
      if (seen.has(field.key))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fields", index, "key"],
          message: "Repeatable field keys must be unique.",
        });
      seen.add(field.key);
    }
  });

const formattedBlockSchema = z.object({
  id: idSchema,
  align: z.enum(["left", "center", "right"]).default("left"),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  fontSize: fontSizeSchema.default("body"),
  visibleWhen: templateVisibilityRuleSchema.optional(),
  repeat: templateRepeatSchema.optional(),
});

export const templateBlockSchema = z.discriminatedUnion("type", [
  formattedBlockSchema.extend({
    type: z.literal("title"),
    text: textSchema(500),
  }),
  formattedBlockSchema.extend({
    type: z.literal("heading"),
    text: textSchema(500),
  }),
  formattedBlockSchema.extend({
    type: z.literal("paragraph"),
    text: textSchema(5000),
  }),
  formattedBlockSchema.extend({
    type: z.literal("field"),
    fieldKey: keySchema,
  }),
  z.object({
    id: idSchema,
    type: z.literal("spacer"),
    height: z.number().int().min(4).max(240).default(24),
    visibleWhen: templateVisibilityRuleSchema.optional(),
    repeat: templateRepeatSchema.optional(),
  }),
  z.object({
    id: idSchema,
    type: z.literal("pageBreak"),
    visibleWhen: templateVisibilityRuleSchema.optional(),
    repeat: templateRepeatSchema.optional(),
  }),
  z.object({
    id: idSchema,
    type: z.literal("signature"),
    label: textSchema(240),
    visibleWhen: templateVisibilityRuleSchema.optional(),
    repeat: templateRepeatSchema.optional(),
  }),
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
  blocks: z.array(templateBlockSchema).max(240),
});

export const templateSettingsSchema = z.object({
  icon: z.enum(templateIconNames).default("contract"),
  paperSize: z.enum(templatePaperSizes).default("A4"),
  marginTop: z.number().int().min(8).max(60).default(20),
  marginRight: z.number().int().min(8).max(50).default(18),
  marginBottom: z.number().int().min(8).max(60).default(20),
  marginLeft: z.number().int().min(8).max(50).default(18),
  stampGap: z.number().int().min(0).max(80).default(0),
  showPageNumbers: z.boolean().default(true),
  fontFamily: z.enum(templateFontFamilies).default("serif"),
  defaultFontSize: fontSizeSchema.default("body"),
  fontScale: z
    .number()
    .int()
    .min(templateFontScaleMin)
    .max(templateFontScaleMax)
    .default(templateFontScaleDefault),
  serviceCta: serviceCtaSchema.default(defaultServiceCta),
  repeaters: z.array(templateRepeaterSchema).max(20).default([]),
});

const documentTemplateBaseSchema = z.object({
  title: textSchema(180),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens.",
    ),
  description: textSchema(500),
  settings: templateSettingsSchema,
  fields: z.array(templateFieldSchema).max(80),
  pages: z.array(templatePageSchema).min(1).max(80),
});

const legacyDocumentTemplateSchema = z.object({
  title: textSchema(180),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: textSchema(500),
  settings: templateSettingsSchema,
  fields: z.array(templateFieldSchema).max(80),
  blocks: z.array(templateBlockSchema).max(240),
});

function templatePlaceholderKeys(text: string) {
  return Array.from(
    text.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/gi),
    (match) => match[1],
  );
}

function addReferenceValidation(
  value: {
    fields: TemplateField[];
    pages: TemplatePage[];
    settings: TemplateSettings;
  },
  context: z.RefinementCtx,
) {
  const seen = new Set<string>();
  const reservedKeys = new Set(["item_number"]);
  const repeaterKeys = new Set<string>();
  const repeatersByKey = new Map<string, TemplateRepeater>();
  for (const [index, repeater] of value.settings.repeaters.entries()) {
    if (repeaterKeys.has(repeater.key))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["settings", "repeaters", index, "key"],
        message: "Repeatable group keys must be unique.",
      });
    repeaterKeys.add(repeater.key);
    repeatersByKey.set(repeater.key, repeater);
    const countField = value.fields.find(
      (field) => field.key === repeater.countFieldKey,
    );
    if (
      !countField ||
      (countField.type !== "select" && countField.type !== "number")
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["settings", "repeaters", index, "countFieldKey"],
        message:
          "Choose an existing number or dropdown field for this repeatable group.",
      });
  }
  for (const [index, field] of value.fields.entries()) {
    if (seen.has(field.key))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fields", index, "key"],
        message: "Field keys must be unique.",
      });
    seen.add(field.key);
  }
  for (const [index, field] of value.fields.entries()) {
    if (field.visibleWhen && !seen.has(field.visibleWhen.fieldKey))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fields", index, "visibleWhen", "fieldKey"],
        message: "Choose an existing field for this visibility rule.",
      });
  }
  for (const [repeaterIndex, repeater] of value.settings.repeaters.entries()) {
    const repeaterFields = new Set(repeater.fields.map((field) => field.key));
    for (const [fieldIndex, field] of repeater.fields.entries()) {
      if (
        field.visibleWhen &&
        !seen.has(field.visibleWhen.fieldKey) &&
        !repeaterFields.has(field.visibleWhen.fieldKey)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "settings",
            "repeaters",
            repeaterIndex,
            "fields",
            fieldIndex,
            "visibleWhen",
            "fieldKey",
          ],
          message:
            "Choose an existing global or repeatable field for this visibility rule.",
        });
      }
    }
  }
  for (const [pageIndex, page] of value.pages.entries()) {
    for (const [blockIndex, block] of page.blocks.entries()) {
      if (block.repeat && !repeaterKeys.has(block.repeat.repeaterKey))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "pages",
            pageIndex,
            "blocks",
            blockIndex,
            "repeat",
            "repeaterKey",
          ],
          message: "Choose an existing repeatable group for this block.",
        });
      const repeater = block.repeat
        ? repeatersByKey.get(block.repeat.repeaterKey)
        : undefined;
      const allowedKeys = repeater
        ? new Set([...seen, ...repeater.fields.map((field) => field.key)])
        : seen;
      if (block.type === "field" && !allowedKeys.has(block.fieldKey))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pages", pageIndex, "blocks", blockIndex, "fieldKey"],
          message:
            "Choose an existing global or repeatable field for this block.",
        });
      if (block.visibleWhen && !allowedKeys.has(block.visibleWhen.fieldKey))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "pages",
            pageIndex,
            "blocks",
            blockIndex,
            "visibleWhen",
            "fieldKey",
          ],
          message:
            "Choose an existing global or repeatable field for this visibility rule.",
        });
      const placeholderText =
        block.type === "title" ||
        block.type === "heading" ||
        block.type === "paragraph"
          ? block.text
          : block.type === "signature"
            ? block.label
            : "";
      for (const key of templatePlaceholderKeys(placeholderText)) {
        if (!allowedKeys.has(key) && !(repeater && reservedKeys.has(key)))
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "pages",
              pageIndex,
              "blocks",
              blockIndex,
              block.type === "signature" ? "label" : "text",
            ],
            message: `Unknown template field placeholder: ${key}.`,
          });
      }
    }
  }
}

export const documentTemplateDraftSchema =
  documentTemplateBaseSchema.superRefine(addReferenceValidation);

export type TemplateField = z.infer<typeof templateFieldSchema>;
export type TemplateRepeaterField = z.infer<typeof templateRepeaterFieldSchema>;
export type TemplateRepeat = z.infer<typeof templateRepeatSchema>;
export type TemplateRepeater = z.infer<typeof templateRepeaterSchema>;
export type TemplateVisibilityRule = z.infer<
  typeof templateVisibilityRuleSchema
>;
export type TemplateBlock = z.infer<typeof templateBlockSchema>;
export type TemplatePageSettings = z.infer<typeof templatePageSettingsSchema>;
export type TemplatePage = z.infer<typeof templatePageSchema>;
export type TemplateSettings = z.infer<typeof templateSettingsSchema>;
export type TemplateIconName = TemplateSettings["icon"];
export type TemplateServiceCta = z.infer<typeof serviceCtaSchema>;
export type DocumentTemplateDraft = z.infer<typeof documentTemplateDraftSchema>;

export type DocumentTemplateSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: TemplateIconName;
  paperSize: TemplatePaperSize;
  status: "DRAFT" | "PUBLISHED";
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  sortOrder: number;
  updatedAt: string;
};

export type AdminDocumentTemplate = DocumentTemplateSummary &
  DocumentTemplateDraft;

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

export type TemplateBlockInstance = {
  block: TemplateBlock;
  values: TemplateValues;
  fields: TemplateField[];
  key: string;
};

export function templateRepeaterFieldValueKey(
  repeater: TemplateRepeater,
  index: number,
  field: TemplateRepeaterField,
) {
  return (
    field.sourceKeyPattern?.replace(/\{index\}/g, String(index)) ??
    `${repeater.key}.${index}.${field.key}`
  );
}

export function templateRepeaterItemCount(
  repeater: TemplateRepeater,
  values: TemplateValues = {},
) {
  const parsed = Number.parseInt(values[repeater.countFieldKey] ?? "", 10);
  const requested = Number.isFinite(parsed) ? parsed : repeater.minItems;
  return Math.min(repeater.maxItems, Math.max(repeater.minItems, requested));
}

export function templateRepeaterItemIndexes(
  repeater: TemplateRepeater,
  values: TemplateValues = {},
  range?: TemplateRepeat,
) {
  const count = templateRepeaterItemCount(repeater, values);
  const from = range?.from ?? 1;
  const to = range?.to ?? count;
  if (from > count || to < 1 || to < from) return [];
  const start = Math.max(1, from);
  const end = Math.min(count, to);
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

export function templateRepeaterItemContext(
  repeater: TemplateRepeater,
  index: number,
  values: TemplateValues = {},
) {
  const context: TemplateValues = { ...values, item_number: String(index) };
  for (const field of repeater.fields) {
    const valueKey = templateRepeaterFieldValueKey(repeater, index, field);
    context[field.key] = values[valueKey] ?? field.defaultValue ?? "";
  }
  return context;
}

export function isTemplateFieldManagedByRepeater(
  field: TemplateField,
  repeaters: TemplateRepeater[] = [],
) {
  return repeaters.some((repeater) =>
    repeater.fields.some((repeaterField) =>
      Array.from({ length: repeater.maxItems }, (_, offset) => offset + 1).some(
        (index) =>
          templateRepeaterFieldValueKey(repeater, index, repeaterField) ===
          field.key,
      ),
    ),
  );
}

export function expandTemplateBlockInstances(
  template: DocumentTemplateDraft,
  block: TemplateBlock,
  values: TemplateValues = {},
): TemplateBlockInstance[] {
  if (!block.repeat)
    return [{ block, values, fields: template.fields, key: block.id }];
  const repeater = template.settings.repeaters.find(
    (item) => item.key === block.repeat?.repeaterKey,
  );
  if (!repeater)
    return [{ block, values, fields: template.fields, key: block.id }];
  const { repeat: _repeat, ...baseBlock } = block;
  return templateRepeaterItemIndexes(repeater, values, block.repeat).map(
    (index) => ({
      block: baseBlock as TemplateBlock,
      values: templateRepeaterItemContext(repeater, index, values),
      fields: [...repeater.fields, ...template.fields],
      key: `${block.id}-${index}`,
    }),
  );
}

export const defaultTemplateSettings: TemplateSettings = {
  icon: "contract",
  paperSize: "A4",
  marginTop: 20,
  marginRight: 18,
  marginBottom: 20,
  marginLeft: 18,
  stampGap: 18,
  showPageNumbers: true,
  fontFamily: "serif",
  defaultFontSize: "body",
  fontScale: templateFontScaleDefault,
  serviceCta: { ...defaultServiceCta },
  repeaters: [],
};

const defaultMouBlocks: TemplateBlock[] = [
  {
    id: "block-title",
    type: "title",
    text: "MEMORANDUM OF UNDERSTANDING",
    align: "center",
    bold: true,
    italic: false,
    fontSize: "title",
  },
  {
    id: "block-intro",
    type: "paragraph",
    text: "This draft is prepared on {{effective_date}} between {{party_a}} and {{party_b}} for review and discussion.",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  {
    id: "block-purpose-heading",
    type: "heading",
    text: "1. Shared purpose",
    align: "left",
    bold: true,
    italic: false,
    fontSize: "subtitle",
  },
  {
    id: "block-purpose",
    type: "paragraph",
    text: "{{purpose}}",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  { id: "block-page-two", type: "pageBreak" },
  {
    id: "block-responsibilities-heading",
    type: "heading",
    text: "2. Responsibilities",
    align: "left",
    bold: true,
    italic: false,
    fontSize: "subtitle",
  },
  {
    id: "block-party-a",
    type: "paragraph",
    text: "First party — {{party_a}}\n{{party_a_obligations}}",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  {
    id: "block-party-b",
    type: "paragraph",
    text: "Second party — {{party_b}}\n{{party_b_obligations}}",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  {
    id: "block-term-heading",
    type: "heading",
    text: "3. Duration and milestones",
    align: "left",
    bold: true,
    italic: false,
    fontSize: "subtitle",
  },
  {
    id: "block-term",
    type: "paragraph",
    text: "{{term}}",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  { id: "block-page-three", type: "pageBreak" },
  {
    id: "block-review-heading",
    type: "heading",
    text: "4. Review and next steps",
    align: "left",
    bold: true,
    italic: false,
    fontSize: "subtitle",
  },
  {
    id: "block-review",
    type: "paragraph",
    text: "This document records the current understanding of the parties. It should be reviewed for applicable law, confidentiality, intellectual property, payment, termination and dispute provisions before signing.",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
  },
  {
    id: "block-signature-a",
    type: "signature",
    label: "First party — {{party_a}}",
  },
  {
    id: "block-signature-b",
    type: "signature",
    label: "Second party — {{party_b}}",
  },
];

export function createTemplateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function blocksToPages(blocks: TemplateBlock[]): TemplatePage[] {
  const pages: TemplatePage[] = [
    { id: "page-1", title: "Page 1", settings: {}, blocks: [] },
  ];
  for (const block of blocks) {
    if (block.type === "pageBreak") {
      if (pages.at(-1)?.blocks.length)
        pages.push({
          id: `page-${pages.length + 1}`,
          title: `Page ${pages.length + 1}`,
          settings: {},
          blocks: [],
        });
      continue;
    }
    pages.at(-1)!.blocks.push(block);
  }
  const nonEmptyPages = pages.filter((page) => page.blocks.length > 0);
  return nonEmptyPages.length ? nonEmptyPages : pages;
}

export function flattenTemplatePages(pages: TemplatePage[]): TemplateBlock[] {
  return pages.flatMap((page, index) => [
    ...(index
      ? [{ id: `page-break-${page.id}`, type: "pageBreak" as const }]
      : []),
    ...page.blocks,
  ]);
}

export function normalizeDocumentTemplateDraft(
  input: unknown,
): DocumentTemplateDraft {
  const candidate =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  if (Array.isArray(candidate.pages))
    return documentTemplateDraftSchema.parse(input);
  const legacy = legacyDocumentTemplateSchema.parse(input);
  return documentTemplateDraftSchema.parse({
    ...legacy,
    pages: blocksToPages(legacy.blocks),
  });
}

export const defaultMouTemplate: DocumentTemplateDraft = {
  title: "Memorandum of Understanding",
  slug: "memorandum-of-understanding",
  description:
    "A clear starting template for recording a shared business understanding.",
  settings: defaultTemplateSettings,
  fields: [
    {
      id: "field-party-a",
      key: "party_a",
      label: "First party",
      type: "text",
      required: true,
      placeholder: "Full legal name",
      options: [],
    },
    {
      id: "field-party-b",
      key: "party_b",
      label: "Second party",
      type: "text",
      required: true,
      placeholder: "Full legal name",
      options: [],
    },
    {
      id: "field-date",
      key: "effective_date",
      label: "Effective date",
      type: "date",
      required: true,
      placeholder: "",
      options: [],
    },
    {
      id: "field-purpose",
      key: "purpose",
      label: "Shared purpose",
      type: "textarea",
      required: true,
      placeholder: "What are the parties working toward?",
      options: [],
    },
    {
      id: "field-party-a-obligations",
      key: "party_a_obligations",
      label: "First party responsibilities",
      type: "textarea",
      required: true,
      placeholder: "List the agreed responsibilities.",
      options: [],
    },
    {
      id: "field-party-b-obligations",
      key: "party_b_obligations",
      label: "Second party responsibilities",
      type: "textarea",
      required: true,
      placeholder: "List the agreed responsibilities.",
      options: [],
    },
    {
      id: "field-term",
      key: "term",
      label: "Duration and milestones",
      type: "textarea",
      required: true,
      placeholder: "State the proposed term and key milestones.",
      options: [],
    },
  ],
  pages: blocksToPages(defaultMouBlocks).map((page, index) => ({
    ...page,
    title:
      ["Overview", "Responsibilities", "Review & signing"][index] ?? page.title,
  })),
};

export function createBlankTemplate(): DocumentTemplateDraft {
  return {
    title: "Untitled template",
    slug: `untitled-template-${Date.now()}`,
    description: "Describe what this template is for.",
    settings: { ...defaultTemplateSettings },
    fields: [],
    pages: [
      {
        id: createTemplateId("page"),
        title: "Page 1",
        settings: {},
        blocks: [
          {
            id: createTemplateId("block"),
            type: "paragraph",
            text: "Start writing your document here.",
            align: "left",
            bold: false,
            italic: false,
            fontSize: "body",
          },
        ],
      },
    ],
  };
}

export function resolveTemplateFieldValue(
  field: Pick<TemplateField, "type" | "options"> | undefined,
  value: string | undefined,
) {
  const rawValue = value?.trim() ?? "";
  if (!rawValue || field?.type !== "select") return rawValue;
  return (
    field.options.find((option) => option.value === rawValue)?.label ?? rawValue
  );
}

export function resolveTemplateText(
  text: string,
  values: TemplateValues = {},
  fields: TemplateField[] = [],
  showLabels = true,
) {
  const placeholders = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/gi;
  const isVisible = (key: string) => {
    const field = fields.find((item) => item.key === key);
    return (
      !field?.visibleWhen ||
      isTemplateVisibilityMatch(field.visibleWhen, values)
    );
  };
  const withoutHiddenLines = text
    .split("\n")
    .filter((line) => {
      const keys = Array.from(line.matchAll(placeholders), (match) => match[1]);
      return !keys.length || keys.some((key) => isVisible(key));
    })
    .join("\n");
  return withoutHiddenLines.replace(placeholders, (_match, key: string) => {
    if (!isVisible(key)) return "";
    const field = fields.find((item) => item.key === key);
    const value = resolveTemplateFieldValue(field, values[key]);
    if (value) return value;
    if (!showLabels) return "";
    return `[${field?.label ?? key}]`;
  });
}

export function isTemplateVisibilityMatch(
  rule: TemplateVisibilityRule,
  values: TemplateValues = {},
) {
  const value = values[rule.fieldKey]?.trim() ?? "";
  return rule.values?.length ? rule.values.includes(value) : Boolean(value);
}

export function isTemplateFieldVisible(
  field: TemplateField,
  values: TemplateValues = {},
) {
  return (
    !field.visibleWhen || isTemplateVisibilityMatch(field.visibleWhen, values)
  );
}

export function isTemplateBlockVisible(
  block: TemplateBlock,
  values: TemplateValues = {},
) {
  return (
    !block.visibleWhen || isTemplateVisibilityMatch(block.visibleWhen, values)
  );
}

export function missingTemplateFields(
  fields: TemplateField[],
  values: TemplateValues,
  repeaters: TemplateRepeater[] = [],
) {
  const managedKeys = new Set(
    repeaters.flatMap((repeater) =>
      repeater.fields.flatMap((field) =>
        Array.from({ length: repeater.maxItems }, (_, offset) =>
          templateRepeaterFieldValueKey(repeater, offset + 1, field),
        ),
      ),
    ),
  );
  const missing = fields.filter(
    (field) =>
      !managedKeys.has(field.key) &&
      isTemplateFieldVisible(field, values) &&
      field.required &&
      (!values[field.key] ||
        (field.type === "checkbox" && values[field.key] !== "true")),
  );
  for (const repeater of repeaters) {
    for (const index of templateRepeaterItemIndexes(repeater, values)) {
      const itemValues = templateRepeaterItemContext(repeater, index, values);
      for (const field of repeater.fields) {
        const valueKey = templateRepeaterFieldValueKey(repeater, index, field);
        if (
          isTemplateFieldVisible(field, itemValues) &&
          field.required &&
          (!values[valueKey] ||
            (field.type === "checkbox" && values[valueKey] !== "true"))
        ) {
          missing.push({
            ...field,
            key: valueKey,
            label: `${repeater.itemLabel} ${index} — ${field.label}`,
          });
        }
      }
    }
  }
  return missing;
}

export function resolvePageSettings(
  template: Pick<DocumentTemplateDraft, "settings">,
  page: Pick<TemplatePage, "settings">,
) {
  return {
    paperSize: template.settings.paperSize,
    marginTop: page.settings.marginTop ?? template.settings.marginTop,
    marginRight: page.settings.marginRight ?? template.settings.marginRight,
    marginBottom: page.settings.marginBottom ?? template.settings.marginBottom,
    marginLeft: page.settings.marginLeft ?? template.settings.marginLeft,
    stampGap: page.settings.stampGap ?? template.settings.stampGap,
    showPageNumbers:
      page.settings.showPageNumbers ?? template.settings.showPageNumbers,
    fontFamily: page.settings.fontFamily ?? template.settings.fontFamily,
    defaultFontSize:
      page.settings.defaultFontSize ?? template.settings.defaultFontSize,
  };
}

export function resolveBlockFontSize(
  block: Extract<
    TemplateBlock,
    { type: "title" | "heading" | "paragraph" | "field" }
  >,
  settings: Pick<TemplateSettings, "defaultFontSize">,
) {
  return block.fontSize === "body" ? settings.defaultFontSize : block.fontSize;
}
