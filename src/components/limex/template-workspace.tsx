"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { missingTemplateFields, type PublicDocumentTemplate, type TemplateField, type TemplateValues } from "@/lib/document-templates";
import { getAdminTemplatePreview, getPublishedTemplate } from "@/lib/template-api";
import { renderTemplatePrintHtml } from "@/lib/document-template-print";
import { DocumentTemplatePaper } from "./document-template-paper";

const inputClass = "h-11 w-full rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 text-[13px] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#e44762] focus:ring-4 focus:ring-[#f8d9de]";
const areaClass = "min-h-28 w-full resize-y rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 py-3 text-[13px] leading-[1.5] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#e44762] focus:ring-4 focus:ring-[#f8d9de]";

function FieldInput({ field, value, onChange }: { field: TemplateField; value: string; onChange: (value: string) => void }) {
  const label = <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f6961]">{field.label}{field.required ? <span className="ml-1 text-[#e44762]">*</span> : null}</span>;
  if (field.type === "textarea") return <label className="block">{label}<textarea className={areaClass} value={value} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.type === "select") return <label className="block">{label}<select className={`${inputClass} cursor-pointer`} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Choose an option</option>{field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "checkbox") return <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 text-[13px] font-semibold text-[#403b36]"><input className="size-4 accent-[#e44762]" type="checkbox" checked={value === "true"} onChange={(event) => onChange(String(event.target.checked))} />{field.label}{field.required ? <span className="text-[#e44762]">*</span> : null}</label>;
  return <label className="block">{label}<input className={inputClass} type={field.type === "number" ? "number" : field.type} value={value} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function TemplateWorkspace({ slug, preview = false }: { slug: string; preview?: boolean }) {
  const [template, setTemplate] = useState<PublicDocumentTemplate | null>(null);
  const [values, setValues] = useState<TemplateValues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let active = true;
    const load = preview ? getAdminTemplatePreview(slug).then((loaded) => ({ slug: loaded.slug, title: loaded.title, description: loaded.description, settings: loaded.settings, fields: loaded.fields, pages: loaded.pages, publishedAt: loaded.updatedAt })) : getPublishedTemplate(slug);
    void load.then((loaded) => {
      if (!active) return;
      setTemplate(loaded);
      setValues(Object.fromEntries(loaded.fields.map((field) => [field.key, field.type === "checkbox" ? "false" : ""])));
    }).catch((value) => { if (active) setError(value instanceof Error ? value.message : "This template is not available."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [preview, slug]);

  const missing = useMemo(() => template ? missingTemplateFields(template.fields, values) : [], [template, values]);

  function update(key: string, value: string) { setValues((current) => ({ ...current, [key]: value })); setError(""); }

  function print() {
    if (!template) return;
    if (missing.length) { setError(`Complete: ${missing.map((field) => field.label).join(", ")}.`); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const popup = window.open("", "_blank", "width=900,height=900");
    if (!popup) { setError("Allow popups to open the print preview."); return; }
    popup.opener = null;
    popup.document.open();
    popup.document.write(renderTemplatePrintHtml(template, values));
    popup.document.close();
    window.setTimeout(() => { popup.focus(); popup.print(); }, 350);
  }

  if (loading) return <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e1dcd4] bg-white text-[13px] font-semibold text-[#777168]">Loading template…</div>;
  if (!template) return <div className="rounded-[24px] border border-[#f0c7ce] bg-[#fff8f8] p-6 text-[13px] font-semibold text-[#c53e59]">{error || "This template is not available."}</div>;

  return <div className="space-y-6">
    <nav className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#817970]" aria-label="Breadcrumb"><Link className="transition-colors hover:text-[#e44762]" href="/business-tools">Business tools</Link><span aria-hidden="true">/</span><span className="text-[#242129]">{template.title}</span></nav>
    <header className="max-w-[760px]"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">{preview ? "Draft preview" : "Business document template"}</p><h1 className="mt-2 font-brand text-[32px] font-bold leading-[1.05] tracking-[-0.045em] text-[#17151c] sm:text-[46px]">{template.title}</h1><p className="mt-3 text-[14px] leading-[1.7] text-[#756e66]">{template.description} Fill in the fields, review the document, then print or save it as a PDF.</p></header>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.84fr)_minmax(420px,1.16fr)]">
      <form className="min-w-0 rounded-[22px] border border-[#e1dcd4] bg-white p-4 sm:p-6" ref={formRef} onSubmit={(event) => { event.preventDefault(); print(); }}><div className="flex items-center justify-between gap-3 border-b border-[#ebe5dd] pb-4"><div><h2 className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#17151c]">Your details</h2><p className="mt-1 text-[12px] text-[#817970]">Fields marked with * are required.</p></div><span className="rounded-full bg-[#f4eee8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#796d61]">{template.settings.paperSize}</span></div><div className="mt-5 grid gap-4">{template.fields.map((field) => <FieldInput field={field} value={values[field.key] ?? ""} onChange={(value) => update(field.key, value)} key={field.id} />)}</div>{error ? <p className="mt-5 rounded-[12px] border border-[#f0c7ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] font-semibold text-[#c53e59]" role="alert">{error}</p> : null}<div className="mt-6 flex flex-col gap-3 border-t border-[#ebe5dd] pt-5 sm:flex-row sm:items-center"><button className="min-h-12 flex-1 rounded-full bg-[#17151c] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#e44762]" type="submit">Print / Save as PDF <span aria-hidden="true">↗</span></button><p className="text-[11px] leading-[1.45] text-[#938a80]">This is a draft for review. Check applicable legal, stamp and signing requirements before use.</p></div></form>
      <section className="min-w-0 rounded-[22px] border border-[#e1dcd4] bg-[#f7f4ef] p-3 sm:p-5" aria-label="Document preview"><div className="mb-3 flex items-center justify-between gap-3 px-1"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#e44762]">Live preview</p><p className="mt-1 text-[12px] text-[#817970]">Page setup: {template.settings.paperSize} · {template.pages.length} pages</p></div><span className="text-[11px] font-semibold text-[#817970]">Updates as you type</span></div><DocumentTemplatePaper template={template} values={values} showLabels compact /></section>
    </div>
  </div>;
}
