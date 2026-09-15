"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  getAdminMenu,
  isUnauthorizedError,
  type AdminMenuSection,
} from "@/lib/menu-api";
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

export const sectionGroups: Array<{
  name: string;
  tabs: Array<{ key: LandingSectionKey; label: string; hint: string }>;
}> = [
  {
    name: "Top of Page",
    tabs: [
      { key: "hero", label: "Hero", hint: "First impression" },
      { key: "clients", label: "Clients", hint: "Logo strip" },
      { key: "metrics", label: "Metrics", hint: "Trust figures" },
    ],
  },
  {
    name: "Core Highlights",
    tabs: [
      { key: "services", label: "Services", hint: "Featured services" },
      { key: "process", label: "How it works", hint: "Process steps" },
      { key: "packages", label: "Packages", hint: "Offers & pricing" },
    ],
  },
  {
    name: "Proof & Media",
    tabs: [
      { key: "testimonials", label: "Testimonials", hint: "Video stories" },
      { key: "articles", label: "Articles", hint: "Journal cards" },
      { key: "tools", label: "Tools", hint: "Business tools" },
    ],
  },
  {
    name: "Conversion & Site",
    tabs: [
      { key: "faq", label: "FAQ", hint: "Common questions" },
      { key: "contact", label: "Let's talk", hint: "Contact form" },
      { key: "footer", label: "Footer", hint: "Global links" },
    ],
  },
];

export const sectionTabs = sectionGroups.flatMap((group) => group.tabs);

const fieldClassName =
  "h-11 w-full rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] px-3.5 text-[13px] text-[#1c191d] shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a8a197] hover:border-[#bfb7ab] focus:border-[#0055ff] focus:bg-white focus:ring-4 focus:ring-[#008cff]/10";

const textareaClassName =
  "min-h-[104px] w-full resize-y rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] px-3.5 py-3 text-[13px] leading-[1.6] text-[#1c191d] shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a8a197] hover:border-[#bfb7ab] focus:border-[#0055ff] focus:bg-white focus:ring-4 focus:ring-[#008cff]/10";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className="flex items-center justify-between text-[12px] font-semibold text-[#37332d]">
        <span>{label}</span>
        {hint ? (
          <span className="text-[11px] font-normal text-[#9b958c]">{hint}</span>
        ) : null}
      </span>
      <input
        className={`${fieldClassName} mt-1.5`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className="flex items-center justify-between text-[12px] font-semibold text-[#37332d]">
        <span>{label}</span>
        {hint ? (
          <span className="text-[11px] font-normal text-[#9b958c]">{hint}</span>
        ) : null}
      </span>
      <textarea
        className={`${textareaClassName} mt-1.5`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2.5">
      <input
        className="peer sr-only"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className="relative h-[22px] w-[40px] shrink-0 rounded-full bg-[#d5d0c8] transition-colors focus-within:ring-4 focus-within:ring-[#008cff]/10 peer-checked:bg-[#0055ff] after:absolute after:left-[2px] after:top-[2px] after:size-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.15)] after:transition-transform peer-checked:after:translate-x-[18px]"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-[#37332d]">
          {label}
        </span>
        {description ? (
          <span className="block text-[11px] text-[#9b958c]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#071b3d";

  return (
    <label className="block min-w-0">
      <span className="text-[12px] font-semibold text-[#37332d]">{label}</span>
      <span className="mt-1.5 flex h-11 items-center gap-2.5 rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] px-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors focus-within:border-[#0055ff] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#008cff]/10">
        <span
          className="size-6 shrink-0 rounded-full border border-black/10 shadow-inner"
          style={{ backgroundColor: safeValue }}
        />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-mono uppercase text-[#1c191d] outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#071B3D"
        />
        <input
          className="size-6 cursor-pointer rounded-md border-0 bg-transparent p-0"
          type="color"
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        />
      </span>
    </label>
  );
}

function FormGroupCard({
  title,
  description,
  badge,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#e5dfd5] bg-white p-5 shadow-[0_2px_8px_rgba(30,25,20,0.03)] sm:p-6 ${className}`.trim()}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2 border-b border-[#f0ebe3] pb-3.5">
        <div>
          <h3 className="text-[14px] font-bold tracking-[-0.01em] text-[#071b3d]">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-[12px] leading-normal text-[#817a72]">
              {description}
            </p>
          ) : null}
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ClientLogoUpload({
  item,
  onChange,
}: {
  item: ClientLogo;
  onChange: (patch: Partial<ClientLogo>) => void;
}) {
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
      setUploadNote(
        `Compressed ${formatBytes(compressed.originalBytes)} → ${formatBytes(result.bytes)}. Save section to publish.`,
      );
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload this logo.",
      );
    } finally {
      setUploading(false);
    }
  }

  const preview = previewUrl || item.logoUrl;

  return (
    <div className="flex min-w-0 items-center gap-3.5 rounded-[14px] border border-[#e5dfd5] bg-[#faf8f5] p-3">
      <div className="grid size-[64px] shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[#e2dcce] bg-white shadow-sm">
        {preview ? (
          <img
            className="max-h-12 max-w-[52px] object-contain"
            src={preview}
            alt=""
          />
        ) : (
          <span className="text-[20px] font-bold text-[#b0a89d]">
            {item.name.slice(0, 1).toUpperCase()}
            {(item.name?.trim() || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <label className="inline-flex min-h-8 cursor-pointer items-center rounded-full bg-[#071b3d] px-3.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#0055ff]">
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              id={inputId}
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading
              ? "Compressing…"
              : preview
                ? "Replace logo"
                : "Upload logo"}
          </label>
          <span className="truncate text-[11px] text-[#8d857c]">
            WebP auto-compression
          </span>
        </div>
        {uploadNote ? (
          <p className="mt-1 text-[11px] font-semibold text-[#2d7650]">
            {uploadNote}
          </p>
        ) : null}
        {uploadError ? (
          <p
            className="mt-1 text-[11px] font-semibold text-[#c53e59]"
            role="alert"
          >
            {uploadError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SortableRows<T extends { id: string }>({
  items,
  onChange,
  onRemove,
  render,
  itemTitle,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  onRemove?: (id: string) => void;
  render: (item: T, index: number) => ReactNode;
  itemTitle?: (item: T, index: number) => string;
}) {
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
    <div className="space-y-3">
      {items.map((item, index) => {
        const title = itemTitle
          ? itemTitle(item, index)
          : `Item ${String(index + 1).padStart(2, "0")}`;
        return (
          <div
            className={`overflow-hidden rounded-[16px] border bg-[#fffefa] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
              dragId === item.id
                ? "border-[#0055ff] ring-2 ring-[#0055ff]/10 bg-[#f8fbff]"
                : "border-[#e5dfd5] hover:border-[#cfc7bc]"
            }`.trim()}
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => drop(item.id)}
            onDragEnd={() => setDragId(null)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#f0ebe3] bg-[#fcfaf7] px-4 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="cursor-grab select-none text-[18px] leading-none text-[#b5ada2] hover:text-[#071b3d] transition-colors"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  ⠿
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eee7dd] text-[10px] font-bold text-[#635c52]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[13px] font-bold text-[#242129]">
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="grid size-7 place-items-center rounded-lg border border-[#e2dcce] bg-white text-[12px] text-[#69635d] transition-all hover:border-[#0055ff] hover:text-[#0055ff] hover:bg-[#f3f8ff] disabled:opacity-25 disabled:hover:border-[#e2dcce] disabled:hover:text-[#69635d] disabled:hover:bg-white"
                  type="button"
                  onClick={() => move(item.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${title} up`}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="grid size-7 place-items-center rounded-lg border border-[#e2dcce] bg-white text-[12px] text-[#69635d] transition-all hover:border-[#0055ff] hover:text-[#0055ff] hover:bg-[#f3f8ff] disabled:opacity-25 disabled:hover:border-[#e2dcce] disabled:hover:text-[#69635d] disabled:hover:bg-white"
                  type="button"
                  onClick={() => move(item.id, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${title} down`}
                  title="Move down"
                >
                  ↓
                </button>
                {onRemove ? (
                  <button
                    className="ml-1 grid size-7 place-items-center rounded-lg border border-transparent text-[#9e4453] transition-all hover:border-[#f3cdd4] hover:bg-[#fff0f2] hover:text-[#c53e59]"
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${title}`}
                    title="Remove item"
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 6h12M8 6V4h4v2M6 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
            <div className="p-4 sm:p-5">{render(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="mb-6 flex flex-col gap-1.5 border-b border-[#ece6dc] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h2 className="font-brand text-[24px] font-bold tracking-[-0.03em] text-[#071b3d]">
          {title}
        </h2>
        <p className="mt-1 max-w-[680px] text-[13px] leading-[1.5] text-[#706a62]">
          {description}
        </p>
      </div>
      {count === undefined ? null : (
        <span className="w-max shrink-0 rounded-full bg-[#f3ede3] px-3 py-1 text-[11px] font-bold text-[#5c5448]">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}

function CatalogServicePicker({
  value,
  services,
  onChange,
}: {
  value: string;
  services: CatalogService[];
  onChange: (service: CatalogService) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-[12px] font-semibold text-[#37332d]">
        Source service from menu
      </span>
      <select
        className={`${fieldClassName} mt-1.5 cursor-pointer`}
        value={value}
        onChange={(event) => {
          const selected = services.find(
            (service) => service.serviceKey === event.target.value,
          );
          if (selected) onChange(selected);
        }}
      >
        <option value="">Choose from catalog…</option>
        {services.map((service) => (
          <option value={service.serviceKey} key={service.serviceKey}>
            {service.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function ServiceItemEditor({
  item,
  services,
  onChange,
}: {
  item: LandingServiceItem;
  services: CatalogService[];
  onChange: (item: LandingServiceItem) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
        <CatalogServicePicker
          value={item.serviceKey}
          services={services}
          onChange={(service) =>
            onChange({
              ...item,
              serviceKey: service.serviceKey,
              title: service.title,
              description: service.description,
              href: service.href,
              icon: service.icon,
              filter: service.filter,
            })
          }
        />
        <div>
          <span className="mb-1.5 block text-[12px] font-semibold text-[#37332d]">
            Icon
          </span>
          <IconPicker
            value={item.icon}
            onChange={(icon) => onChange({ ...item, icon })}
          />
        </div>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label="Display title"
          value={item.title}
          onChange={(title) => onChange({ ...item, title })}
        />
        <Field
          label="Link destination"
          value={item.href}
          onChange={(href) => onChange({ ...item, href })}
        />
      </div>
      <TextAreaField
        label="Short description"
        value={item.description}
        onChange={(description) => onChange({ ...item, description })}
      />
      <div className="border-t border-[#f0ebe3] pt-1">
        <Toggle
          label="Show on landing page"
          checked={item.isVisible}
          onChange={(isVisible) => onChange({ ...item, isVisible })}
        />
      </div>
    </div>
  );
}

function AddBar({
  label,
  options,
  onAdd,
  buttonLabel = "Add",
}: {
  label: string;
  options?: Array<{ value: string; label: string }>;
  onAdd: (value?: string) => void;
  buttonLabel?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-2.5 rounded-[16px] border border-dashed border-[#cfc8bd] bg-[#fdfcf9] p-3.5 transition-colors hover:border-[#b5aca0] sm:flex-row sm:items-center">
      {options ? (
        <select
          className={`${fieldClassName} mt-0 flex-1 cursor-pointer`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          <option value="">{label}</option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="flex-1 px-1 text-[13px] font-medium text-[#776f66]">
          {label}
        </span>
      )}
      <button
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[#071b3d] px-4 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#0055ff] hover:shadow disabled:cursor-not-allowed disabled:opacity-40 sm:shrink-0"
        type="button"
        disabled={Boolean(options && !value)}
        onClick={() => {
          onAdd(value || undefined);
          setValue("");
        }}
      >
        <span>+</span>
        <span>{buttonLabel}</span>
      </button>
    </div>
  );
}

function updateById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function parseLinks(value: string, prefix: string): FooterLink[] {
  return value
    .split("\n")
    .map((line, index) => {
      const [label, ...hrefParts] = line.split("|");
      return {
        id: `${prefix}-${index + 1}`,
        isVisible: true,
        label: (label ?? "").trim(),
        href: hrefParts.join("|").trim() || "#top",
      };
    })
    .filter((link) => link.label);
}

function linksToText(links: FooterLink[]) {
  return links
    .filter((link) => link.isVisible)
    .map((link) => `${link.label} | ${link.href}`)
    .join("\n");
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
        if (
          isUnauthorizedLandingError(requestError) ||
          isUnauthorizedError(requestError)
        ) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load landing content.",
        );
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
    const values = menu.flatMap((section) =>
      (section.groups ?? []).flatMap((group) =>
        group.items.map((item) => ({
          serviceKey: item.label,
          title: item.label,
          description: item.description,
          href: item.href,
          icon: normalizeServiceIcon(item.icon),
          filter: filterMap[section.label] ?? "Startup",
        })),
      ),
    );
    const fallback = defaultLandingContent.services.items.map((item) => ({
      serviceKey: item.serviceKey,
      title: item.title,
      description: item.description,
      href: item.href,
      icon: item.icon,
      filter: item.filter,
    }));
    return Array.from(
      new Map(
        [...values, ...fallback].map((service) => [
          service.serviceKey,
          service,
        ]),
      ).values(),
    );
  }, [menu]);

  function editSection<K extends LandingSectionKey>(
    section: K,
    patch: Partial<LandingContent[K]>,
  ) {
    setContent((current) =>
      current
        ? ({
            ...current,
            [section]: { ...current[section], ...patch },
          } as LandingContent)
        : current,
    );
    setMessage("");
  }

  async function saveSection() {
    if (!content || !updatedAt) {
      setError(
        "Landing content is still loading. Refresh the editor before saving.",
      );
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const next = await updateLandingSection(
        activeSection,
        content[activeSection],
        updatedAt,
      );
      setContent(withLandingFallback(next.content));
      setUpdatedAt(next.updatedAt);
      setMessage("Draft saved successfully.");
    } catch (saveError) {
      if (
        isUnauthorizedLandingError(saveError) ||
        isUnauthorizedError(saveError)
      ) {
        window.location.assign("/admin/login");
        return;
      }
      if (isLandingConflictError(saveError)) {
        setError(
          "This section changed in another session. Your edits were not saved; refresh before trying again.",
        );
      } else if (isLandingSafetyError(saveError)) {
        setError(
          "This update looks incomplete, so it was not saved. Refresh the section and try again.",
        );
      } else {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Unable to save this section.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e3ddd4] bg-white">
        <p className="text-[13px] font-semibold text-[#777168]">
          Loading landing workspace…
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-[24px] border border-[#f0c7ce] bg-[#fff8f8] p-5 text-[13px] font-semibold text-[#c53e59]">
        {error || "Landing content is unavailable."}
      </div>
    );
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
        return (
          <HeroEditor
            content={hero}
            services={catalog}
            onChange={(patch) => editSection("hero", patch)}
          />
        );
      case "clients":
        return (
          <ClientsEditor
            content={clients}
            onChange={(patch) => editSection("clients", patch)}
          />
        );
      case "metrics":
        return (
          <MetricsEditor
            content={metrics}
            onChange={(patch) => editSection("metrics", patch)}
          />
        );
      case "services":
        return (
          <ServicesEditor
            content={services}
            services={catalog}
            onChange={(patch) => editSection("services", patch)}
          />
        );
      case "process":
        return (
          <ProcessEditor
            content={process}
            onChange={(patch) => editSection("process", patch)}
          />
        );
      case "testimonials":
        return (
          <TestimonialsEditor
            content={testimonials}
            onChange={(patch) => editSection("testimonials", patch)}
          />
        );
      case "packages":
        return (
          <PackagesEditor
            content={packages}
            onChange={(patch) => editSection("packages", patch)}
          />
        );
      case "tools":
        return (
          <ToolsEditor
            content={tools}
            onChange={(patch) => editSection("tools", patch)}
          />
        );
      case "articles":
        return (
          <ArticlesEditor
            content={articles}
            onChange={(patch) => editSection("articles", patch)}
          />
        );
      case "faq":
        return (
          <FaqEditor
            content={faq}
            onChange={(patch) => editSection("faq", patch)}
          />
        );
      case "contact":
        return (
          <ContactEditor
            content={contact}
            onChange={(patch) => editSection("contact", patch)}
          />
        );
      case "footer":
        return (
          <FooterEditor
            content={footer}
            onChange={(patch) => editSection("footer", patch)}
          />
        );
    }
  }

  const activeTab = sectionTabs.find((tab) => tab.key === activeSection)!;

  return (
    <div className="space-y-6">
      {/* Header & Main Save Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#0055ff]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
              Landing Workspace
            </p>
          </div>
          <h1 className="mt-1 font-brand text-[32px] font-bold tracking-[-0.04em] text-[#071b3d]">
            Shape the public landing page.
          </h1>
          <p className="mt-1 max-w-[650px] text-[13px] leading-[1.5] text-[#817a72]">
            Organize copy, reorder feature cards, and update media for every
            section. Edits are saved independently per section.
          </p>
        </div>
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          {message ? (
            <span className="min-w-0 flex-1 rounded-full bg-[#e4f4e9] px-3.5 py-2 text-center text-[12px] font-bold text-[#2d7650] sm:flex-none">
              {message}
            </span>
          ) : null}
          <button
            className="min-h-11 w-full rounded-full bg-[#071b3d] px-6 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(7,27,61,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#0055ff] hover:shadow-[0_10px_24px_rgba(0,85,255,0.25)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            type="button"
            onClick={() => void saveSection()}
            disabled={saving || !updatedAt}
          >
            {saving ? "Saving…" : `Save ${activeTab.label}`}
          </button>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-[14px] border border-[#f0c7ce] bg-[#fff8f8] px-4 py-3 text-[12px] font-semibold text-[#c53e59]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* Main Workspace Frame */}
      <div className="overflow-hidden rounded-[24px] border border-[#e3ddd4] bg-[#faf8f5] shadow-[0_12px_36px_rgba(64,52,43,0.05)]">
        {/* Desktop Categorized Navigation */}
        <div className="hidden border-b border-[#e8e2d8] bg-white p-4 sm:block">
          <div className="grid gap-3 lg:grid-cols-4">
            {sectionGroups.map((group) => (
              <div
                key={group.name}
                className="flex flex-col gap-1.5 rounded-[14px] bg-[#faf8f5] p-2"
              >
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#918a80]">
                  {group.name}
                </span>
                <div className="flex flex-col gap-1">
                  {group.tabs.map((tab) => {
                    const isActive = activeSection === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setActiveSection(tab.key);
                          setMessage("");
                          setError("");
                        }}
                        className={`group flex items-center justify-between rounded-[10px] px-3 py-2 text-left transition-all ${
                          isActive
                            ? "bg-[#071b3d] text-white shadow-sm"
                            : "text-[#5e5851] hover:bg-white hover:text-[#071b3d]"
                        }`.trim()}
                      >
                        <span className="text-[12px] font-bold">
                          {tab.label}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isActive
                              ? "text-white/65"
                              : "text-[#9e978d] group-hover:text-[#6a635a]"
                          }`}
                        >
                          {tab.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="border-b border-[#e8e2d8] bg-white p-3.5 sm:hidden">
          <label
            className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#777168]"
            htmlFor="landing-section-select"
          >
            Jump to section
          </label>
          <select
            id="landing-section-select"
            className={`${fieldClassName} cursor-pointer bg-white`}
            value={activeSection}
            onChange={(event) => {
              setActiveSection(event.target.value as LandingSectionKey);
              setMessage("");
              setError("");
            }}
            aria-label="Choose a landing section"
          >
            {sectionGroups.map((group) => (
              <optgroup label={group.name} key={group.name}>
                {group.tabs.map((tab) => (
                  <option value={tab.key} key={tab.key}>
                    {tab.label} — {tab.hint}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Section Editor Area */}
        <div className="p-4 sm:p-7 lg:p-9">{renderEditor()}</div>
      </div>

      {/* Floating Bottom Quick-Save Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-[20px] border border-[#e2dcd3] bg-white/95 px-5 py-3.5 shadow-[0_12px_32px_rgba(20,18,28,0.12)] backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="size-2 shrink-0 rounded-full bg-[#0055ff]" />
          <span className="truncate text-[12px] font-semibold text-[#4f4942]">
            Editing:{" "}
            <strong className="text-[#071b3d]">{activeTab.label}</strong>
          </span>
          {message ? (
            <span className="hidden rounded-full bg-[#e4f4e9] px-2.5 py-0.5 text-[11px] font-bold text-[#2d7650] sm:inline-block">
              {message}
            </span>
          ) : null}
        </div>
        <button
          className="min-h-10 shrink-0 rounded-full bg-[#071b3d] px-5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#0055ff] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => void saveSection()}
          disabled={saving || !updatedAt}
        >
          {saving ? "Saving…" : `Save ${activeTab.label}`}
        </button>
      </div>
    </div>
  );
}

function HeroEditor({
  content,
  services,
  onChange,
}: {
  content: LandingContent["hero"];
  services: CatalogService[];
  onChange: (patch: Partial<LandingContent["hero"]>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hero Banner"
        description="Control the initial headline, positioning copy, calls to action and popular services shown on the public landing page."
        count={content.featuredServices.length}
      />

      <FormGroupCard
        title="Headlines & Messaging"
        description="Primary copy visitors read first."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Desktop eyebrow"
              value={content.eyebrow}
              onChange={(eyebrow) => onChange({ eyebrow })}
              placeholder="E.g. REGISTRATION · LICENSING · COMPLIANCE"
            />
            <Field
              label="Mobile eyebrow"
              value={content.mobileEyebrow}
              onChange={(mobileEyebrow) => onChange({ mobileEyebrow })}
              placeholder="E.g. FAST BUSINESS SERVICES"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Primary title"
              value={content.titlePrimary}
              onChange={(titlePrimary) => onChange({ titlePrimary })}
              placeholder="E.g. Everything your business needs"
            />
            <Field
              label="Secondary title"
              value={content.titleSecondary}
              onChange={(titleSecondary) => onChange({ titleSecondary })}
              placeholder="E.g. to launch and stay compliant."
            />
          </div>
          <Field
            label="Animated rotating phrases"
            hint="Comma-separated list (e.g. Guaranteed, Zero Delays, 100% Compliant)"
            value={(content.animatedWords ?? []).join(", ")}
            onChange={(value) => {
              const words = value
                .split(",")
                .map((w) => w.trim())
                .filter(Boolean);
              onChange({ animatedWords: words });
            }}
            placeholder="Guaranteed, Zero Delays, 100% Compliant, End-to-End Support"
          />
          <TextAreaField
            label="Main description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            placeholder="Share the overarching value proposition and confidence statement."
            rows={3}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Calls to Action (CTAs)"
        description="Primary and secondary navigation buttons in the hero."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-[14px] border border-[#e8e2d8] bg-[#fdfcf9] p-4 space-y-3">
            <span className="inline-block rounded-full bg-[#071b3d] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Primary Button
            </span>
            <Field
              label="Button label"
              value={content.primaryCtaLabel}
              onChange={(primaryCtaLabel) => onChange({ primaryCtaLabel })}
            />
            <Field
              label="Button link destination"
              value={content.primaryCtaHref}
              onChange={(primaryCtaHref) => onChange({ primaryCtaHref })}
            />
          </div>
          <div className="rounded-[14px] border border-[#e8e2d8] bg-[#fdfcf9] p-4 space-y-3">
            <span className="inline-block rounded-full bg-[#eee7dd] px-2.5 py-0.5 text-[10px] font-bold text-[#5c5448] uppercase tracking-wider">
              Secondary Button
            </span>
            <Field
              label="Button label"
              value={content.secondaryCtaLabel}
              onChange={(secondaryCtaLabel) => onChange({ secondaryCtaLabel })}
            />
            <Field
              label="Button link destination"
              value={content.secondaryCtaHref}
              onChange={(secondaryCtaHref) => onChange({ secondaryCtaHref })}
            />
          </div>
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Popular Services in Hero"
        description="Quick service chips displayed below the hero CTAs. Drag to reorder or remove."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.featuredServices.length} / 8 featured
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.featuredServices}
            onChange={(featuredServices) => onChange({ featuredServices })}
            onRemove={(id) =>
              onChange({
                featuredServices: content.featuredServices.filter(
                  (item) => item.id !== id,
                ),
              })
            }
            itemTitle={(item) => item.title || "Featured service"}
            render={(item) => (
              <ServiceItemEditor
                item={item}
                services={services}
                onChange={(next) =>
                  onChange({
                    featuredServices: updateById(
                      content.featuredServices,
                      item.id,
                      next,
                    ),
                  })
                }
              />
            )}
          />
          {content.featuredServices.length < 8 ? (
            <AddBar
              label="Choose a service from catalog to feature"
              buttonLabel="Feature service"
              options={services
                .filter(
                  (service) =>
                    !content.featuredServices.some(
                      (item) => item.serviceKey === service.serviceKey,
                    ),
                )
                .map((service) => ({
                  value: service.serviceKey,
                  label: service.title,
                }))}
              onAdd={(serviceKey) => {
                const service = services.find(
                  (item) => item.serviceKey === serviceKey,
                );
                if (!service) return;
                onChange({
                  featuredServices: [
                    ...content.featuredServices,
                    { id: uid("hero-service"), isVisible: true, ...service },
                  ],
                });
              }}
            />
          ) : null}
        </div>
      </FormGroupCard>
    </div>
  );
}

function ClientsEditor({
  content,
  onChange,
}: {
  content: LandingContent["clients"];
  onChange: (patch: Partial<LandingContent["clients"]>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Client Logos Strip"
        description="Showcase recognized brands and partners. Upload WebP compressed logos or use custom text styling."
        count={content.logos.length}
      />

      <FormGroupCard title="Section Headline">
        <Field
          label="Section title"
          value={content.title}
          onChange={(title) => onChange({ title })}
        />
      </FormGroupCard>

      <FormGroupCard
        title="Client Logos"
        description="Drag logos to reorder. Images are cached and optimized automatically."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.logos.length} logos
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.logos}
            onChange={(logos) => onChange({ logos })}
            onRemove={(id) =>
              onChange({
                logos: content.logos.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.name || "Client logo"}
            itemTitle={(item) => item.name?.trim() || "Client logo"}
            render={(item) => (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)]">
                  <div className="min-w-0 space-y-3">
                    <ClientLogoUpload
                      item={item}
                      onChange={(patch) =>
                        onChange({
                          logos: updateById(content.logos, item.id, patch),
                        })
                      }
                    />
                    <Field
                      label="Client or brand name"
                      value={item.name}
                      label="Client or brand name (optional)"
                      value={item.name ?? ""}
                      onChange={(name) =>
                        onChange({
                          logos: updateById(content.logos, item.id, { name }),
                          logos: updateById(content.logos, item.id, {
                            name: name.trim() ? name : null,
                          }),
                        })
                      }
                      placeholder="e.g. Acme Corp (or leave blank if logo only)"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Field
                      label="External Image URL (optional)"
                      value={item.logoUrl}
                      onChange={(logoUrl) =>
                        onChange({
                          logos: updateById(content.logos, item.id, {
                            logoUrl,
                          }),
                        })
                      }
                      placeholder="Paste URL if not uploading"
                    />
                    <ColorField
                      label="Mark text color"
                      value={item.textColor}
                      onChange={(textColor) =>
                        onChange({
                          logos: updateById(content.logos, item.id, {
                            textColor,
                          }),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible on public logo strip"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        logos: updateById(content.logos, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add a new client logo card"
            buttonLabel="Add client"
            onAdd={() =>
              onChange({
                logos: [
                  ...content.logos,
                  {
                    id: uid("client"),
                    isVisible: true,
                    name: "New client",
                    name: null,
                    logoUrl: "",
                    textColor: "#071b3d",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function MetricsEditor({
  content,
  onChange,
}: {
  content: MetricsContent;
  onChange: (patch: Partial<MetricsContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trust Figures (Limex Standard)"
        description="Key statistics that reinforce trust, reliability and volume beneath the logo strip."
        count={content.items.length}
      />

      <FormGroupCard title="Section Title">
        <Field
          label="Accessible title"
          value={content.title}
          onChange={(title) => onChange({ title })}
        />
      </FormGroupCard>

      <FormGroupCard
        title="Metric Statistics"
        description="Big numerical highlights paired with clear labels."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} figures
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => `${item.value} — ${item.label}`}
            render={(item) => (
              <div className="space-y-3">
                <div className="grid gap-3.5 sm:grid-cols-[180px_1fr]">
                  <Field
                    label="Stat value"
                    value={item.value}
                    onChange={(value) =>
                      onChange({
                        items: updateById(content.items, item.id, { value }),
                      })
                    }
                    placeholder="E.g. 99.8% or 10k+"
                  />
                  <Field
                    label="Metric label"
                    value={item.label}
                    onChange={(label) =>
                      onChange({
                        items: updateById(content.items, item.id, { label }),
                      })
                    }
                    placeholder="E.g. Filing approval rate"
                  />
                </div>
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible on landing page"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another trust metric figure"
            buttonLabel="Add metric"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("metric"),
                    isVisible: true,
                    value: "100%",
                    label: "Satisfaction rate",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function ServicesEditor({
  content,
  services,
  onChange,
}: {
  content: ServicesContent;
  services: CatalogService[];
  onChange: (patch: Partial<ServicesContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Featured Services Section"
        description="Curate standout service cards for the homepage. You can link them directly to full service detail pages."
        count={content.items.length}
      />

      <FormGroupCard title="Section Overview & Link">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
              className="sm:col-span-1"
            />
            <Field
              label="Section CTA label"
              value={content.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
            <Field
              label="Section CTA destination"
              value={content.ctaHref}
              onChange={(ctaHref) => onChange({ ctaHref })}
            />
          </div>
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Featured Service Cards"
        description="Choose services from your live navigation catalog, adjust titles and icons, and reorder as desired."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} services
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.title || "Service item"}
            render={(item) => (
              <ServiceItemEditor
                item={item}
                services={services}
                onChange={(next) =>
                  onChange({ items: updateById(content.items, item.id, next) })
                }
              />
            )}
          />
          <AddBar
            label="Choose a service from catalog to add"
            buttonLabel="Add service card"
            options={services
              .filter(
                (service) =>
                  !content.items.some(
                    (item) => item.serviceKey === service.serviceKey,
                  ),
              )
              .map((service) => ({
                value: service.serviceKey,
                label: service.title,
              }))}
            onAdd={(serviceKey) => {
              const service = services.find(
                (item) => item.serviceKey === serviceKey,
              );
              if (service)
                onChange({
                  items: [
                    ...content.items,
                    {
                      id: uid("featured-service"),
                      isVisible: true,
                      ...service,
                    },
                  ],
                });
            }}
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function ProcessEditor({
  content,
  onChange,
}: {
  content: ProcessContent;
  onChange: (patch: Partial<ProcessContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="How It Works (Process)"
        description="Explain your customer journey step-by-step with clear milestone cards."
        count={content.items.length}
      />

      <FormGroupCard title="Main Heading & Overview">
        <div className="space-y-4">
          <Field
            label="Section title"
            value={content.title}
            onChange={(title) => onChange({ title })}
          />
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Workflow Steps"
        description="Sequential stages customers go through when engaging Limex."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} steps
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) => {
              if (content.items.length > 1) {
                onChange({
                  items: content.items.filter((item) => item.id !== id),
                });
              }
            }}
            itemTitle={(item) => `${item.number}: ${item.title}`}
            render={(item) => (
              <div className="space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
                  <Field
                    label="Step number"
                    value={item.number}
                    onChange={(number) =>
                      onChange({
                        items: updateById(content.items, item.id, { number }),
                      })
                    }
                    placeholder="01"
                  />
                  <Field
                    label="Step title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        items: updateById(content.items, item.id, { title }),
                      })
                    }
                    placeholder="E.g. Initial Consultation"
                  />
                </div>
                <TextAreaField
                  label="Step details"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      items: updateById(content.items, item.id, {
                        description,
                      }),
                    })
                  }
                  placeholder="Outline what happens in this step."
                  rows={2}
                />
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible on process track"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another workflow step"
            buttonLabel="Add step"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("step"),
                    isVisible: true,
                    number: String(content.items.length + 1).padStart(2, "0"),
                    title: "New step",
                    description: "Describe the next phase.",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Sidebar Support Guidance Box"
        description="The helpful guidance callout beside the process timeline."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Helper eyebrow"
              value={content.helperEyebrow}
              onChange={(helperEyebrow) => onChange({ helperEyebrow })}
            />
            <Field
              label="Helper title"
              value={content.helperTitle}
              onChange={(helperTitle) => onChange({ helperTitle })}
            />
          </div>
          <TextAreaField
            label="Helper description"
            value={content.helperDescription}
            onChange={(helperDescription) => onChange({ helperDescription })}
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="CTA button label"
              value={content.helperCtaLabel}
              onChange={(helperCtaLabel) => onChange({ helperCtaLabel })}
            />
            <Field
              label="CTA destination"
              value={content.helperCtaHref}
              onChange={(helperCtaHref) => onChange({ helperCtaHref })}
            />
          </div>
        </div>
      </FormGroupCard>
    </div>
  );
}

function TestimonialsEditor({
  content,
  onChange,
}: {
  content: TestimonialsContent;
  onChange: (patch: Partial<TestimonialsContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Video Testimonials (Reels)"
        description="Share customer stories with embedded YouTube playback or visual story cards."
        count={content.items.length}
      />

      <FormGroupCard title="Section Headline & Context">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Section title"
            value={content.title}
            onChange={(title) => onChange({ title })}
          />
          <TextAreaField
            label="Section subtitle"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Customer Video Story Cards"
        description="Drag to reorder. When a YouTube URL is provided, customers can watch inline."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} stories
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.title || "Video story"}
            render={(item) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Story title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        items: updateById(content.items, item.id, { title }),
                      })
                    }
                  />
                  <Field
                    label="Subtitle or company"
                    value={item.subtitle}
                    onChange={(subtitle) =>
                      onChange({
                        items: updateById(content.items, item.id, { subtitle }),
                      })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <Field
                      label="YouTube URL"
                      value={item.youtubeUrl}
                      onChange={(youtubeUrl) =>
                        onChange({
                          items: updateById(content.items, item.id, {
                            youtubeUrl,
                          }),
                        })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    {!item.youtubeUrl ? (
                      <button
                        className="mt-2 text-[11px] font-semibold text-[#0055ff] hover:underline"
                        type="button"
                        onClick={() =>
                          onChange({
                            items: updateById(content.items, item.id, {
                              youtubeUrl: landingTestVideoUrl,
                            }),
                          })
                        }
                      >
                        Insert sample test reel URL ↗
                      </button>
                    ) : null}
                  </div>
                  <Field
                    label="Fallback cover image"
                    value={item.imageUrl}
                    onChange={(imageUrl) =>
                      onChange({
                        items: updateById(content.items, item.id, { imageUrl }),
                      })
                    }
                    placeholder="/figma/reel-1.png"
                  />
                </div>
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Show on public testimonials strip"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another customer story video"
            buttonLabel="Add story card"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("testimonial"),
                    isVisible: true,
                    imageUrl: "",
                    title: "New customer story",
                    subtitle: "Founding journey",
                    youtubeUrl: "",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function PackagesEditor({
  content,
  onChange,
}: {
  content: PackagesContent;
  onChange: (patch: Partial<PackagesContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Package Deals & Offers"
        description="Display clear starting prices, package inclusions and custom advisory plans."
        count={content.items.length}
      />

      <FormGroupCard title="Section Header & Custom Plan Prompt">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
            />
            <Field
              label="Custom-plan tag"
              value={content.customPlanLabel}
              onChange={(customPlanLabel) => onChange({ customPlanLabel })}
            />
          </div>
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Custom CTA button label"
              value={content.customPlanCtaLabel}
              onChange={(customPlanCtaLabel) =>
                onChange({ customPlanCtaLabel })
              }
            />
            <Field
              label="Custom CTA destination"
              value={content.customPlanCtaHref}
              onChange={(customPlanCtaHref) => onChange({ customPlanCtaHref })}
            />
          </div>
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Offer Package Cards"
        description="Features can be typed one per line and render as clean checklists."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} packages
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) =>
              `${item.tag ? `[${item.tag}] ` : ""}${item.title} — ${item.price}`
            }
            render={(item) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Badge / tag"
                    value={item.tag}
                    onChange={(tag) =>
                      onChange({
                        items: updateById(content.items, item.id, { tag }),
                      })
                    }
                    placeholder="E.g. POPULAR or ALL-IN-ONE"
                  />
                  <Field
                    label="Package name"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        items: updateById(content.items, item.id, { title }),
                      })
                    }
                  />
                  <Field
                    label="Price"
                    value={item.price}
                    onChange={(price) =>
                      onChange({
                        items: updateById(content.items, item.id, { price }),
                      })
                    }
                    placeholder="From BDT 15,000"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Card button text"
                    value={item.action}
                    onChange={(action) =>
                      onChange({
                        items: updateById(content.items, item.id, { action }),
                      })
                    }
                    placeholder="Get started"
                  />
                  <Field
                    label="Button link"
                    value={item.href}
                    onChange={(href) =>
                      onChange({
                        items: updateById(content.items, item.id, { href }),
                      })
                    }
                    placeholder="#contact"
                  />
                  <ColorField
                    label="Card accent color"
                    value={item.color}
                    onChange={(color) =>
                      onChange({
                        items: updateById(content.items, item.id, { color }),
                      })
                    }
                  />
                </div>
                <TextAreaField
                  label="Package description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      items: updateById(content.items, item.id, {
                        description,
                      }),
                    })
                  }
                  rows={2}
                />
                <TextAreaField
                  label="Included features (one deliverable per line)"
                  value={item.features.join("\n")}
                  onChange={(value) =>
                    onChange({
                      items: updateById(content.items, item.id, {
                        features: value
                          .split("\n")
                          .map((feature) => feature.trim())
                          .filter(Boolean),
                      }),
                    })
                  }
                  rows={4}
                  hint={`${item.features.length} features listed`}
                />
                <div className="flex flex-wrap items-center gap-6 border-t border-[#f0ebe3] pt-2">
                  <Toggle
                    label="Highlight as Recommended"
                    checked={item.isFeatured}
                    onChange={(isFeatured) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isFeatured,
                        }),
                      })
                    }
                  />
                  <Toggle
                    label="Visible publicly"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another pricing package offer"
            buttonLabel="Add package"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("package"),
                    isVisible: true,
                    tag: "STARTER",
                    title: "New package",
                    description: "Describe what is covered.",
                    price: "From BDT 10,000",
                    features: ["Inclusion one", "Inclusion two"],
                    color: "#008cff",
                    surface: "#eaf3ff",
                    href: "#contact",
                    action: "Get started",
                    isFeatured: false,
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function ToolsEditor({
  content,
  onChange,
}: {
  content: ToolsContent;
  onChange: (patch: Partial<ToolsContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Business Tools Cards"
        description="Showcase self-service calculators and legal document builders on the landing page."
        count={content.items.length}
      />

      <div className="flex items-center justify-between rounded-[16px] border border-[#d2e4f8] bg-[#f2f8ff] p-4 text-[#071b3d]">
        <div>
          <p className="text-[13px] font-bold">
            Manage calculations, fees & document templates
          </p>
          <p className="text-[12px] text-[#557199]">
            Government rates, VAT rules, RJSC slabs and print settings are
            managed in Business Tools.
          </p>
        </div>
        <a
          href="/admin/tools"
          className="inline-flex min-h-9 items-center rounded-full bg-[#0055ff] px-4 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071b3d]"
        >
          Open Business Tools ↗
        </a>
      </div>

      <FormGroupCard title="Section Heading & Link">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
              className="sm:col-span-1"
            />
            <Field
              label="CTA label"
              value={content.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
            <Field
              label="CTA link"
              value={content.ctaHref}
              onChange={(ctaHref) => onChange({ ctaHref })}
            />
          </div>
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Tool Cards on Landing Page"
        description="Order of featured interactive calculators and builder highlights."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} tools
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.title || "Tool card"}
            render={(item) => (
              <div className="space-y-3.5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Tool title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        items: updateById(content.items, item.id, { title }),
                      })
                    }
                  />
                  <Field
                    label="Tool destination URL"
                    value={item.href}
                    onChange={(href) =>
                      onChange({
                        items: updateById(content.items, item.id, { href }),
                      })
                    }
                  />
                </div>
                <TextAreaField
                  label="Short description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      items: updateById(content.items, item.id, {
                        description,
                      }),
                    })
                  }
                  rows={2}
                />
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible on landing page"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function ArticlesEditor({
  content,
  onChange,
}: {
  content: ArticlesContent;
  onChange: (patch: Partial<ArticlesContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Journal Articles (Blog Highlights)"
        description="Curate top articles and guides featured on the landing page."
        count={content.items.length}
      />

      <FormGroupCard title="Section Heading & Link">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
              className="sm:col-span-1"
            />
            <Field
              label="CTA label"
              value={content.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
            <Field
              label="CTA link"
              value={content.ctaHref}
              onChange={(ctaHref) => onChange({ ctaHref })}
            />
          </div>
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Featured Article Cards"
        description="Drag to organize sequence. Slugs link automatically to the blog."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} articles
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.title || "Article preview"}
            render={(item) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Article title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        items: updateById(content.items, item.id, { title }),
                      })
                    }
                  />
                  <Field
                    label="Subtitle / summary"
                    value={item.subtitle}
                    onChange={(subtitle) =>
                      onChange({
                        items: updateById(content.items, item.id, { subtitle }),
                      })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="URL slug"
                    value={item.slug}
                    onChange={(slug) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          slug,
                          href: `/blog/${slug}`,
                        }),
                      })
                    }
                  />
                  <Field
                    label="Direct destination"
                    value={item.href}
                    onChange={(href) =>
                      onChange({
                        items: updateById(content.items, item.id, { href }),
                      })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Published date"
                    value={item.date}
                    onChange={(date) =>
                      onChange({
                        items: updateById(content.items, item.id, { date }),
                      })
                    }
                    placeholder="E.g. SEPTEMBER 2026"
                  />
                  <Field
                    label="Read duration"
                    value={item.readTime}
                    onChange={(readTime) =>
                      onChange({
                        items: updateById(content.items, item.id, { readTime }),
                      })
                    }
                    placeholder="5 MIN READ"
                  />
                </div>
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Show on landing page"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add an article feature card"
            buttonLabel="Add article"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("article"),
                    isVisible: true,
                    slug: "new-article",
                    category: "Guide",
                    date: "TODAY",
                    readTime: "5 MIN READ",
                    title: "New practical guide",
                    subtitle: "Add a concise summary for readers.",
                    coverTone: "mint",
                    coverNumber: "01",
                    media: "image",
                    href: "/blog/new-article",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function FaqEditor({
  content,
  onChange,
}: {
  content: FaqContent;
  onChange: (patch: Partial<FaqContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Frequently Asked Questions"
        description="Helpful, direct answers to common questions asked by founders and compliance leads."
        count={content.items.length}
      />

      <FormGroupCard title="Section Header & CTA">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
              className="sm:col-span-1"
            />
            <Field
              label="CTA label"
              value={content.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
            <Field
              label="CTA link"
              value={content.ctaHref}
              onChange={(ctaHref) => onChange({ ctaHref })}
            />
          </div>
          <TextAreaField
            label="Section description"
            value={content.description}
            onChange={(description) => onChange({ description })}
            rows={2}
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Questions & Answers"
        description="Drag to prioritize the most essential questions near the top."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.items.length} questions
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.items}
            onChange={(items) => onChange({ items })}
            onRemove={(id) =>
              onChange({
                items: content.items.filter((item) => item.id !== id),
              })
            }
            itemTitle={(item) => item.question || "FAQ question"}
            render={(item) => (
              <div className="space-y-3.5">
                <Field
                  label="Question"
                  value={item.question}
                  onChange={(question) =>
                    onChange({
                      items: updateById(content.items, item.id, { question }),
                    })
                  }
                  placeholder="What document is required for..."
                />
                <TextAreaField
                  label="Direct answer"
                  value={item.answer}
                  onChange={(answer) =>
                    onChange({
                      items: updateById(content.items, item.id, { answer }),
                    })
                  }
                  placeholder="Provide a clear, authoritative response."
                  rows={3}
                />
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible in accordion list"
                    checked={item.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        items: updateById(content.items, item.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another frequently asked question"
            buttonLabel="Add question"
            onAdd={() =>
              onChange({
                items: [
                  ...content.items,
                  {
                    id: uid("faq"),
                    isVisible: true,
                    question: "New question",
                    answer: "Add a clear answer.",
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function ContactEditor({
  content,
  onChange,
}: {
  content: ContactContent;
  onChange: (patch: Partial<ContactContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Let's Talk (Contact Section)"
        description="Configure the direct advisory phone lines, WhatsApp prompt and consultation intake form."
      />

      <FormGroupCard
        title="Intro & Direct Advisory Channels"
        description="Fast ways customers can reach out right away."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Section title"
              value={content.title}
              onChange={(title) => onChange({ title })}
            />
            <Field
              label="Start eyebrow"
              value={content.startEyebrow}
              onChange={(startEyebrow) => onChange({ startEyebrow })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextAreaField
              label="Section description"
              value={content.description}
              onChange={(description) => onChange({ description })}
              rows={2}
            />
            <TextAreaField
              label="Start description"
              value={content.startDescription}
              onChange={(startDescription) => onChange({ startDescription })}
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#f0ebe3] pt-4">
            <Field
              label="Direct phone label"
              value={content.directLineLabel}
              onChange={(directLineLabel) => onChange({ directLineLabel })}
              placeholder="Direct line"
            />
            <Field
              label="Direct CTA action"
              value={content.directCtaLabel}
              onChange={(directCtaLabel) => onChange({ directCtaLabel })}
              placeholder="Call now"
            />
            <Field
              label="WhatsApp number"
              value={content.whatsapp}
              onChange={(whatsapp) => onChange({ whatsapp })}
              placeholder="+880..."
            />
            <Field
              label="Email address"
              value={content.email}
              onChange={(email) => onChange({ email })}
              placeholder="hello@limex.com"
            />
          </div>
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Consultation Form Headings & Privacy"
        description="Copy surrounding the interactive contact submission form."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Form eyebrow"
              value={content.formEyebrow}
              onChange={(formEyebrow) => onChange({ formEyebrow })}
            />
            <Field
              label="Form title"
              value={content.formTitle}
              onChange={(formTitle) => onChange({ formTitle })}
            />
          </div>
          <TextAreaField
            label="Form description"
            value={content.formDescription}
            onChange={(formDescription) => onChange({ formDescription })}
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f0ebe3] pt-4">
            <Field
              label="Submit button label"
              value={content.submitLabel}
              onChange={(submitLabel) => onChange({ submitLabel })}
              placeholder="Book consultation"
            />
            <Field
              label="Privacy guarantee note"
              value={content.privacyNote}
              onChange={(privacyNote) => onChange({ privacyNote })}
              placeholder="We respect your confidential information."
            />
          </div>
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Form Step Guidance & Success State"
        description="Small helper prompts shown as users fill in each detail."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField
            label="Service selector guidance"
            value={content.serviceHelper}
            onChange={(serviceHelper) => onChange({ serviceHelper })}
            rows={2}
          />
          <TextAreaField
            label="Contact method guidance"
            value={content.contactMethodHelper}
            onChange={(contactMethodHelper) =>
              onChange({ contactMethodHelper })
            }
            rows={2}
          />
          <TextAreaField
            label="Schedule guidance"
            value={content.scheduleHelper}
            onChange={(scheduleHelper) => onChange({ scheduleHelper })}
            rows={2}
          />
          <TextAreaField
            label="Success confirmation message"
            value={content.submittedNote}
            onChange={(submittedNote) => onChange({ submittedNote })}
            rows={2}
          />
        </div>
      </FormGroupCard>
    </div>
  );
}

function FooterEditor({
  content,
  onChange,
}: {
  content: FooterContent;
  onChange: (patch: Partial<FooterContent>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Global Footer"
        description="Shared footer navigation, company credentials and legal links across all website pages."
        count={content.columns.length}
      />

      <FormGroupCard title="Brand Header & Action">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Brand tagline"
              value={content.tagline}
              onChange={(tagline) => onChange({ tagline })}
            />
            <Field
              label="Footer title"
              value={content.title}
              onChange={(title) => onChange({ title })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f0ebe3] pt-4">
            <Field
              label="CTA button label"
              value={content.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
            <Field
              label="CTA button link"
              value={content.ctaHref}
              onChange={(ctaHref) => onChange({ ctaHref })}
            />
          </div>
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Company Information & Contacts"
        description="Official address, support phone and copyright disclaimer."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Contact heading"
            value={content.contactTitle}
            onChange={(contactTitle) => onChange({ contactTitle })}
          />
          <Field
            label="Support email"
            value={content.contactEmail}
            onChange={(contactEmail) => onChange({ contactEmail })}
          />
          <Field
            label="Direct phone"
            value={content.contactPhone}
            onChange={(contactPhone) => onChange({ contactPhone })}
          />
          <Field
            label="Office location"
            value={content.location}
            onChange={(location) => onChange({ location })}
            className="sm:col-span-2"
          />
          <Field
            label="Copyright notice"
            value={content.copyright}
            onChange={(copyright) => onChange({ copyright })}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Navigation Columns"
        description="Each column contains links formatted as Label | URL per line."
        badge={
          <span className="text-[11px] font-semibold text-[#817a72]">
            {content.columns.length} columns
          </span>
        }
      >
        <div className="space-y-4">
          <SortableRows
            items={content.columns}
            onChange={(columns) => onChange({ columns })}
            onRemove={(id) =>
              onChange({
                columns: content.columns.filter((item) => item.id !== id),
              })
            }
            itemTitle={(column) => column.title || "Footer column"}
            render={(column) => (
              <div className="space-y-3.5">
                <Field
                  label="Column heading"
                  value={column.title}
                  onChange={(title) =>
                    onChange({
                      columns: updateById(content.columns, column.id, {
                        title,
                      }),
                    })
                  }
                  placeholder="E.g. COMPANY FORMATION"
                />
                <TextAreaField
                  label="Links (Format: Title | /path per line)"
                  value={linksToText(column.links)}
                  onChange={(value) =>
                    onChange({
                      columns: updateById(content.columns, column.id, {
                        links: parseLinks(value, column.id),
                      }),
                    })
                  }
                  rows={5}
                  placeholder="Private Limited | /services/private-limited&#10;One Person Company | /services/opc"
                  hint={`${column.links.length} links parsed`}
                />
                <div className="border-t border-[#f0ebe3] pt-1">
                  <Toggle
                    label="Visible in footer"
                    checked={column.isVisible}
                    onChange={(isVisible) =>
                      onChange({
                        columns: updateById(content.columns, column.id, {
                          isVisible,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            )}
          />
          <AddBar
            label="Add another navigation column"
            buttonLabel="Add column"
            onAdd={() =>
              onChange({
                columns: [
                  ...content.columns,
                  {
                    id: uid("footer-column"),
                    isVisible: true,
                    title: "NEW COLUMN",
                    links: [],
                  },
                ],
              })
            }
          />
        </div>
      </FormGroupCard>

      <FormGroupCard
        title="Legal & Compliance Links"
        description="Single-line links for Terms, Privacy and Policy."
      >
        <TextAreaField
          label="Legal links (Format: Title | /path per line)"
          value={linksToText(content.legalLinks)}
          onChange={(value) =>
            onChange({ legalLinks: parseLinks(value, "legal") })
          }
          rows={3}
          placeholder="Privacy Policy | /privacy&#10;Terms of Service | /terms"
          hint={`${content.legalLinks.length} links`}
        />
      </FormGroupCard>
    </div>
  );
}
