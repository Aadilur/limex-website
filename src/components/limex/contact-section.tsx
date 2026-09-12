"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";

import { navigation, type NavItem } from "./data";
import { ActionButton, CheckIcon, ChevronDownIcon } from "./ui";
import { getPublicMenu, request } from "@/lib/menu-api";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { ContactContent } from "@/lib/landing-types";
import { getPublicContactSettings } from "@/lib/contact-api";
import type { PublicContactSettings } from "@/lib/contact-types";

type ContactValues = {
  services: string[];
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
};

export type ContactRequestSource = {
  type: "BLOG";
  slug: string;
  service?: string;
};

type ServiceOption = { label: string; value: string };
type ServiceGroup = { label: string; items: ServiceOption[] };

const initialValues: ContactValues = {
  services: [],
  name: "",
  phone: "",
  email: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
};
const fieldLabelClassName = "flex min-w-0 flex-col gap-2";
const fieldLabelTextClassName = "text-button font-semibold text-[#49313a]";
const fieldControlClassName = "w-full min-w-0 rounded-[14px] border-2 border-[#a4a39b] bg-page px-3.5 text-body-sm leading-normal text-[#172019] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(54,54,49,0.06)] outline-none placeholder:text-[#777872] transition-colors hover:border-[#8f9089] focus:border-accent focus:bg-page focus:ring-4 focus:ring-[#f3d2da]";

function getMinimumDateTimeInputValue() {
  const minimum = new Date();
  const minutes = minimum.getMinutes();
  minimum.setSeconds(0, 0);
  if (minutes === 0) minimum.setMinutes(0);
  else if (minutes <= 30) minimum.setMinutes(30);
  else minimum.setHours(minimum.getHours() + 1, 0, 0, 0);

  if (minimum.getHours() < 9) minimum.setHours(9, 0, 0, 0);
  if (minimum.getHours() > 18 || (minimum.getHours() === 18 && minimum.getMinutes() > 0)) {
    minimum.setDate(minimum.getDate() + 1);
    minimum.setHours(9, 0, 0, 0);
  }

  const localMinimum = new Date(minimum.getTime() - minimum.getTimezoneOffset() * 60_000);
  return localMinimum.toISOString().slice(0, 16);
}

function getServiceGroups(menuNavigation: NavItem[]): ServiceGroup[] {
  return menuNavigation
    .filter((item) => item.megaGroups?.length)
    .map((section) => ({
      label: section.label,
      items: Array.from(new Map(
        (section.megaGroups ?? []).flatMap((group) => group.items).map((item) => [item.label, item]),
      ).values()).map((item) => ({ label: item.label, value: `${section.label}: ${item.label}` })),
    }))
    .filter((section) => section.items.length > 0);
}

function findServiceOption(groups: ServiceGroup[], requestedService: string) {
  const normalized = requestedService.trim().toLowerCase();
  if (!normalized) return undefined;
  return groups.flatMap((group) => group.items).find((option) => {
    const value = option.value.toLowerCase();
    return value === normalized || option.label.toLowerCase() === normalized || value.endsWith(`: ${normalized}`);
  });
}

function ServiceMultiSelect({ groups, value, onChange, hasError, helperText, instanceId }: { groups: ServiceGroup[]; value: string[]; onChange: (nextValue: string[]) => void; hasError: boolean; helperText: string; instanceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsId = `${instanceId}-service-options`;
  const options = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const selectedOptions = options.filter((option) => value.includes(option.value));
  const summary = selectedOptions.length === 0
    ? "Choose one or more services"
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} services selected`;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={`${fieldControlClassName} flex h-12 items-center justify-between gap-3 text-left ${hasError ? "border-accent ring-4 ring-[#f3d2da]" : ""}`.trim()}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={optionsId}
        aria-invalid={hasError}
        aria-label="Choose one or more services"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`min-w-0 truncate ${selectedOptions.length ? "text-[#172019]" : "text-[#777872]"}`.trim()}>{summary}</span>
        <ChevronDownIcon className={`size-5 shrink-0 text-[#65665f] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`.trim()} />
      </button>
      <p className="mt-1 text-micro text-muted">{helperText}</p>

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[16px] border border-[#d0cdc4] bg-[#f8f6f1] shadow-[0_18px_42px_rgba(42,44,39,0.12)]" id={optionsId} role="listbox" aria-multiselectable="true" aria-label="Choose services">
          <div className="flex items-center justify-between border-b border-[#dedbd3] px-3.5 py-2.5">
            <span className="text-micro font-semibold text-[#4c4d48]">Choose services</span>
            <button className="text-micro font-semibold text-accent transition-colors hover:text-[#bd3f60] disabled:cursor-not-allowed disabled:text-[#aaa9a2]" type="button" onClick={() => onChange([])} disabled={value.length === 0}>Clear</button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {groups.map((group) => (
              <div className="not-last:pb-2" key={group.label}>
                <p className="px-2.5 pb-1 pt-1 text-overline text-[#6c6c65]">{group.label}</p>
                <div className="grid gap-0.5">
                  {group.items.map((option) => {
                    const selected = value.includes(option.value);
                    return (
                      <button
                        className={`flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-body-xs transition-colors ${selected ? "bg-[#f5e3e8] text-ink" : "text-[#4f504b] hover:bg-white/75"}`.trim()}
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => toggleOption(option.value)}
                      >
                        <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] border ${selected ? "border-accent bg-accent text-white" : "border-[#c5c3bb] bg-page text-transparent"}`.trim()} aria-hidden="true">{selected ? <CheckIcon className="size-3" /> : null}</span>
                        <span className="min-w-0">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ContactFormProps = {
  content?: ContactContent;
  compact?: boolean;
  formId?: string;
  initialService?: string;
  initialMessage?: string;
  source?: ContactRequestSource | null;
};

export function ContactForm({ content = defaultLandingContent.contact, compact = false, formId = "contact-form", initialService, initialMessage, source = null }: ContactFormProps) {
  const [menuNavigation, setMenuNavigation] = useState<NavItem[]>(navigation);
  const [values, setValues] = useState<ContactValues>(() => ({ ...initialValues, message: initialMessage ?? "" }));
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [minimumDateTimeValue, setMinimumDateTimeValue] = useState("");
  const [blogSource, setBlogSource] = useState<ContactRequestSource | null>(source);
  const submission = useRef<{ key: string; fingerprint: string } | null>(null);
  const serviceGroups = useMemo(() => getServiceGroups(menuNavigation), [menuNavigation]);
  const instanceId = useId().replace(/:/g, "");
  const formTitleId = `${instanceId}-title`;
  const contactMethodHelpId = `${instanceId}-contact-method-help`;

  const updateValue = <Field extends keyof ContactValues>(field: Field, value: ContactValues[Field]) => {
    setSubmitted(false);
    setReference("");
    setFormError("");
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateSchedule = (value: string) => {
    const [preferredDate = "", preferredTime = ""] = value.split("T");
    setSubmitted(false);
    setReference("");
    setFormError("");
    setValues((current) => ({ ...current, preferredDate, preferredTime }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (values.services.length === 0) {
      setSubmitted(false);
      setFormError("Choose at least one service so we can direct your request.");
      return;
    }

    if (!values.phone.trim() && !values.email.trim()) {
      setSubmitted(false);
      setFormError("Add a phone number or email so we know how to reach you.");
      return;
    }

    if (Boolean(values.preferredDate) !== Boolean(values.preferredTime)) {
      setSubmitted(false);
      setFormError("Choose both a date and time, or leave the schedule blank.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const requestType = values.preferredDate && values.preferredTime ? "APPOINTMENT" : "CALLBACK";
    const payload = {
      toolSlug: "contact",
      requestType,
      services: values.services,
      name: values.name,
      phone: values.phone,
      email: values.email,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      message: values.message,
      consent: true,
      website: String(data.get("website") ?? ""),
      ...(blogSource ? { source: blogSource } : {}),
    };
    const fingerprint = JSON.stringify(payload);
    if (!submission.current || submission.current.fingerprint !== fingerprint) submission.current = { key: crypto.randomUUID(), fingerprint };

    setFormError("");
    setBusy(true);
    try {
      const saved = await request<{ reference: string }>("/api/tools/requests", { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.key }) });
      setReference(saved.reference);
      setSubmitted(true);
    } catch (error) {
      setSubmitted(false);
      setFormError(error instanceof Error ? error.message : "We couldn’t save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setMinimumDateTimeValue(getMinimumDateTimeInputValue());

    const params = new URLSearchParams(window.location.search);
    const article = params.get("article");
    const requestedService = initialService ?? source?.service ?? params.get("service") ?? "";
    const urlService = params.get("service") || undefined;
    const urlSource: ContactRequestSource | null = params.get("from") === "blog" && article
      ? { type: "BLOG", slug: article, ...(urlService ? { service: urlService } : {}) }
      : null;
    const resolvedSource = source ?? urlSource;
    if (resolvedSource) setBlogSource(resolvedSource);

    const setInitialService = (groups: ServiceGroup[]) => {
      const match = findServiceOption(groups, requestedService);
      if (!match) return;
      setValues((current) => current.services.length ? current : { ...current, services: [match.value] });
    };

    setInitialService(getServiceGroups(navigation));
    void getPublicMenu()
      .then((managedItems) => {
        if (cancelled) return;
        setMenuNavigation(managedItems);
        setInitialService(getServiceGroups(managedItems));
      })
      .catch(() => {
        // Keep the bundled top-level service list available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [initialService, source?.service, source?.slug]);

  const formClassName = compact
    ? "relative flex min-h-0 flex-col p-4 sm:p-6"
    : "relative flex min-h-0 flex-col rounded-[24px] border border-[#c8c6be] bg-page p-card-pad-sm shadow-[0_12px_30px_rgba(42,44,39,0.04)] lg:min-h-[560px] lg:p-[32px]";
  const fieldGap = compact ? "gap-3" : "gap-cluster";

  return (
    <form className={formClassName} id={formId} aria-labelledby={formTitleId} onSubmit={handleSubmit}>
      {!compact ? <span className="pointer-events-none absolute left-4 top-0 h-1 w-14 rounded-b-full bg-accent lg:left-8" aria-hidden="true" /> : null}
      <div className={`border-b border-[#d3d0c8] ${compact ? "pb-4" : "pb-section-gap-lg"}`.trim()}>
        <p className="text-overline text-accent">{content.formEyebrow}</p>
        <h3 className="mt-2 font-brand text-subheading text-ink" id={formTitleId}>{content.formTitle}</h3>
        <p className="mt-cluster-xs text-body-xs text-muted">{content.formDescription}</p>
      </div>

      <div className={`${compact ? "mt-4" : "mt-section-gap-lg"} flex flex-col ${fieldGap}`.trim()}>
        <div className="grid grid-cols-1 gap-cluster lg:grid-cols-2">
          <div className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>Service</span>
            <ServiceMultiSelect groups={serviceGroups} value={values.services} onChange={(nextValue) => updateValue("services", nextValue)} hasError={Boolean(formError && values.services.length === 0)} helperText={content.serviceHelper} instanceId={instanceId} />
          </div>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>Name</span>
            <input className={`h-12 ${fieldControlClassName}`} autoComplete="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="Your name" required />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-cluster lg:grid-cols-2">
          <label className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>Phone / WhatsApp</span>
            <input className={`h-12 ${fieldControlClassName}`} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="+880 1XXX XXXXXX" aria-describedby={contactMethodHelpId} />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>Email</span>
            <input className={`h-12 ${fieldControlClassName}`} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="you@example.com" aria-describedby={contactMethodHelpId} />
          </label>
        </div>
        <p className="-mt-1 text-micro text-muted" id={contactMethodHelpId}>{content.contactMethodHelper}</p>
        {formError ? <p className="-mt-1 text-body-xs font-semibold text-accent" role="alert">{formError}</p> : null}

        <fieldset className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <legend className={fieldLabelTextClassName}>Preferred date &amp; time <span className="font-normal text-muted">(optional)</span></legend>
            <span className="text-micro text-muted">Dhaka time · 30-minute slots</span>
          </div>
          <label className="relative block">
            <span className="sr-only">Preferred date and time</span>
            <input className={`h-12 ${fieldControlClassName}`} type="datetime-local" min={minimumDateTimeValue || undefined} step="1800" value={values.preferredDate && values.preferredTime ? `${values.preferredDate}T${values.preferredTime}` : ""} onChange={(event) => updateSchedule(event.target.value)} aria-label="Preferred date and time" />
          </label>
          <p className="text-micro leading-relaxed text-muted">{content.scheduleHelper}</p>
        </fieldset>

        <label className={fieldLabelClassName}>
          <span className={fieldLabelTextClassName}>Short message <span className="font-normal text-muted">(optional)</span></span>
          <textarea className={`min-h-[88px] ${fieldControlClassName} resize-y py-3`} maxLength={500} value={values.message} onChange={(event) => updateValue("message", event.target.value)} placeholder="Tell us what you need help with." />
        </label>
      </div>

      <div className="mt-auto pt-section-gap-lg">
        <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <button className="group mt-4 flex h-12 w-full items-center justify-between rounded-[14px] border border-accent bg-accent px-5 text-button font-strong text-white shadow-[0_8px_16px_rgba(222,77,115,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c53f62] hover:bg-[#c53f62] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-3 disabled:cursor-wait disabled:opacity-65" type="submit" disabled={busy} aria-busy={busy}>
          <span>{busy ? "Sending…" : submitted ? "Request received" : content.submitLabel}</span>
          <span className="text-icon-action transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">{busy ? "…" : submitted ? "✓" : "↗"}</span>
        </button>
        <p className="mt-cluster text-body-xs text-muted/70" aria-live="polite">{submitted ? `${content.submittedNote} Reference: ${reference}` : content.privacyNote}</p>
      </div>
    </form>
  );
}

export function ContactSection({ content = defaultLandingContent.contact }: { content?: ContactContent }) {
  const [contactDetails, setContactDetails] = useState<PublicContactSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPublicContactSettings().then((settings) => {
      if (!cancelled) setContactDetails(settings);
    }).catch(() => {
      // The landing copy remains a safe fallback when the contact settings are unavailable.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappDisplay = contactDetails?.whatsappDisplay || content.whatsapp;
  const email = contactDetails?.email || content.email;

  return (
    <section className="flex min-h-0 flex-col gap-cluster-sm bg-page px-page-gutter pt-section-gap-xl pb-page-gutter lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-cluster-lg lg:rounded-panel lg:px-page-gutter-lg lg:pt-section-gap-xl lg:pb-section-y-lg" id="contact" aria-labelledby="contact-title">
      <div className="flex min-h-0 flex-col items-center text-center lg:min-h-[560px] lg:justify-center lg:py-6">
        <div className="flex w-full max-w-[430px] flex-col items-center">
          <div className="max-w-[400px]">
            <h2 className="mt-0 max-w-[390px] text-balance font-brand text-section-title-mobile text-ink lg:text-section-title" id="contact-title">{content.title}</h2>
            <p className="mt-cluster-lg max-w-[360px] text-body-sm text-muted">{content.description}</p>
          </div>
        </div>

        <div className="relative mt-section-gap-lg w-full max-w-[360px] border-t border-[#ead2d7] pt-section-gap-lg lg:mt-section-gap-xl">
          <p className="text-overline text-accent">{content.startEyebrow}</p>
          <p className="mt-cluster-sm text-body-xs text-muted">{content.startDescription}</p>
        </div>

        <div className="relative mt-section-gap-lg w-full max-w-[360px] border-t border-[#ead2d7] pt-section-gap-lg lg:mt-section-gap-xl">
          <p className="text-body-xs font-text text-muted">{content.directLineLabel}</p>
          <ActionButton href={contactDetails?.whatsappUrl || "#contact-form"} variant="dark" className="mt-cluster w-max min-h-11 border-accent bg-accent hover:border-[#c53f62] hover:bg-[#c53f62]">{content.directCtaLabel}</ActionButton>
          <div className="mt-section-gap-lg grid w-full grid-cols-1 gap-cluster-lg text-center sm:grid-cols-2">
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-accent">WHATSAPP</span>
              <strong className="text-body-sm font-semibold text-ink">{whatsappDisplay}</strong>
            </div>
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-accent">EMAIL</span>
              <strong className="break-words text-body-sm font-semibold text-ink sm:whitespace-nowrap">{email}</strong>
            </div>
          </div>
        </div>
      </div>

      <ContactForm content={content} />
    </section>
  );
}

type ContactModalProps = {
  articleSlug?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  content?: ContactContent;
  initialMessage?: string;
  serviceKey?: string;
  variant?: "dark" | "light" | "outline" | "white" | "soft" | "ghost" | "ghost-muted";
};

export function ContactModal({ articleSlug, buttonClassName = "", buttonLabel = "Start a conversation", content = defaultLandingContent.contact, initialMessage, serviceKey, variant = "white" }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalId = useId().replace(/:/g, "");
  const source: ContactRequestSource | null = articleSlug
    ? { type: "BLOG", slug: articleSlug, ...(serviceKey ? { service: serviceKey } : {}) }
    : null;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <ActionButton variant={variant} className={buttonClassName} onClick={() => setIsOpen(true)}>{buttonLabel}</ActionButton>
      {isOpen ? (
        <div className="fixed inset-0 z-[100]" role="presentation">
          <button className="absolute inset-0 size-full cursor-default bg-[#14131c]/45 backdrop-blur-[3px]" type="button" aria-label="Close contact form" onClick={() => setIsOpen(false)} />
          <div className="relative flex min-h-dvh items-start justify-center overflow-y-auto px-3 py-3 sm:items-center sm:p-6">
            <div className="relative z-10 my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-page shadow-[0_24px_80px_rgba(20,19,28,0.22)]" role="dialog" aria-modal="true" aria-labelledby={`${modalId}-title`}>
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e2ddd4] bg-page/95 px-4 py-4 backdrop-blur sm:px-6">
                <div>
                  <p className="text-overline text-accent">LET’S TALK</p>
                  <h2 className="mt-1 font-brand text-subheading text-ink" id={`${modalId}-title`}>A clear next step starts here.</h2>
                  <p className="mt-1 text-body-xs text-muted">Share the essentials and our team will guide you from there.</p>
                </div>
                <button ref={closeButtonRef} className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d5d0c8] bg-white text-[22px] leading-none text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-2" type="button" aria-label="Close contact form" onClick={() => setIsOpen(false)}>×</button>
              </div>
              <ContactForm content={content} compact formId={`${modalId}-form`} initialService={serviceKey} initialMessage={initialMessage} source={source} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
