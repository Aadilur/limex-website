"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  assignAdminService,
  createAdminService,
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
import type { ServiceDetailContent, ServiceDestinationType, ServiceMenuTargetType, ServiceProfileInput } from "@/lib/service-types";
import { ServiceIcon } from "@/components/limex/service-icons";
import type { ServiceIconName } from "@/components/limex/data";
import { getToneClasses } from "@/components/limex/styles";
import { IconPicker, normalizeServiceIcon } from "./icon-picker";

const fieldClass = "mt-2 min-h-11 w-full rounded-[13px] border border-[#d9d3ca] bg-white px-3.5 text-[13px] text-[#14131c] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#e44762] focus:ring-4 focus:ring-[#f54763]/10";
const textAreaClass = `${fieldClass} min-h-[90px] resize-y py-3 leading-[1.5]`;
const destinationTypes: Array<{ value: ServiceDestinationType; label: string; hint: string }> = [
  { value: "DETAIL", label: "Service detail page", hint: "Use the Limex service page for this service." },
  { value: "BLOG", label: "Blog or guide", hint: "Send visitors to an article or guide." },
  { value: "TOOL", label: "Business tool", hint: "Send visitors to a calculator or document builder." },
  { value: "CONTACT", label: "Contact form", hint: "Open the contact flow with this service selected." },
  { value: "INTERNAL", label: "Other internal page", hint: "Use any safe internal path." },
  { value: "EXTERNAL", label: "External website", hint: "Open an approved HTTP or HTTPS destination." },
];

function emptyDetail(): ServiceDetailContent {
  return {
    ctaLabel: "Talk to an advisor",
    startingPrice: "Let's talk",
    deliveryTime: "Confirmed after review",
    serviceMode: "Online or offline",
    mediaTitle: "A clearer next step",
    mediaDescription: "Add an optional image or video to introduce this service.",
    mediaUrl: "",
    mediaAlt: "",
    overviewEyebrow: "OVERVIEW",
    overviewTitle: "A practical path forward",
    overviewDescription: "Share the scope of this service and the next step your customer should take.",
    contentLabel: "THE LIMEX APPROACH",
    contentTitle: "Make the next step easier to understand.",
    contentDescription: "Add the key guidance, inclusions and expectations for this service.",
    contentLinkLabel: "Talk to an advisor",
    contentLinkHref: "#service-contact",
    benefits: [],
    steps: [],
    facts: [],
    pricing: [],
    faqs: [],
  };
}

function cloneDetail(detail: ServiceDetailContent | null) {
  if (!detail) return null;
  return {
    ...detail,
    benefits: [...detail.benefits],
    steps: detail.steps.map((step) => ({ ...step })),
    facts: detail.facts.map((fact) => ({ ...fact })),
    pricing: detail.pricing.map((tier) => ({ ...tier, features: [...tier.features] })),
    faqs: detail.faqs.map((faq) => ({ ...faq })),
  };
}

function draftFromService(service: AdminService): ServiceProfileInput & { revision: number; profileId: string | null } {
  return {
    revision: service.revision,
    profileId: service.profileId,
    serviceKey: service.serviceKey,
    slug: service.slug,
    label: service.assignedMenu?.label ?? service.title,
    description: service.description,
    href: service.href || `/services/${service.slug}`,
    icon: service.icon,
    titleEn: service.titleEn,
    titleBn: service.titleBn,
    descriptionEn: service.descriptionEn,
    descriptionBn: service.descriptionBn,
    detail: cloneDetail(service.detail),
  };
}

function slugifyDraft(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

function menuTargetKey(target: { id: string; targetType: ServiceMenuTargetType } | null) {
  return target ? `${target.targetType}:${target.id}` : "";
}

function menuTargetFromKey(value: string): { targetType: ServiceMenuTargetType; targetId: string } | null {
  const [targetType, ...idParts] = value.split(":");
  if ((targetType !== "ITEM" && targetType !== "LINK") || !idParts.length) return null;
  return { targetType, targetId: idParts.join(":") };
}

function dateLabel(value: string | null) {
  if (!value) return "Not saved yet";
  try {
    return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return "Recently";
  }
}

function Field({ label, value, onChange, placeholder, className = "", type = "text" }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string; type?: string }) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span>
      <input className={fieldClass} type={type} value={value} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block min-w-0 ${className}`.trim()}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span>
      <textarea className={textAreaClass} value={value} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

function SaveButton({ children = "Save draft", disabled, onClick }: { children?: ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-55" type="button" disabled={disabled} onClick={onClick}>{children}</button>;
}

function StatusPill({ service }: { service: AdminService }) {
  const label = service.status === "PUBLISHED" ? "Published" : service.status === "DRAFT" ? "Draft" : service.assignedMenu ? "Link only" : "Unassigned";
  const classes = service.status === "PUBLISHED" ? "bg-[#e1f2e7] text-[#29634d]" : service.status === "DRAFT" ? "bg-[#fff0e0] text-[#a45e24]" : "bg-[#f0edf7] text-[#655493]";
  return <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.09em] ${classes}`.trim()}>{label}</span>;
}

function destinationLabel(type: ServiceDestinationType) {
  return destinationTypes.find((item) => item.value === type)?.label ?? "Internal page";
}

function destinationTypeFromHref(href: string): ServiceDestinationType {
  const normalized = href.trim();
  if (normalized.startsWith("/services/")) return "DETAIL";
  if (normalized.startsWith("/blog/") || normalized.startsWith("/bn/blog/")) return "BLOG";
  if (normalized.startsWith("/business-tools/")) return "TOOL";
  if (normalized === "#contact" || normalized.startsWith("#contact-")) return "CONTACT";
  if (/^https?:\/\//i.test(normalized)) return "EXTERNAL";
  return "INTERNAL";
}

function DetailEditor({ detail, onChange }: { detail: ServiceDetailContent; onChange: (next: ServiceDetailContent) => void }) {
  const update = <K extends keyof ServiceDetailContent>(key: K, value: ServiceDetailContent[K]) => onChange({ ...detail, [key]: value });
  const addBenefit = () => update("benefits", [...detail.benefits, ""]);
  const addFact = () => update("facts", [...detail.facts, { label: "", value: "" }]);
  const addStep = () => update("steps", [...detail.steps, { title: "", description: "" }]);
  const addPricing = () => update("pricing", [...detail.pricing, { name: "New package", price: "Let's talk", description: "", features: [], action: "Book now", whatsappLabel: "Discuss on WhatsApp" }]);
  const addFaq = () => update("faqs", [...detail.faqs, { question: "", answer: "" }]);

  return (
    <div className="space-y-3">
      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>Page introduction</span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="CTA label" value={detail.ctaLabel} onChange={(event) => update("ctaLabel", event.target.value)} />
          <Field label="Starting price" value={detail.startingPrice} onChange={(event) => update("startingPrice", event.target.value)} />
          <Field label="Delivery time" value={detail.deliveryTime} onChange={(event) => update("deliveryTime", event.target.value)} />
          <Field label="Service mode" value={detail.serviceMode} onChange={(event) => update("serviceMode", event.target.value)} />
          <Field label="Media title" value={detail.mediaTitle} onChange={(event) => update("mediaTitle", event.target.value)} />
          <Field label="Media URL" value={detail.mediaUrl} onChange={(event) => update("mediaUrl", event.target.value)} placeholder="/api/... or https://…" />
          <TextAreaField className="sm:col-span-2" label="Media description" value={detail.mediaDescription} onChange={(event) => update("mediaDescription", event.target.value)} />
          <Field className="sm:col-span-2" label="Media alt text" value={detail.mediaAlt} onChange={(event) => update("mediaAlt", event.target.value)} placeholder="Describe the image for accessibility" />
        </div>
      </details>

      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>Overview and approach</span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid gap-4">
          <Field label="Overview eyebrow" value={detail.overviewEyebrow} onChange={(event) => update("overviewEyebrow", event.target.value)} />
          <Field label="Overview title" value={detail.overviewTitle} onChange={(event) => update("overviewTitle", event.target.value)} />
          <TextAreaField label="Overview description" value={detail.overviewDescription} onChange={(event) => update("overviewDescription", event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Approach label" value={detail.contentLabel} onChange={(event) => update("contentLabel", event.target.value)} />
            <Field label="Approach title" value={detail.contentTitle} onChange={(event) => update("contentTitle", event.target.value)} />
          </div>
          <TextAreaField label="Approach description" value={detail.contentDescription} onChange={(event) => update("contentDescription", event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Approach link label" value={detail.contentLinkLabel} onChange={(event) => update("contentLinkLabel", event.target.value)} />
            <Field label="Approach link URL" value={detail.contentLinkHref} onChange={(event) => update("contentLinkHref", event.target.value)} placeholder="#service-contact" />
          </div>
        </div>
      </details>

      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>What customers receive <span className="ml-1 text-[11px] font-medium text-[#9b958c]">{detail.benefits.length}</span></span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 space-y-2">
          {detail.benefits.map((benefit, index) => <div className="flex items-center gap-2" key={`benefit-${index}`}><input className={fieldClass.replace("mt-2 ", "mt-0 ")} value={benefit} placeholder="A clear customer outcome" onChange={(event) => update("benefits", detail.benefits.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button className="grid size-10 shrink-0 place-items-center rounded-full text-[18px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label="Remove benefit" onClick={() => update("benefits", detail.benefits.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}
          <button className="min-h-9 rounded-full bg-white px-3.5 text-[11px] font-bold text-[#5a554f] ring-1 ring-[#ddd7ce] hover:ring-[#aaa197]" type="button" onClick={addBenefit}>+ Add benefit</button>
        </div>
      </details>

      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>Steps and key facts <span className="ml-1 text-[11px] font-medium text-[#9b958c]">{detail.steps.length + detail.facts.length}</span></span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Steps</p><button className="text-[11px] font-bold text-accent" type="button" onClick={addStep}>+ Add</button></div>
            <div className="mt-2 space-y-2">{detail.steps.map((step, index) => <div className="grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_40px]" key={`step-${index}`}><input className={`${fieldClass} mt-0`} value={step.title} placeholder="Step title" onChange={(event) => update("steps", detail.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /><input className={`${fieldClass} mt-0`} value={step.description} placeholder="Short explanation" onChange={(event) => update("steps", detail.steps.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} /><button className="grid size-10 place-items-center rounded-full text-[18px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label="Remove step" onClick={() => update("steps", detail.steps.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Facts</p><button className="text-[11px] font-bold text-accent" type="button" onClick={addFact}>+ Add</button></div>
            <div className="mt-2 space-y-2">{detail.facts.map((fact, index) => <div className="grid gap-2 sm:grid-cols-2" key={`fact-${index}`}><input className={`${fieldClass} mt-0`} value={fact.label} placeholder="Label" onChange={(event) => update("facts", detail.facts.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /><div className="flex gap-2"><input className={`${fieldClass} mt-0`} value={fact.value} placeholder="Value" onChange={(event) => update("facts", detail.facts.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} /><button className="grid size-10 shrink-0 place-items-center rounded-full text-[18px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label="Remove fact" onClick={() => update("facts", detail.facts.filter((_, itemIndex) => itemIndex !== index))}>×</button></div></div>)}</div>
          </div>
        </div>
      </details>

      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>Pricing and booking <span className="ml-1 text-[11px] font-medium text-[#9b958c]">{detail.pricing.length}</span></span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 space-y-3">
          <p className="max-w-[620px] text-[11px] leading-[1.5] text-[#8b857e]">Add up to six packages. Each package gets a booking button, and a WhatsApp discussion link appears automatically when a WhatsApp number is configured in Contact settings.</p>
          {detail.pricing.map((tier, index) => (
            <article className="relative rounded-[15px] bg-white p-3 ring-1 ring-[#e5dfd7]" key={`pricing-${index}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b958c]">Package {String(index + 1).padStart(2, "0")}</p>
                <button className="grid size-8 place-items-center rounded-full text-[17px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label={`Remove package ${index + 1}`} onClick={() => update("pricing", detail.pricing.filter((_, itemIndex) => itemIndex !== index))}>×</button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Package name" value={tier.name} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
                <Field label="Price" value={tier.price} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} placeholder="From BDT 5,000" />
                <Field label="Book button label" value={tier.action} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, action: event.target.value } : item))} />
                <Field label="WhatsApp label" value={tier.whatsappLabel ?? ""} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, whatsappLabel: event.target.value } : item))} placeholder="Discuss on WhatsApp" />
                <TextAreaField className="sm:col-span-2" label="Package description" value={tier.description} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="What this option is best for" />
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Included features <span className="ml-1 font-medium text-[#9b958c]">{tier.features.length}</span></p><button className="text-[11px] font-bold text-accent" type="button" onClick={() => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, features: [...item.features, ""] } : item))}>+ Add</button></div>
                <div className="mt-2 space-y-2">
                  {tier.features.map((feature, featureIndex) => <div className="flex items-center gap-2" key={`pricing-${index}-feature-${featureIndex}`}><input className={`${fieldClass} mt-0`} value={feature} placeholder="Included outcome or deliverable" onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, features: item.features.map((candidate, candidateIndex) => candidateIndex === featureIndex ? event.target.value : candidate) } : item))} /><button className="grid size-10 shrink-0 place-items-center rounded-full text-[18px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label="Remove package feature" onClick={() => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, features: item.features.filter((_, candidateIndex) => candidateIndex !== featureIndex) } : item))}>×</button></div>)}
                </div>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-[#5f5a54]"><input className="size-4 accent-[#de4d73]" type="checkbox" checked={Boolean(tier.featured)} onChange={(event) => update("pricing", detail.pricing.map((item, itemIndex) => itemIndex === index ? { ...item, featured: event.target.checked } : item))} />Mark as most popular</label>
            </article>
          ))}
          {detail.pricing.length < 6 ? <button className="min-h-9 rounded-full bg-white px-3.5 text-[11px] font-bold text-[#5a554f] ring-1 ring-[#ddd7ce] hover:ring-[#aaa197]" type="button" onClick={addPricing}>+ Add pricing package</button> : <p className="text-[11px] text-[#9b958c]">Six pricing packages is the maximum.</p>}
        </div>
      </details>

      <details className="group rounded-[17px] bg-[#faf9f6] px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[#29252a] [&::-webkit-details-marker]:hidden">
          <span>FAQs <span className="ml-1 text-[11px] font-medium text-[#9b958c]">{detail.faqs.length}</span></span><span className="text-[18px] font-normal text-[#a59d93] transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 space-y-3">
          {detail.faqs.map((faq, index) => <div className="relative rounded-[13px] bg-white p-3 ring-1 ring-[#e5dfd7]" key={`faq-${index}`}><button className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-[17px] text-[#b34b60] hover:bg-[#fce7ea]" type="button" aria-label="Remove FAQ" onClick={() => update("faqs", detail.faqs.filter((_, itemIndex) => itemIndex !== index))}>×</button><div className="grid gap-3 pr-8"><Field label="Question" value={faq.question} onChange={(event) => update("faqs", detail.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} /><TextAreaField label="Answer" value={faq.answer} onChange={(event) => update("faqs", detail.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} /></div></div>)}
          <button className="min-h-9 rounded-full bg-white px-3.5 text-[11px] font-bold text-[#5a554f] ring-1 ring-[#ddd7ce] hover:ring-[#aaa197]" type="button" onClick={addFaq}>+ Add FAQ</button>
        </div>
      </details>
    </div>
  );
}

function ServiceEditor({ service, menuOptions, onSaved }: { service: AdminService; menuOptions: AdminServiceMenuOption[]; onSaved: (next: AdminService) => void }) {
  const [draft, setDraft] = useState(() => draftFromService(service));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(Boolean(service.detail));
  const [selectedMenuKey, setSelectedMenuKey] = useState(menuTargetKey(service.assignedMenu));

  useEffect(() => {
    setDraft(draftFromService(service));
    setDetailOpen(Boolean(service.detail));
    setSelectedMenuKey(menuTargetKey(service.assignedMenu));
    setMessage("");
    setError("");
  }, [service.id, service.revision]);

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
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
      href: current.href.startsWith("/services/") ? `/services/${value}` : current.href,
    }));
  };

  const destination = destinationTypeFromHref(draft.href);
  const detail = draft.detail;
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(draftFromService(service));
  const chooseDestination = (type: ServiceDestinationType) => {
    const defaults: Record<ServiceDestinationType, string> = {
      DETAIL: `/services/${draft.slug}`,
      BLOG: "/blog/",
      TOOL: "/business-tools/",
      CONTACT: "#contact",
      INTERNAL: "/",
      EXTERNAL: "https://",
    };
    update("href", defaults[type]);
  };

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
      const saved = await updateAdminService(service.profileId, {
        serviceKey: draft.serviceKey,
        slug: draft.slug,
        label: draft.label,
        description: draft.description,
        href: draft.href,
        icon: normalizeServiceIcon(draft.icon),
        titleEn: draft.titleEn,
        titleBn: draft.titleBn,
        descriptionEn: draft.descriptionEn,
        descriptionBn: draft.descriptionBn,
        detail: detailOpen ? (detail ?? emptyDetail()) : null,
      }, draft.revision);
      onSaved(saved);
      setMessage("Draft saved.");
    } catch (saveError) {
      if (isServiceConflictError(saveError)) setError("This service changed elsewhere. Reload it before saving again.");
      else setError(saveError instanceof Error ? saveError.message : "The service could not be saved.");
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
      const saved = await assignAdminService(service.profileId, menuTargetFromKey(selectedMenuKey), service.revision);
      onSaved(saved);
      setSelectedMenuKey(menuTargetKey(saved.assignedMenu));
      setMessage(saved.assignedMenu ? "Service attached to the menu." : "Service detached. Its page content is still safe.");
    } catch (assignmentError) {
      if (isServiceConflictError(assignmentError)) setError(assignmentError instanceof Error ? assignmentError.message : "That menu entry is already in use.");
      else setError(assignmentError instanceof Error ? assignmentError.message : "The menu assignment could not be changed.");
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
      const saved = await publishAdminService(service.profileId, service.revision);
      onSaved(saved);
      setMessage("Service page published.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "The service could not be published.");
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
      const saved = await unpublishAdminService(service.profileId, service.revision);
      onSaved(saved);
      setMessage("Service page unpublished. Its saved content is still here as a draft.");
    } catch (unpublishError) {
      setError(unpublishError instanceof Error ? unpublishError.message : "The service could not be unpublished.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="min-w-0 rounded-[22px] bg-white/65 ring-1 ring-[#ddd8cf]/80" aria-labelledby="service-editor-title">
      <div className="flex flex-col gap-4 border-b border-[#eee9e2] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Service page</p><StatusPill service={service} /></div>
          <h2 className="mt-2 truncate font-brand text-[25px] font-bold tracking-[-0.04em] text-[#14131c]" id="service-editor-title">{service.title}</h2>
          <p className="mt-1 text-[11px] text-[#9b958c]">{service.assignedMenu ? `${service.assignedMenu.sectionLabel} · ${service.assignedMenu.groupLabel}` : "Not assigned to a menu"} · Updated {dateLabel(service.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {service.hasDetailPage ? <a className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-3.5 text-[11px] font-bold text-[#4f4b47] ring-1 ring-[#d8d2c8] hover:ring-[#aaa197]" href={`/services/${service.slug}`} target="_blank" rel="noreferrer">Preview ↗</a> : null}
          <SaveButton disabled={saving || !service.profileId} onClick={() => void save()}>{saving ? "Saving…" : "Save draft"}</SaveButton>
          {service.status === "PUBLISHED" ? <button className="min-h-10 rounded-full px-3 text-[11px] font-bold text-[#a34b5c] hover:bg-[#fce7ea] disabled:opacity-50" type="button" disabled={saving} onClick={() => void unpublish()}>Unpublish</button> : <button className="min-h-10 rounded-full px-3 text-[11px] font-bold text-[#29634d] hover:bg-[#e3f4e8] disabled:opacity-50" type="button" disabled={saving || !service.profileId} onClick={() => void publish()}>Publish</button>}
        </div>
      </div>

      {message ? <p className="mx-4 mt-4 rounded-[12px] bg-[#effaf3] px-3.5 py-2.5 text-[12px] font-semibold text-[#29634d] sm:mx-5" role="status">{message}</p> : null}
      {error ? <p className="mx-4 mt-4 rounded-[12px] bg-[#fff4f5] px-3.5 py-2.5 text-[12px] font-semibold text-[#ad3148] sm:mx-5" role="alert">{error}</p> : null}

      <div className="space-y-5 p-4 sm:p-5">
        <div className="rounded-[16px] bg-[#f8f6f2] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Menu assignment</p>
              <p className="mt-1 max-w-[560px] text-[12px] leading-[1.5] text-[#8d877f]">Attach this service to one real menu entry. The list includes every top-level menu item across all sections; child links are not mixed in.</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${service.assignedMenu ? "bg-[#e1f2e7] text-[#29634d]" : "bg-white text-[#77736e] ring-1 ring-[#ded8cf]"}`.trim()}>{service.assignedMenu ? "Assigned" : "Unassigned"}</span>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Choose menu entry</span><select className={fieldClass} value={selectedMenuKey} disabled={saving || !menuOptions.length} onChange={(event) => setSelectedMenuKey(event.target.value)}><option value="">Not assigned</option>{menuOptions.map((option) => { const inUse = Boolean(option.assignedProfileId && option.assignedProfileId !== service.profileId); return <option key={`${option.targetType}:${option.id}`} value={`${option.targetType}:${option.id}`} disabled={inUse}>{option.pathLabel}{inUse ? " · already assigned" : ""}</option>; })}</select></label>
            <button className="min-h-11 shrink-0 rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={saving || hasUnsavedChanges || selectedMenuKey === menuTargetKey(service.assignedMenu) || !menuOptions.length} onClick={() => void assignMenu()}>{selectedMenuKey ? "Attach to menu" : "Remove assignment"}</button>
          </div>
          <p className="mt-2 text-[11px] text-[#9b958c]">{hasUnsavedChanges ? "Save the current draft before changing its menu assignment." : service.assignedMenu ? `Currently attached to ${service.assignedMenu.sectionLabel} / ${service.assignedMenu.groupLabel} / ${service.assignedMenu.label}.` : "This service can be drafted and published before it is placed in navigation."}</p>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Service identity</p><p className="mt-1 text-[12px] text-[#9b958c]">This is the reusable service record. When assigned, its name, summary and icon sync to the menu entry.</p></div><span className="text-[11px] text-[#9b958c]">Revision {draft.revision}</span></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Menu title" value={draft.label} onChange={(event) => update("label", event.target.value)} />
            <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Icon</span><div className="mt-2"><IconPicker value={draft.icon} onChange={(value) => update("icon", value)} disabled={saving} /></div></label>
            <TextAreaField className="sm:col-span-2" label="Short description" value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </div>
        </div>

        <div className="border-t border-[#eee9e2] pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Where should this go?</p><p className="mt-1 text-[12px] text-[#9b958c]">The selected destination controls menu, landing and catalogue clicks.</p></div><span className="rounded-full bg-[#f4f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">{destinationLabel(destination)}</span></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Destination type</span><select className={fieldClass} value={destination} onChange={(event) => chooseDestination(event.target.value as ServiceDestinationType)}>{destinationTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <Field label="Destination URL" value={draft.href} onChange={(event) => update("href", event.target.value)} placeholder="/blog/article or https://…" />
          </div>
          <p className="mt-2 text-[11px] text-[#9b958c]">{destinationTypes.find((item) => item.value === destination)?.hint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Service page slug" value={draft.slug} onChange={(event) => updateSlug(event.target.value)} placeholder="company-formation" />
            <div className="flex items-end"><span className="w-full rounded-[13px] bg-[#f8f6f2] px-3.5 py-3 text-[12px] text-[#77736e]">Public page: <strong className="font-semibold text-[#3f3c38]">/services/{draft.slug || "…"}</strong></span></div>
          </div>
        </div>

        <div className="border-t border-[#eee9e2] pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Detail page content</p><p className="mt-1 text-[12px] text-[#9b958c]">Optional. Turn this on when this service needs its own Limex page.</p></div><button className={`inline-flex min-h-9 items-center rounded-full px-3 text-[11px] font-bold transition-colors ${detailOpen ? "bg-[#e4f3e8] text-[#29634d]" : "bg-[#f4f1ec] text-[#77736e]"}`.trim()} type="button" onClick={() => { const nextOpen = !detailOpen; setDetailOpen(nextOpen); if (nextOpen) setDraft((current) => ({ ...current, href: current.href.startsWith("/services/") ? current.href : `/services/${current.slug}`, detail: current.detail ?? emptyDetail() })); }}>{detailOpen ? "Enabled" : "Create detail page"}</button></div>
          {detailOpen ? <div className="mt-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="English page title" value={draft.titleEn} onChange={(event) => update("titleEn", event.target.value)} /><Field label="Bangla page title" value={draft.titleBn} onChange={(event) => update("titleBn", event.target.value)} /><TextAreaField label="English page summary" value={draft.descriptionEn} onChange={(event) => update("descriptionEn", event.target.value)} /><TextAreaField label="Bangla page summary" value={draft.descriptionBn} onChange={(event) => update("descriptionBn", event.target.value)} /></div><div className="mt-4"><DetailEditor detail={detail ?? emptyDetail()} onChange={(next) => update("detail", next)} /></div></div> : <div className="mt-4 rounded-[14px] bg-[#faf9f6] px-4 py-3 text-[12px] text-[#817a72]">This service will continue to use its configured destination. No detail page will be published.</div>}
        </div>
      </div>
    </section>
  );
}

export function ServicePagesModule() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [menuOptions, setMenuOptions] = useState<AdminServiceMenuOption[]>([]);
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "assigned" | "unassigned">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newService, setNewService] = useState({ titleEn: "", titleBn: "", slug: "", descriptionEn: "", descriptionBn: "" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([getAdminServices(), getAdminServiceMenuOptions()])
      .then(([items, options]) => {
        if (!active) return;
        setServices(items);
        setMenuOptions(options);
        setActiveId((current) => current || items[0]?.id || "");
      })
      .catch((loadError) => {
        if (!active) return;
        if (isUnauthorizedServiceError(loadError)) setError("Your admin session expired. Sign in again to manage services.");
        else setError(loadError instanceof Error ? loadError.message : "Service data could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const assigned = Boolean(service.assignedMenu);
      const matchesScope = scope === "all" || (scope === "assigned" ? assigned : !assigned);
      const searchable = `${service.title} ${service.description} ${service.titleEn} ${service.titleBn} ${service.category} ${service.groupLabel} ${service.assignedMenu?.sectionLabel ?? ""} ${service.assignedMenu?.groupLabel ?? ""}`.toLowerCase();
      return matchesScope && (!needle || searchable.includes(needle));
    });
  }, [query, scope, services]);
  const activeService = filtered.find((service) => service.id === activeId) ?? filtered[0] ?? null;

  function updateService(next: AdminService) {
    setServices((current) => current.map((service) => service.id === next.id ? next : service));
    setMenuOptions((current) => current.map((option) => {
      const optionKey = `${option.targetType}:${option.id}`;
      const assignedKey = menuTargetKey(next.assignedMenu);
      if (option.assignedProfileId === next.profileId) return { ...option, assignedProfileId: null, assignedProfileTitle: null };
      if (optionKey === assignedKey) return { ...option, assignedProfileId: next.profileId, assignedProfileTitle: next.titleEn };
      return option;
    }));
    setActiveId(next.id);
  }

  function updateNewService(key: keyof typeof newService, value: string) {
    setCreateError("");
    setNewService((current) => ({ ...current, [key]: value }));
  }

  async function createService() {
    if (creating) return;
    const titleEn = newService.titleEn.trim();
    const titleBn = newService.titleBn.trim();
    const descriptionEn = newService.descriptionEn.trim();
    const descriptionBn = newService.descriptionBn.trim();
    const slug = slugifyDraft(newService.slug || titleEn);
    if (!titleEn || !titleBn || !descriptionEn || !descriptionBn || !slug) {
      setCreateError("Add English and Bangla titles, both summaries and a valid URL slug.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const created = await createAdminService({
        serviceKey: `service:${slug}`,
        slug,
        label: titleEn,
        description: descriptionEn,
        href: `/services/${slug}`,
        icon: "briefcase",
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        detail: null,
      });
      setServices((current) => [created, ...current]);
      setActiveId(created.id);
      setCreateOpen(false);
      setNewService({ titleEn: "", titleBn: "", slug: "", descriptionEn: "", descriptionBn: "" });
    } catch (createRequestError) {
      setCreateError(createRequestError instanceof Error ? createRequestError.message : "The service could not be created.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">Content workspace</p><h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#14131c] sm:text-[48px]">Service pages</h1><p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">Create service pages independently, then place them in any menu entry when they are ready.</p></div>
        <div className="flex flex-wrap items-center gap-2"><a className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] hover:border-[#aaa197]" href="/services" target="_blank" rel="noreferrer">Preview catalogue ↗</a><a className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-transparent px-4 text-[12px] font-bold text-[#4f4b47] hover:border-[#aaa197]" href="/admin/services">Menu structure</a><button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px" type="button" onClick={() => { setCreateOpen((current) => !current); setCreateError(""); }}>{createOpen ? "Close" : "+ New service"}</button></div>
      </section>

      {error ? <p className="rounded-[14px] bg-[#fff4f5] px-4 py-3 text-[13px] font-semibold text-[#ad3148]" role="alert">{error}</p> : null}

      {createOpen ? <section className="rounded-[20px] bg-[#14131c] p-4 text-white sm:p-5" aria-labelledby="new-service-title">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f08ca0]">New service record</p><h2 className="mt-1 font-brand text-[24px] font-bold tracking-[-0.04em]" id="new-service-title">Start with the essentials</h2><p className="mt-1 text-[12px] text-white/60">Create it first. You can attach it to a menu entry from the editor after it exists.</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70">Standalone</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">English title</span><input className="mt-2 min-h-11 w-full rounded-[13px] bg-white/10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:ring-2 focus:ring-[#f08ca0]" value={newService.titleEn} placeholder="Limited company registration" onChange={(event) => updateNewService("titleEn", event.target.value)} /></label>
          <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Bangla title</span><input className="mt-2 min-h-11 w-full rounded-[13px] bg-white/10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:ring-2 focus:ring-[#f08ca0]" value={newService.titleBn} placeholder="লিমিটেড কোম্পানি নিবন্ধন" onChange={(event) => updateNewService("titleBn", event.target.value)} /></label>
          <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">URL slug</span><input className="mt-2 min-h-11 w-full rounded-[13px] bg-white/10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:ring-2 focus:ring-[#f08ca0]" value={newService.slug} placeholder={slugifyDraft(newService.titleEn) || "limited-company-registration"} onChange={(event) => updateNewService("slug", event.target.value)} /></label>
          <label className="block min-w-0 sm:col-span-2 lg:col-span-3"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Short summary <span className="font-normal text-white/40">(English)</span></span><textarea className="mt-2 min-h-[76px] w-full resize-y rounded-[13px] bg-white/10 px-3.5 py-3 text-[13px] leading-[1.5] text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:ring-2 focus:ring-[#f08ca0]" value={newService.descriptionEn} placeholder="A short explanation for the menu and service catalogue." onChange={(event) => updateNewService("descriptionEn", event.target.value)} /></label>
          <label className="block min-w-0 sm:col-span-2 lg:col-span-3"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Short summary <span className="font-normal text-white/40">(Bangla, required)</span></span><textarea className="mt-2 min-h-[76px] w-full resize-y rounded-[13px] bg-white/10 px-3.5 py-3 text-[13px] leading-[1.5] text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:ring-2 focus:ring-[#f08ca0]" value={newService.descriptionBn} placeholder="সেবাটির সংক্ষিপ্ত বিবরণ" onChange={(event) => updateNewService("descriptionBn", event.target.value)} /></label>
        </div>
        {createError ? <p className="mt-3 rounded-[12px] bg-[#7c2940] px-3.5 py-2.5 text-[12px] font-semibold text-white" role="alert">{createError}</p> : null}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2"><button className="min-h-10 rounded-full px-4 text-[12px] font-bold text-white/65 hover:bg-white/10" type="button" onClick={() => setCreateOpen(false)}>Cancel</button><button className="min-h-10 rounded-full bg-[#e44762] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:opacity-50" type="button" disabled={creating} onClick={() => void createService()}>{creating ? "Creating…" : "Create service"}</button></div>
      </section> : null}

      {loading ? <div className="rounded-[20px] bg-white/60 px-5 py-10 text-center text-[13px] text-[#77736e] ring-1 ring-[#ddd8cf]/80">Loading service workspace…</div> : null}

      {!loading && services.length ? <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(270px,0.34fr)_minmax(0,0.66fr)] xl:items-start">
        <aside className="min-w-0 rounded-[22px] bg-white/60 p-3 ring-1 ring-[#ddd8cf]/80" aria-label="Service records">
          <div className="px-2 pb-3"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Service records</p><span className="rounded-full bg-[#f4f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">{services.length}</span></div><input className={`${fieldClass} mt-3`} type="search" placeholder="Find a service…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <div className="flex gap-1.5 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{(["all", "assigned", "unassigned"] as const).map((item) => <button className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${scope === item ? "bg-[#14131c] text-white" : "bg-[#f4f1ec] text-[#77736e]"}`.trim()} type="button" key={item} onClick={() => setScope(item)}>{item === "all" ? `All ${services.length}` : item === "assigned" ? `Assigned ${services.filter((service) => service.assignedMenu).length}` : `Unassigned ${services.filter((service) => !service.assignedMenu).length}`}</button>)}</div>
          <div className="mt-2 divide-y divide-[#eee9e2]">{filtered.map((service) => { const tone = getToneClasses(service.color, service.surface); return <button className={`flex w-full items-center gap-3 px-2.5 py-3 text-left transition-colors ${service.id === activeService?.id ? "bg-[#fcecef]" : "hover:bg-[#faf9f6]"}`.trim()} type="button" key={service.id} onClick={() => setActiveId(service.id)}><span className={`grid size-9 shrink-0 place-items-center rounded-[11px] ${tone.surface} ${tone.text}`.trim()}><ServiceIcon name={normalizeServiceIcon(service.icon)} className="size-[18px]" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold text-[#29252a]">{service.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#9b958c]">{service.assignedMenu ? `${service.assignedMenu.sectionLabel} · ${service.assignedMenu.groupLabel}` : "Not assigned to menu"}</span></span><span className="shrink-0"><StatusPill service={service} /></span></button>; })}{!filtered.length ? <p className="px-2.5 py-6 text-center text-[12px] text-[#9b958c]">No matching services.</p> : null}</div>
        </aside>
        {activeService ? <ServiceEditor key={`${activeService.id}-${activeService.revision}`} service={activeService} menuOptions={menuOptions} onSaved={updateService} /> : null}
      </div> : null}
      {!loading && !services.length && !error ? <div className="rounded-[20px] bg-white/60 px-5 py-10 text-center ring-1 ring-[#ddd8cf]/80"><p className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#29252a]">Your service workspace is ready.</p><p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-[1.5] text-[#77736e]">Create a service record, build its page, then attach it to one of the {menuOptions.length || "available"} real menu entries.</p><button className="mt-4 min-h-10 rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white" type="button" onClick={() => setCreateOpen(true)}>+ Create first service</button></div> : null}
    </div>
  );
}
