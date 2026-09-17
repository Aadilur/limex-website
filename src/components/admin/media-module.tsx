"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  createMediaFolder,
  deleteMediaAsset,
  getAdminMedia,
  isUnauthorizedMediaError,
  updateMediaAsset,
  uploadMediaAsset,
  type MediaAsset,
  type MediaFolder,
  type MediaLibrary,
} from "@/lib/media-api";
import { compressImageToWebp } from "@/lib/image-compression";

const acceptedImageTypes = "image/jpeg,image/png,image/webp";

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDimensions(asset: MediaAsset) {
  return asset.width && asset.height
    ? `${asset.width} × ${asset.height}`
    : "Dimensions unavailable";
}

function FolderIcon({ open = false }: { open?: boolean }) {
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
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      {open ? <path d="M3.5 10h17" /> : null}
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="13" height="13" x="8" y="8" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      className="size-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="size-3.5 text-[#9a948b]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ImageFallback() {
  return (
    <div className="grid size-full place-items-center bg-[#f3f0ea] text-[#b0a99e]">
      <svg
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="16" x="3" y="4" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-4-4L5 20" />
      </svg>
    </div>
  );
}

function MediaThumbnail({
  asset,
  className = "",
}: {
  asset: MediaAsset;
  className?: string;
}) {
  const preferredUrl = asset.publicUrl || asset.url;
  const [source, setSource] = useState(preferredUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSource(asset.publicUrl || asset.url);
    setFailed(false);
  }, [asset.id, asset.publicUrl, asset.url]);

  if (failed) return <ImageFallback />;

  return (
    <img
      className={"size-full object-cover " + className}
      src={source}
      alt={asset.altText || asset.displayName}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (asset.directUrl && source !== asset.directUrl) {
          setSource(asset.directUrl);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function FolderCard({
  folder,
  onOpen,
}: {
  folder: MediaFolder;
  onOpen: () => void;
}) {
  return (
    <button
      className="group flex min-h-[48px] items-center gap-2.5 rounded-[12px] border border-[#e4ded6] bg-white px-3 py-2 text-left transition-all hover:border-[#0055ff] hover:bg-[#faf7f2] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff]"
      type="button"
      onClick={onOpen}
      title={`${folder.name} (${folder.assetCount} items)`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-[8px] transition-colors ${
          folder.isSystem
            ? "bg-[#eaf1ff] text-[#0055ff] group-hover:bg-[#0055ff] group-hover:text-white"
            : "bg-[#f5ece1] text-[#9b6628] group-hover:bg-[#9b6628] group-hover:text-white"
        }`}
      >
        <FolderIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-bold text-[#1e1b20] group-hover:text-[#0055ff]">
          {folder.name}
        </span>
        <span className="block text-[10.5px] font-medium text-[#938b81]">
          {folder.assetCount} {folder.assetCount === 1 ? "item" : "items"}
        </span>
      </span>
      <span
        className="text-[13px] text-[#c0b8ad] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0055ff]"
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}

function AssetCard({
  asset,
  selected,
  onSelect,
  onQuickCopy,
}: {
  asset: MediaAsset;
  selected: boolean;
  onSelect: () => void;
  onQuickCopy: (event: React.MouseEvent) => void;
}) {
  const extension = asset.contentType.replace("image/", "").toUpperCase();

  return (
    <button
      className={`group relative flex flex-col overflow-hidden rounded-[13px] border bg-white text-left transition-all hover:border-[#0055ff] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff] ${
        selected ? "border-[#0055ff] ring-2 ring-[#0055ff]" : "border-[#e5dfd6]"
      }`}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f3f0ea]">
        <MediaThumbnail
          asset={asset}
          className="transition-transform duration-200 group-hover:scale-[1.03]"
        />

        {/* Format Badge */}
        <span className="absolute left-1.5 top-1.5 rounded-[5px] bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-[2px]">
          {extension}
        </span>

        {/* Selected Checkmark Badge */}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[#0055ff] text-white shadow-sm">
            <CheckIcon />
          </span>
        ) : null}

        {/* Quick Copy Link Action on Hover */}
        <span
          className="absolute bottom-1.5 right-1.5 hidden items-center gap-1 rounded-[6px] bg-[#071b3d]/85 px-2 py-1 text-[10px] font-bold text-white shadow backdrop-blur-[2px] transition-colors hover:bg-[#0055ff] group-hover:inline-flex"
          onClick={onQuickCopy}
          role="button"
          tabIndex={-1}
          title="Copy permanent link"
        >
          <CopyIcon /> Copy
        </span>
      </div>

      <div className="min-w-0 px-2.5 py-2">
        <p
          className="truncate text-[11.5px] font-bold text-[#1f1b22] group-hover:text-[#0055ff]"
          title={asset.displayName}
        >
          {asset.displayName}
        </p>
        <p className="mt-0.5 flex items-center justify-between text-[10px] text-[#958c82]">
          <span>{formatBytes(asset.byteSize)}</span>
          {asset.width && asset.height ? (
            <span>
              {asset.width}×{asset.height}
            </span>
          ) : null}
        </p>
      </div>
    </button>
  );
}

function DetailField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c756c]">
        {label}
      </span>
      {multiline ? (
        <textarea
          className="mt-1 min-h-[64px] w-full resize-y rounded-[9px] border border-[#dcd5cb] bg-[#fffdfa] px-2.5 py-1.5 text-[11.5px] leading-[1.45] text-[#071b3d] outline-none transition-colors placeholder:text-[#b4ada4] focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/10"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="mt-1 h-8 w-full rounded-[9px] border border-[#dcd5cb] bg-[#fffdfa] px-2.5 text-[11.5px] text-[#071b3d] outline-none transition-colors placeholder:text-[#b4ada4] focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/10"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function AssetDetails({
  asset,
  saving,
  onSave,
  onDelete,
  onClose,
}: {
  asset: MediaAsset;
  saving: boolean;
  onSave: (input: {
    displayName: string;
    altText: string;
    caption: string;
  }) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(asset.displayName);
  const [altText, setAltText] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption);
  const [copied, setCopied] = useState(false);
  const [showDirect, setShowDirect] = useState(false);

  useEffect(() => {
    setDisplayName(asset.displayName);
    setAltText(asset.altText);
    setCaption(asset.caption);
    setCopied(false);
  }, [asset]);

  const absolutePublicUrl =
    typeof window !== "undefined"
      ? new URL(asset.publicUrl, window.location.origin).toString()
      : asset.publicUrl;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absolutePublicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  }

  return (
    <aside className="flex flex-col rounded-[18px] border border-[#e0dad0] bg-white p-3.5 shadow-sm lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto">
      {/* Top Bar with Thumbnail & Close */}
      <div className="flex items-start justify-between gap-2.5 border-b border-[#f0eae1] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-11 shrink-0 overflow-hidden rounded-[8px] bg-[#f3f0ea] border border-[#e6e0d6]">
            <MediaThumbnail asset={asset} />
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-[12.5px] font-bold text-[#1d222a]"
              title={asset.displayName}
            >
              {asset.displayName}
            </p>
            <p className="text-[10px] font-medium text-[#938a80]">
              {formatBytes(asset.byteSize)} · {formatDimensions(asset)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 shrink-0 place-items-center rounded-full text-[#888177] transition-colors hover:bg-[#f3ece2] hover:text-[#1d222a]"
          title="Close details"
        >
          <CloseIcon />
        </button>
      </div>

      {/* PERMANENT REFRESHABLE PUBLIC URL CARD */}
      <div className="mt-3 rounded-[12px] border border-[#cbe1ff] bg-[#f3f8ff] p-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055ff]">
            Permanent Public Link
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#18794e]">
            <span className="size-1.5 rounded-full bg-[#18794e] animate-pulse" />{" "}
            Never expires
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <input
            type="text"
            readOnly
            value={absolutePublicUrl}
            onFocus={(e) => e.target.select()}
            className="h-7 min-w-0 flex-1 rounded-[7px] border border-[#b8d7ff] bg-white px-2 font-mono text-[10.5px] text-[#071b3d] outline-none select-all"
            title="Permanent refreshable link"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] px-2.5 text-[10.5px] font-bold transition-colors ${
              copied
                ? "bg-[#18794e] text-white"
                : "bg-[#0055ff] text-white hover:bg-[#0043c7]"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={asset.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="grid size-7 shrink-0 place-items-center rounded-[7px] border border-[#b8d7ff] bg-white text-[#0055ff] hover:bg-[#e4efff]"
            title="Open image in new tab"
          >
            <ExternalIcon />
          </a>
        </div>

        <p className="mt-1.5 text-[9.5px] leading-[1.35] text-[#5578a4]">
          Streams directly from Limex secure storage. Safe for websites, blogs,
          emails, and external documents.
        </p>

        {asset.directUrl ? (
          <div className="mt-2 border-t border-[#d8e8fc] pt-1.5">
            <button
              type="button"
              onClick={() => setShowDirect(!showDirect)}
              className="text-[9.5px] font-semibold text-[#6688b5] hover:text-[#0055ff]"
            >
              {showDirect
                ? "Hide direct storage URL"
                : "Show direct storage URL"}
            </button>
            {showDirect ? (
              <div className="mt-1">
                <input
                  type="text"
                  readOnly
                  value={asset.directUrl}
                  onFocus={(e) => e.target.select()}
                  className="h-6 w-full rounded-[6px] border border-[#d8e2ee] bg-white px-2 font-mono text-[9px] text-[#717d8e] select-all"
                />
                <p className="mt-0.5 text-[9px] text-[#ad4242]">
                  ⚠️ Note: Direct S3 links expire after 1 hour. Always use the
                  permanent link above.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Metadata Form */}
      <div className="mt-3 space-y-2">
        <DetailField
          label="File Name"
          value={displayName}
          onChange={setDisplayName}
        />
        <DetailField
          label="Alt text"
          value={altText}
          onChange={setAltText}
          placeholder="Describe image for accessibility"
        />
        <DetailField
          label="Caption"
          value={caption}
          onChange={setCaption}
          multiline
          placeholder="Optional caption"
        />
      </div>

      {/* Usage Info */}
      <div className="mt-3 rounded-[10px] bg-[#f8f6f2] p-2 text-[10.5px] text-[#797268] space-y-1">
        <div className="flex justify-between items-center">
          <span>Format:</span>
          <strong className="font-semibold text-[#29252a] uppercase">
            {asset.contentType.replace("image/", "")}
          </strong>
        </div>
        <div className="flex justify-between items-center">
          <span>Usage:</span>
          {asset.usage ? (
            <a
              href={asset.usage.href}
              className="truncate max-w-[170px] font-semibold text-[#0055ff] hover:underline"
              title={asset.usage.label}
            >
              {asset.usage.type === "blog" ? "Blog: " : "Service: "}
              {asset.usage.label}
            </a>
          ) : (
            <strong className="font-semibold text-[#277450]">Not in use</strong>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button
          className="inline-flex h-8 items-center justify-center rounded-full bg-[#071b3d] text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:opacity-60"
          type="button"
          onClick={() => onSave({ displayName, altText, caption })}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          className="inline-flex h-8 items-center justify-center gap-1 rounded-full text-[11px] font-bold text-[#b13348] transition-colors hover:bg-[#fff0f2] disabled:opacity-60"
          type="button"
          onClick={onDelete}
          disabled={saving}
        >
          <TrashIcon /> Delete
        </button>
      </div>
    </aside>
  );
}

export function MediaModule() {
  const [library, setLibrary] = useState<MediaLibrary | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load(nextFolderId: string | null = folderId) {
    setLoading(true);
    try {
      setLibrary(await getAdminMedia(nextFolderId));
      setError("");
    } catch (loadError) {
      if (isUnauthorizedMediaError(loadError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the media library.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(null);
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setSearchQuery("");
  }, [folderId]);

  const selectedAsset = useMemo(
    () => library?.assets.find((asset) => asset.id === selectedId) ?? null,
    [library?.assets, selectedId],
  );

  function openFolder(nextFolderId: string | null) {
    setFolderId(nextFolderId);
    void load(nextFolderId);
  }

  async function submitFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!folderName.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await createMediaFolder(folderName.trim(), folderId);
      setFolderName("");
      setFolderFormOpen(false);
      setNotice("Folder created.");
      await load(folderId);
    } catch (createError) {
      if (isUnauthorizedMediaError(createError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create this folder.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function processFiles(files: File[]) {
    if (!files.length) return;
    if (!folderId) {
      setError(
        "Please open a destination folder first before uploading images.",
      );
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");
    try {
      for (const file of files) {
        const compressed = await compressImageToWebp(file);
        await uploadMediaAsset(folderId, compressed.file, {
          displayName: compressed.file.name,
          width: compressed.width,
          height: compressed.height,
        });
      }
      setNotice(
        files.length === 1
          ? "Image uploaded and compressed."
          : `${files.length} images uploaded and compressed.`,
      );
      await load(folderId);
    } catch (uploadError) {
      if (isUnauthorizedMediaError(uploadError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image.",
      );
      await load(folderId);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void processFiles(files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length) void processFiles(files);
  }

  async function saveAsset(input: {
    displayName: string;
    altText: string;
    caption: string;
  }) {
    if (!selectedAsset) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateMediaAsset(selectedAsset.id, input);
      setLibrary((current) =>
        current
          ? {
              ...current,
              assets: current.assets.map((asset) =>
                asset.id === updated.id ? updated : asset,
              ),
            }
          : current,
      );
      setNotice("Media details saved.");
    } catch (saveError) {
      if (isUnauthorizedMediaError(saveError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save media details.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset() {
    if (
      !selectedAsset ||
      !window.confirm("Delete this media permanently? This cannot be undone.")
    )
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await deleteMediaAsset(selectedAsset.id);
      setSelectedId(null);
      setNotice("Media deleted permanently.");
      await load(folderId);
    } catch (deleteError) {
      if (isUnauthorizedMediaError(deleteError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this media.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleQuickCopy(asset: MediaAsset, event: React.MouseEvent) {
    event.stopPropagation();
    const url = new URL(asset.publicUrl, window.location.origin).toString();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setNotice(`Copied permanent link for "${asset.displayName}".`);
        window.setTimeout(() => setNotice(""), 3000);
      })
      .catch(() => {
        setError("Clipboard access denied.");
      });
  }

  if (loading && !library) {
    return (
      <div className="grid min-h-[380px] place-items-center rounded-[20px] bg-white border border-[#e1dcd4]">
        <p className="text-[13px] font-semibold text-[#8a837c]">
          Loading media library…
        </p>
      </div>
    );
  }

  const currentFolder = library?.currentFolder ?? null;
  const folders = library?.folders ?? [];
  const rawAssets = library?.assets ?? [];
  const filteredAssets = searchQuery.trim()
    ? rawAssets.filter(
        (item) =>
          item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rawAssets;

  return (
    <div
      className="space-y-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Compact Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e2d8] pb-3.5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-brand text-[25px] font-bold leading-none tracking-[-0.035em] text-[#071b3d]">
              Media library
            </h1>
            <p className="mt-1 text-[11.5px] text-[#867e74]">
              {currentFolder ? (
                <>
                  Folder:{" "}
                  <strong className="font-semibold text-[#071b3d]">
                    {currentFolder.name}
                  </strong>{" "}
                  · {rawAssets.length}{" "}
                  {rawAssets.length === 1 ? "image" : "images"}
                </>
              ) : (
                <>
                  {folders.length} {folders.length === 1 ? "folder" : "folders"}{" "}
                  available
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Filter when inside folder */}
          {currentFolder && rawAssets.length > 0 ? (
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Filter images…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-44 rounded-full border border-[#d8d2c7] bg-white pl-8 pr-6 text-[11.5px] text-[#071b3d] outline-none transition-colors placeholder:text-[#9e968b] focus:border-[#0055ff] focus:w-56 focus:ring-2 focus:ring-[#0055ff]/10"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8f887e] hover:text-[#071b3d]"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ) : null}

          {/* New Folder Button */}
          <button
            type="button"
            onClick={() => {
              setFolderFormOpen((v) => !v);
              setError("");
              setNotice("");
            }}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-[#d8d2c7] bg-white px-3 text-[11.5px] font-bold text-[#443e37] transition-colors hover:border-[#aaa296] hover:bg-[#faf7f2]"
          >
            + New folder
          </button>

          {/* Upload Button */}
          {currentFolder ? (
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#071b3d] px-3.5 text-[11.5px] font-bold text-white transition-colors hover:bg-[#0055ff]">
              <UploadIcon />
              {uploading ? "Uploading…" : "Upload images"}
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept={acceptedImageTypes}
                multiple
                onChange={handleFileInputChange}
                disabled={uploading}
              />
            </label>
          ) : null}
        </div>
      </div>

      {/* Inline Create Folder Form */}
      {folderFormOpen ? (
        <form
          className="flex items-center gap-2 rounded-[13px] border border-[#dcd6cc] bg-[#faf8f4] p-2.5 shadow-sm"
          onSubmit={submitFolder}
        >
          <div className="flex-1">
            <input
              type="text"
              className="h-8 w-full rounded-[8px] border border-[#d4cdc2] bg-white px-2.5 text-[12px] text-[#071b3d] outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/10"
              placeholder={
                currentFolder ? "Subfolder name…" : "New folder name…"
              }
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="h-8 rounded-[8px] bg-[#071b3d] px-3 text-[11px] font-bold text-white hover:bg-[#0055ff] disabled:opacity-50"
            disabled={saving || !folderName.trim()}
          >
            {saving ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setFolderFormOpen(false)}
            className="h-8 rounded-[8px] px-2.5 text-[11px] font-bold text-[#766f65] hover:bg-[#ede6dc]"
          >
            Cancel
          </button>
        </form>
      ) : null}

      {/* Status Notifications */}
      {notice ? (
        <div className="flex items-center justify-between rounded-[10px] bg-[#eef8f2] px-3.5 py-2 text-[12px] font-semibold text-[#18794e]">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-[#18794e]/70 hover:text-[#18794e]"
          >
            ✕
          </button>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center justify-between rounded-[10px] bg-[#fff0f2] px-3.5 py-2 text-[12px] font-semibold text-[#ad3148]">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-[#ad3148]/70 hover:text-[#ad3148]"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[#f7f4ed] px-3 py-1.5 text-[12px]">
        <div className="flex flex-wrap items-center gap-1.5 font-medium text-[#7c756c]">
          <button
            type="button"
            onClick={() => openFolder(null)}
            className={`transition-colors ${!currentFolder ? "font-bold text-[#071b3d]" : "hover:text-[#0055ff]"}`}
          >
            All folders
          </button>
          {library?.breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-1.5">
              <span className="text-[#b8b0a5]">/</span>
              <button
                type="button"
                onClick={() => openFolder(crumb.id)}
                className={`transition-colors ${crumb.id === currentFolder?.id ? "font-bold text-[#071b3d]" : "hover:text-[#0055ff]"}`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {currentFolder ? (
          <button
            type="button"
            onClick={() => {
              const trail = library?.breadcrumbs ?? [];
              const parentCrumb = trail[trail.length - 2] ?? null;
              openFolder(parentCrumb ? parentCrumb.id : null);
            }}
            className="text-[11px] font-bold text-[#0055ff] hover:underline"
          >
            ← Back up
          </button>
        ) : null}
      </div>

      {/* Main Content Explorer */}
      <div
        className={
          selectedAsset
            ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-4 items-start"
            : "space-y-4"
        }
      >
        {/* Left Column: Folders and/or Images Grid */}
        <div className="space-y-4 min-w-0">
          {/* Folders List */}
          {folders.length > 0 ? (
            <div>
              {!currentFolder ? null : (
                <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8a8177]">
                  Subfolders ({folders.length})
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onOpen={() => openFolder(folder.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Root Empty State */}
          {!currentFolder && folders.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#dcd6cc] bg-[#faf8f4] py-12 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#f3ede3] text-[#8e8578]">
                <FolderIcon />
              </span>
              <p className="mt-2.5 text-[13px] font-bold text-[#2d2930]">
                No folders created yet
              </p>
              <p className="mt-1 text-[11.5px] text-[#8c8479]">
                Click{" "}
                <strong className="text-[#071b3d]">
                  &quot;+ New folder&quot;
                </strong>{" "}
                above to organize your media.
              </p>
            </div>
          ) : null}

          {/* Images Section in Current Folder */}
          {currentFolder ? (
            <div>
              {folders.length > 0 && (
                <div className="my-3 border-t border-[#eee7dc]" />
              )}

              {rawAssets.length === 0 ? (
                /* Empty Folder Upload Zone */
                <div
                  className={`rounded-[16px] border-2 border-dashed py-12 text-center transition-all ${
                    isDragging
                      ? "border-[#0055ff] bg-[#f0f6ff]"
                      : "border-[#ded7ce] bg-[#faf8f4]"
                  }`}
                >
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-white text-[#0055ff] shadow-sm">
                    <UploadIcon />
                  </span>
                  <p className="mt-2.5 text-[13px] font-bold text-[#1e1a22]">
                    This folder is empty
                  </p>
                  <p className="mt-1 text-[11.5px] text-[#8d857a]">
                    Drag & drop JPG, PNG, or WebP images here, or:
                  </p>
                  <label className="mt-3.5 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#071b3d] px-4 text-[11.5px] font-bold text-white transition-colors hover:bg-[#0055ff]">
                    <UploadIcon />
                    Choose files to upload
                    <input
                      className="sr-only"
                      type="file"
                      accept={acceptedImageTypes}
                      multiple
                      onChange={handleFileInputChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : filteredAssets.length === 0 ? (
                /* Search Filter Empty */
                <div className="rounded-[14px] bg-[#faf8f4] py-8 text-center border border-[#ece6dd]">
                  <p className="text-[12px] font-bold text-[#5c554c]">
                    No images matching &quot;{searchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-1.5 text-[11px] font-bold text-[#0055ff] hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                /* Image Grid */
                <div
                  className={`grid gap-2.5 ${
                    selectedAsset
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  }`}
                >
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={asset.id === selectedId}
                      onSelect={() =>
                        setSelectedId(asset.id === selectedId ? null : asset.id)
                      }
                      onQuickCopy={(e) => handleQuickCopy(asset, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Right Column: Selected Asset Details Panel */}
        {selectedAsset ? (
          <AssetDetails
            asset={selectedAsset}
            saving={saving}
            onSave={(input) => void saveAsset(input)}
            onDelete={() => void deleteAsset()}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
