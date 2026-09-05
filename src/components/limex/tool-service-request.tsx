"use client";

import { useRef, useState, type FormEvent } from "react";
import { request } from "@/lib/menu-api";
import type { ToolDefinition, ToolValues } from "@/lib/business-tools";
import styles from "./tools.module.css";

export function ToolServiceRequest({ tool, contextValues }: { tool: ToolDefinition; contextValues?: ToolValues }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [reference, setReference] = useState("");
  const [includeContext, setIncludeContext] = useState(false); const submission = useRef<{ key: string; fingerprint: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    const payload = { toolSlug: tool.slug, name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? ""), message: String(data.get("message") ?? ""), consent: data.get("consent") === "on", website: String(data.get("website") ?? ""), ...(includeContext && contextValues ? { values: contextValues } : {}) };
    const fingerprint = JSON.stringify(payload);
    if (!submission.current || submission.current.fingerprint !== fingerprint) submission.current = { key: crypto.randomUUID(), fingerprint };
    setBusy(true); setError("");
    try { const saved = await request<{ reference: string }>("/api/tools/requests", { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.key }) }); setReference(saved.reference); }
    catch (err) { setError(err instanceof Error ? err.message : "We couldn’t save your request. Please try again."); }
    finally { setBusy(false); }
  }
  if (reference) return <div className={styles.success} role="status"><h3>Your request is with Limex.</h3><p>We’ll contact you to confirm the scope and next steps. No appointment or filing has been confirmed yet.</p><p className="break-all">Reference: {reference}</p></div>;
  return <form className={styles.formPanel} onSubmit={submit}>
    <h3 className={styles.panelTitle}>A little help with {tool.title.toLowerCase()}.</h3><p className={styles.muted}>Leave your details and the Limex team will follow up.</p>
    <div className={styles.fields}>
      <label className={styles.field}><span className={styles.label}>Your name</span><input autoComplete="name" className={styles.control} name="name" required minLength={2} maxLength={120} disabled={busy} /></label>
      <label className={styles.field}><span className={styles.label}>Phone / WhatsApp</span><input type="tel" autoComplete="tel" className={styles.control} name="phone" placeholder="+880 1XXX XXXXXX" required minLength={7} maxLength={25} disabled={busy} /></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.label}>What would you like help with?</span><textarea className={styles.control} name="message" maxLength={2000} rows={3} disabled={busy} /></label>
    </div>
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {contextValues ? <label className={styles.checkbox}><input type="checkbox" checked={includeContext} onChange={(event) => setIncludeContext(event.target.checked)} disabled={busy} /><span>Include my {tool.group === "builder" ? "document details and draft" : "inputs and calculation"} so Limex can review them.</span></label> : null}
    <label className={styles.checkbox}><input type="checkbox" name="consent" required disabled={busy} /><span>I agree that Limex may store these submitted details and contact me about this request.</span></label>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <div className={styles.actions}><button className={styles.button} type="submit" disabled={busy}>{busy ? "Sending…" : "Request a callback"}<span aria-hidden="true">↗</span></button><span className={styles.muted}>No payment required.</span></div>
  </form>;
}
