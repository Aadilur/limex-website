"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import {
  createAboutTeamMember,
  deleteAboutTeamMember,
  getAdminAboutTeam,
  isUnauthorizedAboutError,
  updateAboutTeamMember,
  type AboutTeamMember,
  type AboutTeamMemberInput,
} from "@/lib/about-api";
import { AboutReelsManager } from "./about-reels-module";

const maxImageBytes = 5 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const photoTones = [
  "bg-[#d6ebde] text-[#2e6b4f]",
  "bg-[#dedbfa] text-[#5c4aa6]",
  "bg-[#fae5cc] text-[#9e5726]",
  "bg-[#d1edeb] text-[#1f6e70]",
];

type MemberDraft = Omit<AboutTeamMemberInput, "sortOrder"> & { sortOrder: number };

function emptyDraft(): MemberDraft {
  return {
    name: "",
    title: "",
    description: "",
    sortOrder: 0,
    isVisible: true,
  };
}

function memberDraft(member: AboutTeamMember | null): MemberDraft {
  if (!member) return emptyDraft();

  return {
    name: member.name,
    title: member.title,
    description: member.description,
    sortOrder: member.sortOrder,
    isVisible: member.isVisible,
  };
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "LM";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function PhotoFallback({ name, index = 0, className = "" }: { name: string; index?: number; className?: string }) {
  return (
    <div className={`grid place-items-center ${photoTones[index % photoTones.length]} ${className}`.trim()} aria-hidden="true">
      <span className="font-brand text-[30px] font-bold tracking-[-0.06em]">{initials(name)}</span>
    </div>
  );
}

function MemberPhoto({ member, index }: { member: AboutTeamMember; index: number }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [member.imageUrl]);

  return member.imageUrl && !failed ? (
    <img
      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      src={member.imageUrl}
      alt={`${member.name}, ${member.title}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  ) : (
    <PhotoFallback name={member.name} index={index} className="size-full" />
  );
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]" htmlFor={htmlFor}>{children}</label>;
}

function AboutMemberEditor({
  member,
  index,
  saving,
  onCancel,
  onSave,
}: {
  member: AboutTeamMember | null;
  index: number;
  saving: boolean;
  onCancel: () => void;
  onSave: (input: AboutTeamMemberInput, image: File | null, removeImage: boolean) => void;
}) {
  const [draft, setDraft] = useState<MemberDraft>(() => memberDraft(member));
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(member?.imageUrl ?? null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(removeImage ? null : member?.imageUrl ?? null);
      setPreviewFailed(false);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(image);
    setPreviewUrl(nextPreviewUrl);
    setPreviewFailed(false);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [image, member?.imageUrl, removeImage]);

  function updateDraft<K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const nextImage = event.target.files?.[0] ?? null;
    if (!nextImage) return;

    if (!acceptedImageTypes.includes(nextImage.type)) {
      setImageError("Choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (nextImage.size > maxImageBytes) {
      setImageError("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImage(nextImage);
    setRemoveImage(false);
    setImageError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.title.trim() || !draft.description.trim()) {
      setFormError("Add a name, title and short description before saving.");
      return;
    }

    setFormError("");
    onSave({ ...draft, name: draft.name.trim(), title: draft.title.trim(), description: draft.description.trim() }, image, removeImage);
  }

  const preview = previewUrl && !previewFailed ? (
    <img
      className="size-full object-cover"
      src={previewUrl}
      alt={draft.name ? `${draft.name} preview` : "Profile photo preview"}
      onError={() => setPreviewFailed(true)}
    />
  ) : (
    <PhotoFallback name={draft.name} index={index} className="size-full" />
  );

  return (
    <form className="rounded-[22px] border border-[#d9d1c5] bg-white p-4 shadow-[0_14px_36px_rgba(49,42,35,0.06)] sm:p-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee9e2] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e44762]">{member ? "Edit profile" : "New profile"}</p>
          <h2 className="mt-1 font-brand text-[24px] font-bold tracking-[-0.04em] text-[#14131c]">About us team</h2>
        </div>
        <button className="grid size-9 place-items-center rounded-full border border-[#ddd7ce] text-[18px] text-[#77736e] transition-colors hover:border-[#aaa197] hover:text-[#14131c]" type="button" aria-label="Close profile editor" onClick={onCancel}>×</button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[176px_minmax(0,1fr)]">
        <div>
          <div className="aspect-square overflow-hidden rounded-[18px] border border-[#e8e1d8] bg-[#faf9f6]">{preview}</div>
          <label className="mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-3 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c]" htmlFor="about-team-image">
            {image ? "Change photo" : "Choose photo"}
            <input className="sr-only" id="about-team-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </label>
          {member?.imageUrl && !image && !removeImage ? (
            <button className="mt-2 w-full text-[11px] font-semibold text-[#a44255] transition-colors hover:text-[#14131c]" type="button" onClick={() => setRemoveImage(true)}>Remove photo</button>
          ) : null}
          {image ? <p className="mt-2 truncate text-[10px] text-[#9b958c]" title={image.name}>{image.name}</p> : <p className="mt-2 text-[10px] leading-[1.4] text-[#9b958c]">JPG, PNG or WebP · up to 5 MB</p>}
          {removeImage ? <p className="mt-2 text-[10px] font-semibold text-[#a44255]">Photo will be removed when saved.</p> : null}
          {imageError ? <p className="mt-2 text-[11px] text-[#b7354d]" role="alert">{imageError}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <FieldLabel htmlFor="about-team-name">Name</FieldLabel>
            <input className="mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#14131c] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10" id="about-team-name" value={draft.name} placeholder="e.g. Nusrat Jahan" onChange={(event) => updateDraft("name", event.target.value)} />
          </label>
          <label className="block min-w-0">
            <FieldLabel htmlFor="about-team-title">Title</FieldLabel>
            <input className="mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#14131c] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10" id="about-team-title" value={draft.title} placeholder="e.g. Legal advisor" onChange={(event) => updateDraft("title", event.target.value)} />
          </label>
          <label className="block min-w-0 sm:col-span-2">
            <FieldLabel htmlFor="about-team-description">Short description</FieldLabel>
            <textarea className="mt-2 min-h-[106px] w-full resize-y rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 py-3 text-[13px] leading-[1.5] text-[#14131c] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10" id="about-team-description" value={draft.description} placeholder="One clear sentence about what they help with." onChange={(event) => updateDraft("description", event.target.value)} />
          </label>
          <label className="block min-w-0">
            <FieldLabel htmlFor="about-team-order">Display order</FieldLabel>
            <input className="mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-[#fffdfa] px-3.5 text-[13px] text-[#14131c] outline-none transition-colors focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10" id="about-team-order" type="number" min="0" max="999" value={draft.sortOrder} onChange={(event) => updateDraft("sortOrder", Number(event.target.value) || 0)} />
          </label>
          <label className="flex min-h-11 items-center gap-3 self-end rounded-[12px] border border-[#e8e1d8] bg-[#faf9f6] px-3.5 text-[12px] font-semibold text-[#4f4b47]">
            <input className="size-4 accent-[#e44762]" type="checkbox" checked={draft.isVisible} onChange={(event) => updateDraft("isVisible", event.target.checked)} />
            Show this profile publicly
          </label>
        </div>
      </div>

      {formError ? <p className="mt-4 rounded-[12px] border border-[#f1c6ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] text-[#ad3148]" role="alert">{formError}</p> : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#eee9e2] pt-4">
        <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c] disabled:opacity-60" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-5 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving…" : member ? "Save profile" : "Add profile"}</button>
      </div>
    </form>
  );
}

function AboutMemberCard({ member, index, onEdit, onDelete }: { member: AboutTeamMember; index: number; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#e1dcd4] bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(49,42,35,0.06)]">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="size-[76px] shrink-0 overflow-hidden rounded-[16px] border border-[#e8e1d8] bg-[#faf9f6] sm:size-[88px]"><MemberPhoto member={member} index={index} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#e44762]">{member.title}</p>
              <h3 className="mt-1 truncate font-brand text-[21px] font-bold tracking-[-0.04em] text-[#14131c]">{member.name}</h3>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${member.isVisible ? "bg-[#e9f4ed] text-[#29634d]" : "bg-[#f3f1ec] text-[#8b857e]"}`.trim()}>{member.isVisible ? "Visible" : "Hidden"}</span>
          </div>
          <p className="mt-2 line-clamp-2 max-w-[620px] text-[12px] leading-[1.5] text-[#77736e]">{member.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#eee9e2] bg-[#faf9f6] px-4 py-3 sm:px-5">
        <span className="text-[11px] font-semibold text-[#9b958c]">Profile {String(member.sortOrder + 1).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <button className="inline-flex min-h-9 items-center rounded-full border border-[#d8d2c8] bg-white px-3.5 text-[11px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c]" type="button" onClick={onEdit}>Edit</button>
          <button className="grid size-9 place-items-center rounded-full border border-[#f1c6ce] text-[16px] text-[#c63c56] transition-colors hover:bg-[#fce0e3]" type="button" aria-label={`Delete ${member.name}`} onClick={onDelete}>×</button>
        </div>
      </div>
    </article>
  );
}

export function AboutModule() {
  const [members, setMembers] = useState<AboutTeamMember[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void getAdminAboutTeam()
      .then((nextMembers) => {
        setMembers(nextMembers);
        setLoadError("");
      })
      .catch((loadErrorValue: unknown) => {
        if (isUnauthorizedAboutError(loadErrorValue)) {
          window.location.assign("/admin/login");
          return;
        }
        setLoadError("About us data is not ready. Run the migration, then refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  const editingMember = editingId && editingId !== "new" ? members.find((member) => member.id === editingId) ?? null : null;

  async function saveMember(input: AboutTeamMemberInput, image: File | null, removeImage: boolean) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const nextMembers = editingId === "new"
        ? await createAboutTeamMember(input, image)
        : await updateAboutTeamMember(editingId as string, input, image, removeImage);
      setMembers(nextMembers);
      setEditingId(null);
      setNotice("Profile saved.");
    } catch (saveError) {
      if (isUnauthorizedAboutError(saveError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(saveError instanceof Error ? saveError.message : "Unable to save this profile.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember(member: AboutTeamMember) {
    if (!window.confirm(`Delete ${member.name}'s profile and photo?`)) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      setMembers(await deleteAboutTeamMember(member.id));
      if (editingId === member.id) setEditingId(null);
      setNotice("Profile deleted.");
    } catch (deleteError) {
      if (isUnauthorizedAboutError(deleteError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e1dcd4] bg-white"><p className="text-[13px] font-semibold text-[#8b857e]">Loading About us profiles…</p></div>;
  }

  if (loadError) {
    return (
      <section className="rounded-[24px] border border-[#f1c6ce] bg-[#fff8f8] p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c63c56]">About us unavailable</p>
        <h1 className="mt-2 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#14131c]">Connect the About us data first.</h1>
        <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#716c67]">Run the new Prisma migration, then reload this workspace.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">Content workspace</p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#14131c] sm:text-[48px]">About us</h1>
          <p className="mt-3 max-w-[560px] text-[14px] leading-[1.6] text-[#77736e]">Keep the people behind Limex current, clear and easy to trust.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c]" href="/about" target="_blank" rel="noreferrer">Preview page ↗</a>
          <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px" type="button" onClick={() => { setError(""); setNotice(""); setEditingId("new"); }}>+ Add person</button>
        </div>
      </section>

      {error ? <p className="rounded-[14px] border border-[#f1c6ce] bg-[#fff8f8] px-4 py-3 text-[13px] text-[#ad3148]" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-[14px] border border-[#c6e5d3] bg-[#f2fbf5] px-4 py-3 text-[13px] text-[#29634d]" role="status">{notice}</p> : null}

      {editingId !== null ? <AboutMemberEditor member={editingMember} index={editingMember ? members.findIndex((member) => member.id === editingMember.id) : members.length} saving={saving} onCancel={() => setEditingId(null)} onSave={(input, image, removeImage) => void saveMember(input, image, removeImage)} /> : null}

      <section aria-labelledby="about-team-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e44762]">The people</p>
            <div className="mt-2 flex items-center gap-2">
              <h2 className="font-brand text-[27px] font-bold tracking-[-0.04em] text-[#14131c]" id="about-team-list-title">Team profiles</h2>
              <span className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">{members.length}</span>
            </div>
          </div>
          <p className="text-[12px] text-[#9b958c]">Photos are private and signed when displayed.</p>
        </div>

        {members.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {members.map((member, index) => <AboutMemberCard key={member.id} member={member} index={index} onEdit={() => { setError(""); setNotice(""); setEditingId(member.id); }} onDelete={() => void deleteMember(member)} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-[20px] border border-dashed border-[#d8d1c7] bg-white px-5 py-12 text-center">
            <p className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#14131c]">Add the people behind Limex.</p>
            <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.55] text-[#8b857e]">Each profile needs only a name, title and one clear sentence. A photo is optional.</p>
            <button className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white" type="button" onClick={() => setEditingId("new")}>Add first profile</button>
          </div>
        )}
      </section>

      <AboutReelsManager />
    </div>
  );
}
