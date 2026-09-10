"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { navigation, type NavItem } from "./data";
import { ActionButton, CheckIcon, ChevronDownIcon } from "./ui";
import { getPublicMenu, request } from "@/lib/menu-api";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { ContactContent } from "@/lib/landing-types";

type ContactValues = {
  services: string[];
  requestType: "CALLBACK" | "APPOINTMENT";
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
};

type ServiceOption = { label: string; value: string };
type ServiceGroup = { label: string; items: ServiceOption[] };

const initialValues: ContactValues = {
  services: [],
  requestType: "CALLBACK",
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

function getTodayInputValue() {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localToday.toISOString().slice(0, 10);
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

function ServiceMultiSelect({ groups, value, onChange, hasError, helperText }: { groups: ServiceGroup[]; value: string[]; onChange: (nextValue: string[]) => void; hasError: boolean; helperText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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
        aria-controls="contact-service-options"
        aria-invalid={hasError}
        aria-label="Choose one or more services"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`min-w-0 truncate ${selectedOptions.length ? "text-[#172019]" : "text-[#777872]"}`.trim()}>{summary}</span>
        <ChevronDownIcon className={`size-5 shrink-0 text-[#65665f] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`.trim()} />
      </button>
      <p className="mt-1 text-micro text-muted">{helperText}</p>

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[16px] border border-[#d0cdc4] bg-[#f8f6f1] shadow-[0_18px_42px_rgba(42,44,39,0.12)]" id="contact-service-options" role="listbox" aria-multiselectable="true" aria-label="Choose services">
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

export function ContactSection({ content = defaultLandingContent.contact }: { content?: ContactContent }) {
  const [menuNavigation, setMenuNavigation] = useState<NavItem[]>(navigation);
  const [values, setValues] = useState<ContactValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [reference, setReference] = useState("");
  const [todayInputValue, setTodayInputValue] = useState("");
  const [blogSource, setBlogSource] = useState<{ slug: string; service?: string } | null>(null);
  const submission = useRef<{ key: string; fingerprint: string } | null>(null);
  const serviceGroups = useMemo(() => getServiceGroups(menuNavigation), [menuNavigation]);

  const updateValue = <Field extends keyof ContactValues>(field: Field, value: ContactValues[Field]) => {
    setSubmitted(false);
    setReference("");
    setFormError("");
    setValues((current) => ({ ...current, [field]: value }));
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

    if (values.requestType === "APPOINTMENT" && (!values.preferredDate || !values.preferredTime)) {
      setSubmitted(false);
      setFormError("Choose a preferred date and time for an appointment request.");
      return;
    }

    if (!consent) {
      setSubmitted(false);
      setFormError("Please agree to let Limex store these details and contact you.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const payload = {
      toolSlug: "contact",
      requestType: values.requestType,
      services: values.services,
      name: values.name,
      phone: values.phone,
      email: values.email,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      message: values.message,
      consent,
      website: String(data.get("website") ?? ""),
      ...(blogSource ? { source: { type: "BLOG" as const, slug: blogSource.slug, ...(blogSource.service ? { service: blogSource.service } : {}) } } : {}),
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
    setTodayInputValue(getTodayInputValue());

    const params = new URLSearchParams(window.location.search);
    const article = params.get("article");
    const requestedService = params.get("service");
    if (params.get("from") === "blog" && article) setBlogSource({ slug: article, ...(requestedService ? { service: requestedService } : {}) });
    if (params.get("from") === "blog" && requestedService) {
      const fallbackService = getServiceGroups(navigation).flatMap((group) => group.items).find((item) => item.value.endsWith(`: ${requestedService}`) || item.value === requestedService);
      if (fallbackService) setValues((current) => ({ ...current, services: [fallbackService.value] }));
    }

    void getPublicMenu()
      .then((managedItems) => {
        if (cancelled) return;
        setMenuNavigation(managedItems);
        if (params.get("from") === "blog" && requestedService) {
          const matchingService = getServiceGroups(managedItems).flatMap((group) => group.items).find((item) => item.value.endsWith(`: ${requestedService}`) || item.value === requestedService);
          if (matchingService) setValues((current) => ({ ...current, services: [matchingService.value] }));
        }
      })
      .catch(() => {
        // Keep the bundled top-level service list available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
          <ActionButton href="#contact-form" variant="dark" className="mt-cluster w-max min-h-11 border-accent bg-accent hover:border-[#c53f62] hover:bg-[#c53f62]">{content.directCtaLabel}</ActionButton>
          <div className="mt-section-gap-lg grid w-full grid-cols-1 gap-cluster-lg text-center sm:grid-cols-2">
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-accent">WHATSAPP</span>
              <strong className="text-body-sm font-semibold text-ink">{content.whatsapp}</strong>
            </div>
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-accent">EMAIL</span>
              <strong className="break-words text-body-sm font-semibold text-ink sm:whitespace-nowrap">{content.email}</strong>
            </div>
          </div>
        </div>
      </div>

      <form className="relative flex min-h-0 flex-col rounded-[24px] border border-[#c8c6be] bg-page p-card-pad-sm shadow-[0_12px_30px_rgba(42,44,39,0.04)] lg:min-h-[560px] lg:p-[32px]" id="contact-form" aria-labelledby="contact-form-title" onSubmit={handleSubmit}>
        <span className="pointer-events-none absolute left-4 top-0 h-1 w-14 rounded-b-full bg-accent lg:left-8" aria-hidden="true" />
        <div className="border-b border-[#d3d0c8] pb-section-gap-lg">
          <p className="text-overline text-accent">{content.formEyebrow}</p>
          <h3 className="mt-2 font-brand text-subheading text-ink" id="contact-form-title">{content.formTitle}</h3>
          <p className="mt-cluster-xs text-body-xs text-muted">{content.formDescription}</p>
        </div>

        <div className="mt-section-gap-lg flex flex-col gap-cluster">
          <div className="grid grid-cols-1 gap-cluster lg:grid-cols-2">
            <div className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Service</span>
              <ServiceMultiSelect groups={serviceGroups} value={values.services} onChange={(nextValue) => updateValue("services", nextValue)} hasError={Boolean(formError && values.services.length === 0)} helperText={content.serviceHelper} />
            </div>
            <label className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Name</span>
              <input className={`h-12 ${fieldControlClassName}`} autoComplete="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="Your name" required />
            </label>
          </div>
          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className={fieldLabelTextClassName}>How can we help?</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(["CALLBACK", "APPOINTMENT"] as const).map((type) => (
                <button
                  className={`min-h-11 rounded-[12px] border px-3 text-left text-body-xs font-semibold transition-colors ${values.requestType === type ? "border-[#6d806e] bg-[#edf3eb] text-[#294d3f]" : "border-[#c8c6be] bg-page text-[#60635d] hover:border-[#9ca397]"}`.trim()}
                  type="button"
                  aria-pressed={values.requestType === type}
                  onClick={() => updateValue("requestType", type)}
                  disabled={busy}
                  key={type}
                >
                  {type === "CALLBACK" ? "Request a callback" : "Book an appointment"}
                </button>
              ))}
            </div>
            <p className="text-micro text-muted">Choose appointment to request a time with our team.</p>
          </fieldset>
          <div className="grid grid-cols-1 gap-cluster lg:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Phone / WhatsApp</span>
              <input className={`h-12 ${fieldControlClassName}`} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="+880 1XXX XXXXXX" aria-describedby="contact-method-help" />
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Email</span>
              <input className={`h-12 ${fieldControlClassName}`} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="you@example.com" aria-describedby="contact-method-help" />
            </label>
          </div>
          <p className="-mt-1 text-micro text-muted" id="contact-method-help">{content.contactMethodHelper}</p>
          {formError ? <p className="-mt-1 text-body-xs font-semibold text-accent" role="alert">{formError}</p> : null}
          <fieldset className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <legend className={fieldLabelTextClassName}>Preferred schedule <span className="font-normal text-muted">{values.requestType === "APPOINTMENT" ? "(required)" : "(optional)"}</span></legend>
              <span className="text-micro text-muted">Dhaka time</span>
            </div>
            <div className="grid grid-cols-1 gap-cluster sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-micro font-semibold text-muted">Date</span>
                <input className={`h-12 ${fieldControlClassName}`} type="date" min={todayInputValue || undefined} value={values.preferredDate} onChange={(event) => updateValue("preferredDate", event.target.value)} aria-label="Preferred date" required={values.requestType === "APPOINTMENT"} />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-micro font-semibold text-muted">Time</span>
                <input className={`h-12 ${fieldControlClassName}`} type="time" min="09:00" max="18:00" step="1800" value={values.preferredTime} onChange={(event) => updateValue("preferredTime", event.target.value)} aria-label="Preferred time" required={values.requestType === "APPOINTMENT"} />
              </label>
            </div>
            <p className="text-micro leading-relaxed text-muted">{content.scheduleHelper}</p>
          </fieldset>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>Short message <span className="font-normal text-muted">(optional)</span></span>
            <textarea className={`min-h-[88px] ${fieldControlClassName} resize-y py-3`} maxLength={500} value={values.message} onChange={(event) => updateValue("message", event.target.value)} placeholder="Tell us what you need help with." />
          </label>
        </div>

        <div className="mt-auto pt-section-gap-lg">
          <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="flex items-start gap-2.5 text-micro leading-relaxed text-muted">
            <input className="mt-0.5 size-4 shrink-0 accent-[#35573f]" type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setSubmitted(false); setReference(""); setFormError(""); }} disabled={busy} />
            <span>I agree that Limex may store these details and contact me about this request.</span>
          </label>
          <button className="group mt-4 flex h-12 w-full items-center justify-between rounded-[14px] border border-accent bg-accent px-5 text-button font-strong text-white shadow-[0_8px_16px_rgba(222,77,115,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c53f62] hover:bg-[#c53f62] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-3 disabled:cursor-wait disabled:opacity-65" type="submit" disabled={busy} aria-busy={busy}>
            <span>{busy ? "Sending…" : submitted ? "Request received" : content.submitLabel}</span>
            <span className="text-icon-action transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">{busy ? "…" : submitted ? "✓" : "↗"}</span>
          </button>
          <p className="mt-cluster text-body-xs text-muted/70" aria-live="polite">{submitted ? `${content.submittedNote} Reference: ${reference}` : content.privacyNote}</p>
        </div>
      </form>
    </section>
  );
}
