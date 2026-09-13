"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

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
  return asset.width && asset.height ? asset.width + " × " + asset.height : "Dimensions unavailable";
}

function FolderIcon({ open = false }: { open?: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={open ? "M3.5 7.5A2.5 2.5 0 0 1 6 5h3l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" : "M3.5 7.5A2.5 2.5 0 0 1 6 5h3l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"} />
      {open ? <path d="M3.5 10h17" /> : null}
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="13" height="13" x="8" y="8" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

function ImageFallback() {
  return (
    <div className="grid size-full place-items-center bg-[#f3f1ec] text-[#aaa49b]">
      <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="16" x="3" y="4" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-4-4L5 20" />
      </svg>
    </div>
  );
}

function MediaThumbnail({ asset, className = "" }: { asset: MediaAsset; className?: string }) {
  const [source, setSource] = useState(asset.url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSource(asset.url);
    setFailed(false);
  }, [asset.id, asset.url]);

  if (failed) return <ImageFallback />;

  return <img className={"size-full object-cover " + className} src={source} alt={asset.altText || asset.displayName} loading="lazy" decoding="async" onError={() => {
    if (source !== asset.publicUrl) {
      setSource(asset.publicUrl);
      return;
    }
    setFailed(true);
  }} />;
}

function FolderCard({ folder, onOpen }: { folder: MediaFolder; onOpen: () => void }) {
  return (
    <button className="group flex min-h-[82px] items-center gap-3 rounded-[15px] bg-[#faf9f6] px-3.5 text-left transition-colors hover:bg-[#fcecef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff]" type="button" onClick={onOpen}>
      <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#f8e7cb] text-[#ac6c27] transition-colors group-hover:bg-white">
        <FolderIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-[#29252a]">{folder.name}</span>
        <span className="mt-1 block text-[11px] text-[#9b958c]">{folder.assetCount} {folder.assetCount === 1 ? "image" : "images"}</span>
      </span>
      <span className="text-[16px] text-[#b1aaa1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0055ff]" aria-hidden="true">→</span>
    </button>
  );
}

function AssetCard({ asset, selected, onSelect }: { asset: MediaAsset; selected: boolean; onSelect: () => void }) {
  return (
    <button className={"group min-w-0 overflow-hidden rounded-[16px] bg-white text-left ring-1 ring-[#e6e0d7] transition-all hover:-translate-y-0.5 hover:ring-[#0055ff]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0055ff] " + (selected ? "ring-2 ring-[#0055ff]" : "")} type="button" onClick={onSelect} aria-pressed={selected}>
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f1ec]">
        <MediaThumbnail asset={asset} className="transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="min-w-0 px-3 py-3">
        <p className="truncate text-[12px] font-bold text-[#29252a]" title={asset.displayName}>{asset.displayName}</p>
        <p className="mt-1 truncate text-[10px] text-[#9b958c]">{formatBytes(asset.byteSize)} · {formatDimensions(asset)}</p>
      </div>
    </button>
  );
}

function DetailField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span>
      {multiline ? <textarea className="mt-1.5 min-h-[74px] w-full resize-y rounded-[10px] border border-[#ddd7ce] bg-[#fffdfa] px-3 py-2.5 text-[12px] leading-[1.5] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" value={value} onChange={(event) => onChange(event.target.value)} /> : <input className="mt-1.5 min-h-10 w-full rounded-[10px] border border-[#ddd7ce] bg-[#fffdfa] px-3 text-[12px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function AssetDetails({ asset, saving, onSave, onDelete, onCopy }: { asset: MediaAsset; saving: boolean; onSave: (input: { displayName: string; altText: string; caption: string }) => void; onDelete: () => void; onCopy: () => void }) {
  const [displayName, setDisplayName] = useState(asset.displayName);
  const [altText, setAltText] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption);

  useEffect(() => {
    setDisplayName(asset.displayName);
    setAltText(asset.altText);
    setCaption(asset.caption);
  }, [asset]);

  return (
    <aside className="h-max rounded-[18px] bg-white p-4 ring-1 ring-[#e6e0d7] lg:sticky lg:top-[104px]" aria-labelledby="media-details-title">
      <div className="aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f3f1ec]">
        <MediaThumbnail asset={asset} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">Selected media</p>
          <h2 className="mt-1 truncate font-brand text-[21px] font-bold tracking-[-0.035em] text-[#071b3d]" id="media-details-title">{asset.displayName}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3f1ec] px-2 py-1 text-[10px] font-bold text-[#77736e]">{asset.contentType.replace("image/", "").toUpperCase()}</span>
      </div>
      <div className="mt-4 grid gap-3">
        <DetailField label="File name" value={displayName} onChange={setDisplayName} />
        <DetailField label="Alt text" value={altText} onChange={setAltText} />
        <DetailField label="Caption" value={caption} onChange={setCaption} multiline />
      </div>
      <div className="mt-4 space-y-2 text-[11px] text-[#77736e]">
        <p className="flex items-center justify-between gap-3"><span>Size</span><strong className="font-semibold text-[#4f4b47]">{formatBytes(asset.byteSize)}</strong></p>
        <p className="flex items-center justify-between gap-3"><span>Dimensions</span><strong className="font-semibold text-[#4f4b47]">{formatDimensions(asset)}</strong></p>
        {asset.usage ? <p className="flex items-center justify-between gap-3"><span>Used in</span><a className="max-w-[150px] truncate font-semibold text-[#0055ff] hover:underline" href={asset.usage.href}>{asset.usage.label}</a></p> : <p className="flex items-center justify-between gap-3"><span>Used in</span><strong className="font-semibold text-[#29634d]">Nothing yet</strong></p>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-[#071b3d] px-3 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:opacity-60" type="button" onClick={() => onSave({ displayName, altText, caption })} disabled={saving}>Save details</button>
        <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-[#f3f1ec] px-3 text-[11px] font-bold text-[#4f4b47] transition-colors hover:bg-[#e9e4dc]" type="button" onClick={onCopy}><CopyIcon />Copy URL</button>
      </div>
      <button className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full text-[11px] font-bold text-[#ad3148] transition-colors hover:bg-[#fff1f3]" type="button" onClick={onDelete} disabled={saving}><TrashIcon />Delete media</button>
      <p className="mt-3 text-[10px] leading-[1.45] text-[#aaa49b]">Public links use a refreshable signed URL, so expiring storage signatures do not break the website.</p>
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
      setError(loadError instanceof Error ? loadError.message : "Unable to load the media library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(null);
  }, []);

  useEffect(() => {
    setSelectedId(null);
  }, [folderId]);

  const selectedAsset = useMemo(() => library?.assets.find((asset) => asset.id === selectedId) ?? null, [library?.assets, selectedId]);

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
      setError(createError instanceof Error ? createError.message : "Unable to create this folder.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !folderId) return;

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
      setNotice(files.length === 1 ? "Image uploaded and compressed." : files.length + " images uploaded and compressed.");
      await load(folderId);
    } catch (uploadError) {
      if (isUnauthorizedMediaError(uploadError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload this image.");
      await load(folderId);
    } finally {
      setUploading(false);
    }
  }

  async function saveAsset(input: { displayName: string; altText: string; caption: string }) {
    if (!selectedAsset) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateMediaAsset(selectedAsset.id, input);
      setLibrary((current) => current ? { ...current, assets: current.assets.map((asset) => asset.id === updated.id ? updated : asset) } : current);
      setNotice("Media details saved.");
    } catch (saveError) {
      if (isUnauthorizedMediaError(saveError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(saveError instanceof Error ? saveError.message : "Unable to save media details.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset() {
    if (!selectedAsset || !window.confirm("Delete this media permanently? This cannot be undone.")) return;
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
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this media.");
    } finally {
      setSaving(false);
    }
  }

  async function copyUrl() {
    if (!selectedAsset) return;
    try {
      await navigator.clipboard.writeText(new URL(selectedAsset.publicUrl, window.location.origin).toString());
      setNotice("Refreshable public URL copied.");
    } catch {
      setError("Your browser did not allow copying the URL.");
    }
  }

  if (loading && !library) {
    return <div className="grid min-h-[420px] place-items-center rounded-[22px] bg-white ring-1 ring-[#e1dcd4]"><p className="text-[13px] font-semibold text-[#8b857e]">Loading media library…</p></div>;
  }

  const currentFolder = library?.currentFolder ?? null;
  const folders = library?.folders ?? [];
  const assets = library?.assets ?? [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Content workspace</p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#071b3d] sm:text-[48px]">Media library</h1>
          <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">Keep every image in one organized place. Blog uploads are grouped automatically by article.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#071b3d]" type="button" onClick={() => { setFolderFormOpen((open) => !open); setError(""); setNotice(""); }}>+ New folder</button>
          {currentFolder ? <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff]">
            <UploadIcon />
            {uploading ? "Uploading…" : "Upload image"}
            <input className="sr-only" type="file" accept={acceptedImageTypes} multiple onChange={(event) => void handleUpload(event)} disabled={uploading} />
          </label> : null}
        </div>
      </section>

      {folderFormOpen ? <form className="flex flex-col gap-2 rounded-[16px] bg-[#fffdfa] p-3 ring-1 ring-[#e6e0d7] sm:flex-row sm:items-end" onSubmit={submitFolder}>
        <label className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Folder name</span>
          <input className="mt-1.5 min-h-10 w-full rounded-[10px] border border-[#ddd7ce] bg-white px-3 text-[12px] text-[#071b3d] outline-none focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder={currentFolder ? "e.g. Campaign images" : "e.g. Brand assets"} autoFocus />
        </label>
        <button className="min-h-10 rounded-[10px] bg-[#071b3d] px-4 text-[11px] font-bold text-white hover:bg-[#0055ff] disabled:opacity-60" type="submit" disabled={saving || !folderName.trim()}>{saving ? "Creating…" : "Create folder"}</button>
        <button className="min-h-10 rounded-[10px] px-3 text-[11px] font-bold text-[#77736e] hover:bg-[#f3eee7]" type="button" onClick={() => setFolderFormOpen(false)}>Cancel</button>
      </form> : null}

      {notice ? <p className="text-[12px] font-semibold text-[#29634d]" role="status">{notice}</p> : null}
      {error ? <p className="rounded-[14px] bg-[#fff3f4] px-4 py-3 text-[12px] font-semibold text-[#ad3148]" role="alert">{error}</p> : null}

      <section className="rounded-[20px] bg-white p-4 ring-1 ring-[#e1dcd4] sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
          <button className={currentFolder ? "text-[#77736e] hover:text-[#0055ff]" : "text-[#071b3d]"} type="button" onClick={() => openFolder(null)}>All media</button>
          {library?.breadcrumbs.map((crumb) => <span className="flex items-center gap-2" key={crumb.id}><span className="text-[#c2bbb2]" aria-hidden="true">/</span><button className={crumb.id === currentFolder?.id ? "text-[#071b3d]" : "text-[#77736e] hover:text-[#0055ff]"} type="button" onClick={() => openFolder(crumb.id)}>{crumb.name}</button></span>)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#eee9e2] pt-4">
          <div>
            <p className="font-brand text-[23px] font-bold tracking-[-0.03em] text-[#071b3d]">{currentFolder ? currentFolder.name : "Folders"}</p>
            <p className="mt-1 text-[11px] text-[#9b958c]">{currentFolder ? "Images stored in this folder" : "Choose a folder to upload and manage media"}</p>
          </div>
          {loading ? <span className="text-[11px] font-semibold text-[#0055ff]">Refreshing…</span> : null}
        </div>

        {folders.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{folders.map((folder) => <FolderCard folder={folder} onOpen={() => openFolder(folder.id)} key={folder.id} />)}</div> : !currentFolder ? <div className="mt-4 rounded-[14px] bg-[#faf9f6] px-4 py-8 text-center"><FolderIcon /><p className="mt-2 text-[12px] font-semibold text-[#5f5a54]">No folders yet.</p><p className="mt-1 text-[11px] text-[#9b958c]">Create one to keep your media organized.</p></div> : null}

        {currentFolder ? <div className="mt-6 border-t border-[#eee9e2] pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div><p className="font-brand text-[21px] font-bold tracking-[-0.03em] text-[#071b3d]">Images</p><p className="mt-1 text-[11px] text-[#9b958c]">{assets.length} {assets.length === 1 ? "image" : "images"}</p></div>
            {!assets.length ? <label className="cursor-pointer text-[11px] font-bold text-[#0055ff] hover:text-[#071b3d]">Upload the first image<input className="sr-only" type="file" accept={acceptedImageTypes} multiple onChange={(event) => void handleUpload(event)} disabled={uploading} /></label> : null}
          </div>
          {assets.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{assets.map((asset) => <AssetCard asset={asset} selected={asset.id === selectedId} onSelect={() => setSelectedId(asset.id)} key={asset.id} />)}</div> : <div className="mt-4 rounded-[14px] bg-[#faf9f6] px-4 py-10 text-center"><p className="text-[12px] font-semibold text-[#5f5a54]">This folder is empty.</p><p className="mt-1 text-[11px] text-[#9b958c]">Upload a compressed JPG, PNG or WebP image to get started.</p></div>}
        </div> : null}
      </section>

      {selectedAsset ? <AssetDetails asset={selectedAsset} saving={saving} onSave={(input) => void saveAsset(input)} onDelete={() => void deleteAsset()} onCopy={() => void copyUrl()} /> : null}
    </div>
  );
}
