"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  getAdminServices,
  isServiceConflictError,
  isUnauthorizedServiceError,
  publishAdminService,
  unpublishAdminService,
  updateAdminService,
  type AdminService,
} from "@/lib/service-api";
import type { ServiceDetailContent, ServiceDestinationType, ServiceProfileInput } from "@/lib/service-types";
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
    label: service.title,
    description: service.description,
    href: service.href,
    icon: service.icon,
    titleEn: service.titleEn,
    titleBn: service.titleBn,
    descriptionEn: service.descriptionEn,
    descriptionBn: service.descriptionBn,
    detail: cloneDetail(service.detail),
  };
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
  const label = service.status === "PUBLISHED" ? "Published" : service.status === "DRAFT" ? "Draft" : "Link only";
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

function ServiceEditor({ service, onSaved }: { service: AdminService; onSaved: (next: AdminService) => void }) {
  const [draft, setDraft] = useState(() => draftFromService(service));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(Boolean(service.detail));

  useEffect(() => {
    setDraft(draftFromService(service));
    setDetailOpen(Boolean(service.detail));
    setMessage("");
    setError("");
  }, [service.id, service.revision]);

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setMessage("");
    setError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const destination = destinationTypeFromHref(draft.href);
  const detail = draft.detail;
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
      if (!service.menuItemId) {
        setError("This service is detached from the menu. Reconnect it before saving.");
        return;
      }
      const saved = await updateAdminService(service.menuItemId, {
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
          <p className="mt-1 text-[11px] text-[#9b958c]">{service.category} · {service.groupLabel} · Updated {dateLabel(service.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {service.hasDetailPage ? <a className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-3.5 text-[11px] font-bold text-[#4f4b47] ring-1 ring-[#d8d2c8] hover:ring-[#aaa197]" href={`/services/${service.slug}`} target="_blank" rel="noreferrer">Preview ↗</a> : null}
          <SaveButton disabled={saving || !service.menuItemId} onClick={() => void save()}>{saving ? "Saving…" : "Save draft"}</SaveButton>
          {service.status === "PUBLISHED" ? <button className="min-h-10 rounded-full px-3 text-[11px] font-bold text-[#a34b5c] hover:bg-[#fce7ea] disabled:opacity-50" type="button" disabled={saving} onClick={() => void unpublish()}>Unpublish</button> : <button className="min-h-10 rounded-full px-3 text-[11px] font-bold text-[#29634d] hover:bg-[#e3f4e8] disabled:opacity-50" type="button" disabled={saving || !service.profileId} onClick={() => void publish()}>Publish</button>}
        </div>
      </div>

      {message ? <p className="mx-4 mt-4 rounded-[12px] bg-[#effaf3] px-3.5 py-2.5 text-[12px] font-semibold text-[#29634d] sm:mx-5" role="status">{message}</p> : null}
      {error ? <p className="mx-4 mt-4 rounded-[12px] bg-[#fff4f5] px-3.5 py-2.5 text-[12px] font-semibold text-[#ad3148] sm:mx-5" role="alert">{error}</p> : null}

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Catalogue basics</p><p className="mt-1 text-[12px] text-[#9b958c]">This copy appears in the menu and service catalogue.</p></div><span className="text-[11px] text-[#9b958c]">Revision {draft.revision}</span></div>
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
            <Field label="Service page slug" value={draft.slug} onChange={(event) => update("slug", event.target.value)} placeholder="company-formation" />
            <div className="flex items-end"><span className="w-full rounded-[13px] bg-[#f8f6f2] px-3.5 py-3 text-[12px] text-[#77736e]">Public page: <strong className="font-semibold text-[#3f3c38]">/services/{draft.slug || "…"}</strong></span></div>
          </div>
        </div>

        <div className="border-t border-[#eee9e2] pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Detail page content</p><p className="mt-1 text-[12px] text-[#9b958c]">Optional. Turn this on when this service needs its own Limex page.</p></div><button className={`inline-flex min-h-9 items-center rounded-full px-3 text-[11px] font-bold transition-colors ${detailOpen ? "bg-[#e4f3e8] text-[#29634d]" : "bg-[#f4f1ec] text-[#77736e]"}`.trim()} type="button" onClick={() => { setDetailOpen((open) => !open); if (!detail && !detailOpen) update("detail", emptyDetail()); }}>{detailOpen ? "Enabled" : "Create detail page"}</button></div>
          {detailOpen ? <div className="mt-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="English page title" value={draft.titleEn} onChange={(event) => update("titleEn", event.target.value)} /><Field label="Bangla page title" value={draft.titleBn} onChange={(event) => update("titleBn", event.target.value)} /><TextAreaField label="English page summary" value={draft.descriptionEn} onChange={(event) => update("descriptionEn", event.target.value)} /><TextAreaField label="Bangla page summary" value={draft.descriptionBn} onChange={(event) => update("descriptionBn", event.target.value)} /></div><div className="mt-4"><DetailEditor detail={detail ?? emptyDetail()} onChange={(next) => update("detail", next)} /></div></div> : <div className="mt-4 rounded-[14px] bg-[#faf9f6] px-4 py-3 text-[12px] text-[#817a72]">This service will continue to use its configured destination. No detail page will be published.</div>}
        </div>
      </div>
    </section>
  );
}

export function ServicePagesModule() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getAdminServices()
      .then((items) => {
        if (!active) return;
        setServices(items);
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

  const categories = useMemo(() => [...new Map(services.map((service) => [service.categoryKey, service.category])).entries()].map(([key, label]) => ({ key, label })), [services]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => (category === "all" || service.categoryKey === category) && (!needle || `${service.title} ${service.description} ${service.category} ${service.groupLabel}`.toLowerCase().includes(needle)));
  }, [category, query, services]);
  const activeService = filtered.find((service) => service.id === activeId) ?? filtered[0] ?? null;

  function updateService(next: AdminService) {
    setServices((current) => current.map((service) => service.id === next.id || (service.menuItemId && service.menuItemId === next.menuItemId) ? next : service));
    setActiveId(next.id);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">Content workspace</p><h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#14131c] sm:text-[48px]">Service pages</h1><p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">Manage catalogue copy, icons, destinations and optional detail pages from one focused workspace.</p></div>
        <div className="flex flex-wrap items-center gap-2"><a className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] hover:border-[#aaa197]" href="/services" target="_blank" rel="noreferrer">Preview catalogue ↗</a><a className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#14131c] px-4 text-[12px] font-bold text-white hover:bg-[#2d2c37]" href="/admin/services">Menu structure</a></div>
      </section>

      {error ? <p className="rounded-[14px] bg-[#fff4f5] px-4 py-3 text-[13px] font-semibold text-[#ad3148]" role="alert">{error}</p> : null}
      {loading ? <div className="rounded-[20px] bg-white/60 px-5 py-10 text-center text-[13px] text-[#77736e] ring-1 ring-[#ddd8cf]/80">Loading service catalogue…</div> : null}

      {!loading && services.length ? <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(270px,0.34fr)_minmax(0,0.66fr)] xl:items-start">
        <aside className="min-w-0 rounded-[22px] bg-white/60 p-3 ring-1 ring-[#ddd8cf]/80" aria-label="Service catalogue">
          <div className="px-2 pb-3"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Catalogue</p><span className="rounded-full bg-[#f4f1ec] px-2.5 py-1 text-[10px] font-bold text-[#77736e]">{services.length}</span></div><input className={`${fieldClass} mt-3`} type="search" placeholder="Find a service…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <div className="flex gap-1.5 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><button className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${category === "all" ? "bg-[#14131c] text-white" : "bg-[#f4f1ec] text-[#77736e]"}`.trim()} type="button" onClick={() => setCategory("all")}>All</button>{categories.map((item) => <button className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${category === item.key ? "bg-[#14131c] text-white" : "bg-[#f4f1ec] text-[#77736e]"}`.trim()} type="button" key={item.key} onClick={() => setCategory(item.key)}>{item.label}</button>)}</div>
          <div className="mt-2 divide-y divide-[#eee9e2]">{filtered.map((service) => { const tone = getToneClasses(service.color, service.surface); return <button className={`flex w-full items-center gap-3 px-2.5 py-3 text-left transition-colors ${service.id === activeService?.id ? "bg-[#fcecef]" : "hover:bg-[#faf9f6]"}`.trim()} type="button" key={service.id} onClick={() => setActiveId(service.id)}><span className={`grid size-9 shrink-0 place-items-center rounded-[11px] ${tone.surface} ${tone.text}`.trim()}><ServiceIcon name={normalizeServiceIcon(service.icon)} className="size-[18px]" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold text-[#29252a]">{service.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#9b958c]">{service.category}</span></span><span className="shrink-0"><StatusPill service={service} /></span></button>; })}{!filtered.length ? <p className="px-2.5 py-6 text-center text-[12px] text-[#9b958c]">No matching services.</p> : null}</div>
        </aside>
        {activeService ? <ServiceEditor key={`${activeService.id}-${activeService.revision}`} service={activeService} onSaved={updateService} /> : null}
      </div> : null}
      {!loading && !services.length && !error ? <div className="rounded-[20px] bg-white/60 px-5 py-10 text-center text-[13px] text-[#77736e] ring-1 ring-[#ddd8cf]/80">No menu services are available yet. Add a service from the menu structure first.</div> : null}
    </div>
  );
}
