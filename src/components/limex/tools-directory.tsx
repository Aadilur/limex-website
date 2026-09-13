"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { businessTools, toolHref, type ToolDefinition } from "@/lib/business-tools";
import { getPublishedTemplates, type DocumentTemplateSummary } from "@/lib/template-api";
import { ServiceIcon } from "./service-icons";
import styles from "./tools.module.css";

export function ToolCard({ tool }: { tool: ToolDefinition & { href?: string } }) {
  return <Link href={tool.href ?? toolHref(tool.slug)} className={styles.card}><div className={styles.cardTop}><ServiceIcon name={tool.icon} className={styles.icon} /><span className={styles.arrow} aria-hidden="true">↗</span></div><strong>{tool.title}</strong><p>{tool.description}</p></Link>;
}
export function ToolsDirectory() {
  const [filter, setFilter] = useState<"all" | "calculator" | "builder">("all"); const [query, setQuery] = useState("");
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  useEffect(() => { let active = true; void getPublishedTemplates().then((items) => { if (active) setTemplates(items); }).catch(() => { if (active) setTemplates([]); }).finally(() => { if (active) setTemplatesLoading(false); }); return () => { active = false; }; }, []);
  const filteredCalculators = businessTools.filter((tool) => tool.group === "calculator" && (filter === "all" || filter === "calculator") && `${tool.title} ${tool.description} ${tool.menuLabel}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredTemplates = templates.filter((template) => (filter === "all" || filter === "builder") && `${template.title} ${template.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const hasMatches = filteredCalculators.length > 0 || filteredTemplates.length > 0;
  return <div className={styles.directory}>
    <header className={styles.intro}><h1>Move faster with<br className="hidden sm:block" /> practical tools.</h1><p>Plan a cost. Work out your tax. Put an agreement in writing.<br className="hidden sm:block" /> A simpler starting point for your business in Bangladesh.</p></header>
    <div className={styles.directoryBar}><div className={styles.tabs} aria-label="Filter tools">{[["all", "All tools"], ["calculator", "Calculators"], ["builder", "Document builders"]].map(([key, label]) => <button className={styles.tab} type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key as "all" | "calculator" | "builder")}>{label}</button>)}</div><input className={`${styles.control} ${styles.search}`} type="search" aria-label="Find a business tool" placeholder="Find a tool…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    {filteredCalculators.length ? <section className={styles.group}><h2 className={styles.groupTitle}>Essential calculators</h2><div className={styles.grid}>{filteredCalculators.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div></section> : null}
    {filter !== "calculator" ? <section className={styles.group} id="document-builders"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className={styles.groupTitle}>Document builders</h2><p className={styles.muted}>Published templates you can complete, review and print.</p></div>{filteredTemplates.length ? <span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-[11px] font-semibold text-[#006dce]">{filteredTemplates.length} available</span> : null}</div>{templatesLoading ? <p className={`${styles.muted} mt-4`} role="status">Loading published templates…</p> : filteredTemplates.length ? <div className={styles.builderGrid}>{filteredTemplates.map((template) => <Link href={`/business-tools/templates/${template.slug}`} className={styles.builderCard} key={template.id}><ServiceIcon name={template.icon} className={`${styles.icon} shrink-0`} /><div><strong>{template.title}</strong><p>{template.description}</p></div><span className={styles.arrow} aria-hidden="true">↗</span></Link>)}</div> : <p className={`${styles.muted} mt-4`}>No published document templates are available yet.</p>}</section> : null}
    {!hasMatches && !templatesLoading ? <p className={styles.muted} role="status">No tools match “{query}”. Try tax, licence or agreement.</p> : null}
  </div>;
}
