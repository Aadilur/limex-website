"use client";

import { useEffect, useState, type FormEvent } from "react";

import { businessTools, money } from "@/lib/business-tools";
import { request } from "@/lib/menu-api";
import styles from "../limex/tools.module.css";

type InquiryContext = {
  type?: string;
  services?: string[];
  values?: Record<string, string>;
  requestType?: string;
  result?: { title: string; total: number };
  draft?: { title: string; sections: { heading: string; body: string }[] };
};

type Inquiry = {
  id: string;
  toolSlug: string;
  name: string;
  phone: string | null;
  email: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  requestType: string;
  message: string;
  status: string;
  context: InquiryContext;
  createdAt: string;
};

const statuses = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"] as const;
const labelStatus = (value: string) => value.toLowerCase().replaceAll("_", " ");

function sourceLabel(slug: string) {
  if (slug === "contact") return "Website contact form";
  return businessTools.find((tool) => tool.slug === slug)?.title ?? slug;
}

function phoneHref(phone: string) {
  return phone.replace(/[^+\d]/g, "");
}

export function InquiriesAdminModule() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    setItems([]);
    const params = new URLSearchParams({ page: String(page), source });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    void request<{ items: Inquiry[]; total: number }>(`/api/admin/tools/requests?${params.toString()}`, { cache: "no-store" })
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load enquiries.");
      });
    return () => {
      active = false;
    };
  }, [page, reload, search, source, status]);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function updateStatus(id: string, next: string) {
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/tools/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setItems((current) => current.map((item) => item.id === id ? { ...item, status: next } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update enquiry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c63c56]">Inbox</p>
          <h1 className="mt-2 font-brand text-[32px] font-semibold tracking-[-.03em]">Enquiries & bookings</h1>
          <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-[#687063]">Every contact form, calculator request and appointment enquiry in one private workspace.</p>
        </div>
        <a className={styles.textLink} href="/" target="_blank" rel="noreferrer">Open website ↗</a>
      </div>

      <div className="mb-7 grid gap-3 rounded-[22px] border border-[#d6dad0] bg-white/70 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
        <form className="flex min-w-0 flex-col gap-2" id="inquiry-search-form" onSubmit={applySearch}>
          <label className={styles.label} htmlFor="inquiry-search">Search people or messages</label>
          <input className={styles.control} id="inquiry-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name, phone, email…" maxLength={120} />
        </form>
        <label className="flex min-w-[160px] flex-col gap-2 text-[12px] font-semibold text-[#4f5d4d]">Source<select className={styles.control} value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }}><option value="all">All enquiries</option><option value="contact">Contact form</option><option value="tools">Tools & calculators</option></select></label>
        <label className="flex min-w-[160px] flex-col gap-2 text-[12px] font-semibold text-[#4f5d4d]">Status<select className={styles.control} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{labelStatus(value)}</option>)}</select></label>
        <div className="flex items-center gap-3 sm:col-span-3 sm:justify-between">
          <button className={styles.button} type="submit" form="inquiry-search-form">Search</button>
          <button type="button" className={styles.quiet} onClick={() => setReload((value) => value + 1)}>Refresh inbox</button>
        </div>
      </div>

      {error ? <div className={`${styles.error} mb-5 whitespace-pre-line`} role="alert">{error}</div> : null}

      <div className="grid gap-4">
        {items.map((item) => (
          <article className={styles.formPanel} key={item.id}>
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={styles.panelTitle}>{item.name}</h2>
                  <span className="rounded-full bg-[#fce7e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#b93d53]">{item.requestType === "APPOINTMENT" ? "Appointment" : "Callback"}</span>
                </div>
                <p className={`${styles.muted} mt-2`}>{sourceLabel(item.toolSlug)} · {new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} (Dhaka)</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-[#355b45]">
                  {item.phone ? <a className="hover:underline" href={`tel:${phoneHref(item.phone)}`}>Phone / WhatsApp: {item.phone}</a> : null}
                  {item.email ? <a className="break-all hover:underline" href={`mailto:${item.email}`}>{item.email}</a> : null}
                </div>
              </div>
              <label className="flex min-w-[190px] flex-col gap-2 text-[12px] font-semibold text-[#4f5d4d]">Request status<select className={styles.control} value={item.status} disabled={busy} onChange={(event) => void updateStatus(item.id, event.target.value)}>{statuses.map((value) => <option value={value} key={value}>{labelStatus(value)}</option>)}</select></label>
            </div>

            {item.preferredDate || item.preferredTime ? <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[14px] border border-[#d7e2d0] bg-[#f2f7ee] px-3.5 py-3 text-[12px] text-[#3f5e48]"><strong>Preferred schedule</strong><span>{item.preferredDate ?? "Date not set"}</span><span>{item.preferredTime ?? "Time not set"} · Dhaka time</span></div> : null}
            {item.context.services?.length ? <p className={`${styles.muted} mt-4`}><strong className="font-semibold text-[#4f5d4d]">Services:</strong> {item.context.services.join(" · ")}</p> : null}
            {item.message ? <p className="mt-4 whitespace-pre-wrap text-[13px] leading-7 text-[#30382f]">{item.message}</p> : null}
            <button type="button" className={`${styles.quiet} mt-4`} aria-expanded={expanded === item.id} onClick={() => setExpanded((current) => current === item.id ? "" : item.id)}>{expanded === item.id ? "Hide shared details" : "View shared details"}</button>
            {expanded === item.id ? <div className="mt-4 border-t border-[#dce1d6] pt-4"><p className={`${styles.muted} break-all`}>Reference: {item.id}</p>{item.context.values ? <dl className={styles.rows}>{Object.entries(item.context.values).map(([key, value]) => <div className={styles.row} key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd className="!whitespace-pre-wrap break-words">{value || "Not provided"}</dd></div>)}</dl> : null}{item.context.result ? <p className="mt-5 text-[15px] font-semibold text-[#294d3f]">{item.context.result.title}: {money(item.context.result.total)}</p> : null}{item.context.draft ? <details className="mt-4"><summary className="cursor-pointer text-[13px] font-semibold">Submitted document draft</summary>{item.context.draft.sections.map((section) => <section key={section.heading} className="mt-4"><h3 className="text-[13px] font-semibold">{section.heading}</h3><p className="mt-2 whitespace-pre-wrap text-[12px] leading-7">{section.body}</p></section>)}</details> : null}{!item.context.values && !item.context.result && !item.context.draft ? <p className={`${styles.muted} mt-3`}>No calculator or document details were shared.</p> : null}</div> : null}
          </article>
        ))}
      </div>

      {!items.length && !error ? <p className={`${styles.formPanel} ${styles.muted}`}>No enquiries match these filters.</p> : null}
      <div className="mt-5 flex items-center justify-between gap-4"><button className={styles.quiet} type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Previous</button><p className={styles.muted}>Page {page} · {total} enquiries</p><button className={styles.quiet} type="button" disabled={page * 20 >= total} onClick={() => setPage((value) => value + 1)}>Next →</button></div>
    </div>
  );
}
