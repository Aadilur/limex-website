"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import {
  getAdminContactSettings,
  isContactConflictError,
  isUnauthorizedContactError,
  updateAdminContactSettings,
  type AdminContactSettings,
  type ContactSettingsInput,
} from "@/lib/contact-api";

const emptySettings: ContactSettingsInput = {
  whatsappNumber: "",
  whatsappDisplay: "+880 1XXX XXXXXX",
  whatsappMessage: "Hello Limex, I would like to discuss a service.",
  email: "hello@yourbrand.com",
  phone: "",
  address: "Dhaka, Bangladesh",
  businessHours: "Sunday–Thursday · 9:00 AM–6:00 PM (Dhaka)",
};

const inputClass = "mt-2 min-h-11 w-full rounded-[13px] border border-[#d9d3ca] bg-white px-3.5 text-[13px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10";
const textAreaClass = `${inputClass} min-h-[86px] resize-y py-3 leading-[1.5]`;

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span><input className={inputClass} type={type} value={value} onChange={onChange} placeholder={placeholder} /></label>;
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) {
  return <label className="block min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">{label}</span><textarea className={textAreaClass} value={value} onChange={onChange} placeholder={placeholder} /></label>;
}

function inputFromSettings(settings: AdminContactSettings | null): ContactSettingsInput {
  if (!settings) return emptySettings;
  return {
    whatsappNumber: settings.whatsappNumber,
    whatsappDisplay: settings.whatsappDisplay,
    whatsappMessage: settings.whatsappMessage,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    businessHours: settings.businessHours,
  };
}

export function ContactSettingsModule() {
  const [settings, setSettings] = useState<AdminContactSettings | null>(null);
  const [draft, setDraft] = useState<ContactSettingsInput>(emptySettings);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminContactSettings().then((loaded) => {
      if (!active) return;
      setSettings(loaded);
      setDraft(inputFromSettings(loaded));
      setRevision(loaded?.revision ?? 0);
    }).catch((loadError) => {
      if (!active) return;
      setError(isUnauthorizedContactError(loadError) ? "Your admin session expired. Sign in again." : loadError instanceof Error ? loadError.message : "Contact settings could not be loaded.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = <K extends keyof ContactSettingsInput>(key: K, value: ContactSettingsInput[K]) => {
    setMessage("");
    setError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await updateAdminContactSettings(draft, revision);
      setSettings(saved);
      setDraft(inputFromSettings(saved));
      setRevision(saved.revision);
      setMessage("Contact settings saved. Service and WhatsApp actions now use this information.");
    } catch (saveError) {
      if (isContactConflictError(saveError)) setError("These settings changed elsewhere. Reload the page before saving again.");
      else setError(saveError instanceof Error ? saveError.message : "Contact settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Global settings</p><h1 className="mt-2 font-brand text-[38px] font-bold leading-[1] tracking-[-0.05em] text-[#071b3d] sm:text-[48px]">Contact</h1><p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-[#77736e]">One source of truth for service booking, WhatsApp conversations and public contact details.</p></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-[#f4f1ec] px-3 py-2 text-[11px] font-bold text-[#77736e]">Revision {revision}</span><button className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-50" type="button" onClick={() => void save()} disabled={loading || saving}>{saving ? "Saving…" : "Save settings"}</button></div>
      </section>

      {message ? <p className="rounded-[14px] bg-[#effaf3] px-4 py-3 text-[13px] font-semibold text-[#29634d]" role="status">{message}</p> : null}
      {error ? <p className="rounded-[14px] bg-[#fff4f5] px-4 py-3 text-[13px] font-semibold text-[#ad3148]" role="alert">{error}</p> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
        <div className="rounded-[22px] bg-white/70 p-4 ring-1 ring-[#ddd8cf]/80 sm:p-5">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Reach the team</p><h2 className="mt-1.5 font-brand text-[24px] font-bold tracking-[-0.04em] text-[#071b3d]">Public contact details</h2></div><span className="grid size-10 place-items-center rounded-[12px] bg-[#e9f4ed] text-[16px] text-[#29634d]" aria-hidden="true">↗</span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" value={draft.whatsappNumber} onChange={(event) => update("whatsappNumber", event.target.value)} placeholder="+880 1XXX XXXXXX" />
            <Field label="WhatsApp display text" value={draft.whatsappDisplay} onChange={(event) => update("whatsappDisplay", event.target.value)} placeholder="+880 1XXX XXXXXX" />
            <Field label="Email" value={draft.email} onChange={(event) => update("email", event.target.value)} type="email" />
            <Field label="Phone" value={draft.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Optional direct line" />
            <TextAreaField label="Office address" value={draft.address} onChange={(event) => update("address", event.target.value)} />
            <TextAreaField label="Business hours" value={draft.businessHours} onChange={(event) => update("businessHours", event.target.value)} />
          </div>
        </div>

        <aside className="rounded-[22px] bg-[#071b3d] p-5 text-white sm:p-6" aria-labelledby="contact-preview-title">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f8bec8]">Preview</p>
          <h2 className="mt-2 font-brand text-[23px] font-bold tracking-[-0.04em]" id="contact-preview-title">How customers reach you</h2>
          <div className="mt-6 space-y-4 text-[13px]">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">WhatsApp</p><p className="mt-1 font-semibold text-white/90">{draft.whatsappDisplay || "Not configured"}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Email</p><p className="mt-1 break-words font-semibold text-white/90">{draft.email || "Not configured"}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Phone</p><p className="mt-1 font-semibold text-white/90">{draft.phone || "Optional"}</p></div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4"><p className="text-[11px] leading-[1.55] text-white/55">Use an international WhatsApp number. A safe wa.me link is generated only when the number is valid; otherwise no broken WhatsApp button is shown.</p>{settings?.whatsappUrl ? <a className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3.5 text-[12px] font-bold text-[#071b3d]" href={settings.whatsappUrl} target="_blank" rel="noreferrer">Test WhatsApp link <span aria-hidden="true">↗</span></a> : <p className="mt-4 text-[11px] font-semibold text-[#f8bec8]">Add a number to enable WhatsApp actions.</p>}</div>
        </aside>
      </section>

      <section className="rounded-[22px] bg-white/70 p-4 ring-1 ring-[#ddd8cf]/80 sm:p-5">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736e]">Conversation defaults</p><h2 className="mt-1.5 font-brand text-[24px] font-bold tracking-[-0.04em] text-[#071b3d]">WhatsApp message</h2><p className="mt-1 max-w-[620px] text-[12px] leading-[1.5] text-[#8b857e]">This message is prefilled when someone chooses “Discuss on WhatsApp” from a service or pricing tier.</p></div>
        <TextAreaField label="Default message" value={draft.whatsappMessage} onChange={(event) => update("whatsappMessage", event.target.value)} placeholder="Hello Limex, I would like to discuss a service." />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8b857e]"><span>Last saved {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "not yet"}</span><button className="font-bold text-[#0055ff] hover:text-[#ad3148]" type="button" onClick={() => { setDraft(inputFromSettings(settings)); setMessage(""); setError(""); }}>Discard changes</button></div>
      </section>
    </div>
  );
}
