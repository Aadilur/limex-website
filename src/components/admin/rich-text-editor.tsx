"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { sanitizeBlogContent } from "@/lib/blog-content";
import { blogRichTextClass } from "@/components/limex/blog-rich-text";

export type RichTextDocument = Record<string, unknown>;

type EditorIconName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify"
  | "bullet-list"
  | "ordered-list"
  | "quote"
  | "palette"
  | "highlight"
  | "clear"
  | "link"
  | "image"
  | "divider"
  | "undo"
  | "redo"
  | "external";

type BlockStyle = "paragraph" | "heading-2" | "heading-3" | "heading-4";
type TextAlignment = "left" | "center" | "right" | "justify";
type EditorMode = "visual" | "html" | "css" | "preview";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string, document: RichTextDocument) => void;
  placeholder?: string;
  ariaLabel?: string;
  compact?: boolean;
  className?: string;
};

const inputClass =
  "min-h-10 w-full rounded-[10px] border border-[#ddd7ce] bg-[#fffdfa] px-3 text-[12px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10";

const textColorPalette = [
  { label: "Ink", value: "#071b3d" },
  { label: "Brand blue", value: "#0055ff" },
  { label: "Sky", value: "#008cff" },
  { label: "Cyan", value: "#008a9a" },
  { label: "Rose", value: "#d64769" },
  { label: "Green", value: "#287a58" },
  { label: "Warm grey", value: "#625a58" },
  { label: "Muted", value: "#77736e" },
];

const highlightPalette = [
  { label: "Soft blue", value: "#e8f0fe" },
  { label: "Soft cyan", value: "#e8f8fb" },
  { label: "Soft green", value: "#e8f4ec" },
  { label: "Soft yellow", value: "#fff3c4" },
  { label: "Soft rose", value: "#ffe8ee" },
  { label: "Soft violet", value: "#f0eafe" },
];

type ColorPanelMode = "text" | "highlight";

function editorSurfaceClass(compact: boolean) {
  return [
    compact ? "min-h-[220px]" : "min-h-[320px]",
    "px-5 py-5 text-[15px] leading-[1.75] text-[#383531] outline-none",
    "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
    "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:font-brand [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.035em] [&_h2]:text-[#071b3d]",
    "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-brand [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:leading-[1.2] [&_h3]:tracking-[-0.025em] [&_h3]:text-[#071b3d]",
    "[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-bold [&_h4]:text-[16px] [&_h4]:leading-[1.3] [&_h4]:text-[#071b3d]",
    "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_.list-none]:list-none",
    "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0055ff] [&_blockquote]:bg-[#eaf3ff] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-[#625a58]",
    "[&_mark]:rounded-[3px] [&_mark]:px-0.5",
    "[&_a]:font-semibold [&_a]:text-[#0055ff] [&_a]:underline [&_a]:decoration-[#14dcff] [&_a]:underline-offset-2",
    "[&_hr]:my-7 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#e8e2da]",
    "[&_img]:my-5 [&_img]:max-h-[460px] [&_img]:max-w-full [&_img]:rounded-[12px] [&_img]:object-contain",
    "[&_.is-empty:first-child::before]:pointer-events-none [&_.is-empty:first-child::before]:float-left [&_.is-empty:first-child::before]:h-0 [&_.is-empty:first-child::before]:text-[#aaa49b] [&_.is-empty:first-child::before]:content-[attr(data-placeholder)]",
  ].join(" ");
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isSafeEditorUrl(value: string) {
  const url = value.trim();
  if (!url || /[\u0000-\u001f]/.test(url) || url.startsWith("//")) return false;
  if (
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  )
    return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeImageUrl(value: string) {
  const url = value.trim();
  if (
    !url ||
    url.startsWith("//") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  )
    return false;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isExternalUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function countWords(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

/**
 * TipTap's standard document schema deliberately handles common prose, not
 * arbitrary layout markup. Editing a custom card/grid/table document in that
 * mode would normalize away its wrappers and classes. Keep those documents
 * source-first, with a faithful preview, so an admin never loses a design by
 * simply opening the editor.
 */
function stripStandardEditorFormatting(html: string) {
  let normalized = html.replace(
    /<((?:p|h[1-6]|blockquote)\b)([^>]*)>/gi,
    (_match, tagName: string, attributes: string) => {
      const cleanedAttributes = attributes.replace(
        /\sstyle=(['"])\s*text-align:\s*(?:left|center|right|justify)\s*;?\s*\1/i,
        "",
      );
      return `<${tagName}${cleanedAttributes}>`;
    },
  );

  normalized = normalized.replace(
    /<span\b([^>]*)>/gi,
    (_match, attributes: string) => {
      const cleanedAttributes = attributes.replace(
        /\sstyle=(['"])\s*color:\s*[^"']*;?\s*\1/i,
        "",
      );
      return `<span${cleanedAttributes}>`;
    },
  );

  return normalized.replace(
    /<mark\b([^>]*)>/gi,
    (_match, attributes: string) => {
      const cleanedAttributes = attributes
        .replace(/\sdata-color=(['"])[^"']*\1/i, "")
        .replace(
          /\sstyle=(['"])\s*background-color:\s*[^"']*;\s*color:\s*inherit\s*\1/i,
          "",
        );
      return `<mark${cleanedAttributes}>`;
    },
  );
}

function hasCustomRichTextStructure(html: string, css = "") {
  if (css.trim().length > 0) return true;
  const normalizedHtml = stripStandardEditorFormatting(html);
  return /<(?:style|article|header|footer|main|nav|aside|section|div|table|thead|tbody|tfoot|tr|th|td|colgroup|col|figure|figcaption|pre|code|kbd|samp|var|details|summary|picture|source)\b|\s(?:class|id|style|data-[\w-]+)\s*=/i.test(
    normalizedHtml,
  );
}

function RichTextPreview({
  html,
  css,
  compact,
}: {
  html: string;
  css: string;
  compact: boolean;
}) {
  return (
    <div
      className={cn(
        compact ? "min-h-[220px]" : "min-h-[320px]",
        "max-h-[680px] overflow-auto bg-[#f2eee7] p-3 sm:p-5",
      )}
      aria-label="Rendered preview"
    >
      <div className="mx-auto max-w-[960px] rounded-[14px] bg-[#fffdfa] px-4 py-5 shadow-[0_8px_28px_rgba(40,34,28,0.08)] sm:px-7 sm:py-7">
        {css ? (
          <style
            data-limex-rich-text-preview="true"
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ) : null}
        {html ? (
          <div
            className={`${blogRichTextClass} !mt-0`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-[13px] text-[#9b958c]">Nothing to preview yet.</p>
        )}
      </div>
    </div>
  );
}

function EditorIcon({ name }: { name: EditorIconName }) {
  if (name === "bold")
    return (
      <span className="font-serif text-[15px] font-bold leading-none">B</span>
    );
  if (name === "italic")
    return (
      <span className="font-serif text-[15px] font-bold italic leading-none">
        I
      </span>
    );
  if (name === "underline")
    return (
      <span className="font-serif text-[15px] font-bold underline leading-none underline-offset-2">
        U
      </span>
    );
  if (name === "strike")
    return (
      <span className="font-serif text-[15px] font-bold leading-none line-through">
        S
      </span>
    );

  const paths: Record<
    Exclude<EditorIconName, "bold" | "italic" | "underline" | "strike">,
    string[]
  > = {
    "align-left": ["M4 6h11", "M4 12h16", "M4 18h13"],
    "align-center": ["M4 6h16", "M7 12h10", "M5 18h14"],
    "align-right": ["M9 6h11", "M4 12h16", "M7 18h13"],
    "align-justify": ["M4 6h16", "M4 12h16", "M4 18h16"],
    "bullet-list": [
      "M6 7h.01",
      "M10 7h8",
      "M6 12h.01",
      "M10 12h8",
      "M6 17h.01",
      "M10 17h8",
    ],
    "ordered-list": [
      "M5 7h.01",
      "M9 7h9",
      "M5 12h.01",
      "M9 12h9",
      "M5 17h.01",
      "M9 17h9",
    ],
    quote: ["M7 8h4v4H8v4", "M15 8h4v4h-3v4"],
    palette: [
      "M12 4a8 8 0 1 0 0 16h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4A8 8 0 0 0 12 4Z",
      "M7.5 10h.01",
      "M10 7.5h.01",
      "M14 7.5h.01",
      "M16.5 10h.01",
    ],
    highlight: ["m4 16 4 4L20 8l-4-4L4 16Z", "M3 21h18"],
    clear: ["M5 5h14", "m7 5 1 15h8l1-15", "M10 9v7", "M14 9v7"],
    link: [
      "M10 13a5 5 0 0 0 7.07.07l1.41-1.41a5 5 0 0 0-7.07-7.07L10.6 5.4",
      "M14 11a5 5 0 0 0-7.07-.07l-1.41 1.41a5 5 0 0 0 7.07 7.07l.81-.81",
    ],
    image: [
      "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z",
      "m4 16 4-4 3 3 2-2 5 5",
      "M8.5 8.5h.01",
    ],
    divider: ["M4 12h16"],
    undo: ["M9 7 4 12l5 5", "M4 12h10a6 6 0 0 1 6 6"],
    redo: ["m15 7 5 5-5 5", "M20 12H10a6 6 0 0 0-6 6"],
    external: [
      "M14 5h5v5",
      "m19 5-8 8",
      "M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4",
    ],
  };

  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

function ToolbarButton({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: EditorIconName;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "grid size-8 place-items-center rounded-[8px] text-[#5f5a54] transition-colors hover:bg-white hover:text-[#0055ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff]",
        active &&
          "bg-white text-[#0055ff] shadow-[0_2px_8px_rgba(20,19,28,0.08)]",
        disabled &&
          "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-[#5f5a54]",
      )}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <EditorIcon name={icon} />
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-[#ded8cf]" aria-hidden="true" />;
}

function FormattingColorPanel({
  editor,
  mode,
  activeColor,
  onClose,
}: {
  editor: Editor;
  mode: ColorPanelMode;
  activeColor: string;
  onClose: () => void;
}) {
  const isTextColor = mode === "text";
  const palette = isTextColor ? textColorPalette : highlightPalette;
  const customColor =
    /^#[0-9a-f]{6}$/i.test(activeColor.trim())
      ? activeColor.trim()
      : isTextColor
        ? "#0055ff"
        : "#fff3c4";

  function applyColor(color: string | null) {
    if (isTextColor) {
      if (color) editor.chain().focus().setColor(color).run();
      else editor.chain().focus().unsetColor().run();
    } else if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    onClose();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#eee9e2] bg-[#fffdfa] px-3 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
        {isTextColor ? "Text color" : "Highlight"}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {palette.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "size-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(50,45,40,0.16)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff]",
              activeColor === item.value &&
                "scale-110 shadow-[0_0_0_2px_#0055ff]",
            )}
            style={{ backgroundColor: item.value }}
            title={item.label}
            aria-label={`${item.label} ${isTextColor ? "text color" : "highlight"}`}
            aria-pressed={activeColor === item.value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyColor(item.value)}
          />
        ))}
      </div>
      <label className="flex items-center gap-2 text-[10px] font-semibold text-[#77736e]">
        Custom
        <input
          className="size-7 cursor-pointer rounded-[6px] border-0 bg-transparent p-0"
          type="color"
          value={customColor}
          aria-label={`Custom ${isTextColor ? "text color" : "highlight color"}`}
          onChange={(event) => applyColor(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="rounded-[7px] px-2 py-1 text-[10px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => applyColor(null)}
      >
        Remove
      </button>
      <button
        type="button"
        className="ml-auto rounded-[7px] px-2 py-1 text-[10px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

function LinkPanel({
  editor,
  value,
  onChange,
  onClose,
  onError,
}: {
  editor: Editor;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onError: (value: string) => void;
}) {
  function applyLink() {
    const url = value.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    if (!isSafeEditorUrl(url)) {
      onError("Use a relative path, email, phone or http(s) link.");
      return;
    }
    const attributes = isExternalUrl(url)
      ? { href: url, target: "_blank", rel: "noopener noreferrer" }
      : { href: url };
    editor.chain().focus().extendMarkRange("link").setLink(attributes).run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-[#eee9e2] bg-[#fffdfa] px-3 py-3">
      <label className="min-w-[220px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
          Link URL
        </span>
        <input
          className={inputClass}
          value={value}
          placeholder="https:// or /internal-page"
          onChange={(event) => {
            onChange(event.target.value);
            onError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyLink();
            }
          }}
          autoFocus
        />
      </label>
      <button
        className="min-h-10 rounded-[10px] bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]"
        type="button"
        onClick={applyLink}
      >
        Apply
      </button>
      <button
        className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]"
        type="button"
        onClick={() => {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          onClose();
        }}
      >
        Remove
      </button>
      <button
        className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]"
        type="button"
        onClick={onClose}
      >
        Cancel
      </button>
      <p className="basis-full text-[10px] text-[#9b958c]" role="status">
        Select text, then add a link. External links open in a new tab.
      </p>
    </div>
  );
}

function ImagePanel({
  editor,
  url,
  alt,
  onUrlChange,
  onAltChange,
  onClose,
  onError,
}: {
  editor: Editor;
  url: string;
  alt: string;
  onUrlChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onClose: () => void;
  onError: (value: string) => void;
}) {
  function insertImage() {
    const imageUrl = url.trim();
    if (!isSafeImageUrl(imageUrl)) {
      onError("Use a relative image path or a secure http(s) image URL.");
      return;
    }
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: alt.trim() || undefined })
      .run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-[#eee9e2] bg-[#fffdfa] px-3 py-3">
      <label className="min-w-[220px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
          Image URL
        </span>
        <input
          className={inputClass}
          value={url}
          placeholder="https:// or /uploads/image.webp"
          onChange={(event) => {
            onUrlChange(event.target.value);
            onError("");
          }}
          autoFocus
        />
      </label>
      <label className="min-w-[180px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
          Alt text
        </span>
        <input
          className={inputClass}
          value={alt}
          placeholder="Describe the image"
          onChange={(event) => onAltChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              insertImage();
            }
          }}
        />
      </label>
      <button
        className="min-h-10 rounded-[10px] bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]"
        type="button"
        onClick={insertImage}
      >
        Insert
      </button>
      <button
        className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]"
        type="button"
        onClick={onClose}
      >
        Cancel
      </button>
      <p className="basis-full text-[10px] text-[#9b958c]" role="status">
        Add the image after uploading it through the Media tab so delivery stays
        optimized.
      </p>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article…",
  ariaLabel = "Article body",
  compact = false,
  className = "",
}: RichTextEditorProps) {
  const initialContent = useRef(value || "");
  const initialSanitizedContent = useRef(
    sanitizeBlogContent(initialContent.current),
  );
  const initialHasCustomStructure = useRef(
    hasCustomRichTextStructure(
      initialSanitizedContent.current.html,
      initialSanitizedContent.current.css,
    ),
  );
  const [editorMode, setEditorMode] = useState<EditorMode>(() =>
    initialHasCustomStructure.current ? "preview" : "visual",
  );
  const [htmlSource, setHtmlSource] = useState(
    () => sanitizeBlogContent(value).html,
  );
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [colorPanelMode, setColorPanelMode] =
    useState<ColorPanelMode | null>(null);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [panelError, setPanelError] = useState("");
  // Source editors stay uncontrolled while an admin is typing. Their value is
  // still mirrored into React state and the parent draft, but React must not
  // write the prop echo back into the live textarea on every keystroke. That
  // feedback loop is what makes the caret/focus jump in HTML and CSS mode.
  const htmlSourceInputRef = useRef<HTMLTextAreaElement | null>(null);
  const cssSourceInputRef = useRef<HTMLTextAreaElement | null>(null);
  const preservedCss = useRef(sanitizeBlogContent(value).css);
  const internalValueUpdate = useRef(false);
  const lastEmittedHtml = useRef(value || "");
  const valueRef = useRef(value || "");
  valueRef.current = value || "";
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [customCss, setCustomCss] = useState(
    () => sanitizeBlogContent(value).css,
  );
  const renderedContent = useMemo(() => sanitizeBlogContent(value), [value]);
  const hasCustomStructure = hasCustomRichTextStructure(
    renderedContent.html,
    renderedContent.css,
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3, 4] },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        isAllowedUri: (url) => isSafeEditorUrl(url),
      }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true }),
    ],
    [placeholder],
  );

  // Keep editor options referentially stable. TipTap compares non-callback
  // options between renders; recreating editorProps after every selection
  // update can make it re-apply the view props and collapse a live selection.
  const editorProps = useMemo(
    () => ({
      attributes: {
        class: `blog-rich-text ${editorSurfaceClass(compact)}`,
        "aria-label": ariaLabel,
        role: "textbox",
        spellcheck: "true",
      },
      handlePaste: (_view: unknown, event: ClipboardEvent) => {
        const clipboardHtml = event.clipboardData?.getData("text/html") || "";
        const clipboardText = event.clipboardData?.getData("text/plain") || "";

        let candidateMarkup = "";
        if (
          /<(?:style|article|header|footer|main|nav|aside|section|div|table|pre|code|figure)\b|<!doctype/i.test(
            clipboardText,
          )
        ) {
          candidateMarkup = clipboardText;
        } else if (clipboardHtml && hasCustomRichTextStructure(clipboardHtml)) {
          candidateMarkup = clipboardHtml;
        } else if (clipboardText && hasCustomRichTextStructure(clipboardText)) {
          candidateMarkup = clipboardText;
        }

        if (
          candidateMarkup &&
          (hasCustomRichTextStructure(candidateMarkup) ||
            candidateMarkup.includes("<style"))
        ) {
          event.preventDefault();
          const sanitizedPasted = sanitizeBlogContent(candidateMarkup);
          const currentValue = valueRef.current || "";
          const currentSanitized = sanitizeBlogContent(currentValue);

          const isCurrentEmpty =
            !currentSanitized.html || currentSanitized.html === "<p></p>";
          const combinedCss = [currentSanitized.css, sanitizedPasted.css]
            .filter(Boolean)
            .join("\n\n");
          const combinedHtml = isCurrentEmpty
            ? sanitizedPasted.html
            : `${currentSanitized.html}\n${sanitizedPasted.html}`;
          const nextHtml = combinedCss
            ? `<style>${combinedCss}</style>${combinedHtml}`
            : combinedHtml;

          preservedCss.current = combinedCss;
          setCustomCss(combinedCss);
          setHtmlSource(combinedHtml);
          lastEmittedHtml.current = nextHtml;
          internalValueUpdate.current = true;
          onChangeRef.current(nextHtml, { version: 1, html: nextHtml });
          setEditorMode("preview");
          setPanelError("");
          return true;
        }

        return false;
      },
    }),
    [ariaLabel, compact],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: initialHasCustomStructure.current
      ? ""
      : initialSanitizedContent.current.html,
    editorProps,
    onUpdate: ({ editor: nextEditor }) => {
      const html = nextEditor.getHTML();
      emitChange(
        preservedCss.current
          ? `<style>${preservedCss.current}</style>${html}`
          : html,
        nextEditor.getJSON(),
      );
    },
    onSelectionUpdate: () => setSelectionVersion((current) => current + 1),
  });

  useEffect(() => {
    const nextHtml = value || "";
    const wasInternalUpdate = internalValueUpdate.current;
    internalValueUpdate.current = false;

    // Echo protection: never clobber active typing when value matches what we just emitted
    if (wasInternalUpdate || nextHtml === lastEmittedHtml.current) {
      return;
    }

    lastEmittedHtml.current = nextHtml;

    const nextContent = sanitizeBlogContent(nextHtml);
    preservedCss.current = nextContent.css;
    setCustomCss(nextContent.css);
    setHtmlSource(nextContent.html);

    // Source textareas use defaultValue so parent draft updates cannot reset
    // their selection. Synchronize an external change only when the control
    // is not the active element; an active source editor always owns its text.
    if (
      htmlSourceInputRef.current &&
      document.activeElement !== htmlSourceInputRef.current
    ) {
      htmlSourceInputRef.current.value = nextContent.html;
    }
    if (
      cssSourceInputRef.current &&
      document.activeElement !== cssSourceInputRef.current
    ) {
      cssSourceInputRef.current.value = nextContent.css;
    }

    // If editor has active focus, do not replace the document and kill cursor
    if (editor?.isFocused) return;

    // External change has custom markup: present preview cleanly
    if (hasCustomRichTextStructure(nextContent.html, nextContent.css)) {
      if (editorMode === "visual") setEditorMode("preview");
      return;
    }

    if (!editor || editorMode !== "visual") return;
    const currentHtml = editor.getHTML();
    if (
      currentHtml === nextHtml ||
      currentHtml === nextContent.html ||
      (nextHtml === "" && currentHtml === "<p></p>")
    ) {
      return;
    }

    editor.commands.setContent(nextContent.html, false);
  }, [editor, editorMode, value]);

  const activeStyle = useMemo<BlockStyle>(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "heading-2";
    if (editor.isActive("heading", { level: 3 })) return "heading-3";
    if (editor.isActive("heading", { level: 4 })) return "heading-4";
    return "paragraph";
  }, [editor, selectionVersion, value]);
  const activeAlignment =
    editor?.getAttributes("heading").textAlign ??
    editor?.getAttributes("paragraph").textAlign ??
    editor?.getAttributes("blockquote").textAlign ??
    "left";
  const activeTextColor = String(
    editor?.getAttributes("textStyle").color ?? "",
  );
  const activeHighlightColor = String(
    editor?.getAttributes("highlight").color ?? "",
  );

  const bodyText =
    editorMode === "visual"
      ? editor?.getText() || ""
      : renderedContent.html.replace(/<[^>]+>/g, " ");
  const wordCount = countWords(bodyText);
  const characterCount = bodyText.replace(/\s/g, "").length;
  const visualMode = editorMode === "visual";
  const modeLabel =
    editorMode === "html"
      ? "HTML source"
      : editorMode === "css"
        ? "Custom CSS"
        : editorMode === "preview"
          ? "Rendered preview"
          : "Visual editor";

  function emitChange(html: string, document: RichTextDocument) {
    lastEmittedHtml.current = html;
    internalValueUpdate.current = true;
    onChange(html, document);
  }

  function updateCustomCss(nextValue: string) {
    const sanitizedCss = sanitizeBlogContent(`<style>${nextValue}</style>`).css;
    const html = htmlSource || sanitizeBlogContent(valueRef.current).html;
    const nextHtml = sanitizedCss
      ? `<style>${sanitizedCss}</style>${html}`
      : html;
    setCustomCss(nextValue);
    preservedCss.current = sanitizedCss;
    emitChange(nextHtml, { version: 1, html: nextHtml });
  }

  function updateHtmlSource(nextValue: string) {
    setHtmlSource(nextValue);
    if (nextValue.includes("<style")) {
      const parsed = sanitizeBlogContent(nextValue);
      const combinedCss = [customCss, parsed.css].filter(Boolean).join("\n\n");
      preservedCss.current = combinedCss;
      setCustomCss(combinedCss);
      const nextHtml = combinedCss
        ? `<style>${combinedCss}</style>${parsed.html}`
        : parsed.html;
      emitChange(nextHtml, { version: 1, html: nextHtml });
    } else {
      const nextHtml = preservedCss.current
        ? `<style>${preservedCss.current}</style>${nextValue}`
        : nextValue;
      emitChange(nextHtml, { version: 1, html: nextHtml });
    }
  }

  function openLinkPanel() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href || "");
    setPanelError("");
    setLinkPanelOpen(true);
    setImagePanelOpen(false);
    setColorPanelMode(null);
  }

  function openImagePanel() {
    setPanelError("");
    setImageUrl("");
    setImageAlt("");
    setImagePanelOpen(true);
    setLinkPanelOpen(false);
    setColorPanelMode(null);
  }

  function changeEditorMode(nextMode: EditorMode) {
    if (nextMode === "visual") {
      const nextContent = sanitizeBlogContent(valueRef.current);
      if (hasCustomRichTextStructure(nextContent.html, nextContent.css)) {
        setPanelError(
          "This content uses custom HTML/CSS. Use HTML or CSS to edit it and Preview to inspect the exact result.",
        );
        setEditorMode("preview");
        return;
      }
      preservedCss.current = nextContent.css;
      editor?.commands.setContent(nextContent.html, false);
      setSelectionVersion((current) => current + 1);
    } else if (nextMode === "html") {
      if (editorMode === "visual" && editor) {
        setHtmlSource(editor.getHTML());
      }
    }
    setPanelError("");
    setLinkPanelOpen(false);
    setImagePanelOpen(false);
    setColorPanelMode(null);
    setEditorMode(nextMode);
  }

  function updateBlockStyle(nextStyle: BlockStyle) {
    if (!editor) return;
    if (nextStyle === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(nextStyle.replace("heading-", "")) as 2 | 3 | 4;
    editor.chain().focus().toggleHeading({ level }).run();
  }

  function updateTextAlignment(alignment: TextAlignment) {
    if (!editor) return;
    if (alignment === "left") {
      editor.chain().focus().unsetTextAlign().run();
      return;
    }
    editor.chain().focus().setTextAlign(alignment).run();
  }

  function clearFormatting() {
    editor?.chain().focus().unsetAllMarks().clearNodes().run();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-[#ddd7ce] bg-[#fffdfa] transition-colors focus-within:border-[#0055ff] focus-within:ring-4 focus-within:ring-[#008cff]/10",
        className,
      )}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee9e2] bg-[#faf7f2] px-2.5 py-1.5"
        aria-label="Formatting toolbar"
      >
        {editorMode === "visual" ? (
          <div className="flex flex-wrap items-center gap-1">
            <label className="sr-only" htmlFor="editor-block-style">
              Text style
            </label>
            <select
              id="editor-block-style"
              className="mr-1 h-8 rounded-[8px] bg-transparent px-2 text-[11px] font-bold text-[#4f4b47] outline-none transition-colors hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#008cff]/20"
              value={activeStyle}
              onChange={(event) =>
                updateBlockStyle(event.target.value as BlockStyle)
              }
              disabled={!editor}
            >
              <option value="paragraph">Paragraph</option>
              <option value="heading-2">Heading 2</option>
              <option value="heading-3">Heading 3</option>
              <option value="heading-4">Heading 4</option>
            </select>
            <ToolbarDivider />
            <ToolbarButton
              label="Bold"
              icon="bold"
              active={editor?.isActive("bold") ?? false}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              label="Italic"
              icon="italic"
              active={editor?.isActive("italic") ?? false}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              label="Underline"
              icon="underline"
              active={editor?.isActive("underline") ?? false}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            />
            <ToolbarButton
              label="Strikethrough"
              icon="strike"
              active={editor?.isActive("strike") ?? false}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            />
            <ToolbarButton
              label="Text color"
              icon="palette"
              active={colorPanelMode === "text" || Boolean(activeTextColor)}
              onClick={() => {
                setColorPanelMode((current) =>
                  current === "text" ? null : "text",
                );
                setLinkPanelOpen(false);
                setImagePanelOpen(false);
              }}
            />
            <ToolbarButton
              label="Highlight color"
              icon="highlight"
              active={
                colorPanelMode === "highlight" ||
                (editor?.isActive("highlight") ?? false)
              }
              onClick={() => {
                setColorPanelMode((current) =>
                  current === "highlight" ? null : "highlight",
                );
                setLinkPanelOpen(false);
                setImagePanelOpen(false);
              }}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Bulleted list"
              icon="bullet-list"
              active={editor?.isActive("bulletList") ?? false}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              label="Numbered list"
              icon="ordered-list"
              active={editor?.isActive("orderedList") ?? false}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              label="Quote"
              icon="quote"
              active={editor?.isActive("blockquote") ?? false}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton
              label="Horizontal divider"
              icon="divider"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Align left"
              icon="align-left"
              active={activeAlignment === "left"}
              onClick={() => updateTextAlignment("left")}
            />
            <ToolbarButton
              label="Align center"
              icon="align-center"
              active={activeAlignment === "center"}
              onClick={() => updateTextAlignment("center")}
            />
            <ToolbarButton
              label="Align right"
              icon="align-right"
              active={activeAlignment === "right"}
              onClick={() => updateTextAlignment("right")}
            />
            <ToolbarButton
              label="Justify text"
              icon="align-justify"
              active={activeAlignment === "justify"}
              onClick={() => updateTextAlignment("justify")}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Add or edit link"
              icon="link"
              active={linkPanelOpen || (editor?.isActive("link") ?? false)}
              onClick={openLinkPanel}
            />
            <ToolbarButton
              label="Insert image"
              icon="image"
              active={imagePanelOpen}
              onClick={openImagePanel}
            />
            <ToolbarButton
              label="Clear formatting"
              icon="clear"
              onClick={clearFormatting}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Undo"
              icon="undo"
              disabled={!editor?.can().undo()}
              onClick={() => editor?.chain().focus().undo().run()}
            />
            <ToolbarButton
              label="Redo"
              icon="redo"
              disabled={!editor?.can().redo()}
              onClick={() => editor?.chain().focus().redo().run()}
            />
          </div>
        ) : editorMode === "html" ? (
          <div className="flex items-center gap-2 px-1 text-[12px] font-semibold text-[#5f5a54]">
            <span className="rounded bg-[#e8e4dc] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#071b3d]">
              &lt;/&gt;
            </span>
            <span className="font-bold text-[#071b3d]">HTML Source</span>
            <span className="hidden text-[11px] text-[#9b958c] sm:inline">
              · Paste or edit raw HTML tags, classes and attributes
            </span>
          </div>
        ) : editorMode === "css" ? (
          <div className="flex items-center gap-2 px-1 text-[12px] font-semibold text-[#5f5a54]">
            <span className="rounded bg-[#e8f0fe] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0055ff]">
              &#123; &#125;
            </span>
            <span className="font-bold text-[#071b3d]">Custom CSS</span>
            <span className="hidden text-[11px] text-[#9b958c] sm:inline">
              · Scoped to (.blog-rich-text)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-1 text-[12px] font-semibold text-[#5f5a54]">
            <span className="rounded bg-[#e8f4ec] px-1.5 py-0.5 text-[10px] font-bold text-[#29634d]">
              👁
            </span>
            <span className="font-bold text-[#071b3d]">Rendered Preview</span>
            <span className="hidden text-[11px] text-[#9b958c] sm:inline">
              · Exact output with full scoped CSS applied
            </span>
          </div>
        )}

        {/* Clean right side mode switcher */}
        <div
          className="ml-auto flex shrink-0 items-center rounded-[9px] bg-[#eee9e2] p-0.5"
          role="tablist"
          aria-label="Editor view mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === "visual"}
            onClick={() => changeEditorMode("visual")}
            className={cn(
              "rounded-[7px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-all",
              editorMode === "visual"
                ? "bg-white text-[#0055ff] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#68635c] hover:text-[#071b3d]",
            )}
          >
            Visual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === "html"}
            onClick={() => changeEditorMode("html")}
            className={cn(
              "rounded-[7px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-all",
              editorMode === "html"
                ? "bg-white text-[#0055ff] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#68635c] hover:text-[#071b3d]",
            )}
          >
            HTML
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === "css"}
            onClick={() => changeEditorMode("css")}
            className={cn(
              "inline-flex items-center gap-1 rounded-[7px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-all",
              editorMode === "css"
                ? "bg-white text-[#0055ff] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#68635c] hover:text-[#071b3d]",
            )}
          >
            CSS
            {customCss.trim() ? (
              <span
                className="size-1.5 rounded-full bg-[#0055ff]"
                title="Custom CSS active"
              />
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === "preview"}
            onClick={() => changeEditorMode("preview")}
            className={cn(
              "rounded-[7px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-all",
              editorMode === "preview"
                ? "bg-white text-[#0055ff] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#68635c] hover:text-[#071b3d]",
            )}
          >
            Preview
          </button>
        </div>
      </div>
      {panelError ? (
        <p
          className="border-b border-[#f4c9d0] bg-[#fff5f6] px-3 py-2 text-[10px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {panelError}
        </p>
      ) : null}
      {hasCustomStructure ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8e9df] bg-[#f3faf5] px-3 py-2 text-[10px] leading-[1.45] text-[#3d6650]">
          <span className="font-bold uppercase tracking-[0.1em]">
            Custom layout protected
          </span>
          <span>
            Use HTML or CSS to edit it. Preview renders the exact scoped styles
            that the public page receives.
          </span>
        </div>
      ) : null}
      {colorPanelMode && editor ? (
        <FormattingColorPanel
          editor={editor}
          mode={colorPanelMode}
          activeColor={
            colorPanelMode === "text"
              ? activeTextColor
              : activeHighlightColor
          }
          onClose={() => setColorPanelMode(null)}
        />
      ) : null}
      {linkPanelOpen && editor ? (
        <LinkPanel
          editor={editor}
          value={linkUrl}
          onChange={setLinkUrl}
          onClose={() => setLinkPanelOpen(false)}
          onError={setPanelError}
        />
      ) : null}
      {imagePanelOpen && editor ? (
        <ImagePanel
          editor={editor}
          url={imageUrl}
          alt={imageAlt}
          onUrlChange={setImageUrl}
          onAltChange={setImageAlt}
          onClose={() => setImagePanelOpen(false)}
          onError={setPanelError}
        />
      ) : null}
      {editorMode === "html" ? (
        <div className="bg-[#fffdfa] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#77736e]">
            <span>
              Raw HTML markup · &lt;style&gt; blocks pasted here automatically
              move to CSS
            </span>
            <span className="rounded bg-[#f0ece4] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#555]">
              HTML
            </span>
          </div>
          <textarea
            ref={htmlSourceInputRef}
            className={cn(
              compact ? "min-h-[220px]" : "min-h-[360px]",
              "w-full resize-y rounded-[10px] border border-[#ddd7ce] bg-white p-4 font-mono text-[12px] leading-[1.7] text-[#3f3b37] outline-none transition-colors placeholder:text-[#9b958c] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10",
            )}
            defaultValue={htmlSource}
            onChange={(event) => updateHtmlSource(event.target.value)}
            spellCheck={false}
            aria-label={`${ariaLabel} HTML source`}
            placeholder='<article class="guide-card">\n  <h2>Guide Title</h2>\n  <p>Content goes here…</p>\n</article>'
          />
        </div>
      ) : editorMode === "css" ? (
        <div className="bg-[#fffdfa] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#77736e]">
            <span>
              Custom CSS rules · Automatically scoped to .blog-rich-text on save
            </span>
            <span className="rounded bg-[#e8f0fe] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0055ff]">
              CSS
            </span>
          </div>
          <textarea
            ref={cssSourceInputRef}
            className={cn(
              compact ? "min-h-[220px]" : "min-h-[360px]",
              "w-full resize-y rounded-[10px] border border-[#cfe0f4] bg-white p-4 font-mono text-[12px] leading-[1.7] text-[#071b3d] outline-none transition-colors placeholder:text-[#9b958c] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10",
            )}
            defaultValue={customCss}
            onChange={(event) => updateCustomCss(event.target.value)}
            spellCheck={false}
            aria-label={`${ariaLabel} custom CSS`}
            placeholder={
              ".guide-card {\n  border-radius: 16px;\n  background: #f8fafc;\n}\n\n@media (max-width: 640px) {\n  .guide-card {\n    padding: 16px;\n  }\n}"
            }
          />
        </div>
      ) : editorMode === "preview" ? (
        <RichTextPreview
          html={renderedContent.html}
          css={renderedContent.css}
          compact={compact}
        />
      ) : (
        <>
          {renderedContent.css ? (
            <style
              data-limex-rich-text-editor="true"
              dangerouslySetInnerHTML={{ __html: renderedContent.css }}
            />
          ) : null}
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div
              className={cn(
                compact ? "min-h-[220px]" : "min-h-[320px]",
                "px-5 py-5 text-[13px] text-[#aaa49b]",
              )}
            >
              Loading editor…
            </div>
          )}
        </>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e2] px-4 py-2 text-[10px] text-[#9b958c]">
        <span>
          {wordCount.toLocaleString()} words · {characterCount.toLocaleString()}{" "}
          characters
        </span>
        <span>
          {modeLabel}
          {customCss ? " · custom CSS active" : ""} · scoped and sanitized on
          save
        </span>
      </div>
    </div>
  );
}
