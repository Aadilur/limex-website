"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import { getAdminMenu, isUnauthorizedError, type AdminMenuSection } from "@/lib/menu-api";
import {
  defaultLandingContent,
  landingTestVideoUrl,
  getAdminLanding,
  isLandingConflictError,
  isLandingSafetyError,
  isUnauthorizedLandingError,
  uploadLandingLogo,
  updateLandingSection,
  withLandingFallback,
} from "@/lib/landing-api";
import { compressImageToWebp } from "@/lib/image-compression";
import type {
  ArticleItem,
  ArticlesContent,
  ClientLogo,
  ContactContent,
  FaqContent,
  FaqItem,
  FooterColumn,
  FooterContent,
  FooterLink,
  LandingContent,
  LandingSectionKey,
  LandingServiceItem,
  MetricItem,
  MetricsContent,
  PackageItem,
  PackagesContent,
  ProcessContent,
  ProcessStep,
  ServicesContent,
  TestimonialItem,
  TestimonialsContent,
  ToolItem,
  ToolsContent,
} from "@/lib/landing-types";
import { normalizeServiceIcon, IconPicker } from "./icon-picker";

type CatalogService = {
  serviceKey: string;
  title: string;
  description: string;
  href: string;
  icon: LandingServiceItem["icon"];
  filter: LandingServiceItem["filter"];
};

const sectionTabs: Array<{ key: LandingSectionKey; label: string; hint: string }> = [
  { key: "hero", label: "Hero", hint: "First impression" },
  { key: "clients", label: "Clients", hint: "Logo strip" },
  { key: "metrics", label: "Matrix", hint: "Trust figures" },
  { key: "services", label: "Services", hint: "Featured menu" },
  { key: "process", label: "How it works", hint: "Process steps" },
  { key: "testimonials", label: "Testimonials", hint: "Video stories" },
  { key: "packages", label: "Packages", hint: "Offers" },
  { key: "tools", label: "Tools", hint: "Business tools" },
  { key: "articles", label: "Articles", hint: "Journal cards" },
  { key: "faq", label: "FAQ", hint: "Questions" },
  { key: "contact", label: "Let’s talk", hint: "Contact form" },
  { key: "footer", label: "Footer", hint: "Global links" },
];

const fieldClassName = "mt-1.5 h-10 w-full rounded-[11px] border border-[#d9d3c9] bg-[#fcfbf8] px-3 text-[13px] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";
const textareaClassName = "mt-1.5 min-h-20 w-full resize-y rounded-[11px] border border-[#d9d3c9] bg-[#fcfbf8] px-3 py-2.5 text-[13px] leading-[1.45] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#777168]">
      {label}
      <input className={fieldClassName} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#777168]">
      {label}
      <textarea className={textareaClassName} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#5f5a54]">
      <input className="peer sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="relative h-5 w-9 rounded-full bg-[#d5d0c8] transition-colors peer-checked:bg-[#0055ff] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" aria-hidden="true" />
      {label}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const safeValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#071b3d";

  return (
    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#777168]">
      {label}
      <span className="mt-1.5 flex h-10 items-center gap-2 rounded-[11px] border border-[#d9d3c9] bg-[#fcfbf8] px-2">
        <input className="size-7 cursor-pointer rounded-md border-0 bg-transparent p-0" type="color" value={safeValue} onChange={(event) => onChange(event.target.value)} aria-label={label} />
        <input className="min-w-0 flex-1 border-0 bg-transparent px-1 text-[13px] uppercase text-[#242129] outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ClientLogoUpload({ item, onChange }: { item: ClientLogo; onChange: (patch: Partial<ClientLogo>) => void }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadNote, setUploadNote] = useState("");
  const [uploadError, setUploadError] = useState("");
  const inputId = `landing-client-logo-${item.id}`;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
  }, [item.logoUrl]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadNote("");
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreview;
    });

    try {
      const compressed = await compressImageToWebp(file);
      const result = await uploadLandingLogo(compressed.file);
      onChange({ logoUrl: result.url });
      setUploadNote(`Compressed ${formatBytes(compressed.originalBytes)} → ${formatBytes(result.bytes)}. Save this section to publish.`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload this logo.");
    } finally {
      setUploading(false);
    }
  }

  const preview = previewUrl || item.logoUrl;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[13px] border border-[#e8e2d9] bg-[#fcfaf7] p-2.5">
      <div className="grid size-[58px] shrink-0 place-items-center overflow-hidden rounded-[10px] border border-[#e5ded4] bg-white">
        {preview ? <img className="max-h-11 max-w-[46px] object-contain" src={preview} alt="" /> : <span className="text-[17px] font-bold text-[#a59d93]">{item.name.slice(0, 1).toUpperCase()}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <label className="inline-flex min-h-8 cursor-pointer items-center rounded-full bg-[#071b3d] px-3 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]">
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" id={inputId} onChange={handleFileChange} disabled={uploading} />
            {uploading ? "Compressing…" : preview ? "Replace logo" : "Upload logo"}
          </label>
          <span className="truncate text-[11px] text-[#8d857c]">WebP, cached by file hash</span>
        </div>
        {uploadNote ? <p className="mt-1 text-[10px] font-semibold leading-[1.35] text-[#2d7650]">{uploadNote}</p> : null}
        {uploadError ? <p className="mt-1 text-[10px] font-semibold leading-[1.35] text-[#c53e59]" role="alert">{uploadError}</p> : null}
      </div>
    </div>
  );
}

function SortableRows<T extends { id: string }>({ items, onChange, render }: { items: T[]; onChange: (items: T[]) => void; render: (item: T, index: number) => ReactNode }) {
  const [dragId, setDragId] = useState<string | null>(null);

  function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function drop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((item) => item.id === dragId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setDragId(null);
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          className={`rounded-[14px] border bg-white p-3 transition-colors ${dragId === item.id ? "border-[#0055ff] bg-[#fff8f8]" : "border-[#e4ded5]"}`.trim()}
          key={item.id}
          draggable
          onDragStart={() => setDragId(item.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => drop(item.id)}
          onDragEnd={() => setDragId(null)}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-1 cursor-grab select-none text-[17px] leading-none text-[#aaa39a]" title="Drag to reorder" aria-hidden="true">⠿</span>
            <div className="min-w-0 flex-1">{render(item, index)}</div>
            <div className="flex shrink-0 flex-row gap-1 sm:flex-col">
              <button className="grid size-6 place-items-center rounded-md border border-[#e5dfd6] text-[12px] text-[#69635d] transition-colors hover:border-[#0055ff] hover:text-[#0055ff] disabled:opacity-30" type="button" onClick={() => move(item.id, -1)} disabled={index === 0} aria-label="Move item up">↑</button>
              <button className="grid size-6 place-items-center rounded-md border border-[#e5dfd6] text-[12px] text-[#69635d] transition-colors hover:border-[#0055ff] hover:text-[#0055ff] disabled:opacity-30" type="button" onClick={() => move(item.id, 1)} disabled={index === items.length - 1} aria-label="Move item down">↓</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, description, count }: { title: string; description: string; count?: number }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-[#e6e0d7] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h2 className="font-brand text-[23px] font-bold tracking-[-0.025em] text-[#071b3d]">{title}</h2>
        <p className="mt-1 max-w-[680px] text-[13px] leading-[1.45] text-[#817a72]">{description}</p>
      </div>
      {count === undefined ? null : <span className="w-max rounded-full bg-[#f7e8ea] px-2.5 py-1 text-[11px] font-bold text-[#c63d58]">{count} items</span>}
    </div>
  );
}

function CatalogServicePicker({ value, services, onChange }: { value: string; services: CatalogService[]; onChange: (service: CatalogService) => void }) {
  return (
    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#777168]">
      Source service
      <select className={`${fieldClassName} cursor-pointer`} value={value} onChange={(event) => {
        const selected = services.find((service) => service.serviceKey === event.target.value);
        if (selected) onChange(selected);
      }}>
        <option value="">Choose from menu</option>
        {services.map((service) => <option value={service.serviceKey} key={service.serviceKey}>{service.title}</option>)}
      </select>
    </label>
  );
}

function ServiceItemEditor({ item, services, onChange }: { item: LandingServiceItem; services: CatalogService[]; onChange: (item: LandingServiceItem) => void }) {
  return (
    <div className="space-y-2.5">
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_150px]">
        <CatalogServicePicker value={item.serviceKey} services={services} onChange={(service) => onChange({ ...item, serviceKey: service.serviceKey, title: service.title, description: service.description, href: service.href, icon: service.icon, filter: service.filter })} />
        <IconPicker value={item.icon} onChange={(icon) => onChange({ ...item, icon })} />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Display title" value={item.title} onChange={(title) => onChange({ ...item, title })} />
        <Field label="Link" value={item.href} onChange={(href) => onChange({ ...item, href })} />
      </div>
      <TextAreaField label="Description" value={item.description} onChange={(description) => onChange({ ...item, description })} />
      <Toggle label="Show on landing page" checked={item.isVisible} onChange={(isVisible) => onChange({ ...item, isVisible })} />
    </div>
  );
}

function AddBar({ label, options, onAdd }: { label: string; options?: Array<{ value: string; label: string }>; onAdd: (value?: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-dashed border-[#d7d0c6] bg-[#fcfaf6] p-3 sm:flex-row sm:items-center">
      {options ? (
        <select className={`${fieldClassName} mt-0 flex-1 cursor-pointer`} value={value} onChange={(event) => setValue(event.target.value)}>
          <option value="">{label}</option>
          {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      ) : <span className="flex-1 text-[12px] font-semibold text-[#776f66]">{label}</span>}
      <button className="min-h-10 rounded-[10px] bg-[#071b3d] px-3.5 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={Boolean(options && !value)} onClick={() => { onAdd(value || undefined); setValue(""); }}>Add</button>
    </div>
  );
}

function updateById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

function parseLinks(value: string, prefix: string): FooterLink[] {
  return value.split("\n").map((line, index) => {
    const [label, ...hrefParts] = line.split("|");
    return { id: `${prefix}-${index + 1}`, isVisible: true, label: (label ?? "").trim(), href: hrefParts.join("|").trim() || "#top" };
  }).filter((link) => link.label);
}

function linksToText(links: FooterLink[]) {
  return links.filter((link) => link.isVisible).map((link) => `${link.label} | ${link.href}`).join("\n");
}

export function LandingModule() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [menu, setMenu] = useState<AdminMenuSection[]>([]);
  const [activeSection, setActiveSection] = useState<LandingSectionKey>("hero");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminLanding(), getAdminMenu()])
      .then(([landing, menuData]) => {
        if (cancelled) return;
        setContent(withLandingFallback(landing.content));
        setUpdatedAt(landing.updatedAt);
        setMenu(menuData);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        if (isUnauthorizedLandingError(requestError) || isUnauthorizedError(requestError)) {
          window.location.assign("/admin/login");
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Unable to load landing content.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo<CatalogService[]>(() => {
    const filterMap: Record<string, LandingServiceItem["filter"]> = {
      "Startup & Licensing": "Startup",
      "IP & Trademark": "Trademark",
      "Compliance & Documentation": "Tax & compliance",
      "Business Tools": "Business tools",
    };
    const values = menu.flatMap((section) => (section.groups ?? []).flatMap((group) => group.items.map((item) => ({
      serviceKey: item.label,
      title: item.label,
      description: item.description,
      href: item.href,
      icon: normalizeServiceIcon(item.icon),
      filter: filterMap[section.label] ?? "Startup",
    }))));
    const fallback = defaultLandingContent.services.items.map((item) => ({ serviceKey: item.serviceKey, title: item.title, description: item.description, href: item.href, icon: item.icon, filter: item.filter }));
    return Array.from(new Map([...values, ...fallback].map((service) => [service.serviceKey, service])).values());
  }, [menu]);

  function editSection<K extends LandingSectionKey>(section: K, patch: Partial<LandingContent[K]>) {
    setContent((current) => current ? { ...current, [section]: { ...current[section], ...patch } } as LandingContent : current);
    setMessage("");
  }

  async function saveSection() {
    if (!content || !updatedAt) {
      setError("Landing content is still loading. Refresh the editor before saving.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const next = await updateLandingSection(activeSection, content[activeSection], updatedAt);
      setContent(withLandingFallback(next.content));
      setUpdatedAt(next.updatedAt);
      setMessage("Saved");
    } catch (saveError) {
      if (isUnauthorizedLandingError(saveError) || isUnauthorizedError(saveError)) {
        window.location.assign("/admin/login");
        return;
      }
      if (isLandingConflictError(saveError)) {
        setError("This section changed in another session. Your edits were not saved; refresh before trying again.");
      } else if (isLandingSafetyError(saveError)) {
        setError("This update looks incomplete, so it was not saved. Refresh the section and try again.");
      } else {
        setError(saveError instanceof Error ? saveError.message : "Unable to save this section.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e3ddd4] bg-white"><p className="text-[13px] font-semibold text-[#777168]">Loading landing workspace…</p></div>;
  }

  if (!content) {
    return <div className="rounded-[24px] border border-[#f0c7ce] bg-[#fff8f8] p-5 text-[13px] font-semibold text-[#c53e59]">{error || "Landing content is unavailable."}</div>;
  }

  const hero = content.hero;
  const clients = content.clients;
  const metrics = content.metrics;
  const services = content.services;
  const process = content.process;
  const testimonials = content.testimonials;
  const packages = content.packages;
  const tools = content.tools;
  const articles = content.articles;
  const faq = content.faq;
  const contact = content.contact;
  const footer = content.footer;

  function renderEditor() {
    switch (activeSection) {
      case "hero":
        return <HeroEditor content={hero} services={catalog} onChange={(patch) => editSection("hero", patch)} />;
      case "clients":
        return <ClientsEditor content={clients} onChange={(patch) => editSection("clients", patch)} />;
      case "metrics":
        return <MetricsEditor content={metrics} onChange={(patch) => editSection("metrics", patch)} />;
      case "services":
        return <ServicesEditor content={services} services={catalog} onChange={(patch) => editSection("services", patch)} />;
      case "process":
        return <ProcessEditor content={process} onChange={(patch) => editSection("process", patch)} />;
      case "testimonials":
        return <TestimonialsEditor content={testimonials} onChange={(patch) => editSection("testimonials", patch)} />;
      case "packages":
        return <PackagesEditor content={packages} onChange={(patch) => editSection("packages", patch)} />;
      case "tools":
        return <ToolsEditor content={tools} onChange={(patch) => editSection("tools", patch)} />;
      case "articles":
        return <ArticlesEditor content={articles} onChange={(patch) => editSection("articles", patch)} />;
      case "faq":
        return <FaqEditor content={faq} onChange={(patch) => editSection("faq", patch)} />;
      case "contact":
        return <ContactEditor content={contact} onChange={(patch) => editSection("contact", patch)} />;
      case "footer":
        return <FooterEditor content={footer} onChange={(patch) => editSection("footer", patch)} />;
    }
  }

  const activeTab = sectionTabs.find((tab) => tab.key === activeSection)!;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Landing</p>
          <h1 className="mt-1 font-brand text-[32px] font-bold tracking-[-0.04em] text-[#071b3d]">Shape the public page.</h1>
          <p className="mt-1 max-w-[650px] text-[13px] leading-[1.5] text-[#817a72]">Manage each section independently. Drag rows to reorder, choose services from the live menu, then save the active section.</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {message ? <span className="min-w-0 flex-1 rounded-full bg-[#e4f4e9] px-3 py-2 text-center text-[12px] font-bold text-[#2d7650] sm:flex-none">{message}</span> : null}
          <button className="min-h-11 w-full rounded-full bg-[#071b3d] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(20,19,28,0.14)] transition-all hover:-translate-y-0.5 hover:bg-[#0055ff] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" type="button" onClick={() => void saveSection()} disabled={saving || !updatedAt}>{saving ? "Saving…" : `Save ${activeTab.label}`}</button>
        </div>
      </div>

      {error ? <p className="rounded-[12px] border border-[#f0c7ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] font-semibold text-[#c53e59]" role="alert">{error}</p> : null}

      <div className="overflow-hidden rounded-[22px] border border-[#e3ddd4] bg-white shadow-[0_10px_30px_rgba(64,52,43,0.04)]">
        <div className="hidden gap-1 overflow-x-auto border-b border-[#e9e3db] bg-[#fcfaf7] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex" role="tablist" aria-label="Landing sections">
          {sectionTabs.map((tab) => (
            <button className={`min-w-max rounded-[12px] px-3 py-2 text-left transition-colors ${activeSection === tab.key ? "bg-[#071b3d] text-white" : "text-[#6f6961] hover:bg-white hover:text-[#071b3d]"}`.trim()} type="button" role="tab" aria-selected={activeSection === tab.key} onClick={() => { setActiveSection(tab.key); setMessage(""); setError(""); }} key={tab.key}>
              <span className="block text-[12px] font-bold">{tab.label}</span>
              <span className={`mt-0.5 block text-[10px] ${activeSection === tab.key ? "text-white/60" : "text-[#a19a91]"}`.trim()}>{tab.hint}</span>
            </button>
          ))}
        </div>
        <div className="border-b border-[#e9e3db] bg-[#fcfaf7] p-3 sm:hidden">
          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#777168]" htmlFor="landing-section-select">Edit section</label>
          <select
            id="landing-section-select"
            className={`${fieldClassName} mt-1 cursor-pointer bg-white`}
            value={activeSection}
            onChange={(event) => { setActiveSection(event.target.value as LandingSectionKey); setMessage(""); setError(""); }}
            aria-label="Choose a landing section"
          >
            {sectionTabs.map((tab) => <option value={tab.key} key={tab.key}>{tab.label} · {tab.hint}</option>)}
          </select>
        </div>
        <div className="p-3 sm:p-6 lg:p-8">{renderEditor()}</div>
      </div>
    </div>
  );
}

function HeroEditor({ content, services, onChange }: { content: LandingContent["hero"]; services: CatalogService[]; onChange: (patch: Partial<LandingContent["hero"]>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Hero" description="Control the first message, calls to action and popular services shown inside the hero." count={content.featuredServices.length} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Desktop eyebrow" value={content.eyebrow} onChange={(eyebrow) => onChange({ eyebrow })} />
        <Field label="Mobile eyebrow" value={content.mobileEyebrow} onChange={(mobileEyebrow) => onChange({ mobileEyebrow })} />
        <Field label="Primary title" value={content.titlePrimary} onChange={(titlePrimary) => onChange({ titlePrimary })} />
        <Field label="Secondary title" value={content.titleSecondary} onChange={(titleSecondary) => onChange({ titleSecondary })} />
      </div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary CTA label" value={content.primaryCtaLabel} onChange={(primaryCtaLabel) => onChange({ primaryCtaLabel })} />
        <Field label="Primary CTA link" value={content.primaryCtaHref} onChange={(primaryCtaHref) => onChange({ primaryCtaHref })} />
        <Field label="Secondary CTA label" value={content.secondaryCtaLabel} onChange={(secondaryCtaLabel) => onChange({ secondaryCtaLabel })} />
        <Field label="Secondary CTA link" value={content.secondaryCtaHref} onChange={(secondaryCtaHref) => onChange({ secondaryCtaHref })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3"><h3 className="text-[13px] font-bold text-[#29252a]">Popular services</h3><span className="text-[11px] text-[#918980]">Drag to reorder</span></div>
        <SortableRows items={content.featuredServices} onChange={(featuredServices) => onChange({ featuredServices })} render={(item) => <ServiceItemEditor item={item} services={services} onChange={(next) => onChange({ featuredServices: updateById(content.featuredServices, item.id, next) })} />} />
        <AddBar label="Choose a service to feature" options={services.filter((service) => !content.featuredServices.some((item) => item.serviceKey === service.serviceKey)).map((service) => ({ value: service.serviceKey, label: service.title }))} onAdd={(serviceKey) => {
          const service = services.find((item) => item.serviceKey === serviceKey);
          if (!service) return;
          onChange({ featuredServices: [...content.featuredServices, { id: uid("hero-service"), isVisible: true, ...service }] });
        }} />
      </div>
    </div>
  );
}

function ClientsEditor({ content, onChange }: { content: LandingContent["clients"]; onChange: (patch: Partial<LandingContent["clients"]>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Our clients" description="Manage the title, upload optimized logos and choose the mark color used on the public page." count={content.logos.length} />
      <Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} />
      <SortableRows items={content.logos} onChange={(logos) => onChange({ logos })} render={(item) => <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
          <div className="min-w-0">
            <ClientLogoUpload item={item} onChange={(patch) => onChange({ logos: updateById(content.logos, item.id, patch) })} />
            <div className="mt-2.5"><Field label="Client name" value={item.name} onChange={(name) => onChange({ logos: updateById(content.logos, item.id, { name }) })} /></div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Image URL (optional)" value={item.logoUrl} onChange={(logoUrl) => onChange({ logos: updateById(content.logos, item.id, { logoUrl }) })} placeholder="Upload a logo or paste a URL" />
            <ColorField label="Text color" value={item.textColor} onChange={(textColor) => onChange({ logos: updateById(content.logos, item.id, { textColor }) })} />
          </div>
        </div>
        <Toggle label="Visible on public page" checked={item.isVisible} onChange={(isVisible) => onChange({ logos: updateById(content.logos, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add client logo" onAdd={() => onChange({ logos: [...content.logos, { id: uid("client"), isVisible: true, name: "New client", logoUrl: "", textColor: "#071b3d" }] })} />
    </div>
  );
}

function MetricsEditor({ content, onChange }: { content: MetricsContent; onChange: (patch: Partial<MetricsContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Limex standard" description="Edit the trust figures shown beneath the client strip." count={content.items.length} />
      <Field label="Accessible section title" value={content.title} onChange={(title) => onChange({ title })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-[150px_1fr]">
        <Field label="Value" value={item.value} onChange={(value) => onChange({ items: updateById(content.items, item.id, { value }) })} />
        <Field label="Label" value={item.label} onChange={(label) => onChange({ items: updateById(content.items, item.id, { label }) })} />
        <Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add metric" onAdd={() => onChange({ items: [...content.items, { id: uid("metric"), isVisible: true, value: "0", label: "New metric" }] })} />
    </div>
  );
}

function ServicesEditor({ content, services, onChange }: { content: ServicesContent; services: CatalogService[]; onChange: (patch: Partial<ServicesContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Featured services" description="Choose from the existing mega-menu service catalog, then drag cards into the order visitors should see." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} />
        <Field label="CTA label" value={content.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} />
        <Field label="CTA link" value={content.ctaHref} onChange={(ctaHref) => onChange({ ctaHref })} />
      </div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <ServiceItemEditor item={item} services={services} onChange={(next) => onChange({ items: updateById(content.items, item.id, next) })} />} />
      <AddBar label="Choose a service to add" options={services.filter((service) => !content.items.some((item) => item.serviceKey === service.serviceKey)).map((service) => ({ value: service.serviceKey, label: service.title }))} onAdd={(serviceKey) => {
        const service = services.find((item) => item.serviceKey === serviceKey);
        if (service) onChange({ items: [...content.items, { id: uid("featured-service"), isVisible: true, ...service }] });
      }} />
    </div>
  );
}

function ProcessEditor({ content, onChange }: { content: ProcessContent; onChange: (patch: Partial<ProcessContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="How it works" description="Keep the process concise and reorder the steps to match your workflow." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} />
        <Field label="Helper eyebrow" value={content.helperEyebrow} onChange={(helperEyebrow) => onChange({ helperEyebrow })} />
        <Field label="Helper title" value={content.helperTitle} onChange={(helperTitle) => onChange({ helperTitle })} />
        <Field label="Helper CTA label" value={content.helperCtaLabel} onChange={(helperCtaLabel) => onChange({ helperCtaLabel })} />
        <Field label="Helper CTA link" value={content.helperCtaHref} onChange={(helperCtaHref) => onChange({ helperCtaHref })} />
      </div>
      <TextAreaField label="Section description" value={content.description} onChange={(description) => onChange({ description })} />
      <TextAreaField label="Helper description" value={content.helperDescription} onChange={(helperDescription) => onChange({ helperDescription })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-[70px_1fr]">
        <Field label="Number" value={item.number} onChange={(number) => onChange({ items: updateById(content.items, item.id, { number }) })} />
        <Field label="Title" value={item.title} onChange={(title) => onChange({ items: updateById(content.items, item.id, { title }) })} />
        <div className="sm:col-span-2"><TextAreaField label="Description" value={item.description} onChange={(description) => onChange({ items: updateById(content.items, item.id, { description }) })} /></div>
        <Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add process step" onAdd={() => onChange({ items: [...content.items, { id: uid("step"), isVisible: true, number: String(content.items.length + 1).padStart(2, "0"), title: "New step", description: "Describe this step." }] })} />
    </div>
  );
}

function TestimonialsEditor({ content, onChange }: { content: TestimonialsContent; onChange: (patch: Partial<TestimonialsContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Video testimonials" description="Add a YouTube URL for inline playback, or keep an image-only story card. A sample playback link is ready to test the player." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} /></div>
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Title" value={item.title} onChange={(title) => onChange({ items: updateById(content.items, item.id, { title }) })} />
        <Field label="Subtitle / metadata" value={item.subtitle} onChange={(subtitle) => onChange({ items: updateById(content.items, item.id, { subtitle }) })} />
        <div className="min-w-0">
          <Field label="YouTube URL" value={item.youtubeUrl} onChange={(youtubeUrl) => onChange({ items: updateById(content.items, item.id, { youtubeUrl }) })} placeholder="https://youtube.com/watch?v=" />
          {!item.youtubeUrl ? <button className="mt-2 text-[12px] font-semibold text-[#355b45] underline underline-offset-4 hover:text-[#0055ff]" type="button" onClick={() => onChange({ items: updateById(content.items, item.id, { youtubeUrl: landingTestVideoUrl }) })}>Use sample playback link ↗</button> : null}
        </div>
        <Field label="Fallback image URL" value={item.imageUrl} onChange={(imageUrl) => onChange({ items: updateById(content.items, item.id, { imageUrl }) })} placeholder="/figma/reel-1.png" />
        <Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add testimonial" onAdd={() => onChange({ items: [...content.items, { id: uid("testimonial"), isVisible: true, imageUrl: "", title: "New customer story", subtitle: "Video story", youtubeUrl: "" }] })} />
    </div>
  );
}

function PackagesEditor({ content, onChange }: { content: PackagesContent; onChange: (patch: Partial<PackagesContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Packages" description="Manage offer cards, pricing, features and their destination links." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="Custom-plan label" value={content.customPlanLabel} onChange={(customPlanLabel) => onChange({ customPlanLabel })} /><Field label="Custom CTA label" value={content.customPlanCtaLabel} onChange={(customPlanCtaLabel) => onChange({ customPlanCtaLabel })} /><Field label="Custom CTA link" value={content.customPlanCtaHref} onChange={(customPlanCtaHref) => onChange({ customPlanCtaHref })} /></div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Tag" value={item.tag} onChange={(tag) => onChange({ items: updateById(content.items, item.id, { tag }) })} /><Field label="Title" value={item.title} onChange={(title) => onChange({ items: updateById(content.items, item.id, { title }) })} />
        <Field label="Price" value={item.price} onChange={(price) => onChange({ items: updateById(content.items, item.id, { price }) })} /><Field label="Card link" value={item.href} onChange={(href) => onChange({ items: updateById(content.items, item.id, { href }) })} />
        <Field label="Card action" value={item.action} onChange={(action) => onChange({ items: updateById(content.items, item.id, { action }) })} /><ColorField label="Accent color" value={item.color} onChange={(color) => onChange({ items: updateById(content.items, item.id, { color }) })} />
        <div className="sm:col-span-2"><TextAreaField label="Description" value={item.description} onChange={(description) => onChange({ items: updateById(content.items, item.id, { description }) })} /></div>
        <div className="sm:col-span-2"><TextAreaField label="Features — one per line" value={item.features.join("\n")} onChange={(value) => onChange({ items: updateById(content.items, item.id, { features: value.split("\n").map((feature) => feature.trim()).filter(Boolean) }) })} /></div>
        <Toggle label="Recommended" checked={item.isFeatured} onChange={(isFeatured) => onChange({ items: updateById(content.items, item.id, { isFeatured }) })} /><Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add package" onAdd={() => onChange({ items: [...content.items, { id: uid("package"), isVisible: true, tag: "NEW", title: "New package", description: "Describe this package.", price: "From BDT", features: ["Feature one"], color: "#008cff", surface: "#eaf3ff", href: "#contact", action: "View package", isFeatured: false }] })} />
    </div>
  );
}

function ToolsEditor({ content, onChange }: { content: ToolsContent; onChange: (patch: Partial<ToolsContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Business tools" description="Edit and reorder the homepage cards here. The catalogue is kept in sync with every calculator and document builder; fees, rules and requests are managed in Business tools." count={content.items.length} />
      <a href="/admin/tools" className="inline-block text-[13px] font-semibold text-[#006dce] underline underline-offset-4">Manage fees & requests ↗</a>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="CTA label" value={content.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} /><Field label="CTA link" value={content.ctaHref} onChange={(ctaHref) => onChange({ ctaHref })} /></div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Title" value={item.title} onChange={(title) => onChange({ items: updateById(content.items, item.id, { title }) })} />
        <Field label="Link" value={item.href} onChange={(href) => onChange({ items: updateById(content.items, item.id, { href }) })} />
        <div className="sm:col-span-2"><TextAreaField label="Description" value={item.description} onChange={(description) => onChange({ items: updateById(content.items, item.id, { description }) })} /></div>
        <Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
    </div>
  );
}

function ArticlesEditor({ content, onChange }: { content: ArticlesContent; onChange: (patch: Partial<ArticlesContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Journal cards" description="Choose the title, subtitle and destination for each landing-page article preview." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="CTA label" value={content.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} /><Field label="CTA link" value={content.ctaHref} onChange={(ctaHref) => onChange({ ctaHref })} /></div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Title" value={item.title} onChange={(title) => onChange({ items: updateById(content.items, item.id, { title }) })} /><Field label="Subtitle" value={item.subtitle} onChange={(subtitle) => onChange({ items: updateById(content.items, item.id, { subtitle }) })} />
        <Field label="Slug" value={item.slug} onChange={(slug) => onChange({ items: updateById(content.items, item.id, { slug, href: `/blog/${slug}` }) })} /><Field label="Link" value={item.href} onChange={(href) => onChange({ items: updateById(content.items, item.id, { href }) })} />
        <Field label="Date" value={item.date} onChange={(date) => onChange({ items: updateById(content.items, item.id, { date }) })} /><Field label="Read time" value={item.readTime} onChange={(readTime) => onChange({ items: updateById(content.items, item.id, { readTime }) })} />
        <Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} />
      </div>} />
      <AddBar label="Add article card" onAdd={() => onChange({ items: [...content.items, { id: uid("article"), isVisible: true, slug: "new-article", category: "Guide", date: "TODAY", readTime: "5 MIN READ", title: "New article", subtitle: "Add a useful summary.", coverTone: "mint", coverNumber: "04", media: "image", href: "/blog/new-article" }] })} />
    </div>
  );
}

function FaqEditor({ content, onChange }: { content: FaqContent; onChange: (patch: Partial<FaqContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="FAQ" description="Keep answers direct and reorder the questions by importance." count={content.items.length} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="CTA label" value={content.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} /><Field label="CTA link" value={content.ctaHref} onChange={(ctaHref) => onChange({ ctaHref })} /></div>
      <TextAreaField label="Description" value={content.description} onChange={(description) => onChange({ description })} />
      <SortableRows items={content.items} onChange={(items) => onChange({ items })} render={(item) => <div className="space-y-2.5"><Field label="Question" value={item.question} onChange={(question) => onChange({ items: updateById(content.items, item.id, { question }) })} /><TextAreaField label="Answer" value={item.answer} onChange={(answer) => onChange({ items: updateById(content.items, item.id, { answer }) })} /><Toggle label="Visible" checked={item.isVisible} onChange={(isVisible) => onChange({ items: updateById(content.items, item.id, { isVisible }) })} /></div>} />
      <AddBar label="Add FAQ" onAdd={() => onChange({ items: [...content.items, { id: uid("faq"), isVisible: true, question: "New question", answer: "Add a clear answer." }] })} />
    </div>
  );
}

function ContactEditor({ content, onChange }: { content: ContactContent; onChange: (patch: Partial<ContactContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Let’s talk" description="Tune the contact section copy and the small pieces of guidance around the form." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Section title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="Start eyebrow" value={content.startEyebrow} onChange={(startEyebrow) => onChange({ startEyebrow })} />
        <Field label="Direct-line label" value={content.directLineLabel} onChange={(directLineLabel) => onChange({ directLineLabel })} /><Field label="Direct CTA label" value={content.directCtaLabel} onChange={(directCtaLabel) => onChange({ directCtaLabel })} />
        <Field label="WhatsApp" value={content.whatsapp} onChange={(whatsapp) => onChange({ whatsapp })} /><Field label="Email" value={content.email} onChange={(email) => onChange({ email })} />
        <Field label="Form eyebrow" value={content.formEyebrow} onChange={(formEyebrow) => onChange({ formEyebrow })} /><Field label="Form title" value={content.formTitle} onChange={(formTitle) => onChange({ formTitle })} />
        <Field label="Submit label" value={content.submitLabel} onChange={(submitLabel) => onChange({ submitLabel })} /><Field label="Privacy note" value={content.privacyNote} onChange={(privacyNote) => onChange({ privacyNote })} />
      </div>
      <TextAreaField label="Section description" value={content.description} onChange={(description) => onChange({ description })} /><TextAreaField label="Start description" value={content.startDescription} onChange={(startDescription) => onChange({ startDescription })} /><TextAreaField label="Form description" value={content.formDescription} onChange={(formDescription) => onChange({ formDescription })} />
      <div className="grid gap-3 sm:grid-cols-2"><TextAreaField label="Service helper" value={content.serviceHelper} onChange={(serviceHelper) => onChange({ serviceHelper })} /><TextAreaField label="Phone/email helper" value={content.contactMethodHelper} onChange={(contactMethodHelper) => onChange({ contactMethodHelper })} /><TextAreaField label="Schedule helper" value={content.scheduleHelper} onChange={(scheduleHelper) => onChange({ scheduleHelper })} /><TextAreaField label="Success note" value={content.submittedNote} onChange={(submittedNote) => onChange({ submittedNote })} /></div>
    </div>
  );
}

function FooterEditor({ content, onChange }: { content: FooterContent; onChange: (patch: Partial<FooterContent>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Global footer" description="This content is reused by the landing page and the other public pages." count={content.columns.length} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Tagline" value={content.tagline} onChange={(tagline) => onChange({ tagline })} /><Field label="Footer title" value={content.title} onChange={(title) => onChange({ title })} /><Field label="CTA label" value={content.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} /><Field label="CTA link" value={content.ctaHref} onChange={(ctaHref) => onChange({ ctaHref })} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Contact heading" value={content.contactTitle} onChange={(contactTitle) => onChange({ contactTitle })} /><Field label="Email" value={content.contactEmail} onChange={(contactEmail) => onChange({ contactEmail })} /><Field label="Phone" value={content.contactPhone} onChange={(contactPhone) => onChange({ contactPhone })} /><Field label="Location" value={content.location} onChange={(location) => onChange({ location })} /><Field label="Copyright" value={content.copyright} onChange={(copyright) => onChange({ copyright })} /></div>
      <SortableRows items={content.columns} onChange={(columns) => onChange({ columns })} render={(column) => <div className="space-y-2.5"><Field label="Column title" value={column.title} onChange={(title) => onChange({ columns: updateById(content.columns, column.id, { title }) })} /><TextAreaField label="Links — label | href per line" value={linksToText(column.links)} onChange={(value) => onChange({ columns: updateById(content.columns, column.id, { links: parseLinks(value, column.id) }) })} /><Toggle label="Visible" checked={column.isVisible} onChange={(isVisible) => onChange({ columns: updateById(content.columns, column.id, { isVisible }) })} /></div>} />
      <TextAreaField label="Legal links — label | href per line" value={linksToText(content.legalLinks)} onChange={(value) => onChange({ legalLinks: parseLinks(value, "legal") })} />
      <AddBar label="Add footer column" onAdd={() => onChange({ columns: [...content.columns, { id: uid("footer-column"), isVisible: true, title: "NEW COLUMN", links: [] }] })} />
    </div>
  );
}
