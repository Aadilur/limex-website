"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { sanitizeBlogContent } from "@/lib/blog-content";

export type RichTextDocument = Record<string, unknown>;

type EditorIconName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "bullet-list"
  | "ordered-list"
  | "quote"
  | "link"
  | "image"
  | "divider"
  | "undo"
  | "redo"
  | "external";

type BlockStyle = "paragraph" | "heading-2" | "heading-3" | "heading-4";

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

function editorSurfaceClass(compact: boolean) {
  return [
  compact ? "min-h-[220px]" : "min-h-[320px]",
  "px-5 py-5 text-[15px] leading-[1.75] text-[#383531] outline-none",
  "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:font-brand [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.035em] [&_h2]:text-[#071b3d]",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-brand [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:leading-[1.2] [&_h3]:tracking-[-0.025em] [&_h3]:text-[#071b3d]",
  "[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-bold [&_h4]:text-[16px] [&_h4]:leading-[1.3] [&_h4]:text-[#071b3d]",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
  "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0055ff] [&_blockquote]:bg-[#eaf3ff] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-[#625a58]",
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
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeImageUrl(value: string) {
  const url = value.trim();
  if (!url || url.startsWith("//") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return false;
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

function EditorIcon({ name }: { name: EditorIconName }) {
  if (name === "bold") return <span className="font-serif text-[15px] font-bold leading-none">B</span>;
  if (name === "italic") return <span className="font-serif text-[15px] font-bold italic leading-none">I</span>;
  if (name === "underline") return <span className="font-serif text-[15px] font-bold underline leading-none underline-offset-2">U</span>;
  if (name === "strike") return <span className="font-serif text-[15px] font-bold leading-none line-through">S</span>;

  const paths: Record<Exclude<EditorIconName, "bold" | "italic" | "underline" | "strike">, string[]> = {
    "bullet-list": ["M6 7h.01", "M10 7h8", "M6 12h.01", "M10 12h8", "M6 17h.01", "M10 17h8"],
    "ordered-list": ["M5 7h.01", "M9 7h9", "M5 12h.01", "M9 12h9", "M5 17h.01", "M9 17h9"],
    quote: ["M7 8h4v4H8v4", "M15 8h4v4h-3v4"],
    link: ["M10 13a5 5 0 0 0 7.07.07l1.41-1.41a5 5 0 0 0-7.07-7.07L10.6 5.4", "M14 11a5 5 0 0 0-7.07-.07l-1.41 1.41a5 5 0 0 0 7.07 7.07l.81-.81"],
    image: ["M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z", "m4 16 4-4 3 3 2-2 5 5", "M8.5 8.5h.01"],
    divider: ["M4 12h16"],
    undo: ["M9 7 4 12l5 5", "M4 12h10a6 6 0 0 1 6 6"],
    redo: ["m15 7 5 5-5 5", "M20 12H10a6 6 0 0 0-6 6"],
    external: ["M14 5h5v5", "m19 5-8 8", "M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"],
  };

  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name].map((path) => <path d={path} key={path} />)}
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
        active && "bg-white text-[#0055ff] shadow-[0_2px_8px_rgba(20,19,28,0.08)]",
        disabled && "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-[#5f5a54]",
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
    const attributes = isExternalUrl(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
    editor.chain().focus().extendMarkRange("link").setLink(attributes).run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-[#eee9e2] bg-[#fffdfa] px-3 py-3">
      <label className="min-w-[220px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">Link URL</span>
        <input className={inputClass} value={value} placeholder="https:// or /internal-page" onChange={(event) => { onChange(event.target.value); onError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(); } }} autoFocus />
      </label>
      <button className="min-h-10 rounded-[10px] bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]" type="button" onClick={applyLink}>Apply</button>
      <button className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]" type="button" onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); onClose(); }}>Remove</button>
      <button className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]" type="button" onClick={onClose}>Cancel</button>
      <p className="basis-full text-[10px] text-[#9b958c]" role="status">Select text in the article, then add a link. External links open in a new tab.</p>
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
    editor.chain().focus().setImage({ src: imageUrl, alt: alt.trim() || undefined }).run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-[#eee9e2] bg-[#fffdfa] px-3 py-3">
      <label className="min-w-[220px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">Image URL</span>
        <input className={inputClass} value={url} placeholder="https:// or /uploads/image.webp" onChange={(event) => { onUrlChange(event.target.value); onError(""); }} autoFocus />
      </label>
      <label className="min-w-[180px] flex-1">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e]">Alt text</span>
        <input className={inputClass} value={alt} placeholder="Describe the image" onChange={(event) => onAltChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); insertImage(); } }} />
      </label>
      <button className="min-h-10 rounded-[10px] bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]" type="button" onClick={insertImage}>Insert</button>
      <button className="min-h-10 rounded-[10px] px-2.5 text-[11px] font-bold text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#071b3d]" type="button" onClick={onClose}>Cancel</button>
      <p className="basis-full text-[10px] text-[#9b958c]" role="status">Add the image after uploading it through the Media tab so delivery stays optimized.</p>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing your article…", ariaLabel = "Article body", compact = false, className = "" }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [panelError, setPanelError] = useState("");
  const initialContent = useRef(value || "");
  const previousValue = useRef(value || "");
  const preservedCss = useRef(sanitizeBlogContent(value).css);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3, 4] },
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
        class: editorSurfaceClass(compact),
        "aria-label": ariaLabel,
        role: "textbox",
        spellcheck: "true",
      },
    }),
    [ariaLabel, compact],
  );

  const editor = useEditor({
    immediatelyRender: false,
    // The parent already receives every content update. Avoid an additional
    // TipTap-driven React render for each keypress so the browser selection
    // remains owned by the same contenteditable node.
    shouldRerenderOnTransaction: false,
    extensions,
    content: sanitizeBlogContent(initialContent.current).html,
    editorProps,
    onUpdate: ({ editor: nextEditor }) => {
      const html = nextEditor.getHTML();
      onChange(preservedCss.current ? `<style>${preservedCss.current}</style>${html}` : html, nextEditor.getJSON());
    },
    onSelectionUpdate: () => setSelectionVersion((current) => current + 1),
  });

  useEffect(() => {
    const nextHtml = value || "";
    const lastPropValue = previousValue.current;
    previousValue.current = nextHtml;
    preservedCss.current = sanitizeBlogContent(nextHtml).css;
    if (!editor || sourceMode) return;
    const nextContent = sanitizeBlogContent(nextHtml).html;
    const currentHtml = editor.getHTML();
    if (currentHtml === nextHtml || currentHtml === nextContent || (nextHtml === "" && currentHtml === "<p></p>")) return;
    // A local transaction updates the editor before the parent state update
    // reaches this component. Do not push the stale parent value back into
    // the editor while it still has focus, or the cursor jumps/resets.
    if (editor.isFocused && nextHtml === lastPropValue) return;
    editor.commands.setContent(nextContent, false);
  }, [editor, sourceMode, value]);

  const activeStyle = useMemo<BlockStyle>(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "heading-2";
    if (editor.isActive("heading", { level: 3 })) return "heading-3";
    if (editor.isActive("heading", { level: 4 })) return "heading-4";
    return "paragraph";
  }, [editor, selectionVersion, value]);

  const bodyText = sourceMode ? value.replace(/<[^>]+>/g, " ") : editor?.getText() || "";
  const wordCount = countWords(bodyText);
  const characterCount = bodyText.replace(/\s/g, "").length;

  function openLinkPanel() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href || "");
    setPanelError("");
    setLinkPanelOpen(true);
    setImagePanelOpen(false);
  }

  function openImagePanel() {
    setPanelError("");
    setImageUrl("");
    setImageAlt("");
    setImagePanelOpen(true);
    setLinkPanelOpen(false);
  }

  function toggleSourceMode() {
    if (sourceMode && editor) {
      preservedCss.current = sanitizeBlogContent(value).css;
      editor.commands.setContent(sanitizeBlogContent(value).html, false);
      setSelectionVersion((current) => current + 1);
    }
    setPanelError("");
    setLinkPanelOpen(false);
    setImagePanelOpen(false);
    setSourceMode((current) => !current);
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

  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-[#ddd7ce] bg-[#fffdfa] transition-colors focus-within:border-[#0055ff] focus-within:ring-4 focus-within:ring-[#008cff]/10", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-[#eee9e2] bg-[#faf7f2] px-2 py-1.5" aria-label="Article formatting toolbar">
        <label className="sr-only" htmlFor="article-block-style">Text style</label>
        <select id="article-block-style" className="mr-1 h-8 rounded-[8px] bg-transparent px-2 text-[11px] font-bold text-[#4f4b47] outline-none transition-colors hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#008cff]/20" value={activeStyle} onChange={(event) => updateBlockStyle(event.target.value as BlockStyle)} disabled={!editor || sourceMode}>
          <option value="paragraph">Paragraph</option>
          <option value="heading-2">Heading 2</option>
          <option value="heading-3">Heading 3</option>
          <option value="heading-4">Heading 4</option>
        </select>
        <ToolbarDivider />
        <ToolbarButton label="Bold" icon="bold" active={editor?.isActive("bold") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Italic" icon="italic" active={editor?.isActive("italic") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Underline" icon="underline" active={editor?.isActive("underline") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <ToolbarButton label="Strikethrough" icon="strike" active={editor?.isActive("strike") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <ToolbarDivider />
        <ToolbarButton label="Bulleted list" icon="bullet-list" active={editor?.isActive("bulletList") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numbered list" icon="ordered-list" active={editor?.isActive("orderedList") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Quote" icon="quote" active={editor?.isActive("blockquote") ?? false} disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="Horizontal divider" icon="divider" disabled={!editor || sourceMode} onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton label="Add or edit link" icon="link" active={linkPanelOpen || (editor?.isActive("link") ?? false)} disabled={!editor || sourceMode} onClick={openLinkPanel} />
          <ToolbarButton label="Insert image" icon="image" active={imagePanelOpen} disabled={!editor || sourceMode} onClick={openImagePanel} />
          <ToolbarDivider />
          <ToolbarButton label="Undo" icon="undo" disabled={!editor || sourceMode || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
          <ToolbarButton label="Redo" icon="redo" disabled={!editor || sourceMode || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
          <button className={cn("ml-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#77736e] transition-colors hover:bg-white hover:text-[#0055ff]", sourceMode && "bg-white text-[#0055ff]")} type="button" aria-pressed={sourceMode} onClick={toggleSourceMode}>{sourceMode ? "Visual editor" : "HTML source"}</button>
        </div>
      </div>
      {panelError ? <p className="border-b border-[#f4c9d0] bg-[#fff5f6] px-3 py-2 text-[10px] font-semibold text-[#ad3148]" role="alert">{panelError}</p> : null}
      {linkPanelOpen && editor ? <LinkPanel editor={editor} value={linkUrl} onChange={setLinkUrl} onClose={() => setLinkPanelOpen(false)} onError={setPanelError} /> : null}
      {imagePanelOpen && editor ? <ImagePanel editor={editor} url={imageUrl} alt={imageAlt} onUrlChange={setImageUrl} onAltChange={setImageAlt} onClose={() => setImagePanelOpen(false)} onError={setPanelError} /> : null}
      {sourceMode ? <textarea className={cn(compact ? "min-h-[220px]" : "min-h-[320px]", "w-full resize-y border-0 bg-[#fffdfa] px-5 py-5 font-mono text-[12px] leading-[1.7] text-[#3f3b37] outline-none")} value={value} onChange={(event) => { preservedCss.current = sanitizeBlogContent(event.target.value).css; onChange(event.target.value, { version: 1, html: event.target.value }); }} spellCheck={false} aria-label={`${ariaLabel} HTML source`} /> : editor ? <EditorContent editor={editor} /> : <div className={cn(compact ? "min-h-[220px]" : "min-h-[320px]", "px-5 py-5 text-[13px] text-[#aaa49b]")}>Loading editor…</div>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e2] px-4 py-2 text-[10px] text-[#9b958c]">
        <span>{wordCount.toLocaleString()} words · {characterCount.toLocaleString()} characters</span>
        <span>{sourceMode ? "HTML source · custom CSS supported" : "Visual editor"} · sanitized on save</span>
      </div>
    </div>
  );
}
