"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { RichTextEditor } from "./rich-text-editor";
import {
  getAdminLegalPages,
  updateAdminLegalPage,
  type LegalPageData,
  type LegalSlug,
} from "@/lib/legal-api";
import { defaultLegalPages } from "@/lib/legal-defaults";

function formatDate(isoString?: string) {
  if (!isoString) return "Never";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function LegalModule() {
  const [activeSlug, setActiveSlug] = useState<LegalSlug>("terms");
  const [pages, setPages] = useState<Record<LegalSlug, LegalPageData>>({
    terms: defaultLegalPages.terms,
    privacy: defaultLegalPages.privacy,
  });
  const [drafts, setDrafts] = useState<
    Record<
      LegalSlug,
      { title: string; contentHtml: string; contentJson?: unknown }
    >
  >({
    terms: {
      title: defaultLegalPages.terms.title,
      contentHtml: defaultLegalPages.terms.contentHtml,
    },
    privacy: {
      title: defaultLegalPages.privacy.title,
      contentHtml: defaultLegalPages.privacy.contentHtml,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminLegalPages()
      .then((loadedPages) => {
        if (!active) return;
        const mapped: Record<LegalSlug, LegalPageData> = {
          terms:
            loadedPages.find((p) => p.slug === "terms") ??
            defaultLegalPages.terms,
          privacy:
            loadedPages.find((p) => p.slug === "privacy") ??
            defaultLegalPages.privacy,
        };
        setPages(mapped);
        setDrafts({
          terms: {
            title: mapped.terms.title,
            contentHtml: mapped.terms.contentHtml,
            contentJson: mapped.terms.contentJson,
          },
          privacy: {
            title: mapped.privacy.title,
            contentHtml: mapped.privacy.contentHtml,
            contentJson: mapped.privacy.contentJson,
          },
        });
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Legal pages could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const currentOriginal = pages[activeSlug];
  const currentDraft = drafts[activeSlug];
  const isDirty =
    currentDraft.title !== currentOriginal.title ||
    currentDraft.contentHtml !== currentOriginal.contentHtml;

  function updateTitle(title: string) {
    setMessage("");
    setError("");
    setDrafts((prev) => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], title },
    }));
  }

  function updateContent(contentHtml: string, contentJson?: unknown) {
    setMessage("");
    setError("");
    setDrafts((prev) => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], contentHtml, contentJson },
    }));
  }

  function discardChanges() {
    setMessage("");
    setError("");
    setDrafts((prev) => ({
      ...prev,
      [activeSlug]: {
        title: currentOriginal.title,
        contentHtml: currentOriginal.contentHtml,
        contentJson: currentOriginal.contentJson,
      },
    }));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const saved = await updateAdminLegalPage(activeSlug, {
        title: currentDraft.title.trim(),
        contentHtml: currentDraft.contentHtml,
        contentJson: currentDraft.contentJson,
      });

      setPages((prev) => ({
        ...prev,
        [activeSlug]: saved,
      }));
      setDrafts((prev) => ({
        ...prev,
        [activeSlug]: {
          title: saved.title,
          contentHtml: saved.contentHtml,
          contentJson: saved.contentJson,
        },
      }));
      setMessage(
        `${saved.title} has been updated successfully. Public page is now live.`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save legal page changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  const publicUrl = activeSlug === "terms" ? "/terms" : "/privacy";

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
            Legal &amp; Statutory Compliance
          </p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#071b3d] sm:text-[48px]">
            Legal Pages
          </h1>
          <p className="mt-3 max-w-[660px] text-[14px] leading-[1.6] text-[#77736e]">
            Manage your Terms and Conditions and Privacy Policy. Use the rich
            text editor to format clauses, add tables, or customize CSS styles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d9d3ca] bg-white px-4 text-[12px] font-bold text-[#071b3d] transition-colors hover:bg-[#f4f1ec]"
          >
            View live page ↗
          </Link>
          {isDirty ? (
            <button
              type="button"
              onClick={discardChanges}
              disabled={saving}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#e5dcd1] px-3.5 text-[12px] font-medium text-[#777168] transition-colors hover:bg-[#f9f7f4]"
            >
              Discard changes
            </button>
          ) : null}
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-5 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-50"
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving || !isDirty}
          >
            {saving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </section>

      {/* Notifications */}
      {message ? (
        <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-[13px] font-medium text-[#166534]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] p-4 text-[13px] font-medium text-[#991b1b]">
          {error}
        </div>
      ) : null}

      {/* Document Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#e2dcd4] pb-px">
        <button
          type="button"
          onClick={() => {
            setActiveSlug("terms");
            setMessage("");
            setError("");
          }}
          className={`relative px-4 py-3 text-[13px] font-bold transition-colors ${
            activeSlug === "terms"
              ? "text-[#0055ff]"
              : "text-[#666057] hover:text-[#071b3d]"
          }`}
        >
          Terms and conditions
          {activeSlug === "terms" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0055ff]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSlug("privacy");
            setMessage("");
            setError("");
          }}
          className={`relative px-4 py-3 text-[13px] font-bold transition-colors ${
            activeSlug === "privacy"
              ? "text-[#0055ff]"
              : "text-[#666057] hover:text-[#071b3d]"
          }`}
        >
          Privacy policy
          {activeSlug === "privacy" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0055ff]" />
          ) : null}
        </button>
      </div>

      {/* Main Editing Card */}
      <div className="rounded-[20px] border border-[#e5dfd6] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(20,24,35,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ece5] pb-5">
          <div className="flex-1 max-w-xl">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">
                Page Title
              </span>
              <input
                type="text"
                value={currentDraft.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-[12px] border border-[#d9d3ca] bg-[#faf8f5] px-3.5 text-[14px] font-medium text-[#071b3d] outline-none transition-colors focus:border-[#0055ff] focus:bg-white focus:ring-4 focus:ring-[#008cff]/10"
                placeholder="Page Title"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-[#888177]">
            <span className="rounded-full bg-[#f4f0eb] px-3 py-1 font-mono text-[11px] font-medium text-[#666057]">
              Slug: /{activeSlug}
            </span>
            <span>Last saved: {formatDate(currentOriginal.updatedAt)}</span>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">
              Document Body Content
            </span>
            <span className="text-[11px] text-[#9b958c]">
              Supports Visual typing, HTML markup, scoped CSS rules &amp;
              Preview
            </span>
          </div>

          <RichTextEditor
            ariaLabel={`${currentDraft.title} body editor`}
            placeholder="Write the legal terms, statutory clauses, and agreements…"
            value={currentDraft.contentHtml}
            onChange={(html, doc) => updateContent(html, doc)}
          />
        </div>
      </div>
    </div>
  );
}
