"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { RichTextEditor } from "./rich-text-editor";
import { BlogDetailContent } from "@/components/limex/blog-sections";
import { SiteFooter } from "@/components/limex/site-footer";
import type { BlogArticle } from "@/components/limex/blog-data";
import {
  getAdminMenu,
  isUnauthorizedError,
  type AdminMenuSection,
} from "@/lib/menu-api";
import {
  checkAdminBlogSlug,
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPost,
  getAdminBlogPosts,
  getAdminBlogRevisions,
  isBlogConflictError,
  isUnauthorizedBlogError,
  publishAdminBlogPost,
  reorderAdminBlogPosts,
  restoreAdminBlogPost,
  unpublishAdminBlogPost,
  updateAdminBlogPost,
  uploadAdminBlogImage,
  type AdminBlogPost,
  type AdminBlogSummary,
  type BlogLocale,
  type BlogMedia,
  type BlogPostInput,
  type BlogRevision,
  type BlogServiceLink,
  type BlogTranslation,
  type BlogStatus,
} from "@/lib/blog-api";
import { normalizeBlogKeywords, sanitizeBlogHtml } from "@/lib/blog-content";

const inputClass =
  "mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10";
const textAreaClass = `${inputClass} min-h-[104px] resize-y py-3 leading-[1.55]`;
const labelClass =
  "text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className={labelClass}>{label}</span>
      <input
        className={inputClass}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className={labelClass}>{label}</span>
      <textarea
        className={textAreaClass}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </label>
  );
}

function StatusPill({ status }: { status: BlogStatus }) {
  const styles =
    status === "PUBLISHED"
      ? "bg-[#e8f4ec] text-[#29634d]"
      : status === "ARCHIVED"
        ? "bg-[#f0edf4] text-[#6d6381]"
        : "bg-[#fff1da] text-[#9a5e22]";
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] ${styles}`.trim()}
    >
      {status.toLowerCase()}
    </span>
  );
}

function compressBlogImage(
  file: File,
): Promise<{ file: File; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxDimension = 2400;
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) return reject(new Error("Unable to prepare this image."));
          resolve({
            file: new File(
              [blob],
              `${file.name.replace(/\.[^.]+$/, "")}.webp`,
              { type: "image/webp" },
            ),
            width,
            height,
          });
        },
        "image/webp",
        0.84,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read this image."));
    };
    image.src = objectUrl;
  });
}

function getPreviewYouTubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (
      ![
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "youtu.be",
        "youtube-nocookie.com",
      ].includes(hostname)
    )
      return "";
    if (hostname === "youtu.be")
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (url.pathname === "/watch") return url.searchParams.get("v") ?? "";
    const segments = url.pathname.split("/").filter(Boolean);
    return ["embed", "shorts", "live"].includes(segments[0] ?? "")
      ? (segments[1] ?? "")
      : "";
  } catch {
    return "";
  }
}

function blankTranslation(locale: BlogLocale): BlogTranslation {
  return {
    locale,
    title: "",
    subtitle: "",
    intro: "",
    atAGlance: "",
    bodyHtml: "",
    bodyJson: null,
    keywords: [],
    seoTitle: "",
    seoDescription: "",
    coverAlt: "",
    coverCaption: "",
  };
}

type BlogEditorDraft = Omit<BlogPostInput, "translations"> & {
  translations: Record<BlogLocale, BlogTranslation>;
};

function draftFromPost(post: AdminBlogPost): BlogEditorDraft {
  return {
    slug: post.slug,
    category: post.category,
    author: post.author,
    readTimeMinutes: post.readTimeMinutes,
    coverTone: post.coverTone,
    coverNote: post.coverNote,
    coverNumber: post.coverNumber,
    coverMediaId: post.coverMediaId,
    sidebarVideoUrl: post.sidebarVideoUrl,
    sidebarVideoTitle: post.sidebarVideoTitle,
    isFeatured: post.isFeatured,
    noIndex: post.noIndex,
    canonicalUrl: post.canonicalUrl,
    translations: {
      en: post.translations.en ?? blankTranslation("en"),
      bn: post.translations.bn ?? blankTranslation("bn"),
    },
    services: post.services,
  };
}

function payloadFromDraft(draft: BlogEditorDraft): BlogPostInput {
  return {
    ...draft,
    translations: [draft.translations.en, draft.translations.bn].map(
      (translation) => {
        const bodyHtml = sanitizeBlogHtml(translation.bodyHtml);
        // Keep the structured TipTap document when it is available. The HTML
        // fallback is only for older articles that predate the visual editor.
        return {
          ...translation,
          bodyHtml,
          bodyJson: translation.bodyJson ?? { version: 1, html: bodyHtml },
        };
      },
    ),
  };
}

function previewArticle(
  draft: BlogEditorDraft,
  post: AdminBlogPost,
  locale: BlogLocale = "en",
): BlogArticle {
  const translation = draft.translations[locale];
  const cover = post.media.find((media) => media.id === draft.coverMediaId);
  return {
    id: post.id,
    slug: draft.slug,
    category: draft.category,
    date: post.publishedAt
      ? new Intl.DateTimeFormat("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
          .format(new Date(post.publishedAt))
          .toUpperCase()
      : "DRAFT PREVIEW",
    readTime: `${draft.readTimeMinutes} MIN READ`,
    author: draft.author,
    title: translation.title || "Untitled article",
    summary:
      translation.subtitle || "Add a subtitle to introduce this article.",
    intro: translation.intro,
    atAGlance: translation.atAGlance,
    bodyHtml: sanitizeBlogHtml(translation.bodyHtml),
    coverTone: draft.coverTone,
    coverNote: draft.coverNote,
    coverNumber: draft.coverNumber || "01",
    media: draft.sidebarVideoUrl ? "video" : "image",
    coverUrl: cover?.url ?? "",
    coverAlt: translation.coverAlt || translation.title || "Article cover",
    coverCaption: translation.coverCaption,
    noIndex: true,
    canonicalUrl: null,
    tags: normalizeBlogKeywords(translation.keywords),
    sidebarVideo: draft.sidebarVideoUrl
      ? {
          url: draft.sidebarVideoUrl,
          videoId: getPreviewYouTubeVideoId(draft.sidebarVideoUrl),
          title: draft.sidebarVideoTitle || "Tutorial video",
        }
      : null,
    relatedServices: draft.services,
    seoTitle: translation.seoTitle || translation.title,
    seoDescription: translation.seoDescription || translation.subtitle,
    isFeatured: draft.isFeatured,
  };
}

function serviceCatalog(menu: AdminMenuSection[]) {
  const seen = new Set<string>();
  return menu
    .flatMap((section) =>
      section.groups.flatMap((group) =>
        group.items.map((item) => ({
          serviceKey: item.label,
          label: item.label,
          href: item.href,
          isPrimary: false,
          sortOrder: 0,
        })),
      ),
    )
    .filter((item) => {
      if (seen.has(item.serviceKey)) return false;
      seen.add(item.serviceKey);
      return true;
    });
}

function BlogSummaryRow({
  item,
  onMove,
  onDragStart,
  onDrop,
  onRequestDelete,
  index,
  total,
  canReorder,
  deleting,
}: {
  item: AdminBlogSummary;
  onMove: (id: string, direction: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
  onRequestDelete: (item: AdminBlogSummary) => void;
  index: number;
  total: number;
  canReorder: boolean;
  deleting: boolean;
}) {
  return (
    <div
      className="group flex items-center gap-3 border-b border-[#eee9e2] px-3 py-3.5 last:border-b-0 sm:px-4"
      onDragOver={(event) => {
        if (canReorder) event.preventDefault();
      }}
      onDrop={() => {
        if (canReorder) void onDrop(item.id);
      }}
    >
      <button
        className={`${canReorder ? "cursor-grab hover:bg-[#f3eee7]" : "cursor-default opacity-40"} grid size-7 shrink-0 place-items-center rounded-[8px] select-none text-[18px] leading-none text-[#b1aaa1] transition-colors active:cursor-grabbing`.trim()}
        type="button"
        draggable={canReorder}
        disabled={!canReorder}
        aria-label={
          canReorder
            ? "Drag to reorder article"
            : "Clear filters to reorder articles"
        }
        onDragStart={(event) => {
          if (!canReorder) return;
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", item.id);
          onDragStart(item.id);
        }}
        onDragEnd={() => onDragStart("")}
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusPill status={item.status} />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a09a91]">
            {item.category}
          </span>
        </div>
        <a
          className="mt-1 block truncate font-brand text-[17px] font-bold tracking-[-0.025em] text-[#071b3d] transition-colors hover:text-[#0055ff]"
          href={`/admin/blog/${item.id}`}
        >
          {item.title || "Untitled article"}
        </a>
        <p className="mt-0.5 truncate text-[11px] text-[#9b958c]">
          /blog/{item.slug} · {item.subtitle || "No subtitle yet"}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[11px] font-semibold text-[#5f5a54]">
          {item.readTimeMinutes} min
        </p>
        <p className="mt-0.5 text-[10px] text-[#a09a91]">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString()
            : "Not published"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          className="grid size-7 place-items-center rounded-[8px] text-[13px] text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#0055ff] disabled:opacity-25"
          type="button"
          onClick={() => onMove(item.id, -1)}
          disabled={!canReorder || index === 0}
          aria-label="Move article up"
        >
          ↑
        </button>
        <button
          className="grid size-7 place-items-center rounded-[8px] text-[13px] text-[#77736e] transition-colors hover:bg-[#f3eee7] hover:text-[#0055ff] disabled:opacity-25"
          type="button"
          onClick={() => onMove(item.id, 1)}
          disabled={!canReorder || index === total - 1}
          aria-label="Move article down"
        >
          ↓
        </button>
        <button
          className="inline-flex min-h-8 items-center justify-center rounded-full border border-[#f1c6ce] px-2.5 text-[10px] font-bold text-[#ad3148] transition-colors hover:bg-[#fff0f2] disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={() => onRequestDelete(item)}
          disabled={deleting}
          aria-label={`Delete ${item.title || "untitled article"}`}
          title="Delete article"
        >
          Delete
        </button>
        <a
          className="ml-1 grid size-8 place-items-center rounded-full bg-[#071b3d] text-[14px] text-white transition-colors hover:bg-[#0055ff]"
          href={`/admin/blog/${item.id}`}
          aria-label={`Edit ${item.title}`}
        >
          ↗
        </a>
      </div>
    </div>
  );
}

type DeleteBlogTarget = {
  title: string;
  slug: string;
  revision: number;
};

function BlogDeleteModal({
  target,
  confirmation,
  busy,
  onConfirmationChange,
  onCancel,
  onConfirm,
}: {
  target: DeleteBlogTarget | null;
  confirmation: string;
  busy: boolean;
  onConfirmationChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!target) return null;
  const confirmed = confirmation.trim().toLowerCase() === "delete";
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[#071b3d]/45 p-4 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <form
        className="w-full max-w-[460px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_80px_rgba(7,27,61,0.24)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-blog-title"
        aria-describedby="delete-blog-description"
        onSubmit={(event) => {
          event.preventDefault();
          if (confirmed) onConfirm();
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-[#eee9e2] px-5 py-5">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff0f2] text-[18px] font-bold text-[#b13c53]"
            aria-hidden="true"
          >
            !
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b13c53]">
              Permanent action
            </p>
            <h2
              id="delete-blog-title"
              className="mt-1 break-words font-brand text-[20px] font-bold tracking-[-0.03em] text-[#071b3d]"
            >
              Delete “{target.title || "Untitled article"}”?
            </h2>
            <p
              id="delete-blog-description"
              className="mt-2 text-[12px] leading-[1.55] text-[#6f675f]"
            >
              This permanently removes the article, its revisions, service
              connections and public URL. Unsaved edits will also be lost.
              Uploaded media stays available in the shared media library.
            </p>
            <p className="mt-2 truncate text-[11px] text-[#9b958c]">
              /blog/{target.slug}
            </p>
          </div>
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-full text-[20px] leading-none text-[#8b8177] transition-colors hover:bg-[#f4eee8] hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close delete dialog"
            onClick={onCancel}
            disabled={busy}
          >
            ×
          </button>
        </div>
        <div className="space-y-2.5 px-5 py-5">
          <label
            htmlFor="delete-blog-confirmation"
            className="block text-[11px] font-bold text-[#423d38]"
          >
            Type <code className="rounded bg-[#f4eee8] px-1.5 py-0.5 font-mono text-[11px] text-[#071b3d]">delete</code> to confirm
          </label>
          <input
            id="delete-blog-confirmation"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} ${confirmation && !confirmed ? "border-[#d98a99] focus:border-[#b13c53] focus:ring-[#ffe3e7]" : ""}`.trim()}
            value={confirmation}
            onChange={(event) => onConfirmationChange(event.target.value)}
            placeholder="delete"
            aria-invalid={Boolean(confirmation) && !confirmed}
          />
        </div>
        <footer className="flex flex-wrap justify-end gap-2 bg-[#faf8f4] px-5 py-4">
          <button
            type="button"
            className="min-h-10 rounded-full bg-white px-4 text-[12px] font-bold text-[#514c47] ring-1 ring-inset ring-[#ded7ce] transition-colors hover:bg-[#f4eee8] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-10 rounded-full bg-[#b13c53] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#922e43] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!confirmed || busy}
          >
            {busy ? "Deleting…" : "Delete permanently"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export function BlogListModule() {
  const [items, setItems] = useState<AdminBlogSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BlogStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteBlogTarget | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const reorderEnabled = !query.trim() && !status;

  async function load() {
    setLoading(true);
    try {
      const next = await getAdminBlogPosts({
        query: query.trim() || undefined,
        status: status || undefined,
      });
      setItems(next.items);
      setError("");
    } catch (loadError) {
      if (
        isUnauthorizedBlogError(loadError) ||
        isUnauthorizedError(loadError)
      ) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load articles.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createArticle() {
    setBusy(true);
    setError("");
    const uniqueSlug = `untitled-article-${Date.now()}`;
    try {
      const created = await createAdminBlogPost({
        slug: uniqueSlug,
        category: "Business setup",
        author: "Limex Editorial",
        readTimeMinutes: 6,
        coverTone: "mint",
        coverNote: "Add a cover image",
        coverNumber: "01",
        coverMediaId: null,
        sidebarVideoUrl: "",
        sidebarVideoTitle: "",
        isFeatured: false,
        noIndex: true,
        canonicalUrl: "",
        translations: [blankTranslation("en"), blankTranslation("bn")],
        services: [],
      });
      window.location.assign(`/admin/blog/${created.id}`);
    } catch (createError) {
      if (isUnauthorizedBlogError(createError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create the article.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, direction: -1 | 1) {
    if (!reorderEnabled) {
      setNotice("Clear search and status filters before reordering articles.");
      return;
    }
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setNotice("");
    try {
      setItems(await reorderAdminBlogPosts(next.map((item) => item.id)));
      setNotice("Order saved.");
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : "Unable to save order.",
      );
      void load();
    }
  }

  async function drop(targetId: string) {
    if (!reorderEnabled) {
      setNotice("Clear search and status filters before reordering articles.");
      return;
    }
    if (!draggingId || draggingId === targetId) return;
    const from = items.findIndex((item) => item.id === draggingId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDraggingId(null);
    setNotice("");
    try {
      setItems(await reorderAdminBlogPosts(next.map((item) => item.id)));
      setNotice("Order saved.");
    } catch (dropError) {
      setError(
        dropError instanceof Error
          ? dropError.message
          : "Unable to save order.",
      );
      void load();
    }
  }

  function requestDelete(item: AdminBlogSummary) {
    if (deletingId) return;
    setDeleteTarget({ title: item.title, slug: item.slug, revision: item.revision });
    setDeleteConfirmation("");
    setNotice("");
    setError("");
  }

  function cancelDelete() {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteConfirmation("");
  }

  async function deleteArticle() {
    const target = deleteTarget;
    if (!target || deleteConfirmation.trim().toLowerCase() !== "delete" || deletingId) return;
    const item = items.find((candidate) => candidate.slug === target.slug);
    if (!item) {
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setNotice("That article is no longer in this list.");
      return;
    }
    setDeletingId(item.id);
    setError("");
    try {
      await deleteAdminBlogPost(item.id, target.revision);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setNotice("Article deleted permanently.");
    } catch (deleteError) {
      if (isUnauthorizedBlogError(deleteError) || isUnauthorizedError(deleteError)) {
        window.location.assign("/admin/login");
        return;
      }
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this article.");
      if (isBlogConflictError(deleteError)) void load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
            Publishing
          </p>
          <h1 className="mt-2 font-brand text-[34px] font-bold leading-none tracking-[-0.05em] text-[#071b3d] sm:text-[42px]">
            Blog
          </h1>
          <p className="mt-2 text-[13px] text-[#817a72]">
            Write useful guidance and turn readers into conversations.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 w-max items-center gap-3 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:opacity-60"
          type="button"
          onClick={() => void createArticle()}
          disabled={busy}
        >
          New article <span className="text-[17px] text-[#f5b8c7]">+</span>
        </button>
      </div>
      <div className="flex flex-col gap-2 rounded-[18px] border border-[#e1dcd4] bg-white p-3 sm:flex-row">
        <input
          className="min-h-10 min-w-0 flex-1 rounded-[11px] bg-[#f7f4ef] px-3.5 text-[13px] text-[#071b3d] outline-none placeholder:text-[#9b958c] focus:ring-4 focus:ring-[#008cff]/10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void load();
          }}
          placeholder="Search title, category or slug"
        />
        <select
          className="min-h-10 rounded-[11px] bg-[#f7f4ef] px-3.5 text-[12px] font-semibold text-[#4f4b47] outline-none focus:ring-4 focus:ring-[#008cff]/10"
          value={status}
          onChange={(event) => setStatus(event.target.value as BlogStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Drafts</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          className="min-h-10 rounded-[11px] bg-[#fce0e3] px-4 text-[12px] font-bold text-[#ad3148] transition-colors hover:bg-[#f8cbd2]"
          type="button"
          onClick={() => void load()}
        >
          Search
        </button>
      </div>
      {notice ? (
        <p className="text-[12px] font-semibold text-[#29634d]" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-[13px] bg-[#fff3f4] px-3.5 py-3 text-[12px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <section
        className="overflow-hidden rounded-[18px] border border-[#e1dcd4] bg-white"
        aria-label="Blog articles"
      >
        <div className="flex items-center justify-between border-b border-[#eee9e2] bg-[#faf9f6] px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">
            Articles
          </span>
          <span className="text-right text-[11px] text-[#9b958c]">
            {loading
              ? "Loading…"
              : reorderEnabled
                ? `${items.length} shown · drag to reorder`
                : `${items.length} shown · clear filters to reorder`}
          </span>
        </div>
        {loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-[#9b958c]">
            Loading articles…
          </div>
        ) : items.length ? (
          items.map((item, index) => (
            <BlogSummaryRow
              item={item}
              index={index}
              total={items.length}
              canReorder={reorderEnabled}
              onMove={(rowId, direction) => void move(rowId, direction)}
              onDragStart={setDraggingId}
              onDrop={(rowId) => void drop(rowId)}
              onRequestDelete={requestDelete}
              deleting={deletingId === item.id}
              key={item.id}
            />
          ))
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-[14px] font-semibold text-[#4f4b47]">
              No articles found.
            </p>
            <button
              className="mt-2 text-[12px] font-bold text-[#0055ff]"
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("");
                void load();
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <BlogDeleteModal
        target={deleteTarget}
        confirmation={deleteConfirmation}
        busy={deletingId !== null}
        onConfirmationChange={setDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={() => void deleteArticle()}
      />
    </div>
  );
}

type EditorTab = "content" | "media" | "seo" | "services" | "preview";

function EditorPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[#e1dcd4] bg-white p-4 sm:p-5">
      <div className="border-b border-[#eee9e2] pb-3">
        <h2 className="font-brand text-[21px] font-bold tracking-[-0.03em] text-[#071b3d]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[12px] leading-[1.5] text-[#817a72]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function KeywordInput({
  value,
  onChange,
  locale,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  locale: BlogLocale;
}) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => setText(value.join(", ")), [value]);
  const commit = (next: string) => onChange(normalizeBlogKeywords(next));
  return (
    <label className="block">
      <span className={labelClass}>
        {locale === "bn"
          ? "বাংলা keywords · comma separated"
          : "English keywords · comma separated"}
      </span>
      <textarea
        className={`${textAreaClass} min-h-[74px]`}
        value={text}
        placeholder={
          locale === "bn"
            ? "কোম্পানি নিবন্ধন, ট্যাক্স"
            : "company registration, business setup"
        }
        onChange={(event) => setText(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
      />
      <span className="mt-1 block text-[10px] text-[#a09a91]">
        Separate phrases with commas. Used for search and content planning; not
        shown on the article by default.
      </span>
    </label>
  );
}

type ServiceCatalogItem = {
  serviceKey: string;
  label: string;
  href: string;
  isPrimary: boolean;
  sortOrder: number;
};

function BlogServiceConnectionPanel({
  draft,
  catalog,
  updateDraft,
}: {
  draft: BlogEditorDraft;
  catalog: ServiceCatalogItem[];
  updateDraft: (patch: Partial<BlogEditorDraft>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q) ||
        item.serviceKey.toLowerCase().includes(q),
    );
  }, [catalog, searchQuery]);

  function toggleService(service: ServiceCatalogItem, checked: boolean) {
    if (checked) {
      const primaryKey =
        draft.services.find((item) => item.isPrimary)?.serviceKey ??
        service.serviceKey;
      updateDraft({
        services: [
          ...draft.services,
          {
            ...service,
            isPrimary: service.serviceKey === primaryKey,
            sortOrder: draft.services.length,
          },
        ],
      });
      return;
    }

    const remaining = draft.services.filter(
      (item) => item.serviceKey !== service.serviceKey,
    );
    const primaryKey =
      remaining.find((item) => item.isPrimary)?.serviceKey ??
      remaining[0]?.serviceKey;
    updateDraft({
      services: remaining.map((item, index) => ({
        ...item,
        sortOrder: index,
        isPrimary: item.serviceKey === primaryKey,
      })),
    });
  }

  function moveService(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.services.length) return;
    const list = [...draft.services];
    const temp = list[index]!;
    list[index] = list[targetIndex]!;
    list[targetIndex] = temp;
    updateDraft({
      services: list.map((item, idx) => ({ ...item, sortOrder: idx })),
    });
  }

  function removeService(serviceKey: string) {
    const remaining = draft.services.filter((item) => item.serviceKey !== serviceKey);
    const primaryKey =
      remaining.find((item) => item.isPrimary)?.serviceKey ??
      remaining[0]?.serviceKey;
    updateDraft({
      services: remaining.map((item, index) => ({
        ...item,
        sortOrder: index,
        isPrimary: item.serviceKey === primaryKey,
      })),
    });
  }

  function addCustomService() {
    const label = customLabel.trim();
    const href = customHref.trim() || "#contact";
    if (!label) return;
    const serviceKey = `custom-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const primaryKey =
      draft.services.find((item) => item.isPrimary)?.serviceKey ?? serviceKey;
    updateDraft({
      services: [
        ...draft.services,
        {
          serviceKey,
          label,
          href,
          isPrimary: draft.services.length === 0,
          sortOrder: draft.services.length,
        },
      ],
    });
    setCustomLabel("");
    setCustomHref("");
  }

  return (
    <EditorPanel
      title="Service connection"
      description="Connect the article to relevant services. Attached services appear as badges on the blog card and power the booking trigger."
    >
      {draft.services.length ? (
        <div className="mb-6 rounded-[14px] border border-[#e2ddd4] bg-[#faf9f6] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
              Attached services ({draft.services.length})
            </p>
            <span className="text-[11px] text-[#9b958c]">
              Drag or use arrows to change display order
            </span>
          </div>
          <div className="mt-3 divide-y divide-[#ece7de] rounded-[10px] border border-[#e8e3da] bg-white">
            {draft.services.map((service, idx) => (
              <div
                key={service.serviceKey}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-5 shrink-0 place-items-center rounded bg-[#f3eee7] text-[10px] font-bold text-[#77736e]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-[#2d2925]">
                      {service.label}
                    </span>
                    <span className="block truncate text-[10px] text-[#9b958c]">
                      {service.href}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {idx > 0 ? (
                    <button
                      type="button"
                      className="px-1.5 py-0.5 text-xs text-[#6e685f] hover:text-[#071b3d]"
                      title="Move up"
                      onClick={() => moveService(idx, -1)}
                    >
                      ↑
                    </button>
                  ) : null}
                  {idx < draft.services.length - 1 ? (
                    <button
                      type="button"
                      className="px-1.5 py-0.5 text-xs text-[#6e685f] hover:text-[#071b3d]"
                      title="Move down"
                      onClick={() => moveService(idx, 1)}
                    >
                      ↓
                    </button>
                  ) : null}

                  <button
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                      service.isPrimary
                        ? "bg-[#0055ff] text-white"
                        : "bg-[#f3eee7] text-[#77736e] hover:bg-[#e8e2d7]"
                    }`}
                    type="button"
                    onClick={() =>
                      updateDraft({
                        services: draft.services.map((item) => ({
                          ...item,
                          isPrimary: item.serviceKey === service.serviceKey,
                        })),
                      })
                    }
                  >
                    {service.isPrimary ? "Primary" : "Make primary"}
                  </button>

                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded text-xs text-[#9b958c] hover:bg-[#f3eee7] hover:text-[#de4d73]"
                    title="Remove service"
                    onClick={() => removeService(service.serviceKey)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-[14px] border border-[#e2ddd4] bg-[#faf9f6] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
          Add custom service link
        </p>
        <p className="mt-0.5 text-[11px] text-[#9b958c]">
          Link to any specific service, consultation, or registration path.
        </p>
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="h-9 rounded-[10px] border border-[#d8d2c6] bg-white px-3 text-[13px] placeholder:text-[#9b958c]"
            placeholder="Service label (e.g. RJSC Fast-track)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
          <input
            className="h-9 rounded-[10px] border border-[#d8d2c6] bg-white px-3 text-[13px] placeholder:text-[#9b958c]"
            placeholder="Destination link (e.g. /services/limited-company)"
            value={customHref}
            onChange={(e) => setCustomHref(e.target.value)}
          />
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#071b3d] px-4 text-xs font-semibold text-white hover:bg-[#0055ff] transition-colors disabled:opacity-40"
            disabled={!customLabel.trim()}
            onClick={addCustomService}
          >
            Attach
          </button>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#77736e]">
            Service catalog ({filteredCatalog.length})
          </p>
          <input
            className="h-8 w-48 rounded-[8px] border border-[#d8d2c6] bg-white px-2.5 text-xs placeholder:text-[#9b958c]"
            placeholder="Search catalog…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid max-h-[380px] gap-2 overflow-y-auto pr-1">
          {filteredCatalog.map((service, index) => {
            const selected = draft.services.some(
              (item) => item.serviceKey === service.serviceKey,
            );
            const inputId = `blog-service-${index}`;
            return (
              <div
                className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors ${
                  selected
                    ? "border border-[#c6dcff] bg-[#eef4ff]"
                    : "bg-[#faf9f6] hover:bg-[#f7f4ef]"
                }`}
                key={service.serviceKey}
              >
                <input
                  className="size-4 shrink-0 accent-[#0055ff]"
                  id={inputId}
                  type="checkbox"
                  checked={selected}
                  onChange={(event) =>
                    toggleService(service, event.target.checked)
                  }
                />
                <label
                  className="min-w-0 flex-1 cursor-pointer"
                  htmlFor={inputId}
                >
                  <span className="block text-[13px] font-semibold text-[#2d2925]">
                    {service.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#9b958c]">
                    {service.href}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </EditorPanel>
  );
}

function BlogEditorActions({
  post,
  isDirty,
  saving,
  onHistory,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
  deleting,
}: {
  post: AdminBlogPost;
  isDirty: boolean;
  saving: boolean;
  onHistory: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const isPublished = post.status === "PUBLISHED";
  const hasUnpublishedChanges =
    isPublished && post.publishedRevision !== post.revision;
  const statusLabel = saving
    ? "Saving changes…"
    : isDirty
      ? "Unsaved changes"
      : hasUnpublishedChanges
        ? "Saved draft · not published"
        : isPublished
          ? "Published and up to date"
          : "All changes saved";
  const statusDescription = isDirty
    ? isPublished
      ? "Save your draft edits first, then publish when they are ready."
      : "Save your work before leaving this article."
    : hasUnpublishedChanges
      ? "Your latest saved edits are private until you publish them."
      : isPublished
        ? "The public article is using the latest saved version."
        : "This article is safely saved as a draft.";

  return (
    <section
      className="sticky top-[76px] z-20 flex flex-col gap-3 rounded-[16px] border border-[#e1dcd4] bg-[#fffdfa]/95 p-3 shadow-[0_8px_24px_rgba(44,36,31,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
      aria-label="Article publishing actions"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] ${isDirty ? "bg-[#fff1da] text-[#9a5e22]" : "bg-[#e8f4ec] text-[#29634d]"}`.trim()}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] text-[#a09a91]">
            Revision {post.revision}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-[1.4] text-[#817a72]">
          {statusDescription}
        </p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <a
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-3.5 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#0055ff] hover:text-[#0055ff] sm:flex-none"
          href={`/admin/blog/${post.id}/preview`}
          target="_blank"
          rel="noreferrer"
          title="Open article preview in a new tab"
        >
          Preview ↗
        </a>
        <button
          className="min-h-10 flex-1 rounded-full border border-[#d8d2c8] bg-white px-3.5 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
          type="button"
          onClick={onHistory}
          disabled={saving}
        >
          History
        </button>
        <button
          className="min-h-10 flex-1 rounded-full bg-[#fce0e3] px-4 text-[12px] font-bold text-[#ad3148] transition-colors hover:bg-[#f8cbd2] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
          type="button"
          onClick={onSave}
          disabled={saving || !isDirty}
          title={
            isDirty
              ? "Save your article changes"
              : "There are no unsaved changes"
          }
        >
          {saving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
        </button>
        {isPublished ? (
          <button
            className="min-h-10 flex-1 rounded-full border border-[#f1c6ce] bg-[#fff8f8] px-3.5 text-[12px] font-bold text-[#ad3148] transition-colors hover:bg-[#fce0e3] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
            type="button"
            onClick={onUnpublish}
            disabled={saving}
          >
            Unpublish
          </button>
        ) : null}
        <button
          className="min-h-10 flex-1 rounded-full border border-[#f1c6ce] bg-[#fff8f8] px-3.5 text-[12px] font-bold text-[#ad3148] transition-colors hover:bg-[#fce0e3] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
          type="button"
          onClick={onDelete}
          disabled={saving || deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
        <button
          className="min-h-10 flex-1 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
          type="button"
          onClick={onPublish}
          disabled={saving}
        >
          {saving
            ? "Working…"
            : isPublished
              ? "Publish changes"
              : "Publish draft"}
        </button>
      </div>
    </section>
  );
}

export function BlogEditorModule({ id }: { id: string }) {
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [draft, setDraft] = useState<BlogEditorDraft | null>(null);
  const [media, setMedia] = useState<BlogMedia[]>([]);
  const [menu, setMenu] = useState<AdminMenuSection[]>([]);
  const [tab, setTab] = useState<EditorTab>("content");
  const [locale, setLocale] = useState<BlogLocale>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [slugState, setSlugState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<BlogRevision[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteBlogTarget | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getAdminBlogPost(id), getAdminMenu()])
      .then(([postResult, menuResult]) => {
        if (cancelled) return;
        if (postResult.status === "rejected") throw postResult.reason;
        const nextPost = postResult.value;
        setPost(nextPost);
        setDraft(draftFromPost(nextPost));
        setMedia(nextPost.media);
        if (menuResult.status === "fulfilled") setMenu(menuResult.value);
        else
          setNotice(
            "The service list is temporarily unavailable; existing article connections are kept safe.",
          );
      })
      .catch((loadError) => {
        if (
          isUnauthorizedBlogError(loadError) ||
          isUnauthorizedError(loadError)
        ) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this article.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const catalog = useMemo(() => serviceCatalog(menu), [menu]);
  const currentTranslation = draft?.translations[locale];
  const savedDraft = useMemo(() => (post ? draftFromPost(post) : null), [post]);
  const isDirty = Boolean(
    draft && savedDraft && JSON.stringify(draft) !== JSON.stringify(savedDraft),
  );

  useEffect(() => {
    if (!isDirty) return;
    const protectUnsavedChanges = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectUnsavedChanges);
    return () =>
      window.removeEventListener("beforeunload", protectUnsavedChanges);
  }, [isDirty]);

  function updateDraft(patch: Partial<BlogEditorDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setNotice("");
    setError("");
  }

  function updateTranslation(patch: Partial<BlogTranslation>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            translations: {
              ...current.translations,
              [locale]: { ...current.translations[locale], ...patch },
            },
          }
        : current,
    );
    setNotice("");
    setError("");
  }

  async function persist(): Promise<AdminBlogPost | null> {
    if (!post || !draft) return null;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await updateAdminBlogPost(
        post.id,
        payloadFromDraft(draft),
        post.revision,
      );
      setPost(saved);
      setDraft(draftFromPost(saved));
      setMedia(saved.media);
      setNotice("Draft saved.");
      return saved;
    } catch (saveError) {
      if (isUnauthorizedBlogError(saveError)) {
        window.location.assign("/admin/login");
        return null;
      }
      if (isBlogConflictError(saveError))
        setError(
          "This article changed in another session. Reload it before saving so no work is overwritten.",
        );
      else
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Unable to save this draft.",
        );
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    const saved = await persist();
    if (!saved) return;
    setSaving(true);
    setError("");
    try {
      const published = await publishAdminBlogPost(saved.id, saved.revision);
      setPost(published);
      setDraft(draftFromPost(published));
      setMedia(published.media);
      setNotice("Article published.");
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Unable to publish this article.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function unpublish() {
    if (!post) return;
    setSaving(true);
    setError("");
    try {
      const unpublished = await unpublishAdminBlogPost(post.id, post.revision);
      setPost(unpublished);
      setDraft(draftFromPost(unpublished));
      setMedia(unpublished.media);
      setNotice("Article moved back to draft.");
    } catch (unpublishError) {
      setError(
        unpublishError instanceof Error
          ? unpublishError.message
          : "Unable to unpublish this article.",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestDelete() {
    if (!post || deleting || saving) return;
    setDeleteTarget({
      title: currentTranslation?.title || "Untitled article",
      slug: post.slug,
      revision: post.revision,
    });
    setDeleteConfirmation("");
    setNotice("");
    setError("");
  }

  function cancelDelete() {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteConfirmation("");
  }

  async function deleteArticle() {
    const target = deleteTarget;
    if (!post || !target || deleteConfirmation.trim().toLowerCase() !== "delete" || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAdminBlogPost(post.id, target.revision);
      window.location.assign("/admin/blog");
    } catch (deleteError) {
      if (isUnauthorizedBlogError(deleteError) || isUnauthorizedError(deleteError)) {
        window.location.assign("/admin/login");
        return;
      }
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this article.");
    } finally {
      setDeleting(false);
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !post || !draft) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const compressed = await compressBlogImage(file);
      const uploaded = await uploadAdminBlogImage(post.id, compressed.file, {
        width: compressed.width,
        height: compressed.height,
        altText: draft.translations.en.coverAlt,
        caption: draft.translations.en.coverCaption,
      });
      setMedia((current) => [
        ...current.filter((item) => item.id !== uploaded.id),
        uploaded,
      ]);
      updateDraft({ coverMediaId: uploaded.id });
      setNotice("Image uploaded and compressed for web delivery.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload this image.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function checkSlug() {
    if (!draft || !post) return;
    setSlugState("checking");
    try {
      const result = await checkAdminBlogSlug(draft.slug, post.id);
      setSlugState(result.available ? "available" : "taken");
      if (!result.available) setError("That slug is already in use.");
    } catch {
      setSlugState("idle");
    }
  }

  async function openHistory() {
    if (!post) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    setError("");
    try {
      setRevisions(await getAdminBlogRevisions(post.id));
    } catch (historyError) {
      setError(
        historyError instanceof Error
          ? historyError.message
          : "Unable to load revision history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function restore(version: number) {
    if (!post) return;
    setSaving(true);
    setError("");
    try {
      const restored = await restoreAdminBlogPost(
        post.id,
        post.revision,
        version,
      );
      setPost(restored);
      setDraft(draftFromPost(restored));
      setMedia(restored.media);
      setHistoryOpen(false);
      setNotice(`Revision ${version} restored as a new draft revision.`);
    } catch (restoreError) {
      if (isBlogConflictError(restoreError))
        setError(
          "This article changed in another session. Reload it before restoring so no work is overwritten.",
        );
      else
        setError(
          restoreError instanceof Error
            ? restoreError.message
            : "Unable to restore this revision.",
        );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="rounded-[18px] border border-[#e1dcd4] bg-white px-4 py-14 text-center text-[13px] text-[#9b958c]">
        Loading article…
      </div>
    );
  if (!post || !draft || !currentTranslation)
    return (
      <div className="rounded-[18px] bg-[#fff3f4] px-4 py-5 text-[13px] font-semibold text-[#ad3148]">
        This article could not be loaded.
      </div>
    );

  const tabs: Array<{ value: EditorTab; label: string }> = [
    { value: "content", label: "Content" },
    { value: "media", label: "Media" },
    { value: "seo", label: "SEO" },
    {
      value: "services",
      label: draft.services.length
        ? `Services (${draft.services.length})`
        : "Services",
    },
    { value: "preview", label: "Preview" },
  ];
  const selectedMedia = media.find((item) => item.id === draft.coverMediaId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <a
            className="text-[12px] font-semibold text-[#0055ff] hover:text-[#071b3d]"
            href="/admin/blog"
          >
            ← All articles
          </a>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={post.status} />
            {post.status === "PUBLISHED" &&
            post.publishedRevision !== post.revision ? (
              <span className="inline-flex min-h-6 items-center rounded-full bg-[#fff1da] px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9a5e22]">
                unpublished changes
              </span>
            ) : null}
            <span className="text-[11px] text-[#a09a91]">
              Revision {post.revision}
            </span>
            {isDirty ? (
              <span className="inline-flex min-h-6 items-center rounded-full bg-[#fff1da] px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9a5e22]">
                unsaved changes
              </span>
            ) : null}
            {post.publishedSlug ? (
              <a
                className="text-[11px] font-semibold text-[#77736e] hover:text-[#0055ff]"
                href={`/blog/${post.publishedSlug}`}
                target="_blank"
                rel="noreferrer"
              >
                Open public page ↗
              </a>
            ) : null}
          </div>
          <h1 className="mt-2 truncate font-brand text-[30px] font-bold tracking-[-0.045em] text-[#071b3d] sm:text-[38px]">
            {currentTranslation.title || "Untitled article"}
          </h1>
          <p className="mt-1 truncate text-[12px] text-[#817a72]">
            /{draft.slug}
          </p>
        </div>
      </div>
      <BlogEditorActions
        post={post}
        isDirty={isDirty}
        saving={saving}
        onHistory={() => void openHistory()}
        onSave={() => void persist()}
        onPublish={() => void publish()}
        onUnpublish={() => void unpublish()}
        onDelete={requestDelete}
        deleting={deleting}
      />
      {notice ? (
        <p className="text-[12px] font-semibold text-[#29634d]" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-[13px] bg-[#fff3f4] px-3.5 py-3 text-[12px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div
        className="flex gap-1 overflow-x-auto border-b border-[#ded8cf] pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Article editor sections"
      >
        {tabs.map((item) => (
          <button
            className={`min-h-10 shrink-0 border-b-2 px-3 text-[12px] font-bold transition-colors ${tab === item.value ? "border-[#0055ff] text-[#0055ff]" : "border-transparent text-[#77736e] hover:text-[#071b3d]"}`.trim()}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            key={item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <EditorPanel
            title="Article content"
            description="Write the article in the same calm, practical voice as the Limex journal."
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9e2] pb-3">
              <div className="flex gap-1 rounded-full bg-[#f3f1ec] p-1">
                <button
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${locale === "en" ? "bg-white text-[#071b3d] shadow-sm" : "text-[#77736e]"}`}
                  type="button"
                  onClick={() => setLocale("en")}
                >
                  English
                </button>
                <button
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${locale === "bn" ? "bg-white text-[#071b3d] shadow-sm" : "text-[#77736e]"}`}
                  type="button"
                  onClick={() => setLocale("bn")}
                >
                  বাংলা
                </button>
              </div>
              <span className="text-[10px] text-[#a09a91]">
                {locale === "bn"
                  ? "Bangla translation"
                  : "Primary publish language"}
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              <Field
                label="Title"
                value={currentTranslation.title}
                placeholder={
                  locale === "bn" ? "বাংলা শিরোনাম" : "Article title"
                }
                onChange={(event) =>
                  updateTranslation({ title: event.target.value })
                }
              />
              <Field
                label="Subtitle"
                value={currentTranslation.subtitle}
                placeholder="One clear sentence"
                onChange={(event) =>
                  updateTranslation({ subtitle: event.target.value })
                }
              />
              <label className="block">
                <span className={labelClass}>Article body</span>
                <span className="mt-1 block text-[11px] leading-[1.45] text-[#9b958c]">
                  Use Visual for standard writing, HTML &amp; CSS for custom
                  layouts, and Preview to inspect the exact result before
                  saving.
                </span>
                <div className="mt-2">
                  <RichTextEditor
                    value={currentTranslation.bodyHtml}
                    onChange={(bodyHtml, bodyJson) =>
                      updateTranslation({ bodyHtml, bodyJson })
                    }
                  />
                </div>
              </label>
            </div>
          </EditorPanel>
          <EditorPanel
            title="Article settings"
            description="Small controls that shape how the article appears in the journal."
          >
            <div className="grid gap-4">
              <Field
                label="Category"
                value={draft.category}
                placeholder="Business setup"
                onChange={(event) =>
                  updateDraft({ category: event.target.value })
                }
              />
              <Field
                label="Author"
                value={draft.author}
                placeholder="Limex Editorial"
                onChange={(event) =>
                  updateDraft({ author: event.target.value })
                }
              />
              <Field
                label="Read time · minutes"
                value={draft.readTimeMinutes}
                type="number"
                onChange={(event) =>
                  updateDraft({
                    readTimeMinutes: Number(event.target.value) || 1,
                  })
                }
              />
              <label className="block">
                <span className={labelClass}>Slug</span>
                <div className="mt-2 flex gap-2">
                  <input
                    className="min-h-11 min-w-0 flex-1 rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#071b3d] outline-none focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                    value={draft.slug}
                    onChange={(event) => {
                      updateDraft({ slug: event.target.value });
                      setSlugState("idle");
                    }}
                  />
                  <button
                    className="min-h-11 rounded-[12px] bg-[#f3f1ec] px-3 text-[11px] font-bold text-[#4f4b47] hover:bg-[#fce0e3]"
                    type="button"
                    onClick={() => void checkSlug()}
                  >
                    {slugState === "checking" ? "…" : "Check"}
                  </button>
                </div>
                {slugState === "available" ? (
                  <span className="mt-1 block text-[10px] font-semibold text-[#29634d]">
                    Slug available
                  </span>
                ) : slugState === "taken" ? (
                  <span className="mt-1 block text-[10px] font-semibold text-[#ad3148]">
                    Slug already used
                  </span>
                ) : null}
              </label>
            </div>
          </EditorPanel>
        </div>
      ) : null}

      {tab === "media" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <EditorPanel
            title="Cover image"
            description="Upload one optimized image and preserve its original ratio on every public card."
          >
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="overflow-hidden rounded-[16px] bg-[#f7f4ef]">
                {selectedMedia ? (
                  <img
                    className="aspect-[852/430] size-full object-cover"
                    src={selectedMedia.url}
                    alt={draft.translations.en.coverAlt || "Selected cover"}
                  />
                ) : (
                  <div className="grid aspect-[852/430] place-items-center px-5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b958c]">
                      No cover image
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#071b3d] px-4 text-center text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff]">
                  {uploading ? "Preparing image…" : "Upload image"}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => void uploadImage(event)}
                    disabled={uploading}
                  />
                </label>
                <p className="mt-2 text-[10px] leading-[1.45] text-[#9b958c]">
                  Images are resized to 2400px max and compressed to WebP before
                  upload.
                </p>
              </div>
            </div>
            {media.length > 1 ? (
              <div className="mt-5">
                <p className={labelClass}>Uploaded images</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {media.map((item) => (
                    <button
                      className={`size-16 overflow-hidden rounded-[11px] bg-[#f7f4ef] ring-offset-2 transition-shadow ${item.id === draft.coverMediaId ? "ring-2 ring-[#0055ff]" : "hover:ring-2 hover:ring-[#d8d2c8]"}`.trim()}
                      type="button"
                      aria-label={`Use image ${item.id === draft.coverMediaId ? "as current cover" : "as cover"}`}
                      aria-pressed={item.id === draft.coverMediaId}
                      onClick={() => updateDraft({ coverMediaId: item.id })}
                      key={item.id}
                    >
                      <img
                        className="size-full object-cover"
                        src={item.url}
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextArea
                label="English alt text"
                value={draft.translations.en.coverAlt}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          translations: {
                            ...current.translations,
                            en: {
                              ...current.translations.en,
                              coverAlt: event.target.value,
                            },
                          },
                        }
                      : current,
                  )
                }
              />
              <TextArea
                label="বাংলা alt text"
                value={draft.translations.bn.coverAlt}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          translations: {
                            ...current.translations,
                            bn: {
                              ...current.translations.bn,
                              coverAlt: event.target.value,
                            },
                          },
                        }
                      : current,
                  )
                }
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field
                label="Cover note"
                value={draft.coverNote ?? ""}
                placeholder="Documents, steps and first decisions"
                onChange={(event) =>
                  updateDraft({ coverNote: event.target.value })
                }
              />
              <Field
                label="Cover number"
                value={draft.coverNumber ?? ""}
                placeholder="01"
                onChange={(event) =>
                  updateDraft({ coverNumber: event.target.value })
                }
              />
            </div>
          </EditorPanel>
          <EditorPanel
            title="Sidebar tutorial"
            description="Optional. Add a YouTube tutorial that appears in the article’s right rail."
          >
            <Field
              label="YouTube URL"
              value={draft.sidebarVideoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(event) =>
                updateDraft({ sidebarVideoUrl: event.target.value })
              }
            />
            <Field
              label="Video title"
              value={draft.sidebarVideoTitle ?? ""}
              placeholder="How the process works"
              onChange={(event) =>
                updateDraft({ sidebarVideoTitle: event.target.value })
              }
              className="mt-4"
            />
            <p className="mt-3 text-[10px] leading-[1.45] text-[#9b958c]">
              Only valid YouTube links are accepted when you save.
            </p>
          </EditorPanel>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <EditorPanel
            title="Search appearance"
            description="Metadata is managed per language so the article can grow into a true bilingual experience."
          >
            <div className="flex gap-1 rounded-full bg-[#f3f1ec] p-1">
              <button
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${locale === "en" ? "bg-white text-[#071b3d] shadow-sm" : "text-[#77736e]"}`}
                type="button"
                onClick={() => setLocale("en")}
              >
                English
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${locale === "bn" ? "bg-white text-[#071b3d] shadow-sm" : "text-[#77736e]"}`}
                type="button"
                onClick={() => setLocale("bn")}
              >
                বাংলা
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <Field
                label="SEO title"
                value={currentTranslation.seoTitle}
                placeholder={currentTranslation.title || "Search result title"}
                onChange={(event) =>
                  updateTranslation({ seoTitle: event.target.value })
                }
              />
              <TextArea
                label="Meta description"
                value={currentTranslation.seoDescription}
                placeholder={
                  currentTranslation.subtitle ||
                  "A concise description for search results."
                }
                onChange={(event) =>
                  updateTranslation({ seoDescription: event.target.value })
                }
              />
              <KeywordInput
                value={currentTranslation.keywords}
                onChange={(keywords) => updateTranslation({ keywords })}
                locale={locale}
              />
              <TextArea
                label={locale === "bn" ? "বাংলা caption" : "English caption"}
                value={currentTranslation.coverCaption}
                placeholder="Optional image caption"
                onChange={(event) =>
                  updateTranslation({ coverCaption: event.target.value })
                }
              />
            </div>
          </EditorPanel>
          <EditorPanel
            title="Discoverability"
            description="These checks help keep published pages useful and indexable."
          >
            <div className="space-y-3 text-[12px] text-[#5f5a54]">
              <p
                className={`flex items-center justify-between rounded-[11px] bg-[#f7f4ef] px-3 py-2 ${draft.translations.en.title ? "text-[#29634d]" : "text-[#ad3148]"}`}
              >
                <span>English title</span>
                <strong>
                  {draft.translations.en.title ? "Ready" : "Missing"}
                </strong>
              </p>
              <p
                className={`flex items-center justify-between rounded-[11px] bg-[#f7f4ef] px-3 py-2 ${draft.translations.en.subtitle ? "text-[#29634d]" : "text-[#ad3148]"}`}
              >
                <span>Meta description</span>
                <strong>
                  {draft.translations.en.seoDescription ||
                  draft.translations.en.subtitle
                    ? "Ready"
                    : "Missing"}
                </strong>
              </p>
              <p
                className={`flex items-center justify-between rounded-[11px] bg-[#f7f4ef] px-3 py-2 ${draft.translations.en.bodyHtml.replace(/<[^>]+>/g, "").trim() ? "text-[#29634d]" : "text-[#ad3148]"}`}
              >
                <span>Article body</span>
                <strong>
                  {draft.translations.en.bodyHtml.replace(/<[^>]+>/g, "").trim()
                    ? "Ready"
                    : "Missing"}
                </strong>
              </p>
              <p className="flex items-center justify-between rounded-[11px] bg-[#f7f4ef] px-3 py-2">
                <span>Cover image</span>
                <strong
                  className={
                    selectedMedia ? "text-[#29634d]" : "text-[#9b958c]"
                  }
                >
                  {selectedMedia ? "Added" : "Optional"}
                </strong>
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              <Field
                label="Canonical URL · optional"
                value={draft.canonicalUrl ?? ""}
                placeholder="https://limex.../blog/..."
                onChange={(event) =>
                  updateDraft({ canonicalUrl: event.target.value })
                }
              />
              <label className="flex min-h-11 items-center gap-3 rounded-[12px] bg-[#f7f4ef] px-3.5 text-[12px] font-semibold text-[#4f4b47]">
                <input
                  className="size-4 accent-[#0055ff]"
                  type="checkbox"
                  checked={draft.noIndex}
                  onChange={(event) =>
                    updateDraft({ noIndex: event.target.checked })
                  }
                />
                Keep this page out of search results
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-[12px] bg-[#f7f4ef] px-3.5 text-[12px] font-semibold text-[#4f4b47]">
                <input
                  className="size-4 accent-[#0055ff]"
                  type="checkbox"
                  checked={draft.isFeatured}
                  onChange={(event) =>
                    updateDraft({ isFeatured: event.target.checked })
                  }
                />
                Show as featured guide
              </label>
            </div>
          </EditorPanel>
        </div>
      ) : null}

      {tab === "services" ? (
        <BlogServiceConnectionPanel
          draft={draft}
          catalog={catalog}
          updateDraft={updateDraft}
        />
      ) : null}

      {tab === "preview" ? (
        <div className="overflow-hidden rounded-[18px] border border-[#e1dcd4] bg-[#f3f1ec]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded8cf] bg-white px-4 py-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">
                Draft preview · {locale === "bn" ? "বাংলা" : "English"}
              </p>
              <p className="mt-1 text-[12px] text-[#817a72]">
                This uses the public article layout and sanitized content.
              </p>
            </div>
            <a
              className="rounded-full bg-[#071b3d] px-3.5 py-2 text-[11px] font-bold text-white hover:bg-[#0055ff]"
              href={`/admin/blog/${post.id}/preview`}
              target="_blank"
              rel="noreferrer"
            >
              Open full preview ↗
            </a>
          </div>
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2 sm:p-5">
            <BlogDetailContent
              article={previewArticle(draft, { ...post, media }, locale)}
              relatedArticles={[]}
              locale={locale}
            />
          </div>
        </div>
      ) : null}
      {historyOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#071b3d]/45 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-history-title"
        >
          <div className="flex max-h-[min(620px,calc(100vh-48px))] w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_80px_rgba(20,20,28,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee9e2] px-5 py-4">
              <div>
                <h2
                  className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#071b3d]"
                  id="blog-history-title"
                >
                  Revision history
                </h2>
                <p className="mt-1 text-[12px] text-[#817a72]">
                  Restore creates a new revision; it never deletes this history.
                </p>
              </div>
              <button
                className="grid size-8 place-items-center rounded-full bg-[#f3f1ec] text-[20px] leading-none text-[#4f4b47]"
                type="button"
                aria-label="Close revision history"
                onClick={() => setHistoryOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              {historyLoading ? (
                <p className="py-8 text-center text-[13px] text-[#9b958c]">
                  Loading history…
                </p>
              ) : revisions.length ? (
                <div className="divide-y divide-[#eee9e2]">
                  {revisions.map((revision) => (
                    <div
                      className="flex items-center justify-between gap-3 py-3"
                      key={revision.id}
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#2d2925]">
                          Revision {revision.version}{" "}
                          <span className="ml-1 rounded-full bg-[#f3f1ec] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#77736e]">
                            {revision.kind.toLowerCase()}
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-[#9b958c]">
                          {new Date(revision.createdAt).toLocaleString()} ·{" "}
                          {revision.createdBy || "system"}
                        </p>
                      </div>
                      <button
                        className="shrink-0 rounded-full bg-[#fce0e3] px-3 py-2 text-[11px] font-bold text-[#ad3148] hover:bg-[#f8cbd2] disabled:opacity-50"
                        type="button"
                        onClick={() => void restore(revision.version)}
                        disabled={saving || revision.version === post.revision}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-[13px] text-[#9b958c]">
                  No saved revisions yet.
                </p>
              )}
            </div>
            <div className="border-t border-[#eee9e2] px-5 py-3 text-right">
              <button
                className="rounded-full border border-[#d8d2c8] px-3.5 py-2 text-[11px] font-bold text-[#4f4b47]"
                type="button"
                onClick={() => setHistoryOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <BlogDeleteModal
        target={deleteTarget}
        confirmation={deleteConfirmation}
        busy={deleting}
        onConfirmationChange={setDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={() => void deleteArticle()}
      />
    </div>
  );
}

export function BlogPreviewModule({ id }: { id: string }) {
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void getAdminBlogPost(id)
      .then(setPost)
      .catch((loadError) => {
        if (
          isUnauthorizedBlogError(loadError) ||
          isUnauthorizedError(loadError)
        ) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load preview.",
        );
      });
  }, [id]);

  if (error)
    return (
      <p
        className="rounded-[13px] bg-[#fff3f4] px-4 py-3 text-[13px] font-semibold text-[#ad3148]"
        role="alert"
      >
        {error}
      </p>
    );
  if (!post)
    return (
      <div className="rounded-[18px] border border-[#e1dcd4] bg-white px-4 py-14 text-center text-[13px] text-[#9b958c]">
        Loading preview…
      </div>
    );
  const draft = draftFromPost(post);
  const previewState =
    post.status === "PUBLISHED" && post.publishedRevision !== post.revision
      ? "Saved draft changes · public page remains on the last published version until you publish again."
      : post.status === "PUBLISHED"
        ? "Published article"
        : "Draft only · not indexed";
  return (
    <div className="-mx-4 -my-6 overflow-hidden bg-page sm:-mx-6 sm:-my-8 lg:-mx-10 lg:-my-10">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#e1dcd4] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">
            Preview
          </p>
          <p className="mt-0.5 text-[12px] text-[#817a72]">{previewState}</p>
        </div>
        <a
          className="rounded-full bg-[#071b3d] px-3.5 py-2 text-[11px] font-bold text-white hover:bg-[#0055ff]"
          href={`/admin/blog/${post.id}`}
        >
          Back to editor
        </a>
      </div>
      <BlogDetailContent
        article={previewArticle(draft, post)}
        relatedArticles={[]}
      />
      <SiteFooter />
    </div>
  );
}
