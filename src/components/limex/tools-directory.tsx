"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { businessTools, toolHref, type ToolDefinition } from "@/lib/business-tools";
import { getPublishedTemplates, type DocumentTemplateSummary } from "@/lib/template-api";
import { ServiceIcon } from "./service-icons";
import styles from "./tools.module.css";

export function ToolCard({ tool, builder = false }: { tool: ToolDefinition & { href?: string }; builder?: boolean }) {
  if (builder) return <Link href={tool.href ?? toolHref(tool.slug)} className={styles.builderCard}><ServiceIcon name={tool.icon} className={`${styles.icon} shrink-0`} /><div><strong>{tool.title}</strong><p>{tool.description}</p></div><span className={styles.arrow} aria-hidden="true">↗</span></Link>;
  return <Link href={tool.href ?? toolHref(tool.slug)} className={styles.card}><div className={styles.cardTop}><ServiceIcon name={tool.icon} className={styles.icon} /><span className={styles.arrow} aria-hidden="true">↗</span></div><strong>{tool.title}</strong><p>{tool.description}</p></Link>;
}
export function ToolsDirectory() {
  const [filter, setFilter] = useState("all"); const [query, setQuery] = useState("");
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  useEffect(() => { let active = true; void getPublishedTemplates().then((items) => { if (active) setTemplates(items); }).catch(() => { if (active) setTemplates([]); }); return () => { active = false; }; }, []);
  const filtered = businessTools.filter((tool) => (filter === "all" || tool.group === filter) && `${tool.title} ${tool.description} ${tool.menuLabel}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredTemplates = templates.filter((template) => (filter === "all" || filter === "builder") && `${template.title} ${template.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className={styles.directory}>
    <header className={styles.intro}><h1>Move faster with<br className="hidden sm:block" /> practical tools.</h1><p>Plan a cost. Work out your tax. Put an agreement in writing.<br className="hidden sm:block" /> A simpler starting point for your business in Bangladesh.</p></header>
    <div className={styles.directoryBar}><div className={styles.tabs} aria-label="Filter tools">{[["all", "All tools"], ["calculator", "Calculators"], ["builder", "Builders"]].map(([key, label]) => <button className={styles.tab} type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div><input className={`${styles.control} ${styles.search}`} type="search" aria-label="Find a business tool" placeholder="Find a tool…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    {(["calculator", "builder"] as const).map((group) => { const items = filtered.filter((tool) => tool.group === group); return items.length ? <section key={group} className={styles.group}><h2 className={styles.groupTitle}>{group === "calculator" ? "Essential calculators" : "Document builders"}</h2><div className={group === "calculator" ? styles.grid : styles.builderGrid}>{items.map((tool) => <ToolCard key={tool.slug} tool={tool} builder={group === "builder"} />)}</div></section> : null; })}
    {filteredTemplates.length ? <section className={styles.group}><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className={styles.groupTitle}>Published templates</h2><p className={styles.muted}>Fill in a reusable document, review it and print it when ready.</p></div><span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-[11px] font-semibold text-[#006dce]">{filteredTemplates.length} available</span></div><div className={styles.builderGrid}>{filteredTemplates.map((template) => <Link href={`/business-tools/templates/${template.slug}`} className={styles.builderCard} key={template.id}><ServiceIcon name="contract" className={`${styles.icon} shrink-0`} /><div><strong>{template.title}</strong><p>{template.description}</p></div><span className={styles.arrow} aria-hidden="true">↗</span></Link>)}</div></section> : null}
    {!filtered.length ? <p className={styles.muted} role="status">No tools match “{query}”. Try tax, licence or agreement.</p> : null}
  </div>;
}
