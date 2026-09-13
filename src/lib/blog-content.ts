import type { BlogContentBlock } from "../components/limex/blog-data.js";

export const blogLocales = ["en", "bn"] as const;
export type BlogLocale = (typeof blogLocales)[number];

const allowedTags = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "a", "img", "hr", "table", "thead",
  "tbody", "tr", "th", "td", "figure", "figcaption", "div", "section", "span", "style",
]);
const voidTags = new Set(["br", "hr", "img"]);
const dangerousBlocks = /<(script|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const dangerousSelfClosing = /<\/?(?:script|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)\b[^>]*>/gi;
const attributePattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function safeUrl(value: string, kind: "href" | "src") {
  const trimmed = value.trim();
  if (!trimmed) return kind === "href" ? "#" : null;
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed) || /^data:(?!image\/(?:gif|jpe?g|png|webp);base64,)/i.test(trimmed)) return kind === "href" ? "#" : null;
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : kind === "href" ? "#" : null;
}

// Rich text can contain editor-defined classes, but they must remain simple
// CSS identifiers. The stylesheet sanitizer scopes every selector to the
// rendered rich-text root, so these names cannot target the rest of the page.
const safeCssIdentifierPattern = /^[-_a-zA-Z][-_a-zA-Z0-9]{0,80}$/;
const richTextClassPattern = safeCssIdentifierPattern;
const richTextIdPattern = safeCssIdentifierPattern;
const allowedCssProperties = new Set([
  "align-content", "align-items", "align-self", "aspect-ratio", "background", "background-color",
  "border", "border-bottom", "border-color", "border-radius", "border-style", "border-top", "border-width",
  "box-sizing", "bottom", "color", "column-gap", "content", "display", "flex", "flex-basis", "flex-direction",
  "flex-grow", "flex-shrink", "flex-wrap", "font-family", "font-size", "font-style", "font-weight", "gap", "grid-auto-flow", "grid-column", "grid-row", "grid-template-columns",
  "grid-template-rows", "height", "justify-content", "justify-items", "left", "letter-spacing", "line-height", "margin",
  "margin-bottom", "margin-left", "margin-right", "margin-top", "max-height", "max-width", "min-height", "min-width",
  "object-fit", "object-position", "opacity", "order", "overflow", "overflow-wrap", "overflow-x", "overflow-y", "padding", "padding-bottom",
  "padding-left", "padding-right", "padding-top", "position", "right", "text-align", "text-decoration", "top",
  "text-overflow", "text-shadow", "text-transform", "transition", "transform", "vertical-align", "white-space", "width", "word-break", "z-index",
  "box-shadow", "cursor", "list-style", "list-style-type",
]);

export function isSafeBlogNavigationUrl(value: unknown) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    return ["http:", "https:"].includes(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

function sanitizeCssDeclarations(value: string) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(";")
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 1) return "";
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const rawValue = declaration.slice(separator + 1).trim();
      if (!allowedCssProperties.has(property) || !rawValue) return "";
      if (/url\s*\(|expression\s*\(|javascript\s*:|vbscript\s*:|behavior\s*:|-moz-binding|@import|<|>|[{}]/i.test(rawValue)) return "";
      const safeValue = rawValue.replace(/\s*!important\b/gi, "").trim();
      return safeValue ? property + ": " + safeValue : "";
    })
    .filter(Boolean)
    .join("; ");
}

function findClosingBrace(source: string, openIndex: number) {
  let depth = 0;
  let quote = "";
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && source[index - 1] !== "\\") quote = "";
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return index;
  }
  return -1;
}

function splitCssSelectors(value: string) {
  const selectors: string[] = [];
  let start = 0;
  let parentheses = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") parentheses += 1;
    if (value[index] === ")") parentheses = Math.max(0, parentheses - 1);
    if (value[index] === "," && parentheses === 0) {
      selectors.push(value.slice(start, index));
      start = index + 1;
    }
  }
  selectors.push(value.slice(start));
  return selectors;
}

function sanitizeBlogStyles(value: string): string {
  let output = "";
  let cursor = 0;
  while (cursor < value.length) {
    const openIndex = value.indexOf("{", cursor);
    if (openIndex < 0) break;
    const closeIndex = findClosingBrace(value, openIndex);
    if (closeIndex < 0) break;
    const prelude = value.slice(cursor, openIndex).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const body = value.slice(openIndex + 1, closeIndex);
    if (/^@media\s+(?:screen\s+and\s+)?\((?:max|min)-(?:width|height)\s*:\s*\d+(?:\.\d+)?(?:px|rem|em)\)\s*$/i.test(prelude)) {
      const nested = sanitizeBlogStyles(body);
      if (nested) output += prelude + "{" + nested + "}";
    } else if (!prelude.startsWith("@")) {
      const selectors = splitCssSelectors(prelude)
        .map((selector) => selector.trim().replace(/\s+/g, " "))
        // The scope prefix keeps even element-only rules (for example
        // `h2` or `p`) inside this rich-text instance. Reject root selectors
        // and CSS control characters so pasted styles cannot escape it.
        .filter((selector) => selector && !/(?:^|[\s>+~,(])(?:html|body|head)\b|:root|:global\b|[{};'"`\\]/i.test(selector))
        .map((selector) => selector.startsWith(".blog-rich-text") ? selector : ".blog-rich-text " + selector);
      const declarations = sanitizeCssDeclarations(body);
      if (selectors.length && declarations) output += selectors.join(", ") + "{" + declarations + "}";
    }
    cursor = closeIndex + 1;
  }
  return output;
}

function sanitizeTag(match: string, closingSlash: string | undefined, tagName: string, rawAttributes: string) {
  const tag = tagName.toLowerCase();
  if (!allowedTags.has(tag)) return "";
  if (closingSlash) return voidTags.has(tag) ? "" : `</${tag}>`;
  if (voidTags.has(tag)) {
    if (tag === "img") {
      let src = "";
      let alt = "";
      let title = "";
      for (const attribute of rawAttributes.matchAll(attributePattern)) {
        const name = attribute[1]?.toLowerCase();
        const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
        if (name === "src") src = safeUrl(value, "src") ?? "";
        if (name === "alt") alt = value.slice(0, 240);
        if (name === "title") title = value.slice(0, 240);
      }
      if (!src) return "";
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${title ? ` title="${escapeAttribute(title)}"` : ""}>`;
    }
    return `<${tag}>`;
  }

  const attributes: string[] = [];
  for (const attribute of rawAttributes.matchAll(attributePattern)) {
    const name = attribute[1]?.toLowerCase();
    const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    if (name === "href") {
      attributes.push(`href="${escapeAttribute(safeUrl(value, "href") ?? "#")}"`);
    } else if (name === "target" && value === "_blank") {
      attributes.push(`target="_blank"`);
    } else if (name === "rel") {
      attributes.push(`rel="${escapeAttribute(value.slice(0, 80))}"`);
    } else if (name === "title") {
      attributes.push(`title="${escapeAttribute(value.slice(0, 240))}"`);
    }
  }
  for (const attribute of rawAttributes.matchAll(attributePattern)) {
    const name = attribute[1]?.toLowerCase();
    const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    if (name === "class") {
      const classes = value.split(/\s+/).filter((className) => richTextClassPattern.test(className)).slice(0, 24);
      if (classes.length) attributes.push("class=\"" + escapeAttribute(classes.join(" ")) + "\"");
    } else if (name === "style") {
      const declarations = sanitizeCssDeclarations(value);
      if (declarations) attributes.push("style=\"" + escapeAttribute(declarations) + "\"");
    } else if (name === "id" && richTextIdPattern.test(value)) {
      attributes.push("id=\"" + escapeAttribute(value) + "\"");
    } else if (name === "data-blog-block" && /^[a-z0-9_-]{1,80}$/i.test(value)) {
      attributes.push("data-blog-block=\"" + escapeAttribute(value) + "\"");
    }
  }
  if (tag === "a" && attributes.some((attribute) => attribute.startsWith("target=\"_blank\"")) && !attributes.some((attribute) => attribute.startsWith("rel="))) {
    attributes.push(`rel="noopener noreferrer"`);
  }
  return `<${tag}${attributes.length ? ` ${attributes.join(" ")}` : ""}>`;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeBlogHtml(value: unknown) {
  const { html, css } = sanitizeBlogContent(value);
  return `${css ? `<style>${css}</style>` : ""}${html}`.trim();
}

export type SanitizedBlogContent = {
  html: string;
  css: string;
};

/**
 * Sanitize rich HTML and separate its safe, scoped stylesheet. Keeping CSS
 * outside the HTML fragment makes browser rendering deterministic: a style
 * element is no longer nested inside dangerouslySetInnerHTML content.
 */
export function sanitizeBlogContent(value: unknown): SanitizedBlogContent {
  const source = typeof value === "string" ? value : "";
  const styles: string[] = [];
  const withoutStyles = source
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi, (_match, css: string) => {
      const safeCss = sanitizeBlogStyles(css);
      if (safeCss) styles.push(safeCss);
      return "";
    })
    // An unfinished style block must never leak raw CSS into the markup.
    .replace(/<style\b[^>]*>[\s\S]*$/gi, "");
  const withoutDangerousBlocks = withoutStyles.replace(dangerousBlocks, "").replace(dangerousSelfClosing, "").replace(/<!--[\s\S]*?-->/g, "");
  const html = withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tagName: string, rawAttributes: string) => {
    const closingSlash = match.startsWith("</") ? "/" : undefined;
    return sanitizeTag(match, closingSlash, tagName, rawAttributes);
  }).trim();
  return { html, css: styles.join("") };
}

export function htmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|blockquote|tr|figcaption)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadTime(value: string) {
  const words = htmlToPlainText(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function normalizeBlogKeywords(value: unknown) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const seen = new Set<string>();
  return values
    .map((item) => String(item).trim().replace(/\s+/g, " ").slice(0, 100))
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

export function normalizeBlogSlug(value: string) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
  return slug || "untitled-article";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function blogBlocksToHtml(blocks: BlogContentBlock[]) {
  return blocks.map((block) => {
    if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
    if (block.type === "paragraph") return `<p>${escapeHtml(block.text)}</p>`;
    return `<section data-blog-block="step"><h3><strong>${escapeHtml(block.number)}</strong> ${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></section>`;
  }).join("");
}

export function blogContentJson(html: string) {
  return { version: 1, html };
}
