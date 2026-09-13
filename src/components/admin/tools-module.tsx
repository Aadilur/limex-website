"use client";

import { useEffect, useState, type FormEvent } from "react";
import { businessTools, money, taxCategoryLabels, toolsSettingsSchema, type ToolsConfig, type ToolsSettings } from "@/lib/business-tools";
import { request } from "@/lib/menu-api";
import { FeeSettingsEditor, type FeeSlug } from "./fee-settings-editor";
import { TemplateBuilderModule } from "./template-builder-module";
import styles from "../limex/tools.module.css";

type ServiceRequest = { id: string; toolSlug: string; name: string; phone: string | null; email: string | null; preferredDate: string | null; preferredTime: string | null; requestType: string; message: string; status: string; createdAt: string; context: { type?: string; services?: string[]; values?: Record<string, string>; result?: { title: string; total: number; rows: { label: string; amount: number | null }[] }; draft?: { title: string; sections: { heading: string; body: string }[] }; configVersion?: number } };
const statuses = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"];
const labelStatus = (value: string) => value.toLowerCase().replaceAll("_", " ");
const displayStatus = (value: string) => labelStatus(value).replace(/^./, (character) => character.toUpperCase());

function requestSourceLabel(toolSlug: string) {
  if (toolSlug === "contact") return "Website contact form";
  return businessTools.find((tool) => tool.slug === toolSlug)?.title ?? toolSlug;
}

function requestDateLabel(value: string) {
  return new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });
}

function ServiceRequestCard({ item, busy, expanded, onToggle, onUpdateStatus }: { item: ServiceRequest; busy: boolean; expanded: boolean; onToggle: () => void; onUpdateStatus: (id: string, status: string) => void }) {
  return <article className="overflow-hidden rounded-[18px] border border-[#dfe4da] bg-white shadow-[0_8px_24px_rgba(35,54,41,0.04)] transition-shadow hover:shadow-[0_12px_30px_rgba(35,54,41,0.07)]">
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f3ff] text-[14px] font-bold text-[#006dce]" aria-hidden="true">{item.name.trim().charAt(0).toUpperCase() || "?"}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-[15px] font-bold tracking-[-0.01em] text-[#071b3d]">{item.name}</h2>
            <span className="rounded-full bg-[#f4eee8] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#74695f]">{item.requestType === "APPOINTMENT" ? "Appointment" : "Callback"}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-[1.5] text-[#777168]">{requestSourceLabel(item.toolSlug)} <span aria-hidden="true">·</span> {requestDateLabel(item.createdAt)} (Dhaka)</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-semibold text-[#355b45]">
            {item.phone ? <a className="break-all transition-colors hover:text-[#0055ff] hover:underline" href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}>Phone / WhatsApp: {item.phone}</a> : null}
            {item.email ? <a className="break-all transition-colors hover:text-[#0055ff] hover:underline" href={`mailto:${item.email}`}>{item.email}</a> : null}
            {!item.phone && !item.email ? <span className="font-medium text-[#a04b5b]">No contact channel</span> : null}
          </div>
        </div>
      </div>
      <label className="flex w-full shrink-0 flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7567] sm:w-[178px]">
        Status
        <select className="min-h-10 w-full rounded-[10px] border border-[#cbd5c7] bg-[#fbfcf9] px-3 text-[12px] font-semibold normal-case tracking-normal text-[#294d3f] outline-none transition-colors focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10" value={item.status} disabled={busy} onChange={(event) => onUpdateStatus(item.id, event.target.value)}>
          {statuses.map((value) => <option value={value} key={value}>{displayStatus(value)}</option>)}
        </select>
      </label>
    </div>

    {item.preferredDate || item.preferredTime ? <div className="mx-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[12px] bg-[#f1f8ed] px-3 py-2.5 text-[11px] text-[#3f5e48] sm:mx-5"><strong className="font-bold">Preferred schedule</strong><span>{item.preferredDate ?? "Date not set"}</span><span>{item.preferredTime ?? "Time not set"} <span className="text-[#71816e]">· Dhaka time</span></span></div> : null}
    {item.context.services?.length ? <div className="mx-4 mt-3 flex flex-wrap items-center gap-1.5 sm:mx-5"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a8378]">Services</span>{item.context.services.map((service) => <span className="rounded-full bg-[#eef5ff] px-2.5 py-1 text-[11px] font-semibold text-[#315f95]" key={service}>{service}</span>)}</div> : null}
    {item.message ? <p className="mx-4 mt-3 whitespace-pre-wrap rounded-[12px] bg-[#fafbf8] px-3 py-2.5 text-[12px] leading-[1.65] text-[#30382f] sm:mx-5">{item.message}</p> : null}

    <div className="mt-4 border-t border-[#edf0ea] px-4 py-3 sm:px-5"><button type="button" className="inline-flex min-h-8 items-center gap-2 rounded-full px-2.5 text-[11px] font-bold text-[#5f6c5e] transition-colors hover:bg-[#f2f6ef] hover:text-[#0055ff]" aria-expanded={expanded} onClick={onToggle}><span aria-hidden="true" className={`text-[14px] transition-transform ${expanded ? "rotate-90" : ""}`.trim()}>›</span>{expanded ? "Hide shared details" : "View shared details"}</button></div>
    {expanded ? <div className="border-t border-[#edf0ea] bg-[#fcfdfb] px-4 py-4 sm:px-5"><p className="break-all text-[10px] font-semibold uppercase tracking-[0.08em] text-[#90988c]">Reference · {item.id}</p>{item.context.values ? <dl className="mt-3 divide-y divide-[#e8ede5] rounded-[12px] bg-white px-3"><div className="grid gap-1 py-2.5 sm:grid-cols-[minmax(140px,0.35fr)_minmax(0,1fr)]">{Object.entries(item.context.values).map(([key, value]) => <div className="contents" key={key}><dt className="text-[11px] font-semibold text-[#737d70]">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="break-words text-[11px] leading-[1.5] text-[#30382f]">{value || "Not provided"}</dd></div>)}</div></dl> : null}{item.context.result ? <p className="mt-4 text-[13px] font-bold text-[#294d3f]">{item.context.result.title}: {money(item.context.result.total)}</p> : null}{item.context.draft ? <details className="mt-4 rounded-[12px] bg-white px-3 py-2.5"><summary className="cursor-pointer text-[12px] font-bold text-[#294d3f]">Submitted document draft</summary>{item.context.draft.sections.map((section) => <section key={section.heading} className="mt-3 border-t border-[#edf0ea] pt-3"><h3 className="text-[12px] font-bold text-[#3e4b3e]">{section.heading}</h3><p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-[1.6] text-[#687063]">{section.body}</p></section>)}</details> : null}{!item.context.values && !item.context.result && !item.context.draft ? <p className="mt-3 text-[11px] text-[#7b8579]">No calculator or document details were shared.</p> : null}</div> : null}
  </article>;
}
const taxNumbers = [
  ["salaryExemptionCap", "Employment exemption cap (৳)"], ["rebateInvestmentRate", "Eligible-investment rebate rate (%)"], ["rebateIncomeRate", "Eligible-income rebate limit (%)"], ["rebateCap", "Maximum rebate (৳)"], ["minimumTax", "Minimum tax (৳)"], ["newTaxpayerMinimum", "New taxpayer minimum (৳)"], ["childAllowance", "Allowance per eligible child (৳)"],
] as const;
export function ToolsAdminModule() {
  const [tab, setTab] = useState("requests"); const [config, setConfig] = useState<ToolsConfig | null>(null); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false); const [items, setItems] = useState<ServiceRequest[]>([]); const [requestsLoading, setRequestsLoading] = useState(true); const [page, setPage] = useState(1); const [total, setTotal] = useState(0); const [status, setStatus] = useState(""); const [expanded, setExpanded] = useState(""); const [reload, setReload] = useState(0); const [yearIndex, setYearIndex] = useState(0); const [dirty, setDirty] = useState(false); const [feeSlug, setFeeSlug] = useState<FeeSlug>("limited-company");
  useEffect(() => { let active = true; void request<ToolsConfig>("/api/admin/tools/config", { cache: "no-store" }).then((data) => { if (active) { setConfig(data); setDirty(false); } }).catch((err) => { if (active) setError(err.message); }); return () => { active = false; }; }, [reload]);
  useEffect(() => { if (tab !== "requests") return; let active = true; setError(""); setItems([]); setRequestsLoading(true); void request<{ items: ServiceRequest[]; total: number }>(`/api/admin/tools/requests?page=${page}${status ? `&status=${status}` : ""}`, { cache: "no-store" }).then((data) => { if (active) { setItems(data.items); setTotal(data.total); } }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setRequestsLoading(false); }); return () => { active = false; }; }, [tab, page, status, reload]);
  useEffect(() => { if (!dirty) return; const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener("beforeunload", prevent); return () => window.removeEventListener("beforeunload", prevent); }, [dirty]);
  function updateSettings(update: (settings: ToolsSettings) => ToolsSettings) { setConfig((current) => current ? { ...current, settings: update(current.settings) } : current); setDirty(true); setNotice(""); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!config || busy) return; setError(""); setNotice("");
    const parsed = toolsSettingsSchema.safeParse(config.settings); if (!parsed.success) { setError(parsed.error.issues.map((issue) => `${issue.path.join(" → ")}: ${issue.message}`).join("\n")); return; }
    setBusy(true);
    try { const updated = await request<ToolsConfig>("/api/admin/tools/config", { method: "PUT", body: JSON.stringify({ ...config, settings: parsed.data }) }); setConfig(updated); setDirty(false); setNotice("Settings published. New calculations use this version; existing requests keep their original snapshot."); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save settings."); }
    finally { setBusy(false); }
  }
  async function updateStatus(id: string, next: string) {
    setBusy(true); setError("");
    try { await request(`/api/admin/tools/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) }); setItems((current) => current.map((item) => item.id === id ? { ...item, status: next } : item)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update request."); }
    finally { setBusy(false); }
  }
  const year = config?.settings.taxYears[yearIndex];
  function updateYear(key: string, value: unknown) { updateSettings((settings) => ({ ...settings, taxYears: settings.taxYears.map((item, index) => index === yearIndex ? { ...item, [key]: value } : item) })); }
  return <div>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-brand text-[32px] font-semibold tracking-[-.03em]">Business tools</h1><p className="mt-2 text-[13px] text-[#687063]">Manage calculators, document templates, fees and requests in one workspace.</p></div><a className={styles.textLink} href="/business-tools" target="_blank" rel="noreferrer">Open tools ↗</a></div>
    <div className="mb-7 flex gap-1 overflow-x-auto border-b border-[#d6dbcf] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{[["requests", "Service requests"], ["templates", "Document templates"], ["fees", "Fee settings"], ["tax", "Income tax rules"]].map(([key, label]) => <button className={`min-h-11 shrink-0 whitespace-nowrap rounded-t-[10px] border-b-2 px-3 text-left text-[12px] font-semibold transition-colors ${tab === key ? "border-[#294d3f] text-[#294d3f]" : "border-transparent text-[#727a71] hover:border-[#a8b8a5] hover:text-[#294d3f]"}`.trim()} type="button" key={key} aria-pressed={tab === key} onClick={() => { setTab(key); setNotice(""); }}>{label}</button>)}</div>
    {error ? <div className={`${styles.error} mb-5 whitespace-pre-line`} role="alert">{error}<button className={styles.quiet} type="button" onClick={() => { if (!dirty || window.confirm("Discard unsaved settings and reload?")) { setError(""); setYearIndex(0); setReload((value) => value + 1); } }}>Reload</button></div> : null}
    {notice ? <p className="mb-5 rounded-xl border border-[#c1d5ba] bg-[#edf5e9] p-4 text-[13px] text-[#355b36]" role="status">{notice}</p> : null}
    {tab === "templates" ? <TemplateBuilderModule /> : tab === "requests" ? <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><label className="flex items-center gap-3 text-[13px]">Status<select className={styles.control} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All requests</option>{statuses.map((value) => <option key={value} value={value}>{labelStatus(value)}</option>)}</select></label><button type="button" className={styles.quiet} onClick={() => setReload((value) => value + 1)}>Refresh inbox</button></div>
      {requestsLoading ? <div className="grid min-h-[180px] place-items-center rounded-[18px] bg-white/70 text-[12px] font-semibold text-[#778175]" role="status">Loading service requests…</div> : items.length ? <div className="grid gap-3">{items.map((item) => <ServiceRequestCard item={item} busy={busy} expanded={expanded === item.id} onToggle={() => setExpanded((current) => current === item.id ? "" : item.id)} onUpdateStatus={(id, next) => void updateStatus(id, next)} key={item.id} />)}</div> : !error ? <p className="rounded-[18px] bg-white/70 px-4 py-8 text-center text-[12px] text-[#778175]">No service requests to show.</p> : null}
      <div className="mt-5 flex items-center justify-between"><button className={styles.quiet} type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Previous</button><p className={styles.muted}>Page {page} · {total} requests</p><button className={styles.quiet} type="button" disabled={page * 20 >= total} onClick={() => setPage((value) => value + 1)}>Next →</button></div>
    </> : !config ? <p className={styles.muted}>Loading settings…</p> : <form onSubmit={save}>
      <fieldset disabled={busy} className="min-w-0">
      {tab === "fees" ? <div className="grid gap-5"><p className={styles.muted}>Choose one service to edit its fees and rules. Blank means “to confirm”; enter 0 only when a charge is genuinely zero. Your edits remain a draft until you publish settings.</p><FeeSettingsEditor settings={config.settings} busy={busy} slug={feeSlug} onSlugChange={setFeeSlug} updateSettings={updateSettings} /></div> : year ? <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-3 text-[13px]">Assessment year<select className={styles.control} value={yearIndex} onChange={(event) => setYearIndex(Number(event.target.value))}>{config.settings.taxYears.map((item, index) => <option key={index} value={index}>{item.year}</option>)}</select></label><button type="button" className={styles.quiet} onClick={() => { if (config.settings.taxYears.length >= 10) return; updateSettings((settings) => ({ ...settings, taxYears: [...settings.taxYears, { ...year, year: `${Number(year.year.slice(0, 4)) + 1}-${String((Number(year.year.slice(5)) + 1) % 100).padStart(2, "0")}` }] })); setYearIndex(config.settings.taxYears.length); }}>Add next year from these rules</button></div>
        <section className={styles.formPanel}><h2 className={`${styles.panelTitle} mb-6`}>Tax-free thresholds</h2><div className={styles.fields}><label className={styles.field}><span className={styles.label}>Year (YYYY-YY)</span><input className={styles.control} required pattern="[0-9]{4}-[0-9]{2}" value={year.year} onChange={(event) => updateYear("year", event.target.value)} /></label>{Object.entries(year.thresholds).map(([key, value]) => <label key={key} className={styles.field}><span className={styles.label}>{taxCategoryLabels[key as keyof typeof taxCategoryLabels]} (৳)</span><input className={styles.control} type="number" min={0} required value={value} onChange={(event) => updateYear("thresholds", { ...year.thresholds, [key]: Number(event.target.value) })} /></label>)}</div></section>
        <section className={styles.formPanel}><h2 className={`${styles.panelTitle} mb-3`}>Progressive bands</h2><p className={`${styles.muted} mb-5`}>Band widths start after the category’s tax-free threshold. The final band covers all remaining income.</p>{year.bands.map((band, index) => <div key={index} className="mb-5 grid grid-cols-2 gap-4"><label className={styles.field}><span className={styles.label}>{index === year.bands.length - 1 ? "Remaining income" : `Band ${index + 1} width (৳)`}</span><input className={styles.control} type={band.width === null ? "text" : "number"} value={band.width ?? "Unlimited"} disabled={band.width === null} min={1} required onChange={(event) => updateYear("bands", year.bands.map((item, i) => i === index ? { ...item, width: Number(event.target.value) } : item))} /></label><label className={styles.field}><span className={styles.label}>Rate (%)</span><input className={styles.control} type="number" required min={0} max={100} step="0.01" value={band.rate} onChange={(event) => updateYear("bands", year.bands.map((item, i) => i === index ? { ...item, rate: Number(event.target.value) } : item))} /></label></div>)}<button className={styles.quiet} type="button" disabled={year.bands.length >= 10} onClick={() => updateYear("bands", [...year.bands.slice(0, -1), { width: 100000, rate: year.bands.at(-1)!.rate }, year.bands.at(-1)!])}>Add a band</button><button className={styles.quiet} type="button" disabled={year.bands.length <= 1} onClick={() => updateYear("bands", [...year.bands.slice(0, -2), year.bands.at(-1)!])}>Remove last finite band</button></section>
        <section className={styles.formPanel}><h2 className={`${styles.panelTitle} mb-6`}>Rebates and adjustments</h2><div className={styles.fields}>{taxNumbers.map(([key, label]) => <label className={styles.field} key={key}><span className={styles.label}>{label}</span><input className={styles.control} type="number" required min={0} step="0.01" value={year[key]} onChange={(event) => updateYear(key, Number(event.target.value))} /></label>)}<label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.label}>Official source URL</span><input className={styles.control} type="url" required value={year.sourceUrl} onChange={(event) => updateYear("sourceUrl", event.target.value)} /></label></div></section>
      </div> : null}
      </fieldset>
      <div className="sticky bottom-4 mt-7 flex items-center justify-between gap-4 rounded-2xl border border-[#d0d8c8] bg-[#f8faf4]/95 p-4 shadow-lg backdrop-blur"><p className={styles.muted}>Version {config.version}{dirty ? " · Unpublished changes" : " · Published"}</p><button className={styles.button} type="submit" disabled={busy || !dirty}>{busy ? "Saving…" : "Publish settings"}</button></div>
    </form>}
  </div>;
}
