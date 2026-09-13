"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  assignAdminService,
  createAdminService,
  getAdminService,
  getAdminServices,
  getAdminServiceMenuOptions,
  isServiceConflictError,
  isUnauthorizedServiceError,
  publishAdminService,
  unpublishAdminService,
  updateAdminService,
  type AdminService,
  type AdminServiceMenuOption,
} from "@/lib/service-api";
import type {
  ServiceDetailContent,
  ServiceMenuTargetType,
  ServiceProfileInput,
} from "@/lib/service-types";
import { businessTools } from "@/lib/business-tools";
import { compressImageToWebp } from "@/lib/image-compression";
import {
  getAdminMedia,
  getAdminMediaAsset,
  isUnauthorizedMediaError,
  uploadMediaAsset,
  type MediaAsset,
} from "@/lib/media-api";
import { RichTextEditor } from "./rich-text-editor";
import { ServiceIcon } from "@/components/limex/service-icons";
import type { ServiceIconName } from "@/components/limex/data";
import { getToneClasses } from "@/components/limex/styles";
import { IconPicker, normalizeServiceIcon } from "./icon-picker";

const fieldClass =
  "min-h-11 w-full rounded-[12px] border border-[#ddd6cc] bg-[#fffefa] px-3.5 text-[13px] leading-normal text-[#1c191d] shadow-[0_1px_2px_rgba(45,40,35,0.03)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#aaa49b] hover:border-[#c8c0b6] focus:border-[#0055ff] focus:bg-white focus:ring-4 focus:ring-[#008cff]/10";
const textAreaClass = `${fieldClass} min-h-[104px] resize-y py-3 leading-[1.55]`;
const fieldLabelClass =
  "text-[10px] font-bold uppercase tracking-[0.12em] text-[#706b64]";
function emptyDetail(): ServiceDetailContent {
  return {
    ctaLabel: "Talk to an advisor",
    startingPrice: "Let's talk",
    deliveryTime: "Confirmed after review",
    serviceMode: "Online or offline",
    mediaTitle: "A clearer next step",
    mediaDescription:
      "Add an optional image or video to introduce this service.",
    mediaUrl: "",
    mediaAlt: "",
    overviewEyebrow: "OVERVIEW",
    overviewTitle: "A practical path forward",
    overviewDescription:
      "Share the scope of this service and the next step your customer should take.",
    overviewHtml: "",
    overviewDescriptionHtml: "",
    contentLabel: "THE LIMEX APPROACH",
    contentTitle: "Make the next step easier to understand.",
    contentDescription:
      "Add the key guidance, inclusions and expectations for this service.",
    contentDescriptionHtml: "",
    contentLinkLabel: "Talk to an advisor",
    contentLinkHref: "#service-contact",
    keyFactsLabel: "Key facts",
    relatedOptionsLabel: "Related options",
    toolsEyebrow: "Helpful tools",
    toolsTitle: "Keep the next step close at hand.",
    toolsDescription:
      "Link a calculator or document builder that helps customers move forward.",
    pricingEyebrow: "Optional / pricing",
    pricingTitle: "Show the right price for this service",
    pricingDescription:
      "Use a starting price, package cards or a custom quote depending on the scope.",
    mostPopularLabel: "Most popular",
    faqEyebrow: "Optional / FAQ",
    faqTitle: "Common questions",
    faqDescription: "A few clear answers before you choose the next step.",
    faqSupportLabel: "Still deciding?",
    faqSupportDescription:
      "Talk to an advisor when the right path needs a little context.",
    contactEyebrow: "Ready when you are",
    contactTitle: "Need help choosing the right option?",
    contactDescription:
      "A short conversation is enough to recommend the right path for",
    contactButtonLabel: "Talk to an advisor",
    benefits: [],
    steps: [],
    facts: [],
    pricing: [],
    faqs: [],
    tools: [],
  };
}

function cloneDetail(detail: ServiceDetailContent | null) {
  if (!detail) return null;
  return {
    ...detail,
    benefits: [...detail.benefits],
    steps: detail.steps.map((step) => ({ ...step })),
    facts: detail.facts.map((fact) => ({ ...fact })),
    pricing: detail.pricing.map((tier) => ({
      ...tier,
      features: [...tier.features],
    })),
    faqs: detail.faqs.map((faq) => ({ ...faq })),
    tools: [...(detail.tools ?? [])],
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function legacyOverviewHtml(detail: ServiceDetailContent) {
  const blocks: string[] = [];
  const addParagraph = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
  };

  if (detail.overviewEyebrow.trim()) addParagraph(detail.overviewEyebrow);
  if (detail.overviewTitle.trim())
    blocks.push(`<h2>${escapeHtml(detail.overviewTitle.trim())}</h2>`);
  if (detail.overviewDescriptionHtml?.trim())
    blocks.push(detail.overviewDescriptionHtml.trim());
  else addParagraph(detail.overviewDescription);

  if (detail.contentLabel.trim()) addParagraph(detail.contentLabel);
  if (detail.contentTitle.trim())
    blocks.push(`<h3>${escapeHtml(detail.contentTitle.trim())}</h3>`);
  if (detail.contentDescriptionHtml?.trim())
    blocks.push(detail.contentDescriptionHtml.trim());
  else addParagraph(detail.contentDescription);
  if (detail.contentLinkLabel.trim()) {
    const href = escapeHtml(
      detail.contentLinkHref.trim() || "#service-contact",
    );
    blocks.push(
      `<p><a href="${href}">${escapeHtml(detail.contentLinkLabel.trim())}</a></p>`,
    );
  }

  if (detail.benefits.length) {
    blocks.push(
      `<ul>${detail.benefits
        .filter((benefit) => benefit.trim())
        .map((benefit) => `<li>${escapeHtml(benefit.trim())}</li>`)
        .join("")}</ul>`,
    );
  }
  if (detail.steps.length) {
    blocks.push(
      `<ol>${detail.steps
        .filter((step) => step.title.trim() || step.description.trim())
        .map(
          (step) =>
            `<li><strong>${escapeHtml(step.title.trim())}</strong>${step.description.trim() ? ` — ${escapeHtml(step.description.trim())}` : ""}</li>`,
        )
        .join("")}</ol>`,
    );
  }

  return blocks.join("");
}

function draftFromService(
  service: AdminService,
): ServiceProfileInput & { revision: number; profileId: string | null } {
  return {
    revision: service.revision,
    profileId: service.profileId,
    serviceKey: service.serviceKey,
    slug: service.slug,
    label: service.titleEn || service.title,
    description: service.descriptionEn || service.description,
    href: `/services/${service.slug}`,
    icon: service.icon,
    titleEn: service.titleEn,
    titleBn: service.titleBn,
    descriptionEn: service.descriptionEn,
    descriptionBn: service.descriptionBn,
    mediaAssetId: service.mediaAssetId,
    detail: cloneDetail(service.detail),
  };
}

function slugifyDraft(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function menuTargetKey(
  target: { id: string; targetType: ServiceMenuTargetType } | null,
) {
  return target ? `${target.targetType}:${target.id}` : "";
}

function menuTargetFromKey(
  value: string,
): { targetType: ServiceMenuTargetType; targetId: string } | null {
  const [targetType, ...idParts] = value.split(":");
  if ((targetType !== "ITEM" && targetType !== "LINK") || !idParts.length)
    return null;
  return { targetType, targetId: idParts.join(":") };
}

function dateLabel(value: string | null) {
  if (!value) return "Not saved yet";
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Recently";
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className={`block min-w-0 ${className}`.trim()} htmlFor={id}>
      <span className={fieldLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-[#0055ff]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <input
        id={id}
        className={`${fieldClass} mt-1.5`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
      />
      {hint ? (
        <span className="mt-1.5 block text-[10px] leading-[1.45] text-[#989188]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className={`block min-w-0 ${className}`.trim()} htmlFor={id}>
      <span className={fieldLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-[#0055ff]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <textarea
        id={id}
        className={`${textAreaClass} mt-1.5`}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
      />
      {hint ? (
        <span className="mt-1.5 block text-[10px] leading-[1.45] text-[#989188]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function SaveButton({
  children = "Save draft",
  disabled,
  onClick,
}: {
  children?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-55"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusPill({ service }: { service: AdminService }) {
  const label =
    service.status === "PUBLISHED"
      ? "Published"
      : service.status === "DRAFT"
        ? "Draft"
        : service.assignedMenu
          ? "Link only"
          : "Unassigned";
  const classes =
    service.status === "PUBLISHED"
      ? "bg-[#e1f2e7] text-[#29634d]"
      : service.status === "DRAFT"
        ? "bg-[#fff0e0] text-[#a45e24]"
        : "bg-[#f0edf7] text-[#655493]";
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.09em] ${classes}`.trim()}
    >
      {label}
    </span>
  );
}

function SectionDisclosure({
  title,
  description,
  count,
  open = false,
  children,
}: {
  title: string;
  description: string;
  count?: number;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      className="group border-b border-[#ece7df] last:border-b-0 transition-colors duration-200 group-open:bg-[#faf9f6]"
      open={open}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left transition-colors sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-[#29252a] transition-colors group-open:text-[#071b3d]">
            {title}
          </span>
          <span className="mt-1 block truncate text-[11px] leading-[1.45] text-[#948d84]">
            {description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {typeof count === "number" ? (
            <span className="inline-flex min-w-6 justify-center rounded-full bg-[#f1eee8] px-1.5 py-0.5 text-[10px] font-bold text-[#777168]">
              {count}
            </span>
          ) : null}
          <span
            className="grid size-7 place-items-center rounded-full bg-[#f2efe9] text-[16px] font-normal text-[#847d74] transition-[color,background-color,transform] group-open:rotate-45 group-open:bg-[#fff0f3] group-open:text-[#0055ff]"
            aria-hidden="true"
          >
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-transparent px-4 pb-5 pt-4 group-open:border-[#eee8df] sm:px-5">
        {children}
      </div>
    </details>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-8 items-center rounded-full px-2.5 text-[11px] font-bold text-[#0055ff] transition-colors hover:bg-[#fff1f3]"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="grid size-8 shrink-0 place-items-center rounded-full text-[17px] font-normal text-[#b34b60] transition-colors hover:bg-[#fce7ea]"
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      ×
    </button>
  );
}

function MediaAssetThumb({ asset }: { asset: MediaAsset }) {
  const [source, setSource] = useState(asset.url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSource(asset.url);
    setFailed(false);
  }, [asset.id, asset.url]);

  if (failed)
    return (
      <span className="grid size-full place-items-center bg-[#f3f1ec] text-[10px] text-[#aaa49b]">
        No preview
      </span>
    );
  return (
    <img
      className="size-full object-cover"
      src={source}
      alt={asset.altText || asset.displayName}
      onError={() => {
        if (source !== asset.publicUrl) {
          setSource(asset.publicUrl);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function MediaPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const root = await getAdminMedia(null);
        const servicesFolder = root.folders.find(
          (folder) => folder.name.toLowerCase() === "services",
        );
        if (!servicesFolder)
          throw new Error("The Services media folder is not available yet.");
        const library = await getAdminMedia(servicesFolder.id);
        let nextAssets = library.assets;
        if (value && !nextAssets.some((asset) => asset.id === value)) {
          try {
            const selected = await getAdminMediaAsset(value);
            nextAssets = [selected, ...nextAssets];
          } catch {
            // A deleted or inaccessible asset should not block the rest of the editor.
          }
        }
        if (active) {
          setFolderId(servicesFolder.id);
          setAssets(nextAssets);
          setError("");
        }
      } catch (loadError) {
        if (!active) return;
        if (isUnauthorizedMediaError(loadError)) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Service media could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [value]);

  const selectedAsset = assets.find((asset) => asset.id === value) ?? null;

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !folderId) return;
    setUploading(true);
    setError("");
    try {
      const compressed = await compressImageToWebp(file);
      const asset = await uploadMediaAsset(folderId, compressed.file, {
        displayName: compressed.file.name,
        width: compressed.width,
        height: compressed.height,
      });
      setAssets((current) => [
        asset,
        ...current.filter((candidate) => candidate.id !== asset.id),
      ]);
      onChange(asset.id);
    } catch (uploadError) {
      if (isUnauthorizedMediaError(uploadError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The service image could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border-t border-[#e9e3da] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={fieldLabelClass}>Managed service image</p>
          <p className="mt-1 text-[11px] text-[#948d84]">
            Use a compressed library image for the most reliable public page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]">
            {uploading ? "Uploading…" : "Upload image"}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void upload(event)}
              disabled={disabled || uploading || loading}
            />
          </label>
          {value ? (
            <button
              className="min-h-9 rounded-full px-2.5 text-[11px] font-bold text-[#b34b60] transition-colors hover:bg-[#fff1f3]"
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
        <div className="grid size-16 shrink-0 overflow-hidden rounded-[12px] bg-[#f3f1ec] ring-1 ring-[#e5dfd6]">
          {selectedAsset ? (
            <MediaAssetThumb asset={selectedAsset} />
          ) : (
            <span className="grid place-items-center text-[10px] text-[#aaa49b]">
              None
            </span>
          )}
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Choose a managed service image</span>
          <select
            className={fieldClass}
            value={value ?? ""}
            disabled={disabled || loading}
            onChange={(event) => onChange(event.target.value || null)}
          >
            <option value="">No managed image</option>
            {assets.map((asset) => (
              <option value={asset.id} key={asset.id}>
                {asset.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p
          className="mt-2 text-[10px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-[10px] leading-[1.45] text-[#9a938a]">
        The public page uses a cache-safe{" "}
        <code className="font-mono text-[#77736e]">/api/media/…</code> URL. An
        external URL remains available as an optional fallback.
      </p>
    </div>
  );
}

function DetailEditor({
  detail,
  onChange,
  mediaAssetId,
  onMediaAssetChange,
}: {
  detail: ServiceDetailContent;
  onChange: (next: ServiceDetailContent) => void;
  mediaAssetId: string | null | undefined;
  onMediaAssetChange: (value: string | null) => void;
}) {
  const update = <K extends keyof ServiceDetailContent>(
    key: K,
    value: ServiceDetailContent[K],
  ) => onChange({ ...detail, [key]: value });
  const addFact = () =>
    update("facts", [...detail.facts, { label: "", value: "" }]);
  const addPricing = () =>
    update("pricing", [
      ...detail.pricing,
      {
        name: "New package",
        price: "Let's talk",
        description: "",
        features: [],
        action: "Book now",
        whatsappLabel: "Discuss on WhatsApp",
      },
    ]);
  const addFaq = () =>
    update("faqs", [...detail.faqs, { question: "", answer: "" }]);
  const selectedTools = detail.tools ?? [];
  const addTool = (slug: string) => {
    if (!slug || selectedTools.includes(slug)) return;
    update("tools", [...selectedTools, slug]);
  };

  return (
    <div className="overflow-hidden border-y border-[#e4ded5] bg-white/35">
      <SectionDisclosure
        title="Hero and media"
        description="CTA, quick details and the visual shown beside the service intro."
      >
        <div className="space-y-5">
          <div>
            <div className="mb-3">
              <p className={fieldLabelClass}>Quick details</p>
              <p className="mt-1 text-[11px] text-[#948d84]">
                Short facts customers see before reading the service content.
              </p>
            </div>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Field
                label="CTA label"
                value={detail.ctaLabel}
                onChange={(event) => update("ctaLabel", event.target.value)}
                placeholder="Talk to an advisor"
              />
              <Field
                label="Starting price"
                value={detail.startingPrice}
                onChange={(event) =>
                  update("startingPrice", event.target.value)
                }
                placeholder="From BDT 5,000"
              />
              <Field
                label="Delivery time"
                value={detail.deliveryTime}
                onChange={(event) => update("deliveryTime", event.target.value)}
                placeholder="2 to 3 days"
              />
              <Field
                label="Service mode"
                value={detail.serviceMode}
                onChange={(event) => update("serviceMode", event.target.value)}
                placeholder="Online or offline"
              />
            </div>
          </div>
          <div className="border-t border-[#e9e3da] pt-5">
            <div className="mb-3">
              <p className={fieldLabelClass}>Visual media</p>
              <p className="mt-1 text-[11px] text-[#948d84]">
                A managed image is preferred; the text remains accessible for
                every visitor.
              </p>
            </div>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                label="Media title"
                value={detail.mediaTitle}
                onChange={(event) => update("mediaTitle", event.target.value)}
              />
              <div className="sm:col-span-2">
                <MediaPicker
                  value={mediaAssetId}
                  onChange={onMediaAssetChange}
                  disabled={false}
                />
              </div>
              <Field
                className="sm:col-span-2"
                label="External media URL"
                value={detail.mediaUrl}
                onChange={(event) => update("mediaUrl", event.target.value)}
                placeholder="https://…"
                hint="Optional fallback when no managed image is selected."
              />
              <TextAreaField
                className="sm:col-span-2"
                label="Media description"
                value={detail.mediaDescription}
                onChange={(event) =>
                  update("mediaDescription", event.target.value)
                }
              />
              <Field
                className="sm:col-span-2"
                label="Media alt text"
                value={detail.mediaAlt}
                onChange={(event) => update("mediaAlt", event.target.value)}
                placeholder="Describe the image for accessibility"
              />
            </div>
          </div>
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Overview and guided filing"
        description="The public-page body, managed through one rich-text editor."
        open
      >
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={fieldLabelClass}>Public page body</p>
              <p className="mt-1 text-[11px] text-[#948d84]">
                Use headings, lists, links and images to explain the full
                service journey.
              </p>
            </div>
            <span className="rounded-full bg-[#f3f0eb] px-2.5 py-1 text-[10px] font-bold text-[#777168]">
              Rich text
            </span>
          </div>
          <div className="mt-4">
            <RichTextEditor
              ariaLabel="Complete service overview and guided filing"
              placeholder="Write the complete overview, approach, benefits and filing steps…"
              value={
                detail.overviewHtml !== undefined
                  ? detail.overviewHtml
                  : legacyOverviewHtml(detail)
              }
              onChange={(html) => update("overviewHtml", html)}
            />
          </div>
          <p className="mt-2 text-[10px] leading-[1.45] text-[#989188]">
            Use Visual for standard writing, HTML &amp; CSS for custom layouts,
            and Preview to inspect the exact result before saving.
          </p>
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Helpful tools"
        description="Attach calculators or document builders that support this service."
        count={selectedTools.length}
      >
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field
            label="Section eyebrow"
            value={detail.toolsEyebrow ?? ""}
            onChange={(event) => update("toolsEyebrow", event.target.value)}
            placeholder="Helpful tools"
          />
          <Field
            label="Section title"
            value={detail.toolsTitle ?? ""}
            onChange={(event) => update("toolsTitle", event.target.value)}
            placeholder="Keep the next step close at hand."
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Section subtitle"
            value={detail.toolsDescription ?? ""}
            onChange={(event) => update("toolsDescription", event.target.value)}
            placeholder="Link a calculator or document builder that helps customers move forward."
          />
        </div>
        <div className="mt-5 border-t border-[#e9e3da] pt-5">
          <label className="block min-w-0">
            <span className={fieldLabelClass}>Add a calculator or builder</span>
            <select
              className={`${fieldClass} mt-1.5`}
              value=""
              onChange={(event) => addTool(event.target.value)}
            >
              <option value="">Choose a tool…</option>
              <optgroup label="Calculators">
                {businessTools
                  .filter(
                    (tool) =>
                      tool.group === "calculator" &&
                      !selectedTools.includes(tool.slug),
                  )
                  .map((tool) => (
                    <option key={tool.slug} value={tool.slug}>
                      {tool.title}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Document builders">
                {businessTools
                  .filter(
                    (tool) =>
                      tool.group === "builder" &&
                      !selectedTools.includes(tool.slug),
                  )
                  .map((tool) => (
                    <option key={tool.slug} value={tool.slug}>
                      {tool.title}
                    </option>
                  ))}
              </optgroup>
            </select>
          </label>
          {selectedTools.length ? (
            <div className="mt-4 divide-y divide-[#e9e3da] border-y border-[#e9e3da]">
              {selectedTools.map((slug) => {
                const tool = businessTools.find(
                  (candidate) => candidate.slug === slug,
                );
                if (!tool) return null;
                return (
                  <div
                    className="flex min-w-0 items-center justify-between gap-3 py-3"
                    key={slug}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-[#3f3b37]">
                        {tool.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em] text-[#a19a91]">
                        {tool.group === "calculator"
                          ? "Calculator"
                          : "Document builder"}
                      </span>
                    </span>
                    <RemoveButton
                      label={`Remove ${tool.title}`}
                      onClick={() =>
                        update(
                          "tools",
                          selectedTools.filter(
                            (candidate) => candidate !== slug,
                          ),
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-[#948d84]">
              No tools attached. This section stays hidden on the public page
              until you add one.
            </p>
          )}
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Key facts"
        description="Optional short facts shown beside the service overview on larger screens."
        count={detail.facts.length}
      >
        <div>
          <Field
            label="Section label"
            value={detail.keyFactsLabel ?? ""}
            onChange={(event) => update("keyFactsLabel", event.target.value)}
            placeholder="Key facts"
          />
          <div className="mt-5 flex items-start justify-between gap-3 border-t border-[#e9e3da] pt-5">
            <div>
              <p className={fieldLabelClass}>Facts shown beside the overview</p>
              <p className="mt-1 text-[11px] text-[#948d84]">
                Leave this list empty and the public facts column stays hidden.
              </p>
            </div>
            <AddButton onClick={addFact}>+ Add fact</AddButton>
          </div>
          {detail.facts.length ? (
            <div className="mt-3 divide-y divide-[#e9e3da] border-y border-[#e9e3da]">
              {detail.facts.map((fact, index) => (
                <div
                  className="grid gap-2 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_32px] sm:items-center"
                  key={`fact-${index}`}
                >
                  <div className="min-w-0">
                    <label
                      className="sr-only"
                      htmlFor={`service-fact-label-${index}`}
                    >
                      Fact {index + 1} label
                    </label>
                    <input
                      className={fieldClass}
                      id={`service-fact-label-${index}`}
                      value={fact.label}
                      placeholder="Label"
                      onChange={(event) =>
                        update(
                          "facts",
                          detail.facts.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <label
                      className="sr-only"
                      htmlFor={`service-fact-value-${index}`}
                    >
                      Fact {index + 1} value
                    </label>
                    <input
                      className={fieldClass}
                      id={`service-fact-value-${index}`}
                      value={fact.value}
                      placeholder="Value"
                      onChange={(event) =>
                        update(
                          "facts",
                          detail.facts.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <RemoveButton
                    label={`Remove fact ${index + 1}`}
                    onClick={() =>
                      update(
                        "facts",
                        detail.facts.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-[#948d84]">
              No key facts added. The facts column will not render publicly.
            </p>
          )}
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Pricing and booking"
        description="Optional packages, actions and WhatsApp prompts for this service."
        count={detail.pricing.length}
      >
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field
            label="Section eyebrow"
            value={detail.pricingEyebrow ?? ""}
            onChange={(event) => update("pricingEyebrow", event.target.value)}
            placeholder="Optional / pricing"
          />
          <Field
            label="Featured package label"
            value={detail.mostPopularLabel ?? ""}
            onChange={(event) => update("mostPopularLabel", event.target.value)}
            placeholder="Most popular"
          />
          <Field
            className="sm:col-span-2"
            label="Section title"
            value={detail.pricingTitle ?? ""}
            onChange={(event) => update("pricingTitle", event.target.value)}
            placeholder="Show the right price for this service"
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Section subtitle"
            value={detail.pricingDescription ?? ""}
            onChange={(event) =>
              update("pricingDescription", event.target.value)
            }
            placeholder="Use a starting price, package cards or a custom quote depending on the scope."
          />
        </div>
        <div className="mt-5 border-t border-[#e9e3da] pt-5">
          <p className="max-w-[680px] text-[11px] leading-[1.5] text-[#948d84]">
            Add up to six packages. Each package receives a booking button;
            WhatsApp appears automatically when Contact settings has a number.
          </p>
          {detail.pricing.length ? (
            <div className="mt-3 divide-y divide-[#e9e3da] border-y border-[#e9e3da]">
              {detail.pricing.map((tier, index) => (
                <div className="relative py-4" key={`pricing-${index}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={fieldLabelClass}>
                      Package {String(index + 1).padStart(2, "0")}
                    </p>
                    <RemoveButton
                      label={`Remove package ${index + 1}`}
                      onClick={() =>
                        update(
                          "pricing",
                          detail.pricing.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                    <Field
                      label="Package name"
                      value={tier.name}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label="Price"
                      value={tier.price}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, price: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="From BDT 5,000"
                    />
                    <Field
                      label="Book button label"
                      value={tier.action}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, action: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label="WhatsApp label"
                      value={tier.whatsappLabel ?? ""}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, whatsappLabel: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Discuss on WhatsApp"
                    />
                    <TextAreaField
                      className="sm:col-span-2"
                      label="Package description"
                      value={tier.description}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, description: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="What this option is best for"
                    />
                  </div>
                  <div className="mt-5 border-t border-[#e9e3da] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className={fieldLabelClass}>
                        Included features{" "}
                        <span className="ml-1 font-medium text-[#9b958c]">
                          {tier.features.length}
                        </span>
                      </p>
                      <AddButton
                        onClick={() =>
                          update(
                            "pricing",
                            detail.pricing.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, features: [...item.features, ""] }
                                : item,
                            ),
                          )
                        }
                      >
                        + Add feature
                      </AddButton>
                    </div>
                    {tier.features.length ? (
                      <div className="mt-2 divide-y divide-[#e9e3da]">
                        {tier.features.map((feature, featureIndex) => (
                          <div
                            className="flex items-center gap-2 py-2"
                            key={`pricing-${index}-feature-${featureIndex}`}
                          >
                            <label
                              className="sr-only"
                              htmlFor={`service-pricing-${index}-feature-${featureIndex}`}
                            >
                              Package {index + 1} feature {featureIndex + 1}
                            </label>
                            <input
                              className={fieldClass}
                              id={`service-pricing-${index}-feature-${featureIndex}`}
                              value={feature}
                              placeholder="Included outcome or deliverable"
                              onChange={(event) =>
                                update(
                                  "pricing",
                                  detail.pricing.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          features: item.features.map(
                                            (candidate, candidateIndex) =>
                                              candidateIndex === featureIndex
                                                ? event.target.value
                                                : candidate,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                            <RemoveButton
                              label="Remove package feature"
                              onClick={() =>
                                update(
                                  "pricing",
                                  detail.pricing.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          features: item.features.filter(
                                            (_, candidateIndex) =>
                                              candidateIndex !== featureIndex,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-[#948d84]">
                        No included features yet.
                      </p>
                    )}
                  </div>
                  <label className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full px-2.5 text-[11px] font-semibold text-[#5f5a54] transition-colors hover:bg-[#f4f1ec]">
                    <input
                      className="size-4 accent-[#0055ff]"
                      type="checkbox"
                      checked={Boolean(tier.featured)}
                      onChange={(event) =>
                        update(
                          "pricing",
                          detail.pricing.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, featured: event.target.checked }
                              : item,
                          ),
                        )
                      }
                    />
                    Mark as most popular
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-[#948d84]">
              No pricing yet. The pricing section stays hidden on the public
              page.
            </p>
          )}
          <div className="mt-3">
            {detail.pricing.length < 6 ? (
              <AddButton onClick={addPricing}>+ Add pricing package</AddButton>
            ) : (
              <p className="text-[11px] text-[#948d84]">
                Six pricing packages is the maximum.
              </p>
            )}
          </div>
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="FAQs"
        description="Answers that help customers decide before they contact your team."
        count={detail.faqs.length}
      >
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field
            label="Section eyebrow"
            value={detail.faqEyebrow ?? ""}
            onChange={(event) => update("faqEyebrow", event.target.value)}
            placeholder="Optional / FAQ"
          />
          <Field
            label="Support label"
            value={detail.faqSupportLabel ?? ""}
            onChange={(event) => update("faqSupportLabel", event.target.value)}
            placeholder="Still deciding?"
          />
          <Field
            className="sm:col-span-2"
            label="Section title"
            value={detail.faqTitle ?? ""}
            onChange={(event) => update("faqTitle", event.target.value)}
            placeholder="Common questions"
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Section subtitle"
            value={detail.faqDescription ?? ""}
            onChange={(event) => update("faqDescription", event.target.value)}
            placeholder="A few clear answers before you choose the next step."
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Support text"
            value={detail.faqSupportDescription ?? ""}
            onChange={(event) =>
              update("faqSupportDescription", event.target.value)
            }
            placeholder="Talk to an advisor when the right path needs a little context."
          />
        </div>
        <div className="mt-5 border-t border-[#e9e3da] pt-5">
          {detail.faqs.length ? (
            <div className="divide-y divide-[#e9e3da] border-y border-[#e9e3da]">
              {detail.faqs.map((faq, index) => (
                <div className="relative py-4" key={`faq-${index}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={fieldLabelClass}>
                      Question {String(index + 1).padStart(2, "0")}
                    </p>
                    <RemoveButton
                      label={`Remove FAQ ${index + 1}`}
                      onClick={() =>
                        update(
                          "faqs",
                          detail.faqs.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-5">
                    <Field
                      label="Question"
                      value={faq.question}
                      onChange={(event) =>
                        update(
                          "faqs",
                          detail.faqs.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, question: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <TextAreaField
                      label="Answer"
                      value={faq.answer}
                      onChange={(event) =>
                        update(
                          "faqs",
                          detail.faqs.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, answer: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#948d84]">
              No FAQs yet. The FAQ section stays hidden.
            </p>
          )}
          <div className="mt-3">
            <AddButton onClick={addFaq}>+ Add FAQ</AddButton>
          </div>
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Contact and booking"
        description="The final prompt that opens the shared contact form for this service."
      >
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Field
            label="Section eyebrow"
            value={detail.contactEyebrow ?? ""}
            onChange={(event) => update("contactEyebrow", event.target.value)}
            placeholder="Ready when you are"
          />
          <Field
            label="Button label"
            value={detail.contactButtonLabel ?? ""}
            onChange={(event) =>
              update("contactButtonLabel", event.target.value)
            }
            placeholder="Talk to an advisor"
          />
          <Field
            className="sm:col-span-2"
            label="Section title"
            value={detail.contactTitle ?? ""}
            onChange={(event) => update("contactTitle", event.target.value)}
            placeholder="Need help choosing the right option?"
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Section subtitle"
            value={detail.contactDescription ?? ""}
            onChange={(event) =>
              update("contactDescription", event.target.value)
            }
            placeholder="A short conversation is enough to recommend the right path for"
          />
        </div>
        <p className="mt-4 border-t border-[#e9e3da] pt-4 text-[11px] leading-[1.5] text-[#948d84]">
          The button opens the shared contact form. WhatsApp uses the global
          contact details configured in Contact settings.
        </p>
      </SectionDisclosure>
    </div>
  );
}

function ServiceEditor({
  service,
  menuOptions,
  onSaved,
}: {
  service: AdminService;
  menuOptions: AdminServiceMenuOption[];
  onSaved: (next: AdminService) => void;
}) {
  const [draft, setDraft] = useState(() => draftFromService(service));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(Boolean(service.detail));
  const [selectedMenuKey, setSelectedMenuKey] = useState(
    menuTargetKey(service.assignedMenu),
  );

  useEffect(() => {
    setDraft(draftFromService(service));
    setDetailOpen(Boolean(service.detail));
    setSelectedMenuKey(menuTargetKey(service.assignedMenu));
    setMessage("");
    setError("");
  }, [service.id, service.revision]);

  const update = <K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) => {
    setMessage("");
    setError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateSlug = (value: string) => {
    setMessage("");
    setError("");
    setDraft((current) => ({
      ...current,
      slug: value,
      href: `/services/${value}`,
    }));
  };

  const detail = draft.detail;
  const hasUnsavedChanges =
    JSON.stringify(draft) !== JSON.stringify(draftFromService(service));
  const menuGroups = useMemo(() => {
    const groups = new Map<string, AdminServiceMenuOption[]>();
    for (const option of menuOptions)
      groups.set(option.sectionLabel, [
        ...(groups.get(option.sectionLabel) ?? []),
        option,
      ]);
    return [...groups.entries()];
  }, [menuOptions]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (!service.profileId) {
        setError("Create the service before saving its details.");
        return;
      }
      if (!draft.titleEn.trim() || !draft.slug.trim()) {
        setError(
          "Add an English service title and a unique URL slug before saving.",
        );
        return;
      }
      const saved = await updateAdminService(
        service.profileId,
        {
          serviceKey: draft.serviceKey,
          slug: draft.slug,
          label: draft.titleEn,
          description: draft.descriptionEn,
          href: `/services/${draft.slug}`,
          icon: normalizeServiceIcon(draft.icon),
          titleEn: draft.titleEn,
          titleBn: draft.titleBn,
          descriptionEn: draft.descriptionEn,
          descriptionBn: draft.descriptionBn,
          mediaAssetId: draft.mediaAssetId,
          detail: detailOpen ? (detail ?? emptyDetail()) : null,
        },
        draft.revision,
      );
      onSaved(saved);
      setMessage("Draft saved.");
    } catch (saveError) {
      if (isServiceConflictError(saveError))
        setError(
          "This service changed elsewhere. Reload it before saving again.",
        );
      else
        setError(
          saveError instanceof Error
            ? saveError.message
            : "The service could not be saved.",
        );
    } finally {
      setSaving(false);
    }
  }

  async function assignMenu() {
    if (!service.profileId || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await assignAdminService(
        service.profileId,
        menuTargetFromKey(selectedMenuKey),
        service.revision,
      );
      onSaved(saved);
      setSelectedMenuKey(menuTargetKey(saved.assignedMenu));
      setMessage(
        saved.assignedMenu
          ? "Service attached to the menu."
          : "Service detached. Its page content is still safe.",
      );
    } catch (assignmentError) {
      if (isServiceConflictError(assignmentError))
        setError(
          assignmentError instanceof Error
            ? assignmentError.message
            : "That menu entry is already in use.",
        );
      else
        setError(
          assignmentError instanceof Error
            ? assignmentError.message
            : "The menu assignment could not be changed.",
        );
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!service.profileId || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await publishAdminService(
        service.profileId,
        service.revision,
      );
      onSaved(saved);
      setMessage("Service page published.");
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "The service could not be published.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function unpublish() {
    if (!service.profileId || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await unpublishAdminService(
        service.profileId,
        service.revision,
      );
      onSaved(saved);
      setMessage(
        "Service page unpublished. Its saved content is still here as a draft.",
      );
    } catch (unpublishError) {
      setError(
        unpublishError instanceof Error
          ? unpublishError.message
          : "The service could not be unpublished.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="min-w-0 bg-white/60"
      aria-labelledby="service-editor-title"
    >
      <div className="sticky top-[72px] z-20 flex min-w-0 items-center justify-between gap-3 border-b border-[#ddd8cf] bg-[#fffdfa]/95 px-3 py-3 backdrop-blur lg:top-[80px] sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-accent sm:block">
            Service editor
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <h2
              className="truncate font-brand text-[17px] font-bold tracking-[-0.035em] text-[#071b3d] sm:text-[22px]"
              id="service-editor-title"
            >
              {draft.titleEn || "Untitled service"}
            </h2>
            <StatusPill service={service} />
          </div>
          <p className="mt-1 hidden truncate text-[10px] text-[#9b958c] sm:block">
            {service.assignedMenu
              ? `${service.assignedMenu.sectionLabel} · ${service.assignedMenu.groupLabel}`
              : "Not connected to navigation"}{" "}
            · Updated {dateLabel(service.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {hasUnsavedChanges ? (
            <span className="hidden rounded-full bg-[#fff0e0] px-2 py-1 text-[10px] font-bold text-[#a45e24] md:inline-flex">
              Unsaved
            </span>
          ) : null}
          {service.status === "PUBLISHED" ? (
            <a
              className="hidden min-h-9 items-center justify-center rounded-full bg-white px-3 text-[11px] font-bold text-[#4f4b47] ring-1 ring-[#d8d2c8] transition-colors hover:border-[#c8c0b6] hover:text-[#0055ff] sm:inline-flex"
              href={`/services/${service.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Preview ↗
            </a>
          ) : null}
          <SaveButton
            disabled={saving || !service.profileId}
            onClick={() => void save()}
          >
            {saving ? (
              <>
                <span className="hidden sm:inline">Saving…</span>
                <span className="sm:hidden">…</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Save draft</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </SaveButton>
          {service.status === "PUBLISHED" ? (
            <button
              className="min-h-9 rounded-full px-2 text-[10px] font-bold text-[#a34b5c] transition-colors hover:bg-[#fce7ea] disabled:opacity-50 sm:px-3 sm:text-[11px]"
              type="button"
              disabled={saving}
              onClick={() => void unpublish()}
            >
              Unpublish
            </button>
          ) : detailOpen ? (
            <button
              className="min-h-9 rounded-full px-2 text-[10px] font-bold text-[#29634d] transition-colors hover:bg-[#e3f4e8] disabled:opacity-50 sm:px-3 sm:text-[11px]"
              type="button"
              disabled={saving || !service.profileId}
              onClick={() => void publish()}
            >
              Publish
            </button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          className="mx-4 mt-4 rounded-[12px] bg-[#effaf3] px-3.5 py-2.5 text-[12px] font-semibold text-[#29634d] sm:mx-6"
          role="status"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          className="mx-4 mt-4 rounded-[12px] bg-[#fff4f5] px-3.5 py-2.5 text-[12px] font-semibold text-[#ad3148] sm:mx-6"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-8 p-4 sm:p-6 lg:p-7">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section
            className="min-w-0 border-t border-[#e9e3da] pt-5"
            aria-labelledby="service-identity-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={fieldLabelClass} id="service-identity-title">
                  Page identity
                </p>
                <p className="mt-1 text-[12px] text-[#948d84]">
                  Only the English title and public URL are required.
                </p>
              </div>
              <span className="text-[10px] font-medium text-[#9b958c]">
                Revision {draft.revision}
              </span>
            </div>
            <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Field
                label="English service title"
                value={draft.titleEn}
                required
                onChange={(event) => update("titleEn", event.target.value)}
                placeholder="Limited company registration"
              />
              <Field
                label="Public URL slug"
                value={draft.slug}
                required
                onChange={(event) =>
                  updateSlug(slugifyDraft(event.target.value))
                }
                placeholder="limited-company-registration"
                hint="Lowercase letters, numbers and hyphens only."
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9e3da] pt-4 text-[11px] text-[#7c756d]">
              <span>Public page</span>
              <strong className="break-all font-mono text-[11px] font-semibold text-[#3f3c38]">
                /services/{draft.slug || "…"}
              </strong>
            </div>
            <details className="group mt-5 border-t border-[#e9e3da] pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-[12px] font-bold text-[#4f4b47]">
                    Localization and card settings
                  </span>
                  <span className="mt-1 block text-[10px] text-[#9b958c]">
                    Bangla content, catalogue summaries and icon.
                  </span>
                </span>
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f2efe9] text-[16px] font-normal text-[#847d74] transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field
                  label="Bangla title"
                  value={draft.titleBn}
                  onChange={(event) => update("titleBn", event.target.value)}
                  placeholder="লিমিটেড কোম্পানি নিবন্ধন"
                />
                <label className="block min-w-0">
                  <span className={fieldLabelClass}>Service icon</span>
                  <div className="mt-1.5">
                    <IconPicker
                      value={draft.icon}
                      onChange={(value) => update("icon", value)}
                      disabled={saving}
                    />
                  </div>
                </label>
                <TextAreaField
                  className="sm:col-span-2"
                  label="English summary"
                  value={draft.descriptionEn}
                  onChange={(event) =>
                    update("descriptionEn", event.target.value)
                  }
                  placeholder="A short explanation for the service catalogue."
                />
                <TextAreaField
                  className="sm:col-span-2"
                  label="Bangla summary"
                  value={draft.descriptionBn}
                  onChange={(event) =>
                    update("descriptionBn", event.target.value)
                  }
                  placeholder="সেবাটির সংক্ষিপ্ত বিবরণ"
                />
              </div>
            </details>
          </section>

          <section
            className="min-w-0 border-t border-[#e9e3da] pt-5"
            aria-labelledby="service-navigation-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={fieldLabelClass} id="service-navigation-title">
                  Menu connection
                </p>
                <p className="mt-1 text-[12px] text-[#948d84]">
                  Connect this page to one live menu entry when it is ready.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${service.assignedMenu ? "bg-[#e1f2e7] text-[#29634d]" : "bg-[#f2efe9] text-[#777168]"}`.trim()}
              >
                {service.assignedMenu ? "Connected" : "Not connected"}
              </span>
            </div>
            <label className="mt-5 block min-w-0">
              <span className={fieldLabelClass}>Choose menu entry</span>
              <select
                className={`${fieldClass} mt-1.5`}
                value={selectedMenuKey}
                disabled={saving || !menuOptions.length}
                onChange={(event) => setSelectedMenuKey(event.target.value)}
              >
                <option value="">Not assigned</option>
                {menuGroups.map(([sectionLabel, options]) => (
                  <optgroup label={sectionLabel} key={sectionLabel}>
                    {options.map((option) => {
                      const inUse = Boolean(
                        option.assignedProfileId &&
                        option.assignedProfileId !== service.profileId,
                      );
                      return (
                        <option
                          key={`${option.targetType}:${option.id}`}
                          value={`${option.targetType}:${option.id}`}
                          disabled={inUse}
                        >
                          {option.pathLabel}
                          {inUse ? " · already assigned" : ""}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-[11px] leading-[1.5] text-[#948d84]">
                {hasUnsavedChanges
                  ? "Save this draft before changing the menu connection."
                  : service.assignedMenu
                    ? `Currently connected to ${service.assignedMenu.sectionLabel} / ${service.assignedMenu.groupLabel} / ${service.assignedMenu.label}.`
                    : "You can publish this page before connecting it to navigation."}
              </p>
              {selectedMenuKey === menuTargetKey(service.assignedMenu) ? (
                <span className="shrink-0 text-[10px] font-semibold text-[#9a938a]">
                  {service.assignedMenu
                    ? "Menu is up to date"
                    : "Choose a menu to connect"}
                </span>
              ) : (
                <button
                  className="min-h-10 shrink-0 rounded-full bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                  disabled={saving || hasUnsavedChanges || !menuOptions.length}
                  onClick={() => void assignMenu()}
                >
                  {selectedMenuKey ? "Connect menu" : "Remove menu"}
                </button>
              )}
            </div>
          </section>
        </div>

        <section
          className="border-t border-[#e9e3da] pt-6"
          aria-labelledby="service-content-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={fieldLabelClass} id="service-content-title">
                Service page content
              </p>
              <p className="mt-1 text-[12px] text-[#948d84]">
                Work through only the public sections this service needs.
              </p>
            </div>
            {service.detail || detailOpen ? (
              <span className="inline-flex min-h-8 items-center rounded-full bg-[#e4f3e8] px-3 text-[10px] font-bold text-[#29634d]">
                Content enabled
              </span>
            ) : (
              <button
                className="inline-flex min-h-9 items-center rounded-full bg-[#f2efe9] px-3 text-[11px] font-bold text-[#5e5952] transition-colors hover:bg-[#ebe6de]"
                type="button"
                onClick={() => {
                  setDetailOpen(true);
                  setDraft((current) => ({
                    ...current,
                    href: `/services/${current.slug}`,
                    detail: current.detail ?? emptyDetail(),
                  }));
                }}
              >
                Add page content
              </button>
            )}
          </div>
          {detailOpen ? (
            <div className="mt-5">
              <DetailEditor
                detail={detail ?? emptyDetail()}
                mediaAssetId={draft.mediaAssetId}
                onMediaAssetChange={(value) => update("mediaAssetId", value)}
                onChange={(next) => update("detail", next)}
              />
            </div>
          ) : (
            <p className="mt-5 border-t border-[#e9e3da] pt-4 text-[12px] text-[#817a72]">
              Save the title and URL first, then add the detail sections when
              you are ready.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export function ServicePagesModule() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "assigned" | "unassigned">("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getAdminServices()
      .then((items) => {
        if (active) {
          setServices(items);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!active) return;
        if (isUnauthorizedServiceError(loadError)) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Service data could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const assigned = Boolean(service.assignedMenu);
      const matchesScope =
        scope === "all" || (scope === "assigned" ? assigned : !assigned);
      const searchable = [
        service.title,
        service.description,
        service.titleEn,
        service.titleBn,
        service.category,
        service.groupLabel,
        service.assignedMenu?.sectionLabel ?? "",
        service.assignedMenu?.groupLabel ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return matchesScope && (!needle || searchable.includes(needle));
    });
  }, [query, scope, services]);

  async function createService() {
    if (creating) return;
    setCreating(true);
    setError("");
    const slug = "untitled-service-" + Date.now().toString(36);

    try {
      const created = await createAdminService({
        serviceKey: "service:" + slug,
        slug,
        label: "Untitled service",
        description: "",
        href: "/services/" + slug,
        icon: "briefcase",
        titleEn: "Untitled service",
        titleBn: "",
        descriptionEn: "",
        descriptionBn: "",
        detail: null,
      });
      const profileId = created.profileId ?? created.id;
      window.location.assign(
        "/admin/services/pages/" + encodeURIComponent(profileId),
      );
    } catch (createError) {
      if (isUnauthorizedServiceError(createError)) {
        window.location.assign("/admin/login");
        return;
      }
      setError(
        createError instanceof Error
          ? createError.message
          : "The service could not be created.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
            Content workspace
          </p>
          <h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#071b3d] sm:text-[48px]">
            Service pages
          </h1>
          <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">
            Create a service page first. Its editor handles the title, unique
            slug, optional localization, page content and menu assignment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] hover:border-[#aaa197]"
            href="/services"
            target="_blank"
            rel="noreferrer"
          >
            Preview catalogue ↗
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-transparent px-4 text-[12px] font-bold text-[#4f4b47] hover:border-[#aaa197]"
            href="/admin/services"
          >
            Menu structure
          </a>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-55"
            type="button"
            disabled={creating}
            onClick={() => void createService()}
          >
            {creating ? "Creating…" : "+ New service"}
          </button>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-[14px] bg-[#fff4f5] px-4 py-3 text-[13px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-[20px] bg-white/60 px-5 py-10 text-center text-[13px] text-[#77736e] ring-1 ring-[#ddd8cf]/80">
          Loading service pages…
        </div>
      ) : null}

      {!loading && services.length ? (
        <section
          className="overflow-hidden rounded-[22px] bg-white/65 ring-1 ring-[#ddd8cf]/80"
          aria-labelledby="service-records-title"
        >
          <div className="flex flex-col gap-4 border-b border-[#eee9e2] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]"
                  id="service-records-title"
                >
                  Service records
                </p>
                <span className="rounded-full bg-[#f4f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">
                  {services.length}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[#9b958c]">
                Menu entries are only connection points. Open a record to edit
                its page.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <input
                className={fieldClass.replace("mt-2 ", "mt-0 ")}
                type="search"
                aria-label="Find a service page"
                placeholder="Find a service…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(["all", "assigned", "unassigned"] as const).map((item) => (
                  <button
                    className={
                      "shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold " +
                      (scope === item
                        ? "bg-[#071b3d] text-white"
                        : "bg-[#f4f1ec] text-[#77736e]")
                    }
                    type="button"
                    key={item}
                    onClick={() => setScope(item)}
                  >
                    {item === "all"
                      ? "All " + services.length
                      : item === "assigned"
                        ? "Assigned " +
                          services.filter((service) => service.assignedMenu)
                            .length
                        : "Unassigned " +
                          services.filter((service) => !service.assignedMenu)
                            .length}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#eee9e2]">
            {filtered.map((service) => {
              const tone = getToneClasses(service.color, service.surface);
              const href =
                "/admin/services/pages/" +
                encodeURIComponent(service.profileId ?? service.id);
              return (
                <a
                  className="group flex min-w-0 items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#faf9f6] sm:px-5"
                  href={href}
                  key={service.id}
                >
                  <span
                    className={
                      "grid size-10 shrink-0 place-items-center rounded-[12px] " +
                      tone.surface +
                      " " +
                      tone.text
                    }
                  >
                    <ServiceIcon
                      name={normalizeServiceIcon(service.icon)}
                      className="size-[19px]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-[14px] font-bold text-[#29252a] group-hover:text-[#0055ff]">
                        {service.titleEn || "Untitled service"}
                      </span>
                      <StatusPill service={service} />
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[#9b958c]">
                      /services/{service.slug} ·{" "}
                      {service.assignedMenu
                        ? service.assignedMenu.sectionLabel +
                          " / " +
                          service.assignedMenu.groupLabel
                        : "Not assigned to menu"}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="block text-[11px] font-semibold text-[#5f5a54]">
                      {service.detail ? "Page content" : "Basic record"}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#a09a91]">
                      {service.assignedMenu
                        ? "Menu connected"
                        : "Ready to connect"}
                    </span>
                  </span>
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[#071b3d] text-[14px] text-white transition-transform group-hover:-translate-y-px"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              );
            })}
            {!filtered.length ? (
              <p className="px-5 py-10 text-center text-[12px] text-[#9b958c]">
                No matching service pages.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {!loading && !services.length && !error ? (
        <section className="rounded-[20px] bg-white/60 px-5 py-12 text-center ring-1 ring-[#ddd8cf]/80">
          <p className="font-brand text-[24px] font-bold tracking-[-0.03em] text-[#29252a]">
            Your service workspace is ready.
          </p>
          <p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-[1.5] text-[#77736e]">
            Create a standalone service page, then attach it to any real menu
            entry from the editor.
          </p>
          <button
            className="mt-4 min-h-10 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:opacity-55"
            type="button"
            disabled={creating}
            onClick={() => void createService()}
          >
            {creating ? "Creating…" : "+ Create first service"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

export function ServicePageEditorModule({ id }: { id: string }) {
  const [service, setService] = useState<AdminService | null>(null);
  const [menuOptions, setMenuOptions] = useState<AdminServiceMenuOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void Promise.all([getAdminService(id), getAdminServiceMenuOptions()])
      .then(([nextService, nextMenuOptions]) => {
        if (!active) return;
        setService(nextService);
        setMenuOptions(nextMenuOptions);
      })
      .catch((loadError) => {
        if (!active) return;
        if (isUnauthorizedServiceError(loadError)) {
          window.location.assign("/admin/login");
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "This service page could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function handleSaved(next: AdminService) {
    setService(next);
    setMenuOptions((current) =>
      current.map((option) => {
        const optionKey = option.targetType + ":" + option.id;
        const assignedKey = menuTargetKey(next.assignedMenu);
        if (option.assignedProfileId === next.profileId)
          return {
            ...option,
            assignedProfileId: null,
            assignedProfileTitle: null,
          };
        if (optionKey === assignedKey)
          return {
            ...option,
            assignedProfileId: next.profileId,
            assignedProfileTitle: next.titleEn,
          };
        return option;
      }),
    );
  }

  if (loading) {
    return (
      <div className="rounded-[20px] bg-white/60 px-5 py-12 text-center text-[13px] text-[#77736e] ring-1 ring-[#ddd8cf]/80">
        Loading service editor…
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-4">
        <a
          className="text-[12px] font-semibold text-[#0055ff] hover:text-[#071b3d]"
          href="/admin/services/pages"
        >
          ← All service pages
        </a>
        <p
          className="rounded-[14px] bg-[#fff4f5] px-4 py-3 text-[13px] font-semibold text-[#ad3148]"
          role="alert"
        >
          {error || "This service page was not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <a
        className="inline-flex min-h-9 items-center rounded-full bg-white px-3.5 text-[12px] font-bold text-[#5f5a54] ring-1 ring-[#d8d2c8] hover:text-[#0055ff]"
        href="/admin/services/pages"
      >
        ← All service pages
      </a>
      <ServiceEditor
        key={service.id + "-" + service.revision}
        service={service}
        menuOptions={menuOptions}
        onSaved={handleSaved}
      />
    </div>
  );
}
