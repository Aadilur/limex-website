"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  createMenuSection,
  createMenuGroup,
  createMenuItem,
  createMenuLink,
  deleteMenuSection,
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

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] px-3.5 text-[13px] text-[#1c191d] outline-none transition-all placeholder:text-[#aaa49b] hover:border-[#c5bdb2] focus:border-[#0055ff] focus:bg-white focus:ring-4 focus:ring-[#008cff]/10 shadow-[0_1px_2px_rgba(30,25,20,0.02)]";
const textAreaClass = `${fieldClass} min-h-[96px] resize-y py-3 leading-[1.5]`;
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
  if (tone === "teal") return "bg-[#e5fbff] text-[#007ea6]";
  if (tone === "violet") return "bg-[#e8f3ff] text-[#006dce]";
  if (tone === "orange") return "bg-[#e9efff] text-[#0055ff]";
  return "bg-[#e8f3ff] text-[#006dce]";
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
      <span className="text-[12px] font-semibold text-[#37332d]">{label}</span>
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
      <span className="text-[12px] font-semibold text-[#37332d]">{label}</span>
      <textarea className={textAreaClass} value={value} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-[#ddd7ce] bg-white px-3.5 text-[12px] font-semibold text-[#4f4b47] transition-all hover:border-[#bbb3a8] hover:bg-[#faf8f5] focus:outline-none focus:ring-2 focus:ring-[#008cff]/20"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span
        className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? "bg-[#0055ff]" : "bg-[#d1ccc4]"
        }`}
        aria-hidden="true"
      >
        <span
          className={`pointer-events-none inline-block size-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

function SaveButton({ label = "Save changes", saving, onClick }: { label?: string; saving: boolean; onClick: () => void }) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:bg-[#162744] hover:-translate-y-px disabled:cursor-wait disabled:opacity-60"
      type="button"
      disabled={saving}
      onClick={onClick}
    >
      {saving ? (
        <>
          <svg className="size-3.5 animate-spin text-white/80" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Saving…</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}

function OutlineButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#aaa197] hover:text-[#071b3d] hover:bg-[#faf8f5] disabled:cursor-wait disabled:opacity-60 ${className}`.trim()}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DeleteButton({
  ariaLabel,
  disabled = false,
  onClick,
}: {
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="grid size-9 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50/70 text-red-600 transition-all hover:bg-red-100 hover:border-red-300 disabled:opacity-50"
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}

function SectionSettings({
  section,
  saving,
  onChange,
  onSave,
  canDelete,
  onDelete,
}: {
  section: AdminMenuSection;
  saving: boolean;
  onChange: (patch: Partial<AdminMenuSection>) => void;
  onSave: () => void;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const tone = toneOptions.includes(section.tone as (typeof toneOptions)[number]) ? section.tone : "green";

  return (
    <section className="rounded-[20px] border border-[#e2dcd4] bg-white p-4.5 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]" aria-labelledby="section-settings-title">
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#f0f4ff] text-[15px] text-[#0055ff] border border-[#0055ff]/10">⌘</span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold text-[#071b3d]" id="section-settings-title">Section settings</span>
            <span className="mt-0.5 block truncate text-[11.5px] text-[#9b958c]">{section.label} · {section.isVisible ? "Visible" : "Hidden"}</span>
          </span>
        </button>
        <button
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#ddd7ce] bg-[#fbfaf8] px-3.5 text-[12px] font-semibold text-[#4f4b47] transition-all hover:bg-white hover:border-[#bbb3a8] hover:text-[#071b3d]"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{open ? "Close" : "Edit settings"}</span>
          <svg
            className={`size-3.5 text-[#8b857e] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Toggle label={section.isVisible ? "Visible" : "Hidden"} checked={section.isVisible} onChange={() => onChange({ isVisible: !section.isVisible })} />
          <SaveButton saving={saving} onClick={onSave} />
          {canDelete ? <DeleteButton ariaLabel={`Delete ${section.label}`} disabled={saving} onClick={onDelete} /> : null}
        </div>
      </div>

      {open ? (
        <div className="mt-5 border-t border-[#eee9e2] pt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Navigation label" value={section.label} onChange={(event) => onChange({ label: event.target.value })} />
            <Field label="Public URL" value={section.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
            <Field label="Menu eyebrow" value={section.menuEyebrow ?? ""} onChange={(event) => onChange({ menuEyebrow: event.target.value })} />
            <label className="block min-w-0">
              <span className="text-[12px] font-semibold text-[#37332d]">Menu tone</span>
              <div className="relative mt-1.5">
                <select
                  className={`${fieldClass} mt-0 appearance-none pr-9 cursor-pointer`}
                  value={tone}
                  onChange={(event) => onChange({ tone: event.target.value })}
                >
                  {toneOptions.map((option) => (
                    <option key={option} value={option}>
                      {option[0].toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b857e]">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </label>
            <Field className="sm:col-span-2" label="Menu title" value={section.menuTitle ?? ""} onChange={(event) => onChange({ menuTitle: event.target.value })} />
            <TextAreaField className="sm:col-span-2" label="Menu description" value={section.menuDescription ?? ""} onChange={(event) => onChange({ menuDescription: event.target.value })} />
          </div>

          <div className="mt-5 rounded-[16px] border border-[#ebe5dc] bg-[#faf8f5] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[12.5px] font-bold text-[#37332d]">Recommendation card</p>
                <p className="mt-0.5 text-[11px] text-[#9b958c]">Optional highlight card shown beside this menu category.</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9b958c] border border-[#e8e2d8]">Optional</span>
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
    <div className="rounded-[14px] border border-[#ece6dc] bg-[#faf9f6] p-3.5 transition-all hover:border-[#ddd5c8]">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Sub-link label" value={link.label} onChange={(event) => onChange({ label: event.target.value })} />
        <Field label="Destination URL" value={link.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-[11.5px] text-[#9b958c]">
          <span className={`size-2 shrink-0 rounded-full ${link.isVisible ? "bg-[#34c759]" : "bg-[#c8c2b9]"}`} aria-hidden="true" />
          {link.href ? (
            <a className="inline-flex items-center gap-1 truncate font-semibold text-[#0055ff] hover:underline" href={link.href} {...getLinkProps(link.href)}>
              <span>Open destination</span>
              <svg className="size-3 text-[#0055ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span>No destination set</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={link.isVisible ? "On" : "Off"} checked={link.isVisible} onChange={() => onChange({ isVisible: !link.isVisible })} />
          <SaveButton label="Save" saving={saving} onClick={onSave} />
          <DeleteButton ariaLabel={`Delete ${link.label}`} disabled={saving} onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ item, active, onSelect }: { item: AdminMenuItem; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`flex w-full min-w-0 items-center gap-3 px-3.5 py-3 text-left transition-all sm:px-4 ${
        active ? "bg-[#f2f6ff] border-l-4 border-l-[#0055ff]" : "bg-white hover:bg-[#faf8f5] border-l-4 border-l-transparent"
      }`.trim()}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors ${
          active ? "bg-[#0055ff] text-white shadow-sm" : "bg-[#f3efe9] text-[#55504a]"
        }`.trim()}
      >
        <ServiceIcon name={item.icon as ServiceIconName} className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`truncate text-[13px] font-bold ${active ? "text-[#0055ff]" : "text-[#071b3d]"}`}>
            {item.label || "Untitled service"}
          </span>
          {item.links.length ? (
            <span className="shrink-0 rounded-full bg-[#ede8e0] px-2 py-0.5 text-[10px] font-bold text-[#676159]">
              {item.links.length} link{item.links.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-[#9b958c]">{item.href || "No destination set"}</span>
      </span>
      <span className="hidden rounded-full bg-[#f3efe9] px-2.5 py-0.5 text-[10px] font-bold text-[#77736e] sm:inline-flex">{item.marker}</span>
      <span
        className={`hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold md:inline-flex ${
          item.isVisible ? "bg-[#e8f7ee] text-[#1c6e43]" : "bg-[#f3efe9] text-[#8b857e]"
        }`.trim()}
      >
        <span className={`size-1.5 rounded-full ${item.isVisible ? "bg-[#29975b]" : "bg-[#a8a197]"}`} />
        {item.isVisible ? "Visible" : "Hidden"}
      </span>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full transition-all ${
          active ? "bg-[#0055ff] text-white" : "text-[#9e978e]"
        }`.trim()}
        aria-hidden="true"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
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
    <article className="rounded-[20px] border border-[#e2dcd4] bg-white p-4.5 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]" aria-labelledby={`service-editor-${item.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#f0f4ff] text-[#0055ff] border border-[#0055ff]/10">
            <ServiceIcon name={item.icon as ServiceIconName} className="size-[20px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Editing service</p>
            <h3 className="mt-0.5 truncate text-[17px] font-bold tracking-[-0.02em] text-[#071b3d]" id={`service-editor-${item.id}`}>{item.label || "Untitled service"}</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={item.isVisible ? "Visible" : "Hidden"} checked={item.isVisible} onChange={() => onChange({ isVisible: !item.isVisible })} />
          <SaveButton label="Save service" saving={itemSaving} onClick={onSave} />
          <DeleteButton ariaLabel={`Delete ${item.label}`} disabled={itemSaving} onClick={onDelete} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-[#eee9e2] pt-4 sm:grid-cols-2 lg:grid-cols-[170px_minmax(0,1fr)_120px]">
        <label className="block min-w-0">
          <span className="text-[12px] font-semibold text-[#37332d]">Service icon</span>
          <div className="mt-1.5"><IconPicker value={item.icon} onChange={(icon) => onChange({ icon })} disabled={itemSaving} /></div>
        </label>
        <Field label="Service name" value={item.label} onChange={(event) => onChange({ label: event.target.value })} />
        <Field label="Marker" value={item.marker} onChange={(event) => onChange({ marker: event.target.value })} />
        <Field className="sm:col-span-2 lg:col-span-3" label="Destination URL" value={item.href} onChange={(event) => onChange({ href: event.target.value })} inputMode="url" />
        <TextAreaField className="sm:col-span-2 lg:col-span-3" label="Description" value={item.description} onChange={(event) => onChange({ description: event.target.value })} />
      </div>

      <div className="mt-5 border-t border-[#eee9e2] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold text-[#37332d]">Sub-links <span className="font-medium text-[#9b958c]">({item.links.length})</span></p>
            <p className="mt-0.5 text-[11px] text-[#9b958c]">Optional child links shown beneath this service.</p>
          </div>
          <OutlineButton disabled={itemSaving} onClick={onAddLink}>
            <svg className="mr-1.5 size-3.5 text-[#77736e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add sub-link
          </OutlineButton>
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
        ) : (
          <p className="mt-3 rounded-[12px] border border-dashed border-[#ded8cf] bg-[#faf8f5] px-3.5 py-3 text-[11.5px] text-[#9b958c]">
            No sub-links yet. Click &ldquo;Add sub-link&rdquo; to create navigation links for this service.
          </p>
        )}
      </div>
    </article>
  );
}

function CategoryRail({
  groups,
  activeGroupId,
  onSelect,
  onAdd,
  disabled,
}: {
  groups: AdminMenuGroup[];
  activeGroupId: string;
  onSelect: (group: AdminMenuGroup) => void;
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <aside className="rounded-[20px] border border-[#e2dcd4] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:sticky lg:top-5" aria-label="Categories">
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <p className="text-[13px] font-bold text-[#071b3d]">Categories</p>
          <p className="mt-0.5 text-[11px] text-[#9b958c]">Choose a menu group to edit</p>
        </div>
        <span className="rounded-full bg-[#f3efe9] px-2.5 py-0.5 text-[11px] font-bold text-[#676159]">{groups.length}</span>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2 lg:block lg:space-y-2">
        {groups.map((group) => {
          const selected = group.id === activeGroupId;
          return (
            <button
              className={`flex min-w-0 items-center gap-2.5 rounded-[14px] border p-2.5 text-left transition-all lg:w-full ${
                selected
                  ? "border-[#071b3d] bg-[#071b3d] text-white shadow-sm"
                  : "border-[#ede7de] bg-[#fcfbf9] text-[#071b3d] hover:border-[#cfc8be] hover:bg-white hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
              }`.trim()}
              type="button"
              aria-pressed={selected}
              key={group.id}
              onClick={() => onSelect(group)}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-[10px] text-[11px] font-bold transition-colors ${
                  selected ? "bg-white/15 text-white" : "bg-[#eee9e0] text-[#0055ff]"
                }`.trim()}
              >
                {String(group.sortOrder + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold tracking-[0.01em]">{group.label || "Untitled category"}</span>
                <span className={`mt-0.5 block truncate text-[11px] ${selected ? "text-white/60" : "text-[#9b958c]"}`.trim()}>
                  {group.items.length} service{group.items.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className={`hidden size-2 shrink-0 rounded-full sm:block ${group.isVisible ? "bg-[#34c759]" : "bg-[#c8c2b9]"}`} aria-label={group.isVisible ? "Visible" : "Hidden"} />
            </button>
          );
        })}
      </div>
      <OutlineButton className="mt-3.5 w-full" disabled={disabled} onClick={onAdd}>
        <svg className="mr-1.5 size-3.5 text-[#77736e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add category
      </OutlineButton>
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
    <section className="rounded-[20px] border border-[#e2dcd4] bg-white p-4.5 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]" aria-labelledby={`category-editor-${group.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#f0f4ff] text-[12px] font-bold text-[#0055ff]">
            {String(group.sortOrder + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Active category</p>
            <h2 className="mt-0.5 truncate text-[17px] font-bold tracking-[-0.02em] text-[#071b3d]" id={`category-editor-${group.id}`}>
              {group.label || "Untitled category"}
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={group.isVisible ? "Visible" : "Hidden"} checked={group.isVisible} onChange={() => onChange({ isVisible: !group.isVisible })} />
          <SaveButton label="Save category" saving={saving} onClick={onSave} />
          <DeleteButton ariaLabel={`Delete ${group.label}`} disabled={saving} onClick={onDelete} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-[#eee9e2] pt-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_120px]">
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
    setActiveGroupId((current) => (activeSection.groups.some((group) => group.id === current) ? current : activeSection.groups[0]?.id ?? ""));
  }, [activeSection]);

  useEffect(() => {
    if (!activeGroup) {
      setActiveItemId("");
      return;
    }
    setActiveItemId((current) => (activeGroup.items.some((item) => item.id === current) ? current : activeGroup.items[0]?.id ?? ""));
  }, [activeGroup]);

  function updateSectionInState(sectionId: string, patch: Partial<AdminMenuSection>) {
    setSections((current) => current.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)));
  }

  function updateGroupInState(sectionId: string, groupId: string, patch: Partial<AdminMenuGroup>) {
    setSections((current) =>
      current.map((section) =>
        section.id !== sectionId
          ? section
          : { ...section, groups: section.groups.map((group) => (group.id === groupId ? { ...group, ...patch } : group)) },
      ),
    );
  }

  function updateItemInState(sectionId: string, groupId: string, itemId: string, patch: Partial<AdminMenuItem>) {
    setSections((current) =>
      current.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              groups: section.groups.map((group) =>
                group.id !== groupId
                  ? group
                  : { ...group, items: group.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) },
              ),
            },
      ),
    );
  }

  function updateLinkInState(sectionId: string, groupId: string, itemId: string, linkId: string, patch: Partial<AdminMenuLink>) {
    setSections((current) =>
      current.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              groups: section.groups.map((group) =>
                group.id !== groupId
                  ? group
                  : {
                      ...group,
                      items: group.items.map((item) =>
                        item.id !== itemId
                          ? item
                          : { ...item, links: item.links.map((link) => (link.id === linkId ? { ...link, ...patch } : link)) },
                      ),
                    },
              ),
            },
      ),
    );
  }

  async function mutate(key: string, action: () => Promise<AdminMenuSection[]>, message: string, onSuccess?: (nextSections: AdminMenuSection[]) => void) {
    if (savingKey) return;
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
    void mutate(
      `section:${section.id}`,
      () =>
        updateMenuSection(section.id, {
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
        }),
      `${section.label} settings saved.`,
    );
  }

  function saveGroup(group: AdminMenuGroup) {
    void mutate(
      `group:${group.id}`,
      () =>
        updateMenuGroup(group.id, {
          key: group.key,
          label: group.label,
          railLabel: group.railLabel,
          description: group.description,
          sortOrder: group.sortOrder,
          isVisible: group.isVisible,
        }),
      `${group.label || "Category"} saved.`,
    );
  }

  function saveItem(item: AdminMenuItem) {
    void mutate(
      `item:${item.id}`,
      () =>
        updateMenuItem(item.id, {
          label: item.label,
          description: item.description,
          href: item.href,
          marker: item.marker,
          icon: item.icon,
          sortOrder: item.sortOrder,
          isVisible: item.isVisible,
        }),
      `${item.label || "Service"} saved.`,
    );
  }

  function saveLink(link: AdminMenuLink) {
    void mutate(
      `link:${link.id}`,
      () =>
        updateMenuLink(link.id, {
          label: link.label,
          href: link.href,
          sortOrder: link.sortOrder,
          isVisible: link.isVisible,
        }),
      `${link.label || "Sub-link"} saved.`,
    );
  }

  function confirmDelete(message: string) {
    return window.confirm(message);
  }

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e1dcd4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <p className="text-[13px] font-semibold text-[#8b857e]">Loading your menu structure…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-[24px] border border-[#f1c6ce] bg-[#fff8f8] p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c63c56]">Menu unavailable</p>
        <h1 className="mt-2 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#071b3d]">Connect the menu database first.</h1>
        <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#716c67]">Run the Prisma migration and seed, then reload.</p>
        <p className="mt-4 rounded-[12px] bg-white px-3.5 py-3 text-[12px] font-semibold text-[#8b3a4b]">{loadError}</p>
      </section>
    );
  }

  if (!activeSection) {
    return (
      <section className="rounded-[24px] border border-[#e1dcd4] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Services & menu</p>
        <h1 className="mt-2 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#071b3d]">No menu sections yet.</h1>
        <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#716c67]">Run the database seed to load the Limex service areas.</p>
      </section>
    );
  }

  function addSection() {
    const nextOrder = sections.length ? Math.max(...sections.map((section) => section.sortOrder)) + 1 : 0;
    const key = `${slugify("new-section")}-${Date.now()}`;
    void mutate(
      "create-section",
      () => createMenuSection({ key, label: "New section", href: "#contact", tone: "green", sortOrder: nextOrder, isVisible: true }),
      "New section added.",
      (nextSections) => {
        const nextSection = nextSections.find((section) => section.key === key) ?? nextSections.at(-1);
        const nextGroup = nextSection?.groups[0];
        setActiveSectionId(nextSection?.id ?? "");
        setActiveGroupId(nextGroup?.id ?? "");
        setActiveItemId(nextGroup?.items[0]?.id ?? "");
      },
    );
  }

  function addCategory() {
    const nextOrder = activeSection.groups.length ? Math.max(...activeSection.groups.map((group) => group.sortOrder)) + 1 : 0;
    const key = `${slugify(activeSection.label)}-${Date.now()}`;
    void mutate(
      `create-group:${activeSection.id}`,
      () =>
        createMenuGroup({
          sectionId: activeSection.id,
          key,
          label: "New category",
          railLabel: "New category",
          description: "Describe this category for customers.",
          sortOrder: nextOrder,
        }),
      "New category added.",
      (nextSections) => {
        const nextSection = nextSections.find((section) => section.id === activeSection.id);
        const nextGroup = nextSection?.groups.find((group) => group.key === key);
        if (nextGroup) {
          setActiveGroupId(nextGroup.id);
          setActiveItemId(nextGroup.items[0]?.id ?? "");
        }
      },
    );
  }

  function addService(group: AdminMenuGroup) {
    const nextOrder = group.items.length ? Math.max(...group.items.map((item) => item.sortOrder)) + 1 : 0;
    const label = nextUnusedLabel("New service", group.items.map((item) => item.label));
    void mutate(
      `create-item:${group.id}`,
      () =>
        createMenuItem({
          groupId: group.id,
          label,
          description: "Describe this service for customers.",
          href: "#contact",
          marker: String(nextOrder + 1).padStart(2, "0"),
          icon: "briefcase",
          sortOrder: nextOrder,
        }),
      "New service added.",
      (nextSections) => {
        const nextSection = nextSections.find((section) => section.id === activeSection.id);
        const nextGroup = nextSection?.groups.find((nextGroupValue) => nextGroupValue.id === group.id);
        const nextItem = nextGroup?.items.find((item) => item.label === label);
        if (nextItem) setActiveItemId(nextItem.id);
      },
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Content workspace</p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#071b3d] sm:text-[48px]">Services & menu</h1>
          <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">Organize categories, services, links and icons from one focused workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:bg-[#1f2d48]"
            href="/admin/services/pages"
          >
            Service pages
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-all hover:border-[#aaa197] hover:text-[#071b3d]"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            <span>Preview website</span>
            <svg className="size-3.5 text-[#8b857e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px"
            type="button"
            onClick={() => window.location.reload()}
          >
            Refresh data
          </button>
        </div>
      </section>

      {error ? <p className="rounded-[14px] border border-[#f1c6ce] bg-[#fff8f8] px-4 py-3 text-[13px] text-[#ad3148]" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-[14px] border border-[#c6e5d3] bg-[#f2fbf5] px-4 py-3 text-[13px] text-[#29634d]" role="status">{notice}</p> : null}

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Choose main menu section">
        {sections.map((section) => {
          const selected = section.id === activeSection.id;
          return (
            <button
              className={`flex min-w-[185px] shrink-0 items-center gap-3 rounded-[18px] border p-3 text-left transition-all ${
                selected
                  ? "border-[#071b3d] bg-[#071b3d] text-white shadow-sm"
                  : "border-[#e2dcd4] bg-white text-[#071b3d] hover:border-[#c7c0b6] hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
              }`.trim()}
              type="button"
              key={section.id}
              aria-current={selected ? "page" : undefined}
              onClick={() => {
                setActiveSectionId(section.id);
                setActiveGroupId("");
                setActiveItemId("");
              }}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-[11px] text-[11px] font-bold ${
                  selected ? "bg-white/15 text-white" : toneClass(section.tone)
                }`.trim()}
              >
                {String(section.sortOrder + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold">{section.label}</span>
                <span className={`mt-0.5 block text-[11px] ${selected ? "text-white/60" : "text-[#9b958c]"}`.trim()}>
                  {section.groups.length} categories · {section.groups.reduce((total, group) => total + group.items.length, 0)} services
                </span>
              </span>
            </button>
          );
        })}
        <OutlineButton className="min-w-[140px] shrink-0" disabled={savingKey !== null} onClick={addSection}>
          <svg className="mr-1.5 size-3.5 text-[#77736e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add section
        </OutlineButton>
      </nav>

      <SectionSettings
        section={activeSection}
        saving={savingKey === `section:${activeSection.id}`}
        onChange={(patch) => updateSectionInState(activeSection.id, patch)}
        onSave={() => saveSection(activeSection)}
        canDelete={sections.length > 1}
        onDelete={() => {
          if (sections.length <= 1 || !confirmDelete(`Delete ${activeSection.label || "this section"} and all of its categories, services and links?`)) return;
          void mutate(`delete-section:${activeSection.id}`, () => deleteMenuSection(activeSection.id), `${activeSection.label || "Section"} deleted.`, (nextSections) => {
            const nextSection = nextSections[0];
            const nextGroup = nextSection?.groups[0];
            setActiveSectionId(nextSection?.id ?? "");
            setActiveGroupId(nextGroup?.id ?? "");
            setActiveItemId(nextGroup?.items[0]?.id ?? "");
          });
        }}
      />

      <section aria-labelledby="categories-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Menu structure</p>
            <h2 className="mt-2 font-brand text-[27px] font-bold tracking-[-0.04em] text-[#071b3d]" id="categories-title">Categories & services</h2>
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
            disabled={savingKey !== null}
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
                  void mutate(`delete-group:${activeGroup.id}`, () => deleteMenuGroup(activeGroup.id), `${activeGroup.label || "Category"} deleted.`, (nextSections) => {
                    const nextSection = nextSections.find((section) => section.id === activeSection.id) ?? nextSections[0];
                    const nextGroup = nextSection?.groups[0];
                    setActiveSectionId(nextSection?.id ?? "");
                    setActiveGroupId(nextGroup?.id ?? "");
                    setActiveItemId(nextGroup?.items[0]?.id ?? "");
                  });
                }}
              />

              <section className="overflow-hidden rounded-[20px] border border-[#e2dcd4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]" aria-labelledby="services-list-title">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9e2] px-4 py-3.5 sm:px-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#071b3d]" id="services-list-title">Services</h3>
                      <span className="rounded-full bg-[#f3efe9] px-2.5 py-0.5 text-[10.5px] font-bold text-[#676159]">{activeGroup.items.length}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#9b958c]">Choose a row to edit its icon, URL or links.</p>
                  </div>
                  <OutlineButton disabled={savingKey === `group:${activeGroup.id}`} onClick={() => addService(activeGroup)}>
                    <svg className="mr-1.5 size-3.5 text-[#77736e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add service
                  </OutlineButton>
                </div>
                {activeGroup.items.length ? (
                  <div className="divide-y divide-[#eee9e2]">
                    {activeGroup.items.map((item) => (
                      <ServiceRow key={item.id} item={item} active={item.id === activeItem?.id} onSelect={() => setActiveItemId(item.id)} />
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-6 text-center text-[12px] text-[#9b958c]">No services yet. Add the first service to this category.</p>
                )}
              </section>

              {activeItem ? (
                <ItemEditor
                  item={activeItem}
                  savingKey={savingKey}
                  onChange={(patch) => updateItemInState(activeSection.id, activeGroup.id, activeItem.id, patch)}
                  onSave={() => saveItem(activeItem)}
                  onDelete={() => {
                    if (!confirmDelete(`Delete ${activeItem.label || "this service"} and its sub-links?`)) return;
                    void mutate(`delete-item:${activeItem.id}`, () => deleteMenuItem(activeItem.id), `${activeItem.label || "Service"} deleted.`, (nextSections) => {
                      const nextSection = nextSections.find((section) => section.id === activeSection.id) ?? nextSections[0];
                      const nextGroup = nextSection?.groups.find((group) => group.id === activeGroup.id) ?? nextSection?.groups[0];
                      setActiveSectionId(nextSection?.id ?? "");
                      setActiveGroupId(nextGroup?.id ?? "");
                      setActiveItemId(nextGroup?.items[0]?.id ?? "");
                    });
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
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#ded8cf] bg-white px-4 py-8 text-center text-[12px] text-[#9b958c]">
                  Select a service to edit its details.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-[#ded8cf] bg-white px-4 py-8 text-center text-[12px] text-[#9b958c]">
              Add a category to start organizing this menu.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
