import type { BlogContentBlock } from "../components/limex/blog-data.js";

export const blogLocales = ["en", "bn"] as const;
export type BlogLocale = (typeof blogLocales)[number];

const allowedTags = new Set([
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
  "caption",
  "figure",
  "figcaption",
  "main",
  "article",
  "header",
  "footer",
  "nav",
  "aside",
  "section",
  "div",
  "span",
  "style",
  "pre",
  "code",
  "kbd",
  "samp",
  "var",
  "small",
  "sub",
  "sup",
  "mark",
  "del",
  "ins",
  "details",
  "summary",
  "picture",
  "source",
  "time",
  "address",
  "abbr",
  "dl",
  "dt",
  "dd",
]);
const voidTags = new Set(["br", "hr", "img", "col", "source"]);
const dangerousBlocks =
  /<(script|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const dangerousSelfClosing =
  /<\/?(?:script|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)\b[^>]*>/gi;
const documentCleanup =
  /<\?xml[^>]*\?>|<!doctype[^>]*>|<\/?html\b[^>]*>|<\/?body\b[^>]*>|<head\b[^>]*>[\s\S]*?<\/head\s*>|<title\b[^>]*>[\s\S]*?<\/title\s*>/gi;
const attributePattern =
  /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function safeUrl(value: string, kind: "href" | "src") {
  const trimmed = value.trim();
  if (!trimmed) return kind === "href" ? "#" : null;
  if (
    /^javascript:/i.test(trimmed) ||
    /^vbscript:/i.test(trimmed) ||
    /^data:(?!image\/(?:gif|jpe?g|png|webp);base64,)/i.test(trimmed)
  )
    return kind === "href" ? "#" : null;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  )
    return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : kind === "href" ? "#" : null;
}

function isSafeCssUrl(url: string) {
  const trimmed = url.trim().replace(/^['"]|['"]$/g, "");
  if (
    !trimmed ||
    /^javascript:/i.test(trimmed) ||
    /^vbscript:/i.test(trimmed) ||
    /^data:(?!image\/(?:gif|jpe?g|png|webp|svg\+xml);base64,)/i.test(trimmed)
  ) {
    return false;
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    /^https?:\/\//i.test(trimmed) ||
    /^data:image\/(?:gif|jpe?g|png|webp|svg\+xml);base64,/i.test(trimmed)
  ) {
    return true;
  }
  return false;
}

function isCssPropertyAllowed(property: string): boolean {
  // Allow all valid CSS property identifiers, vendor prefixes, and CSS variables (--*)
  // while blocking obsolete dangerous executable properties like behavior and -moz-binding.
  return (
    /^(?:--[a-zA-Z0-9-_]+|-?[a-zA-Z_][a-zA-Z0-9-_]*)$/.test(property) &&
    property !== "behavior" &&
    property !== "-moz-binding"
  );
}

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
      if (!isCssPropertyAllowed(property) || !rawValue) return "";
      if (
        /expression\s*\(|javascript\s*:|vbscript\s*:|behavior\s*:|-moz-binding|@import|<|>|[{}]/i.test(
          rawValue,
        )
      )
        return "";
      const urls = rawValue.matchAll(/url\s*\(([^)]+)\)/gi);
      for (const match of urls) {
        if (!isSafeCssUrl(match[1])) return "";
      }
      // Keep local priority declarations from pasted designs. They cannot
      // affect the rest of the page because selectors are scoped below.
      const safeValue = rawValue
        .replace(/\s*!important\b/gi, " !important")
        .trim();
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
    if (character === '"' || character === "'") {
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

function scopeCssSelector(rawSelector: string): string {
  const trimmed = rawSelector.trim().replace(/\s+/g, " ");
  if (!trimmed || /[{};<]/i.test(trimmed)) return "";

  // Map root/document selectors (:root, html, body) to .blog-rich-text
  // so pasted base styles and CSS custom properties target the article root.
  let scoped = trimmed
    .replace(
      /(?:^|(?<=[\s,>+~]))(?:html\s+body|html|body|:root)(?=$|[\s,>+~.:[#])/g,
      ".blog-rich-text",
    )
    .replace(/\.blog-rich-text\s+\.blog-rich-text/g, ".blog-rich-text")
    .trim();

  if (!scoped.startsWith(".blog-rich-text")) {
    scoped =
      scoped.startsWith(">") || scoped.startsWith("+") || scoped.startsWith("~")
        ? ".blog-rich-text " + scoped
        : ".blog-rich-text " + scoped;
  }
  return scoped;
}

function sanitizeBlogStyles(value: string): string {
  let output = "";
  let cursor = 0;
  while (cursor < value.length) {
    const openIndex = value.indexOf("{", cursor);
    if (openIndex < 0) break;
    const closeIndex = findClosingBrace(value, openIndex);
    if (closeIndex < 0) break;
    const prelude = value
      .slice(cursor, openIndex)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();
    const body = value.slice(openIndex + 1, closeIndex);
    if (/^@media\s+[^{};<>]+$/i.test(prelude)) {
      const nested = sanitizeBlogStyles(body);
      if (nested) output += prelude + "{" + nested + "}";
    } else if (/^@keyframes\s+[-_a-zA-Z0-9]+$/i.test(prelude)) {
      // Keyframe rules have steps like "0% { ... }" or "from { ... }"
      let keyframeBody = "";
      let kCursor = 0;
      while (kCursor < body.length) {
        const kOpen = body.indexOf("{", kCursor);
        if (kOpen < 0) break;
        const kClose = findClosingBrace(body, kOpen);
        if (kClose < 0) break;
        const kStep = body.slice(kCursor, kOpen).trim();
        if (
          /^(?:from|to|\d{1,3}(?:\.\d+)?%)(?:\s*,\s*(?:from|to|\d{1,3}(?:\.\d+)?%))*$/i.test(
            kStep,
          )
        ) {
          const kDecls = sanitizeCssDeclarations(body.slice(kOpen + 1, kClose));
          if (kDecls) keyframeBody += kStep + "{" + kDecls + "}";
        }
        kCursor = kClose + 1;
      }
      if (keyframeBody) output += prelude + "{" + keyframeBody + "}";
    } else if (!prelude.startsWith("@")) {
      const selectors = splitCssSelectors(prelude)
        .map(scopeCssSelector)
        .filter(Boolean);
      const declarations = sanitizeCssDeclarations(body);
      if (selectors.length && declarations)
        output += selectors.join(", ") + "{" + declarations + "}";
    }
    cursor = closeIndex + 1;
  }
  return output;
}

function sanitizeTag(
  match: string,
  closingSlash: string | undefined,
  tagName: string,
  rawAttributes: string,
) {
  const tag = tagName.toLowerCase();
  if (!allowedTags.has(tag)) return "";
  if (closingSlash) return voidTags.has(tag) ? "" : `</${tag}>`;
  if (voidTags.has(tag)) {
    if (tag === "img") {
      let src = "";
      let alt = "";
      let title = "";
      let width = "";
      let height = "";
      let loading = "";
      let decoding = "";
      for (const attribute of rawAttributes.matchAll(attributePattern)) {
        const name = attribute[1]?.toLowerCase();
        const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
        if (name === "src") src = safeUrl(value, "src") ?? "";
        if (name === "alt") alt = value.slice(0, 240);
        if (name === "title") title = value.slice(0, 240);
        if (name === "width" && /^\d+(?:%|px)?$/i.test(value)) width = value;
        if (name === "height" && /^\d+(?:%|px)?$/i.test(value)) height = value;
        if (name === "loading" && /^(?:lazy|eager)$/i.test(value))
          loading = value.toLowerCase();
        if (name === "decoding" && /^(?:async|sync|auto)$/i.test(value))
          decoding = value.toLowerCase();
      }
      if (!src) return "";
      const extras = [
        title ? ` title="${escapeAttribute(title)}"` : "",
        width ? ` width="${escapeAttribute(width)}"` : "",
        height ? ` height="${escapeAttribute(height)}"` : "",
        loading ? ` loading="${escapeAttribute(loading)}"` : "",
        decoding ? ` decoding="${escapeAttribute(decoding)}"` : "",
      ].join("");
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${extras}>`;
    }
    return `<${tag}>`;
  }

  const attributes: string[] = [];
  for (const attribute of rawAttributes.matchAll(attributePattern)) {
    const name = attribute[1]?.toLowerCase();
    const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    if (name === "href") {
      attributes.push(
        `href="${escapeAttribute(safeUrl(value, "href") ?? "#")}"`,
      );
    } else if (name === "target" && value === "_blank") {
      attributes.push(`target="_blank"`);
    } else if (name === "rel") {
      attributes.push(`rel="${escapeAttribute(value.slice(0, 80))}"`);
    } else if (name === "title") {
      attributes.push(`title="${escapeAttribute(value.slice(0, 240))}"`);
    } else if (name === "class") {
      // Allow all CSS classes: preserve whatever classes the author puts in their markup,
      // filtering out characters that could break out of attributes (< > " ') and escaping safely.
      const classes = value
        .split(/\s+/)
        .map((c) => c.trim())
        .filter((c) => c && !/[<>"']/.test(c))
        .slice(0, 300);
      if (classes.length)
        attributes.push(`class="${escapeAttribute(classes.join(" "))}"`);
    } else if (name === "style") {
      const declarations = sanitizeCssDeclarations(value);
      if (declarations)
        attributes.push('style="' + escapeAttribute(declarations) + '"');
    } else if (name === "id") {
      const cleanId = value.trim();
      if (cleanId && !/[<>"'\s]/.test(cleanId) && cleanId.length <= 120) {
        attributes.push(`id="${escapeAttribute(cleanId)}"`);
      }
    } else if (/^data-[a-z0-9_-]{1,80}$/i.test(name) && !/[<>"']/.test(value)) {
      attributes.push(`${name}="${escapeAttribute(value.slice(0, 240))}"`);
    } else if (/^aria-[a-z0-9_-]{1,80}$/i.test(name) && !/[<>"']/.test(value)) {
      attributes.push(`${name}="${escapeAttribute(value.slice(0, 240))}"`);
    } else if (name === "role" && /^[a-z0-9_-]{1,40}$/i.test(value)) {
      attributes.push(`role="${escapeAttribute(value)}"`);
    } else if (
      (name === "colspan" || name === "rowspan") &&
      /^\d{1,3}$/.test(value)
    ) {
      attributes.push(`${name}="${value}"`);
    } else if (
      name === "scope" &&
      /^(?:col|row|colgroup|rowgroup)$/i.test(value)
    ) {
      attributes.push(`scope="${value.toLowerCase()}"`);
    } else if (name === "open" && tag === "details") {
      attributes.push("open");
    } else if (name === "name" && !/[<>"'\s]/.test(value)) {
      attributes.push(`name="${escapeAttribute(value.slice(0, 100))}"`);
    } else if (
      (name === "width" || name === "height") &&
      /^\d+(?:%|px|rem|em)?$/i.test(value)
    ) {
      attributes.push(`${name}="${value}"`);
    } else if (
      (name === "align" || name === "valign") &&
      /^[a-z]+$/i.test(value)
    ) {
      attributes.push(`${name}="${value.toLowerCase()}"`);
    } else if (
      (name === "cellpadding" || name === "cellspacing" || name === "border") &&
      /^\d+$/.test(value)
    ) {
      attributes.push(`${name}="${value}"`);
    } else if (name === "type" && /^[a-zA-Z0-9_\/-]+$/.test(value)) {
      attributes.push(`type="${escapeAttribute(value)}"`);
    } else if (name === "srcset" && !/[<>"']/.test(value)) {
      attributes.push(`srcset="${escapeAttribute(value)}"`);
    } else if (name === "sizes" && !/[<>"']/.test(value)) {
      attributes.push(`sizes="${escapeAttribute(value)}"`);
    } else if (name === "media" && !/[<>"']/.test(value)) {
      attributes.push(`media="${escapeAttribute(value)}"`);
    }
  }
  if (
    tag === "a" &&
    attributes.some((attribute) => attribute.startsWith('target="_blank"')) &&
    !attributes.some((attribute) => attribute.startsWith("rel="))
  ) {
    attributes.push(`rel="noopener noreferrer"`);
  }
  return `<${tag}${attributes.length ? ` ${attributes.join(" ")}` : ""}>`;
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
    .replace(
      /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi,
      (_match, css: string) => {
        const safeCss = sanitizeBlogStyles(css);
        if (safeCss) styles.push(safeCss);
        return "";
      },
    )
    // An unfinished style block must never leak raw CSS into the markup.
    .replace(/<style\b[^>]*>[\s\S]*$/gi, "");
  const withoutDocumentTags = withoutStyles.replace(documentCleanup, "");
  const withoutDangerousBlocks = withoutDocumentTags
    .replace(dangerousBlocks, "")
    .replace(dangerousSelfClosing, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const html = withoutDangerousBlocks
    .replace(
      /<\/?([a-zA-Z0-9-]+)([^>]*)>/g,
      (match, tagName: string, rawAttributes: string) => {
        const closingSlash = match.startsWith("</") ? "/" : undefined;
        return sanitizeTag(match, closingSlash, tagName, rawAttributes);
      },
    )
    .trim();
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
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
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
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function blogBlocksToHtml(blocks: BlogContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "paragraph") return `<p>${escapeHtml(block.text)}</p>`;
      return `<section data-blog-block="step"><h3><strong>${escapeHtml(block.number)}</strong> ${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></section>`;
    })
    .join("");
}

export function blogContentJson(html: string) {
  return { version: 1, html };
}
