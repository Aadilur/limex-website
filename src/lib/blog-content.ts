import type { BlogContentBlock } from "../components/limex/blog-data.js";

export const blogLocales = ["en", "bn"] as const;
export type BlogLocale = (typeof blogLocales)[number];

const allowedTags = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "a", "img", "hr", "table", "thead",
  "tbody", "tr", "th", "td", "figure", "figcaption",
]);
const voidTags = new Set(["br", "hr", "img"]);
const dangerousBlocks = /<(script|style|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const dangerousSelfClosing = /<\/?(?:script|style|iframe|object|embed|svg|math|template|textarea|input|button|select|option|form|meta|link)\b[^>]*>/gi;
const attributePattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function safeUrl(value: string, kind: "href" | "src") {
  const trimmed = value.trim();
  if (!trimmed) return kind === "href" ? "#" : null;
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed) || /^data:(?!image\/(?:gif|jpe?g|png|webp);base64,)/i.test(trimmed)) return kind === "href" ? "#" : null;
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : kind === "href" ? "#" : null;
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
  if (tag === "a" && attributes.some((attribute) => attribute.startsWith("target=\"_blank\"")) && !attributes.some((attribute) => attribute.startsWith("rel="))) {
    attributes.push(`rel="noopener noreferrer"`);
  }
  return `<${tag}${attributes.length ? ` ${attributes.join(" ")}` : ""}>`;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeBlogHtml(value: unknown) {
  const source = typeof value === "string" ? value : "";
  const withoutDangerousBlocks = source.replace(dangerousBlocks, "").replace(dangerousSelfClosing, "").replace(/<!--[\s\S]*?-->/g, "");
  return withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tagName: string, rawAttributes: string) => {
    const closingSlash = match.startsWith("</") ? "/" : undefined;
    return sanitizeTag(match, closingSlash, tagName, rawAttributes);
  }).trim();
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
