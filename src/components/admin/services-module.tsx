"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  createMenuGroup,
  createMenuItem,
  createMenuLink,
  deleteMenuGroup,
  deleteMenuItem,
  deleteMenuLink,
  getAdminMenu,
  isUnauthorizedError,
  updateMenuGroup,
  updateMenuItem,
  updateMenuLink,
  updateMenuSection,
  type AdminMenuGroup,
  type AdminMenuItem,
  type AdminMenuLink,
  type AdminMenuSection,
} from "@/lib/menu-api";
import { ServiceIcon } from "@/components/limex/service-icons";
import type { ServiceIconName } from "@/components/limex/data";
import { IconPicker } from "./icon-picker";

const fieldClass = "mt-2 min-h-11 w-full rounded-[12px] border border-[#ddd7ce] bg-white px-3.5 text-[13px] text-[#14131c] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10";
const textAreaClass = `${fieldClass} min-h-[88px] resize-y py-3 leading-[1.45]`;
const toneOptions = ["green", "teal", "violet", "orange"] as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-category";
}

function nextUnusedLabel(base: string, values: string[]) {
  const used = new Set(values.map((value) => value.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;

  let index = 2;
  while (used.has(`${base} ${index}`.toLowerCase())) index += 1;
  return `${base} ${index}`;
}

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function toneClass(tone: string) {
  if (tone === "teal") return "bg-[#d1edeb] text-[#1f6e70]";
  if (tone === "violet") return "bg-[#dedbfa] text-[#5c4aa6]";
  if (tone === "orange") return "bg-[#fae5cc] text-[#9e5726]";
  return "bg-[#d6edde] text-[#2e6b4f]";
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  inputMode,
}: {
  label: string;
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "url";
}) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span>
      <input className={fieldClass} type={type} inputMode={inputMode} value={value} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

function TextAreaField({
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
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span>
      <textarea className={textAreaClass} value={value} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-[#ddd7ce] bg-white px-3 text-[12px] font-semibold text-[#4f4b47] transition-colors hover:border-[#bbb3a8]"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#29634d]" : "bg-[#c8c2b9]"}`.trim()} aria-hidden="true">
        <span className={`absolute top-1 size-3 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`.trim()} />
      </span>
      {label}
    </button>
  );
}

function SaveButton({ label = "Save changes", saving, onClick }: { label?: string; saving: boolean; onClick: () => void }) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-60"
      type="button"
      disabled={saving}
      onClick={onClick}
    >
      {saving ? "Saving…" : label}
    </button>
  );
}

function OutlineButton({ children, onClick, disabled = false, className = "" }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c] disabled:cursor-wait disabled:opacity-60 ${className}`.trim()}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SectionSettings({
  section,
  saving,
  onChange,
  onSave,
}: {
  section: AdminMenuSection;
  saving: boolean;
  onChange: (patch: Partial<AdminMenuSection>) => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const tone = toneOptions.includes(section.tone as typeof toneOptions[number]) ? section.tone : "green";

  return (
    <section className="rounded-[22px] border border-[#e1dcd4] bg-white p-4 sm:p-5" aria-labelledby="section-settings-title">
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#f3f1ec] text-[15px] text-[#e44762]">⌘</span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold text-[#14131c]" id="section-settings-title">Section settings</span>
            <span className="mt-0.5 block truncate text-[11px] text-[#9b958c]">{section.label} · {section.isVisible ? "Visible" : "Hidden"}</span>
          </span>
        </button>
        <button className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-[12px] font-bold text-[#77736e] transition-colors hover:text-[#14131c]" type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {open ? "Close" : "Edit"}<span className={`text-[16px] transition-transform ${open ? "rotate-180" : ""}`.trim()}>⌄</span>
        </button>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Toggle label={section.isVisible ? "Visible" : "Hidden"} checked={section.isVisible} onChange={() => onChange({ isVisible: !section.isVisible })} />
          <SaveButton saving={saving} onClick={onSave} />
        </div>
      </div>

      {open ? (
        <div className="mt-5 border-t border-[#eee9e2] pt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Navigation label" value={section.label} onChange={(event) => onChange({ label: event.target.value })} />
            <Field label="Public URL" value={section.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
            <Field label="Menu eyebrow" value={section.menuEyebrow ?? ""} onChange={(event) => onChange({ menuEyebrow: event.target.value })} />
            <label className="block min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Menu tone</span>
              <select className={fieldClass} value={tone} onChange={(event) => onChange({ tone: event.target.value })}>
                {toneOptions.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
              </select>
            </label>
            <Field className="sm:col-span-2" label="Menu title" value={section.menuTitle ?? ""} onChange={(event) => onChange({ menuTitle: event.target.value })} />
            <TextAreaField className="sm:col-span-2" label="Menu description" value={section.menuDescription ?? ""} onChange={(event) => onChange({ menuDescription: event.target.value })} />
          </div>

          <div className="mt-5 rounded-[14px] border border-[#ece7df] bg-[#faf9f6] p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-[#3f3c38]">Recommendation card</p>
                <p className="mt-0.5 text-[11px] text-[#9b958c]">Optional content shown beside this menu.</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9b958c]">Optional</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Badge" value={section.spotlightBadge ?? ""} onChange={(event) => onChange({ spotlightBadge: event.target.value })} />
              <Field label="Card title" value={section.spotlightTitle ?? ""} onChange={(event) => onChange({ spotlightTitle: event.target.value })} />
              <TextAreaField className="sm:col-span-2" label="Card description" value={section.spotlightDescription ?? ""} onChange={(event) => onChange({ spotlightDescription: event.target.value })} />
              <Field label="Button label" value={section.spotlightCtaLabel ?? ""} onChange={(event) => onChange({ spotlightCtaLabel: event.target.value })} />
              <Field label="Button URL" value={section.spotlightCtaHref ?? ""} onChange={(event) => onChange({ spotlightCtaHref: event.target.value })} inputMode="url" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LinkEditor({
  link,
  saving,
  onChange,
  onSave,
  onDelete,
}: {
  link: AdminMenuLink;
  saving: boolean;
  onChange: (patch: Partial<AdminMenuLink>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[12px] border border-[#ece7df] bg-[#faf9f6] p-3">
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Sub-link label" value={link.label} onChange={(event) => onChange({ label: event.target.value })} />
        <Field label="Destination URL" value={link.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-[#9b958c]">
          <span className={`size-1.5 shrink-0 rounded-full ${link.isVisible ? "bg-[#3d9b68]" : "bg-[#c8c2b9]"}`} aria-hidden="true" />
          {link.href ? <a className="truncate font-semibold text-[#e44762] hover:underline" href={link.href} {...getLinkProps(link.href)}>Open destination ↗</a> : <span>No destination set</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={link.isVisible ? "On" : "Off"} checked={link.isVisible} onChange={() => onChange({ isVisible: !link.isVisible })} />
          <SaveButton label="Save" saving={saving} onClick={onSave} />
          <button className="grid size-10 place-items-center rounded-full border border-[#f1c6ce] text-[16px] text-[#c63c56] transition-colors hover:bg-[#fce0e3] disabled:opacity-50" type="button" aria-label={`Delete ${link.label}`} disabled={saving} onClick={onDelete}>×</button>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ item, active, onSelect }: { item: AdminMenuItem; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left transition-colors sm:px-4 ${active ? "bg-[#fff4f5]" : "bg-white hover:bg-[#fcfaf8]"}`.trim()}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${active ? "bg-[#fce0e3] text-[#e44762]" : "bg-[#f3f1ec] text-[#6c6761]"}`.trim()}>
        <ServiceIcon name={item.icon as ServiceIconName} className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13px] font-bold text-[#14131c]">{item.label || "Untitled service"}</span>
          {item.links.length ? <span className="shrink-0 rounded-full bg-[#f3f1ec] px-2 py-0.5 text-[10px] font-bold text-[#77736e]">{item.links.length} link{item.links.length === 1 ? "" : "s"}</span> : null}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#9b958c]">{item.href || "No destination set"}</span>
      </span>
      <span className="hidden rounded-full bg-[#f3f1ec] px-2 py-1 text-[10px] font-bold text-[#77736e] sm:inline-flex">{item.marker}</span>
      <span className={`hidden rounded-full px-2 py-1 text-[10px] font-bold md:inline-flex ${item.isVisible ? "bg-[#e9f4ed] text-[#29634d]" : "bg-[#f3f1ec] text-[#8b857e]"}`.trim()}>{item.isVisible ? "On" : "Off"}</span>
      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[16px] transition-colors ${active ? "bg-[#14131c] text-white" : "text-[#8b857e]"}`.trim()} aria-hidden="true">{active ? "↑" : "→"}</span>
    </button>
  );
}

function ItemEditor({
  item,
  savingKey,
  onChange,
  onSave,
  onDelete,
  onAddLink,
  onChangeLink,
  onSaveLink,
  onDeleteLink,
}: {
  item: AdminMenuItem;
  savingKey: string | null;
  onChange: (patch: Partial<AdminMenuItem>) => void;
  onSave: () => void;
  onDelete: () => void;
  onAddLink: () => void;
  onChangeLink: (id: string, patch: Partial<AdminMenuLink>) => void;
  onSaveLink: (link: AdminMenuLink) => void;
  onDeleteLink: (link: AdminMenuLink) => void;
}) {
  const itemSaving = savingKey === `item:${item.id}`;

  return (
    <article className="rounded-[18px] border border-[#e1dcd4] bg-white p-4 sm:p-5" aria-labelledby={`service-editor-${item.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#fce0e3] text-[#e44762]"><ServiceIcon name={item.icon as ServiceIconName} className="size-[19px]" /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e44762]">Editing service</p>
            <h3 className="mt-1 truncate text-[17px] font-bold tracking-[-0.02em] text-[#14131c]" id={`service-editor-${item.id}`}>{item.label || "Untitled service"}</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={item.isVisible ? "Visible" : "Hidden"} checked={item.isVisible} onChange={() => onChange({ isVisible: !item.isVisible })} />
          <SaveButton label="Save service" saving={itemSaving} onClick={onSave} />
          <button className="grid size-10 place-items-center rounded-full border border-[#f1c6ce] text-[16px] text-[#c63c56] transition-colors hover:bg-[#fce0e3] disabled:opacity-50" type="button" aria-label={`Delete ${item.label}`} disabled={itemSaving} onClick={onDelete}>×</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[#eee9e2] pt-5 sm:grid-cols-2 lg:grid-cols-[170px_minmax(0,1fr)_120px]">
        <label className="block min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Service icon</span>
          <div className="mt-2"><IconPicker value={item.icon} onChange={(icon) => onChange({ icon })} disabled={itemSaving} /></div>
        </label>
        <Field label="Service name" value={item.label} onChange={(event) => onChange({ label: event.target.value })} />
        <Field label="Marker" value={item.marker} onChange={(event) => onChange({ marker: event.target.value })} />
        <Field className="sm:col-span-2 lg:col-span-3" label="Destination URL" value={item.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
        <TextAreaField className="sm:col-span-2 lg:col-span-3" label="Description" value={item.description} onChange={(event) => onChange({ description: event.target.value })} />
      </div>

      <div className="mt-5 border-t border-[#eee9e2] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-bold text-[#3f3c38]">Sub-links <span className="font-medium text-[#9b958c]">({item.links.length})</span></p>
            <p className="mt-0.5 text-[11px] text-[#9b958c]">Optional links shown beneath this service.</p>
          </div>
          <OutlineButton disabled={itemSaving} onClick={onAddLink}>+ Add sub-link</OutlineButton>
        </div>
        {item.links.length ? (
          <div className="mt-3 space-y-2.5">
            {item.links.map((link) => (
              <LinkEditor
                key={link.id}
                link={link}
                saving={savingKey === `link:${link.id}`}
                onChange={(patch) => onChangeLink(link.id, patch)}
                onSave={() => onSaveLink(link)}
                onDelete={() => onDeleteLink(link)}
              />
            ))}
          </div>
        ) : <p className="mt-3 rounded-[12px] border border-dashed border-[#ded8cf] px-3 py-3 text-[11px] text-[#9b958c]">No sub-links yet.</p>}
      </div>
    </article>
  );
}

function CategoryRail({
  groups,
  activeGroupId,
  onSelect,
  onAdd,
}: {
  groups: AdminMenuGroup[];
  activeGroupId: string;
  onSelect: (group: AdminMenuGroup) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="rounded-[18px] border border-[#e1dcd4] bg-white p-3.5 lg:sticky lg:top-5" aria-label="Categories">
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <p className="text-[12px] font-bold text-[#14131c]">Categories</p>
          <p className="mt-0.5 text-[11px] text-[#9b958c]">Choose a menu group to edit.</p>
        </div>
        <span className="rounded-full bg-[#f3f1ec] px-2 py-1 text-[10px] font-bold text-[#77736e]">{groups.length}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:block lg:space-y-2">
        {groups.map((group) => {
          const selected = group.id === activeGroupId;
          return (
            <button
              className={`flex min-w-0 items-center gap-2.5 rounded-[13px] border p-2.5 text-left transition-colors lg:w-full ${selected ? "border-[#14131c] bg-[#14131c] text-white" : "border-[#eee9e2] bg-[#faf9f6] text-[#14131c] hover:border-[#cfc8be]"}`.trim()}
              type="button"
              aria-pressed={selected}
              key={group.id}
              onClick={() => onSelect(group)}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-[9px] text-[10px] font-bold ${selected ? "bg-white/10 text-[#f8bec8]" : "bg-white text-[#e44762]"}`.trim()}>{String(group.sortOrder + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold uppercase tracking-[0.02em]">{group.label || "Untitled category"}</span>
                <span className={`mt-0.5 block truncate text-[10px] ${selected ? "text-white/50" : "text-[#9b958c]"}`.trim()}>{group.items.length} service{group.items.length === 1 ? "" : "s"}</span>
              </span>
              <span className={`hidden size-1.5 shrink-0 rounded-full sm:block ${group.isVisible ? "bg-[#55b57b]" : "bg-[#c8c2b9]"}`} aria-label={group.isVisible ? "Visible" : "Hidden"} />
            </button>
          );
        })}
      </div>
      <OutlineButton className="mt-3 w-full" onClick={onAdd}>+ Add category</OutlineButton>
    </aside>
  );
}

function CategoryEditor({
  group,
  saving,
  onChange,
  onSave,
  onDelete,
}: {
  group: AdminMenuGroup;
  saving: boolean;
  onChange: (patch: Partial<AdminMenuGroup>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="rounded-[18px] border border-[#e1dcd4] bg-white p-4 sm:p-5" aria-labelledby={`category-editor-${group.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#f3f1ec] text-[11px] font-bold text-[#e44762]">{String(group.sortOrder + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e44762]">Active category</p>
            <h2 className="mt-1 truncate text-[17px] font-bold tracking-[-0.02em] text-[#14131c]" id={`category-editor-${group.id}`}>{group.label || "Untitled category"}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={group.isVisible ? "Visible" : "Hidden"} checked={group.isVisible} onChange={() => onChange({ isVisible: !group.isVisible })} />
          <SaveButton label="Save category" saving={saving} onClick={onSave} />
          <button className="grid size-10 place-items-center rounded-full border border-[#f1c6ce] text-[16px] text-[#c63c56] transition-colors hover:bg-[#fce0e3] disabled:opacity-50" type="button" aria-label={`Delete ${group.label}`} disabled={saving} onClick={onDelete}>×</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[#eee9e2] pt-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_120px]">
        <Field label="Category name" value={group.label} onChange={(event) => onChange({ label: event.target.value })} />
        <Field label="Menu rail label" value={group.railLabel} onChange={(event) => onChange({ railLabel: event.target.value })} />
        <Field label="Order" value={group.sortOrder} type="number" inputMode="numeric" onChange={(event) => onChange({ sortOrder: Number(event.target.value) || 0 })} />
        <TextAreaField className="sm:col-span-2 lg:col-span-3" label="Category description" value={group.description} onChange={(event) => onChange({ description: event.target.value })} />
      </div>
    </section>
  );
}

export function ServicesModule() {
  const [sections, setSections] = useState<AdminMenuSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("");
  const [activeItemId, setActiveItemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0] ?? null,
    [activeSectionId, sections],
  );

  const activeGroup = useMemo(
    () => activeSection?.groups.find((group) => group.id === activeGroupId) ?? activeSection?.groups[0] ?? null,
    [activeGroupId, activeSection],
  );

  const activeItem = useMemo(
    () => activeGroup?.items.find((item) => item.id === activeItemId) ?? activeGroup?.items[0] ?? null,
    [activeGroup, activeItemId],
  );

  useEffect(() => {
    let cancelled = false;

    void getAdminMenu()
      .then((nextSections) => {
        if (cancelled) return;
        setSections(nextSections);
        setActiveSectionId((current) => current || nextSections[0]?.id || "");
        setLoadError("");
      })
      .catch((loadErrorValue: unknown) => {
        if (cancelled) return;
        if (isUnauthorizedError(loadErrorValue)) {
          window.location.assign("/admin/login");
          return;
        }
        setLoadError("Menu data is not ready. Run the migration and seed, then refresh.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSection) return;
    setActiveGroupId((current) => activeSection.groups.some((group) => group.id === current) ? current : activeSection.groups[0]?.id ?? "");
  }, [activeSection]);

  useEffect(() => {
    if (!activeGroup) {
      setActiveItemId("");
      return;
    }
    setActiveItemId((current) => activeGroup.items.some((item) => item.id === current) ? current : activeGroup.items[0]?.id ?? "");
  }, [activeGroup]);

  function updateSectionInState(sectionId: string, patch: Partial<AdminMenuSection>) {
    setSections((current) => current.map((section) => section.id === sectionId ? { ...section, ...patch } : section));
  }

  function updateGroupInState(sectionId: string, groupId: string, patch: Partial<AdminMenuGroup>) {
    setSections((current) => current.map((section) => section.id !== sectionId
      ? section
      : { ...section, groups: section.groups.map((group) => group.id === groupId ? { ...group, ...patch } : group) }));
  }

  function updateItemInState(sectionId: string, groupId: string, itemId: string, patch: Partial<AdminMenuItem>) {
    setSections((current) => current.map((section) => section.id !== sectionId
      ? section
      : {
          ...section,
          groups: section.groups.map((group) => group.id !== groupId
            ? group
            : { ...group, items: group.items.map((item) => item.id === itemId ? { ...item, ...patch } : item) }),
        }));
  }

  function updateLinkInState(sectionId: string, groupId: string, itemId: string, linkId: string, patch: Partial<AdminMenuLink>) {
    setSections((current) => current.map((section) => section.id !== sectionId
      ? section
      : {
          ...section,
          groups: section.groups.map((group) => group.id !== groupId
            ? group
            : {
                ...group,
                items: group.items.map((item) => item.id !== itemId
                  ? item
                  : { ...item, links: item.links.map((link) => link.id === linkId ? { ...link, ...patch } : link) }),
              }),
        }));
  }

  async function mutate(key: string, action: () => Promise<AdminMenuSection[]>, message: string, onSuccess?: (nextSections: AdminMenuSection[]) => void) {
    setSavingKey(key);
    setError("");
    setNotice("");

    try {
      const nextSections = await action();
      setSections(nextSections);
      onSuccess?.(nextSections);
      setNotice(message);
    } catch (mutationError) {
      if (isUnauthorizedError(mutationError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(mutationError instanceof Error ? mutationError.message : "Unable to save that change.");
    } finally {
      setSavingKey(null);
    }
  }

  function saveSection(section: AdminMenuSection) {
    void mutate(`section:${section.id}`, () => updateMenuSection(section.id, {
      key: section.key,
      label: section.label,
      href: section.href,
      menuEyebrow: section.menuEyebrow ?? "",
      menuTitle: section.menuTitle ?? "",
      menuDescription: section.menuDescription ?? "",
      spotlightBadge: section.spotlightBadge ?? "",
      spotlightTitle: section.spotlightTitle ?? "",
      spotlightDescription: section.spotlightDescription ?? "",
      spotlightCtaLabel: section.spotlightCtaLabel ?? "",
      spotlightCtaHref: section.spotlightCtaHref ?? "",
      tone: section.tone,
      sortOrder: section.sortOrder,
      isVisible: section.isVisible,
    }), `${section.label} settings saved.`);
  }

  function saveGroup(group: AdminMenuGroup) {
    void mutate(`group:${group.id}`, () => updateMenuGroup(group.id, {
      key: group.key,
      label: group.label,
      railLabel: group.railLabel,
      description: group.description,
      sortOrder: group.sortOrder,
      isVisible: group.isVisible,
    }), `${group.label || "Category"} saved.`);
  }

  function saveItem(item: AdminMenuItem) {
    void mutate(`item:${item.id}`, () => updateMenuItem(item.id, {
      label: item.label,
      description: item.description,
      href: item.href,
      marker: item.marker,
      icon: item.icon,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
    }), `${item.label || "Service"} saved.`);
  }

  function saveLink(link: AdminMenuLink) {
    void mutate(`link:${link.id}`, () => updateMenuLink(link.id, {
      label: link.label,
      href: link.href,
      sortOrder: link.sortOrder,
      isVisible: link.isVisible,
    }), `${link.label || "Sub-link"} saved.`);
  }

  function confirmDelete(message: string) {
    return window.confirm(message);
  }

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e1dcd4] bg-white"><p className="text-[13px] font-semibold text-[#8b857e]">Loading your menu structure…</p></div>;
  }

  if (loadError) {
    return (
      <section className="rounded-[24px] border border-[#f1c6ce] bg-[#fff8f8] p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c63c56]">Menu unavailable</p>
        <h1 className="mt-2 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#14131c]">Connect the menu database first.</h1>
        <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#716c67]">Run the Prisma migration and seed, then reload.</p>
        <p className="mt-4 rounded-[12px] bg-white px-3.5 py-3 text-[12px] font-semibold text-[#8b3a4b]">{loadError}</p>
      </section>
    );
  }

  if (!activeSection) {
    return (
      <section className="rounded-[24px] border border-[#e1dcd4] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e44762]">Services & menu</p>
        <h1 className="mt-2 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#14131c]">No menu sections yet.</h1>
        <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#716c67]">Run the database seed to load the Limex service areas.</p>
      </section>
    );
  }

  function addCategory() {
    const nextOrder = activeSection.groups.length ? Math.max(...activeSection.groups.map((group) => group.sortOrder)) + 1 : 0;
    const key = `${slugify(activeSection.label)}-${Date.now()}`;
    void mutate(`create-group:${activeSection.id}`, () => createMenuGroup({ sectionId: activeSection.id, key, label: "New category", railLabel: "New category", description: "Describe this category for customers.", sortOrder: nextOrder }), "New category added.", (nextSections) => {
      const nextSection = nextSections.find((section) => section.id === activeSection.id);
      const nextGroup = nextSection?.groups.find((group) => group.key === key);
      if (nextGroup) {
        setActiveGroupId(nextGroup.id);
        setActiveItemId(nextGroup.items[0]?.id ?? "");
      }
    });
  }

  function addService(group: AdminMenuGroup) {
    const nextOrder = group.items.length ? Math.max(...group.items.map((item) => item.sortOrder)) + 1 : 0;
    const label = nextUnusedLabel("New service", group.items.map((item) => item.label));
    void mutate(`create-item:${group.id}`, () => createMenuItem({ groupId: group.id, label, description: "Describe this service for customers.", href: "#contact", marker: String(nextOrder + 1).padStart(2, "0"), icon: "briefcase", sortOrder: nextOrder }), "New service added.", (nextSections) => {
      const nextSection = nextSections.find((section) => section.id === activeSection.id);
      const nextGroup = nextSection?.groups.find((nextGroupValue) => nextGroupValue.id === group.id);
      const nextItem = nextGroup?.items.find((item) => item.label === label);
      if (nextItem) setActiveItemId(nextItem.id);
    });
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">Content workspace</p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#14131c] sm:text-[48px]">Services & menu</h1>
          <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">Organize categories, services, links and icons from one focused workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-colors hover:border-[#aaa197] hover:text-[#14131c]" href="/" target="_blank" rel="noreferrer">Preview website ↗</a>
          <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px" type="button" onClick={() => window.location.reload()}>Refresh data</button>
        </div>
      </section>

      {error ? <p className="rounded-[14px] border border-[#f1c6ce] bg-[#fff8f8] px-4 py-3 text-[13px] text-[#ad3148]" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-[14px] border border-[#c6e5d3] bg-[#f2fbf5] px-4 py-3 text-[13px] text-[#29634d]" role="status">{notice}</p> : null}

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Choose main menu section">
        {sections.map((section) => {
          const selected = section.id === activeSection.id;
          return (
            <button
              className={`flex min-w-[178px] shrink-0 items-center gap-3 rounded-[18px] border p-3 text-left transition-colors ${selected ? "border-[#14131c] bg-[#14131c] text-white" : "border-[#e1dcd4] bg-white text-[#14131c] hover:border-[#c7c0b6]"}`.trim()}
              type="button"
              key={section.id}
              aria-current={selected ? "page" : undefined}
              onClick={() => {
                setActiveSectionId(section.id);
                setActiveGroupId("");
                setActiveItemId("");
              }}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-[11px] text-[11px] font-bold ${selected ? "bg-white/10 text-[#f8bec8]" : toneClass(section.tone)}`.trim()}>{String(section.sortOrder + 1).padStart(2, "0")}</span>
              <span className="min-w-0"><span className="block truncate text-[13px] font-bold">{section.label}</span><span className={`mt-0.5 block text-[11px] ${selected ? "text-white/45" : "text-[#9b958c]"}`.trim()}>{section.groups.length} categories · {section.groups.reduce((total, group) => total + group.items.length, 0)} services</span></span>
            </button>
          );
        })}
      </nav>

      <SectionSettings
        section={activeSection}
        saving={savingKey === `section:${activeSection.id}`}
        onChange={(patch) => updateSectionInState(activeSection.id, patch)}
        onSave={() => saveSection(activeSection)}
      />

      <section aria-labelledby="categories-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e44762]">Menu structure</p>
            <h2 className="mt-2 font-brand text-[27px] font-bold tracking-[-0.04em] text-[#14131c]" id="categories-title">Categories & services</h2>
          </div>
          <p className="text-[12px] text-[#9b958c]">Select a category, then edit one service at a time.</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <CategoryRail
            groups={activeSection.groups}
            activeGroupId={activeGroup?.id ?? ""}
            onSelect={(group) => {
              setActiveGroupId(group.id);
              setActiveItemId(group.items[0]?.id ?? "");
            }}
            onAdd={addCategory}
          />

          {activeGroup ? (
            <div className="min-w-0 space-y-4">
              <CategoryEditor
                group={activeGroup}
                saving={savingKey === `group:${activeGroup.id}`}
                onChange={(patch) => updateGroupInState(activeSection.id, activeGroup.id, patch)}
                onSave={() => saveGroup(activeGroup)}
                onDelete={() => {
                  if (!confirmDelete(`Delete ${activeGroup.label || "this category"} and all of its services?`)) return;
                  void mutate(`delete-group:${activeGroup.id}`, () => deleteMenuGroup(activeGroup.id), `${activeGroup.label || "Category"} deleted.`);
                }}
              />

              <section className="overflow-hidden rounded-[18px] border border-[#e1dcd4] bg-white" aria-labelledby="services-list-title">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9e2] px-4 py-3.5 sm:px-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#14131c]" id="services-list-title">Services</h3>
                      <span className="rounded-full bg-[#f3f1ec] px-2 py-1 text-[10px] font-bold text-[#77736e]">{activeGroup.items.length}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#9b958c]">Choose a row to edit its icon, URL or links.</p>
                  </div>
                  <OutlineButton disabled={savingKey === `group:${activeGroup.id}`} onClick={() => addService(activeGroup)}>+ Add service</OutlineButton>
                </div>
                {activeGroup.items.length ? (
                  <div className="divide-y divide-[#eee9e2]">
                    {activeGroup.items.map((item) => <ServiceRow key={item.id} item={item} active={item.id === activeItem?.id} onSelect={() => setActiveItemId(item.id)} />)}
                  </div>
                ) : <p className="px-4 py-5 text-[12px] text-[#9b958c]">No services yet. Add the first service to this category.</p>}
              </section>

              {activeItem ? (
                <ItemEditor
                  item={activeItem}
                  savingKey={savingKey}
                  onChange={(patch) => updateItemInState(activeSection.id, activeGroup.id, activeItem.id, patch)}
                  onSave={() => saveItem(activeItem)}
                  onDelete={() => {
                    if (!confirmDelete(`Delete ${activeItem.label || "this service"} and its sub-links?`)) return;
                    void mutate(`delete-item:${activeItem.id}`, () => deleteMenuItem(activeItem.id), `${activeItem.label || "Service"} deleted.`, () => setActiveItemId(""));
                  }}
                  onAddLink={() => {
                    const nextOrder = activeItem.links.length ? Math.max(...activeItem.links.map((link) => link.sortOrder)) + 1 : 0;
                    void mutate(`create-link:${activeItem.id}`, () => createMenuLink({ itemId: activeItem.id, label: "New sub-link", href: "#contact", sortOrder: nextOrder }), "New sub-link added.");
                  }}
                  onChangeLink={(linkId, patch) => updateLinkInState(activeSection.id, activeGroup.id, activeItem.id, linkId, patch)}
                  onSaveLink={(link) => saveLink(link)}
                  onDeleteLink={(link) => {
                    if (!confirmDelete(`Delete ${link.label || "this sub-link"}?`)) return;
                    void mutate(`delete-link:${link.id}`, () => deleteMenuLink(link.id), `${link.label || "Sub-link"} deleted.`);
                  }}
                />
              ) : <div className="rounded-[18px] border border-dashed border-[#d8d1c7] bg-white px-4 py-6 text-[12px] text-[#9b958c]">Select a service to edit its details.</div>}
            </div>
          ) : <div className="rounded-[18px] border border-dashed border-[#d8d1c7] bg-white px-4 py-6 text-[12px] text-[#9b958c]">Add a category to start organizing this menu.</div>}
        </div>
      </section>
    </div>
  );
}
