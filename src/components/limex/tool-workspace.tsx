"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { calculatorFields, initialToolValues, money, validateFields, type CalculationResult, type ToolDefinition, type ToolsConfig, type ToolValues } from "@/lib/business-tools";
import { createDocumentDraft, documentFields, documentText, type DocumentDraft } from "@/lib/business-documents";
import { request } from "@/lib/menu-api";
import { ServiceIcon } from "./service-icons";
import { ToolFields } from "./tool-fields";
import { ToolRules } from "./tool-rules";
import { ToolServiceRequest } from "./tool-service-request";
import styles from "./tools.module.css";

function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Paper({ draft }: { draft: DocumentDraft }) {
  return <article className={styles.paper} lang={draft.language} data-document-paper><h2>{draft.title}</h2><p className={styles.warning}>{draft.warning}</p>{draft.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}{draft.signatures.map((signature, index) => <p key={index} className={styles.signature}>{signature}<br />{draft.language === "bn" ? "স্বাক্ষর: __________________  তারিখ: __________" : "Signature: __________________  Date: __________"}</p>)}</article>;
}
export function ToolWorkspace({ tool }: { tool: ToolDefinition }) {
  const isBuilder = tool.group === "builder";
  const [config, setConfig] = useState<ToolsConfig | null>(null); const [loadError, setLoadError] = useState(""); const [reload, setReload] = useState(0);
  const [values, setValues] = useState<ToolValues>(() => isBuilder ? initialToolValues(documentFields(tool.slug)) : {});
  const [result, setResult] = useState<CalculationResult | null>(null); const [draft, setDraft] = useState<DocumentDraft | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [tab, setTab] = useState("tool"); const [step, setStep] = useState(0);
  const [showRequest, setShowRequest] = useState(false); const [feedback, setFeedback] = useState("");
  const version = useRef(0); const formRef = useRef<HTMLFormElement>(null); const outputRef = useRef<HTMLDivElement>(null); const requestRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isBuilder) return;
    let cancelled = false; setLoadError("");
    void request<ToolsConfig>("/api/tools/config", { cache: "no-store" }).then((data) => {
      if (cancelled) return; setConfig(data); setValues((current) => ({ ...initialToolValues(calculatorFields(tool.slug, data.settings)), ...current }));
    }).catch((err) => { if (!cancelled) setLoadError(err instanceof Error ? err.message : "Unable to load settings."); });
    return () => { cancelled = true; };
  }, [isBuilder, tool.slug, reload]);
  useEffect(() => { if (showRequest) { requestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); requestRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }); } }, [showRequest]);
  const fields = useMemo(() => isBuilder ? documentFields(tool.slug) : config ? calculatorFields(tool.slug, config.settings) : [], [config, isBuilder, tool.slug]);
  const split = Math.ceil(fields.length / 2); const visibleFields = isBuilder ? fields.slice(step === 0 ? 0 : split, step === 0 ? split : fields.length) : fields;
  const preview = isBuilder ? draft ?? createDocumentDraft(tool.slug, values) : null;
  function change(key: string, value: string) { version.current++; setValues((current) => ({ ...current, [key]: value })); setResult(null); setDraft(null); setError(""); setFeedback(""); }
  function reset() { if (busy) return; version.current++; setValues(initialToolValues(fields)); setResult(null); setDraft(null); setError(""); setStep(0); setFeedback(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (isBuilder && step === 0) { try { validateFields(visibleFields, values); setStep(1); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (err) { setError(err instanceof Error ? err.message : "Check your entries."); } return; }
    if (busy) return; const currentVersion = version.current;
    try {
      validateFields(fields, values); setBusy(true);
      if (isBuilder) {
        const data = await request<{ draft: DocumentDraft }>(`/api/tools/documents/${tool.slug}`, { method: "POST", body: JSON.stringify({ values }) });
        if (currentVersion === version.current) { setDraft(data.draft); setFeedback("Draft generated. Review it before downloading or signing."); }
      } else {
        const data = await request<{ result: CalculationResult }>(`/api/tools/calculate/${tool.slug}`, { method: "POST", body: JSON.stringify({ values }) });
        if (currentVersion === version.current) setResult(data.result);
      }
      if (currentVersion === version.current) outputRef.current?.focus({ preventScroll: false });
    } catch (err) { if (currentVersion === version.current) setError(err instanceof Error ? err.message : "Please check your entries and try again."); }
    finally { setBusy(false); }
  }
  function printDraft() {
    if (!draft) return;
    const popup = window.open("", "_blank", "width=850,height=900");
    if (!popup) { setError("Allow popups to open the print preview, or download the text version."); return; }
    popup.opener = null; popup.document.title = draft.title;
    const css = popup.document.createElement("style"); css.textContent = "@page{size:A4;margin:22mm}body{font:13px/1.8 Georgia,serif;color:#222;max-width:720px;margin:30px auto;padding:0 20px}h2{font-size:24px}h3{font-size:14px;margin-top:24px;break-after:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere}section{break-inside:auto}button{padding:10px 18px;margin:15px 0}@media print{button{display:none}}"; popup.document.head.append(css);
    const paper = outputRef.current?.querySelector("[data-document-paper]"); if (paper) popup.document.body.append(paper.cloneNode(true));
    const print = popup.document.createElement("button"); print.textContent = "Print / Save as PDF"; print.onclick = () => popup.print(); popup.document.body.prepend(print); popup.focus(); popup.print();
  }
  return <div className={styles.workspace}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/business-tools">Business tools</Link><span aria-hidden="true">/</span><span aria-current="page">{tool.title}</span></nav>
    <header className={styles.workspaceIntro}><h1 className={styles.heading}>{tool.title}{tool.slug === "income-tax" ? " calculator" : ""}</h1><p>{tool.description}</p></header>
    <div className={styles.tabs} aria-label="Tool views"><button type="button" className={styles.tab} aria-pressed={tab === "tool"} onClick={() => setTab("tool")}>{isBuilder ? "Build your document" : "Calculator"}</button><button type="button" className={styles.tab} aria-pressed={tab === "rules"} onClick={() => setTab("rules")}>{isBuilder ? "Before you begin" : "Rules & details"}</button></div>
    {tab === "rules" ? <ToolRules tool={tool} config={config} year={values.year} /> : <>
      {loadError ? <div className={styles.error} role="alert">{loadError}<button className={styles.quiet} onClick={() => setReload((value) => value + 1)} type="button">Try again</button></div> : null}
      {!isBuilder && !config ? <p className={styles.muted} role="status">{loadError ? "The calculator will be available when settings can be loaded." : "Loading published settings…"}</p> : <div className={`${styles.columns} ${!isBuilder ? styles.calculatorColumns : ""}`}>
        {!isBuilder ? <aside className={styles.rulesAside} aria-label="Rules and details"><ToolRules tool={tool} config={config} year={values.year} /></aside> : null}
        <form ref={formRef} className={`${styles.formPanel} scroll-mt-28`} onSubmit={submit}>
          <h2 className={styles.panelTitle}>{isBuilder ? step === 0 ? "Start with the essentials." : "Make the terms clear." : "Your calculation"}</h2>
          <p className={styles.muted}>{isBuilder ? "Your entries aren’t saved unless you include them in a service request." : "Amounts in Bangladeshi taka. Update any field to start a new estimate."}</p>
          {isBuilder ? <div className={styles.stepper}><strong>{step + 1} of 2</strong><span /><span>{step === 0 ? "Parties & details" : "Terms & review"}</span></div> : null}
          <ToolFields fields={visibleFields} values={values} onChange={change} prefix={tool.slug} disabled={busy} />
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.actions}>
            {isBuilder && step > 0 ? <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => setStep(0)} disabled={busy}>Back</button> : null}
            <button className={styles.button} type="submit" disabled={busy}>{busy ? "Working…" : isBuilder ? step === 0 ? "Continue" : "Generate draft" : "Calculate estimate"}<span aria-hidden="true">→</span></button>
            <button className={styles.quiet} type="button" onClick={reset} disabled={busy}>Reset</button>
          </div>
        </form>
        <div ref={outputRef} tabIndex={-1} className={isBuilder ? styles.documentPreview : styles.summary} aria-label={isBuilder ? "Document preview" : "Calculation result"}>
          {isBuilder && preview ? <><h2 className={styles.panelTitle}>{draft ? "Your draft" : "Live preview"}</h2><p className={`${styles.muted} mt-2`}>{draft ? "Ready to download. Professional review is recommended." : "Your document takes shape as you fill in the details."}</p><div className={styles.actions}><button type="button" className={`${styles.button} ${styles.secondary}`} disabled={!draft} onClick={() => draft && downloadText(documentText(draft), `limex-${tool.slug}.txt`)}>Download text</button><button type="button" className={styles.quiet} disabled={!draft} onClick={printDraft}>Print / PDF</button></div>{feedback ? <p className={`${styles.muted} mt-3`} role="status">{feedback}</p> : null}<Paper draft={preview} /></> : result ? <>
            <h2 className={styles.panelTitle}>Your estimate</h2>{result.year ? <p className={`${styles.muted} mt-2`}>Assessment year {result.year}</p> : null}<p className={styles.summaryTitle}>{result.title}</p><p className={styles.total}>{money(result.total)}</p>
            {!result.complete ? <p className={`${styles.muted} mt-3`}>Pending fees are not included in this amount.</p> : null}
            <dl className={styles.rows}>{result.rows.map((row) => <div className={styles.row} key={row.label}><dt>{row.label}</dt><dd>{row.amount === null ? <span className={styles.pending}>To confirm</span> : money(row.amount)}</dd></div>)}</dl>
            {result.slabs ? <details className="mt-5"><summary className="cursor-pointer text-[12px] font-semibold">See the slab breakdown</summary><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Rate</th><th>Income</th><th>Tax</th></tr></thead><tbody>{result.slabs.map((slab) => <tr key={slab.label}><td>{slab.rate}%</td><td>{money(slab.income)}</td><td>{money(slab.tax)}</td></tr>)}</tbody></table></div></details> : null}
            <button className={styles.button} type="button" onClick={() => setShowRequest(true)}>Have Limex check it <span aria-hidden="true">↗</span></button>
            <button className={styles.quiet} type="button" onClick={() => downloadText(`${tool.title}\n${result.year ?? ""}\n${Object.entries(values).map(([key, value]) => `${fields.find((field) => field.key === key)?.label ?? key}: ${value || "Pending"}`).join("\n")}\n\n${result.rows.map((row) => `${row.label}: ${row.amount === null ? "Pending" : money(row.amount)}`).join("\n")}\n${result.title}: ${money(result.total)}\n\n${result.notes.join("\n")}\n${result.sourceUrl}`, `limex-${tool.slug}-estimate.txt`)}>Download estimate ↓</button>
            <div className={styles.notes}>{result.notes.map((note) => <p className={styles.hint} key={note}>{note}</p>)}</div>
          </> : <div className={styles.emptySummary}><ServiceIcon name={tool.icon} className={styles.icon} /><h2 className={styles.panelTitle}>Clarity starts here.</h2><p className={`${styles.muted} mt-3`}>Add your details and calculate to see a simple, itemised result.</p><div className={styles.notes}><p className={styles.hint}>No signup. No payment. Your calculation isn’t stored unless you submit it for review.</p></div></div>}
        </div>
      </div>}
    </>}
    <div className={styles.help}><div><h2 className={styles.panelTitle}>Take the next step with Limex.</h2><p className={styles.muted}>{isBuilder ? "Get your draft checked before it becomes an agreement." : "Get help confirming the fees or arranging the service."}</p></div><button className={`${styles.button} ${styles.secondary}`} type="button" onClick={() => setShowRequest((current) => !current)} aria-expanded={showRequest} aria-controls="tool-request">{showRequest ? "Close request" : "Request support"}<span aria-hidden="true">↗</span></button></div>
    {showRequest ? <div className={styles.request} ref={requestRef} id="tool-request"><ToolServiceRequest tool={tool} contextValues={result || draft ? values : undefined} /></div> : null}
  </div>;
}
