"use client";

import { useEffect, useState, type DragEvent, type FormEvent, type ReactNode } from "react";

import {
  createAboutReel,
  deleteAboutReel,
  getAdminAboutReels,
  isUnauthorizedAboutError,
  reorderAboutReels,
  updateAboutReel,
  type AboutReel,
  type AboutReelInput,
} from "@/lib/about-api";

const fallbackTitle = "Watch on YouTube";
const thumbnailTones = [
  "bg-[#e9f0ec] text-[#32614e]",
  "bg-[#ececf5] text-[#5c5788]",
  "bg-[#f2ece4] text-[#876344]",
  "bg-[#e7eff0] text-[#3a6a6d]",
];

type ReelDraft = {
  youtubeUrl: string;
  title: string;
  sortOrder: number;
  isVisible: boolean;
};

function emptyDraft(sortOrder = 0): ReelDraft {
  return { youtubeUrl: "", title: "", sortOrder, isVisible: true };
}

function reelDraft(reel: AboutReel | null, index: number): ReelDraft {
  if (!reel) return emptyDraft(index);

  return {
    youtubeUrl: reel.youtubeUrl,
    title: reel.title ?? "",
    sortOrder: reel.sortOrder,
    isVisible: reel.isVisible,
  };
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(hostname)) return null;

    let videoId = "";
    if (hostname === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    else if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
    else {
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(segments[0] ?? "")) videoId = segments[1] ?? "";
    }

    return /^[a-zA-Z0-9_-]{6,32}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

function displayTitle(reel: AboutReel) {
  return reel.title?.trim() || reel.youtubeTitle || fallbackTitle;
}

function ReelThumbnail({ src, index, alt = "" }: { src: string | null; index: number; alt?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return <img className="size-full object-cover" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }

  return (
    <div className={`grid size-full place-items-center ${thumbnailTones[index % thumbnailTones.length]}`.trim()} aria-hidden="true">
      <span className="grid size-12 place-items-center rounded-full border border-current/20 bg-white/55 text-[17px] shadow-[0_8px_20px_rgba(40,40,40,0.06)]">▶</span>
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]" htmlFor={htmlFor}>{children}</label>;
}

function AboutReelEditor({
  reel,
  index,
  saving,
  onCancel,
  onSave,
}: {
  reel: AboutReel | null;
  index: number;
  saving: boolean;
  onCancel: () => void;
  onSave: (input: AboutReelInput) => void;
}) {
  const [draft, setDraft] = useState<ReelDraft>(() => reelDraft(reel, index));
  const [formError, setFormError] = useState("");
  const videoId = getYouTubeVideoId(draft.youtubeUrl);

  function updateDraft<K extends keyof ReelDraft>(key: K, value: ReelDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!videoId) {
      setFormError("Paste a valid YouTube video link.");
      return;
    }

    if (draft.title.length > 160) {
      setFormError("Keep the custom title under 160 characters.");
      return;
    }

    setFormError("");
    onSave({
      youtubeUrl: draft.youtubeUrl.trim(),
      title: draft.title.trim() || null,
      sortOrder: draft.sortOrder,
      isVisible: draft.isVisible,
    });
  }

  return (
    <form className="rounded-[22px] border border-[#d9d1c5] bg-white p-4 shadow-[0_14px_36px_rgba(49,42,35,0.06)] sm:p-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee9e2] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">{reel ? "Edit reel" : "New reel"}</p>
          <h3 className="mt-1 font-brand text-[24px] font-bold tracking-[-0.04em] text-[#071b3d]">Add a Limex story</h3>
        </div>
        <button className="grid size-9 place-items-center rounded-full border border-[#ddd7ce] text-[18px] text-[#77736e] transition-colors hover:border-[#aaa197] hover:text-[#071b3d]" type="button" aria-label="Close reel editor" onClick={onCancel}>×</button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="aspect-video overflow-hidden rounded-[16px] border border-[#e8e1d8] bg-[#faf9f6]">
            <ReelThumbnail src={videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null} index={index} />
          </div>
          <p className="mt-2 text-[11px] leading-[1.45] text-[#9b958c]">The thumbnail comes directly from YouTube.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0 sm:col-span-2">
            <FieldLabel htmlFor="about-reel-url">YouTube link</FieldLabel>
            <input className="mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" id="about-reel-url" type="url" value={draft.youtubeUrl} placeholder="https://www.youtube.com/watch?v=…" onChange={(event) => updateDraft("youtubeUrl", event.target.value)} />
            <span className="mt-1.5 block text-[10px] text-[#9b958c]">YouTube watch, Shorts, live, embed and youtu.be links are supported.</span>
          </label>
          <label className="block min-w-0 sm:col-span-2">
            <FieldLabel htmlFor="about-reel-title">Title <span className="font-normal normal-case tracking-normal text-[#aaa49b]">(optional)</span></FieldLabel>
            <input className="mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" id="about-reel-title" value={draft.title} placeholder="Leave blank to use the YouTube title" maxLength={160} onChange={(event) => updateDraft("title", event.target.value)} />
            <span className="mt-1.5 block text-[10px] text-[#9b958c]">No custom title? We use the video title from YouTube automatically.</span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-[12px] border border-[#e8e1d8] bg-[#faf9f6] px-3.5 text-[12px] font-semibold text-[#4f4b47] sm:col-span-2">
            <input className="size-4 accent-[#0055ff]" type="checkbox" checked={draft.isVisible} onChange={(event) => updateDraft("isVisible", event.target.checked)} />
            Show this reel publicly
          </label>
        </div>
      </div>

      {formError ? <p className="mt-4 rounded-[12px] border border-[#f1c6ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] text-[#ad3148]" role="alert">{formError}</p> : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#eee9e2] pt-4">
        <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#071b3d] disabled:opacity-60" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-5 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving…" : reel ? "Save reel" : "Add reel"}</button>
      </div>
    </form>
  );
}

function AboutReelCard({
  reel,
  index,
  canMoveUp,
  canMoveDown,
  dragging,
  disabled,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  reel: AboutReel;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  dragging: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[20px] border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(49,42,35,0.06)] ${dragging ? "border-[#0055ff] opacity-60 ring-2 ring-[#0055ff]/10" : "border-[#e1dcd4]"}`.trim()}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative aspect-video w-[126px] shrink-0 overflow-hidden rounded-[14px] border border-[#e8e1d8] bg-[#faf9f6] sm:w-[160px]">
          <ReelThumbnail src={reel.thumbnailUrl} index={index} alt="" />
          <span className="absolute bottom-2 left-2 rounded-full bg-[#071b3d]/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">YouTube</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <button
                className="mt-0.5 grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-[18px] leading-none text-[#a49b90] transition-colors hover:bg-[#f3f1ec] hover:text-[#071b3d] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                draggable={!disabled}
                disabled={disabled}
                aria-label={`Drag to reorder ${displayTitle(reel)}`}
                title="Drag to reorder"
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <span aria-hidden="true">⠿</span>
              </button>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">{reel.title ? "Custom title" : "YouTube title"}</p>
                <h3 className="mt-1 line-clamp-2 font-brand text-[20px] font-bold leading-[1.08] tracking-[-0.04em] text-[#071b3d]">{displayTitle(reel)}</h3>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${reel.isVisible ? "bg-[#e9f4ed] text-[#29634d]" : "bg-[#f3f1ec] text-[#8b857e]"}`.trim()}>{reel.isVisible ? "Visible" : "Hidden"}</span>
          </div>
          <a className="mt-2 block truncate text-[11px] text-[#8b857e] underline decoration-[#d8d2c8] underline-offset-2 transition-colors hover:text-[#071b3d]" href={reel.youtubeUrl} target="_blank" rel="noreferrer">{reel.youtubeUrl}</a>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#eee9e2] bg-[#faf9f6] px-4 py-3 sm:px-5">
        <span className="text-[11px] font-semibold text-[#9b958c]">Reel {String(reel.sortOrder + 1).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <button className="grid size-9 place-items-center rounded-full border border-[#d8d2c8] bg-white text-[15px] text-[#4f4b47] transition-colors hover:border-[#0055ff] hover:text-[#0055ff] disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label={`Move ${displayTitle(reel)} up`} title="Move up" disabled={disabled || !canMoveUp} onClick={() => onMove(-1)}>↑</button>
          <button className="grid size-9 place-items-center rounded-full border border-[#d8d2c8] bg-white text-[15px] text-[#4f4b47] transition-colors hover:border-[#0055ff] hover:text-[#0055ff] disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label={`Move ${displayTitle(reel)} down`} title="Move down" disabled={disabled || !canMoveDown} onClick={() => onMove(1)}>↓</button>
          <button className="inline-flex min-h-9 items-center rounded-full border border-[#d8d2c8] bg-white px-3.5 text-[11px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#071b3d]" type="button" onClick={onEdit}>Edit</button>
          <button className="grid size-9 place-items-center rounded-full border border-[#f1c6ce] text-[16px] text-[#c63c56] transition-colors hover:bg-[#fce0e3] disabled:opacity-40" type="button" aria-label={`Delete ${displayTitle(reel)}`} onClick={onDelete} disabled={disabled}>×</button>
        </div>
      </div>
    </article>
  );
}

export function AboutReelsManager() {
  const [reels, setReels] = useState<AboutReel[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void getAdminAboutReels()
      .then((nextReels) => {
        setReels(nextReels);
        setLoadError("");
      })
      .catch((loadErrorValue: unknown) => {
        if (isUnauthorizedAboutError(loadErrorValue)) {
          window.location.assign("/admin/login");
          return;
        }
        setLoadError("Video reels are not ready. Run the migration, then refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  const editingReel = editingId && editingId !== "new" ? reels.find((reel) => reel.id === editingId) ?? null : null;

  async function saveReel(input: AboutReelInput) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const nextReels = editingId === "new"
        ? await createAboutReel(input)
        : await updateAboutReel(editingId as string, input);
      setReels(nextReels);
      setEditingId(null);
      setNotice("Reel saved.");
    } catch (saveError) {
      if (isUnauthorizedAboutError(saveError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(saveError instanceof Error ? saveError.message : "Unable to save this reel.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReelOrder(nextReels: AboutReel[]) {
    const ordered = nextReels.map((reel, sortOrder) => ({ ...reel, sortOrder }));
    setReels(ordered);
    setSaving(true);
    setError("");
    setNotice("");

    try {
      setReels(await reorderAboutReels(ordered.map((reel) => reel.id)));
      setNotice("Video order saved.");
    } catch (orderError) {
      if (isUnauthorizedAboutError(orderError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(orderError instanceof Error ? orderError.message : "Unable to save the video order.");
      try {
        setReels(await getAdminAboutReels());
      } catch {
        // Keep the last known order visible if the recovery read also fails.
      }
    } finally {
      setSaving(false);
    }
  }

  function moveReel(sourceId: string, targetIndex: number) {
    if (saving) return;
    const fromIndex = reels.findIndex((reel) => reel.id === sourceId);
    if (fromIndex < 0 || targetIndex < 0 || targetIndex >= reels.length || fromIndex === targetIndex) return;
    const nextReels = [...reels];
    const [moved] = nextReels.splice(fromIndex, 1);
    nextReels.splice(targetIndex, 0, moved);
    void saveReelOrder(nextReels);
  }

  async function deleteReel(reel: AboutReel) {
    if (!window.confirm(`Delete “${displayTitle(reel)}”?`)) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      setReels(await deleteAboutReel(reel.id));
      if (editingId === reel.id) setEditingId(null);
      setNotice("Reel deleted.");
    } catch (deleteError) {
      if (isUnauthorizedAboutError(deleteError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this reel.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border-t border-[#ddd7ce] pt-8" aria-labelledby="about-reels-admin-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Video reels</p>
          <div className="mt-2 flex items-center gap-2">
            <h2 className="font-brand text-[27px] font-bold tracking-[-0.04em] text-[#071b3d]" id="about-reels-admin-title">Stories from Limex</h2>
            <span className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">{reels.length}</span>
          </div>
          <p className="mt-2 max-w-[580px] text-[13px] leading-[1.55] text-[#77736e]">Drag the grip or use the arrows to set the public video order. Titles are optional and fall back to YouTube.</p>
        </div>
        <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:opacity-60" type="button" disabled={loading || saving} onClick={() => { setError(""); setNotice(""); setEditingId("new"); }}>+ Add reel</button>
      </div>

      {error ? <p className="mt-4 rounded-[14px] border border-[#f1c6ce] bg-[#fff8f8] px-4 py-3 text-[13px] text-[#ad3148]" role="alert">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-[14px] border border-[#c6e5d3] bg-[#f2fbf5] px-4 py-3 text-[13px] text-[#29634d]" role="status">{notice}</p> : null}

      {editingId !== null ? <div className="mt-5"><AboutReelEditor key={editingId} reel={editingReel} index={editingReel ? reels.findIndex((reel) => reel.id === editingReel.id) : reels.length} saving={saving} onCancel={() => setEditingId(null)} onSave={(input) => void saveReel(input)} /></div> : null}

      {loading ? (
        <div className="mt-5 grid min-h-[160px] place-items-center rounded-[20px] border border-[#e1dcd4] bg-white"><p className="text-[13px] font-semibold text-[#8b857e]">Loading video reels…</p></div>
      ) : loadError ? (
        <div className="mt-5 rounded-[20px] border border-[#f1c6ce] bg-[#fff8f8] px-5 py-8 text-center"><p className="text-[13px] text-[#ad3148]">{loadError}</p></div>
      ) : reels.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {reels.map((reel, index) => (
            <AboutReelCard
              key={reel.id}
              reel={reel}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < reels.length - 1}
              dragging={draggingId === reel.id}
              disabled={saving}
              onEdit={() => { setError(""); setNotice(""); setEditingId(reel.id); }}
              onDelete={() => void deleteReel(reel)}
              onMove={(direction) => moveReel(reel.id, index + direction)}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", reel.id);
                setDraggingId(reel.id);
              }}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = draggingId || event.dataTransfer.getData("text/plain");
                if (sourceId) moveReel(sourceId, index);
                setDraggingId(null);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] border border-dashed border-[#d8d1c7] bg-white px-5 py-12 text-center">
          <p className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#071b3d]">Make the story visible.</p>
          <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.55] text-[#8b857e]">Add a YouTube video to give visitors a closer look at Limex and the people behind the work.</p>
          <button className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white" type="button" onClick={() => setEditingId("new")}>Add first reel</button>
        </div>
      )}
    </section>
  );
}
