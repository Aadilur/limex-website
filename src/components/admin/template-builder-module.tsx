"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import {
  createBlankTemplate,
  createTemplateId,
  defaultMouTemplate,
  resolveTemplateText,
  type AdminDocumentTemplate,
  type DocumentTemplateDraft,
  type TemplateBlock,
  type TemplateField,
  type TemplateFieldType,
} from "@/lib/document-templates";
import {
  createAdminTemplate,
  getAdminTemplates,
  publishAdminTemplate,
  unpublishAdminTemplate,
  updateAdminTemplate,
} from "@/lib/template-api";
import { ApiError } from "@/lib/menu-api";
import { DocumentTemplatePaper } from "@/components/limex/document-template-paper";

const inputClass = "h-10 w-full rounded-[11px] border border-[#d8d2c8] bg-[#fcfbf8] px-3 text-[13px] text-[#242129] outline-none transition-colors placeholder:text-[#a29b92] focus:border-[#e44762] focus:ring-4 focus:ring-[#f8d9de]";
const areaClass = "min-h-24 w-full resize-y rounded-[11px] border border-[#d8d2c8] bg-[#fcfbf8] px-3 py-2.5 text-[13px] leading-[1.5] text-[#242129] outline-none transition-colors placeholder:text-[#a29b92] focus:border-[#e44762] focus:ring-4 focus:ring-[#f8d9de]";
const labelClass = "block text-[10px] font-bold uppercase tracking-[0.13em] text-[#756e66]";

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className={labelClass}>{label}<input className={`${inputClass} mt-1.5`} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className={labelClass}>{label}<textarea className={`${areaClass} mt-1.5`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#5d5852]"><input className="peer sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="relative h-5 w-9 rounded-full bg-[#d7d1c8] transition-colors peer-checked:bg-[#e44762] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" aria-hidden="true" />{label}</label>;
}

function makeField(type: TemplateFieldType, index: number): TemplateField {
  const key = `field_${index + 1}`;
  return { id: createTemplateId("field"), key, label: "New field", type, required: false, placeholder: "", options: type === "select" ? [{ value: "option_1", label: "Option 1" }] : [] };
}

function makeBlock(type: TemplateBlock["type"], fields: TemplateField[], index: number): TemplateBlock {
  if (type === "pageBreak") return { id: createTemplateId("block"), type };
  if (type === "spacer") return { id: createTemplateId("block"), type, height: 24 };
  if (type === "signature") return { id: createTemplateId("block"), type, label: "Signature — {{party_a}}" };
  if (type === "field") return { id: createTemplateId("block"), type, fieldKey: fields[0]?.key ?? "field_1", align: "left", bold: false, italic: false, fontSize: "body" };
  return { id: createTemplateId("block"), type, text: type === "title" ? "DOCUMENT TITLE" : type === "heading" ? `${index + 1}. New section` : "Write the document text here. Use {{field_key}} for dynamic values.", align: type === "title" ? "center" : "left", bold: type !== "paragraph", italic: false, fontSize: type === "title" ? "large" : "body" };
}

function updateBlock(blocks: TemplateBlock[], id: string, patch: Partial<TemplateBlock>) {
  return blocks.map((block) => block.id === id ? { ...block, ...patch } as TemplateBlock : block);
}

function parseOptions(value: string) {
  return value.split("\n").map((line) => {
    const [optionValue, ...labelParts] = line.split("|");
    return { value: (optionValue ?? "").trim(), label: labelParts.join("|").trim() || (optionValue ?? "").trim() };
  }).filter((option) => option.value && option.label);
}

function SortButtons({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex shrink-0 gap-1 sm:flex-col"><button className="grid size-7 place-items-center rounded-md border border-[#e3ddd4] text-[12px] text-[#6a645d] transition-colors hover:border-[#e44762] hover:text-[#e44762] disabled:opacity-30" type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</button><button className="grid size-7 place-items-center rounded-md border border-[#e3ddd4] text-[12px] text-[#6a645d] transition-colors hover:border-[#e44762] hover:text-[#e44762] disabled:opacity-30" type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>↓</button><button className="grid size-7 place-items-center rounded-md border border-transparent text-[15px] text-[#a59d94] transition-colors hover:border-[#f0c7ce] hover:text-[#c63d58]" type="button" aria-label="Remove" onClick={onRemove}>×</button></div>;
}

function BlockEditor({ block, fields, index, count, onChange, onMove, onRemove }: { block: TemplateBlock; fields: TemplateField[]; index: number; count: number; onChange: (patch: Partial<TemplateBlock>) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  const formatted = block.type === "title" || block.type === "heading" || block.type === "paragraph";
  const text = formatted ? block.text : "";

  return <div className="rounded-[15px] border border-[#e3ddd4] bg-white p-3 sm:p-4">
    <div className="flex items-start gap-2.5">
      <span className="mt-1 cursor-grab select-none text-[18px] leading-none text-[#aaa198]" title="Drag to reorder" aria-hidden="true">⠿</span>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f5eee9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#776c61]">{block.type === "pageBreak" ? "New page" : block.type}</span>{formatted ? <span className="text-[11px] text-[#9a9187]">Use <code className="rounded bg-[#f4f1ec] px-1">{'{{field_key}}'}</code> for dynamic text.</span> : null}</div>
        {formatted ? <>
          {block.type === "paragraph" ? <textarea className={areaClass} value={text} onChange={(event) => onChange({ text: event.target.value })} /> : <input className={inputClass} value={text} onChange={(event) => onChange({ text: event.target.value })} />}
          <div className="flex flex-wrap items-center gap-2">
            <button className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${block.bold ? "border-[#17151c] bg-[#17151c] text-white" : "border-[#ddd6cd] text-[#69635c] hover:border-[#17151c]"}`.trim()} type="button" onClick={() => onChange({ bold: !block.bold })}>Bold</button>
            <button className={`rounded-full border px-3 py-1.5 text-[11px] font-bold italic transition-colors ${block.italic ? "border-[#17151c] bg-[#17151c] text-white" : "border-[#ddd6cd] text-[#69635c] hover:border-[#17151c]"}`.trim()} type="button" onClick={() => onChange({ italic: !block.italic })}>Italic</button>
            <select className="h-8 rounded-full border border-[#ddd6cd] bg-white px-2.5 text-[11px] font-semibold text-[#69635c]" value={block.align} onChange={(event) => onChange({ align: event.target.value as "left" | "center" | "right" })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select>
            <select className="h-8 rounded-full border border-[#ddd6cd] bg-white px-2.5 text-[11px] font-semibold text-[#69635c]" value={block.fontSize} onChange={(event) => onChange({ fontSize: event.target.value as "small" | "body" | "large" })}><option value="small">Small</option><option value="body">Body</option><option value="large">Large</option></select>
          </div>
          {fields.length ? <div className="flex flex-wrap items-center gap-2 border-t border-[#eee9e2] pt-2.5"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#978e84]">Insert field</span>{fields.slice(0, 8).map((field) => <button className="rounded-full bg-[#f2f7f3] px-2.5 py-1.5 text-[10px] font-semibold text-[#29634d] transition-colors hover:bg-[#dff0e5]" type="button" key={field.id} onClick={() => onChange({ text: `${text}${text && !text.endsWith(" ") ? " " : ""}{{${field.key}}}` })}>{field.label}</button>)}</div> : null}
        </> : null}
        {block.type === "field" ? <label className={labelClass}>Dynamic field<select className={`${inputClass} mt-1.5`} value={block.fieldKey} onChange={(event) => onChange({ fieldKey: event.target.value })}><option value="">Choose a field</option>{fields.map((field) => <option value={field.key} key={field.id}>{field.label} · {field.key}</option>)}</select></label> : null}
        {block.type === "spacer" ? <label className={labelClass}>Space height (px)<input className={`${inputClass} mt-1.5`} type="number" min={4} max={240} value={block.height} onChange={(event) => onChange({ height: Number(event.target.value) })} /></label> : null}
        {block.type === "signature" ? <Field label="Signature label" value={block.label} onChange={(label) => onChange({ label })} placeholder="Signature — {{party_a}}" /> : null}
        {block.type === "pageBreak" ? <p className="text-[12px] leading-[1.5] text-[#81786f]">Everything after this block starts on a new printed page.</p> : null}
      </div>
      <SortButtons index={index} count={count} onMove={onMove} onRemove={onRemove} />
    </div>
  </div>;
}

function BlockList({ blocks, fields, onChange }: { blocks: TemplateBlock[]; fields: TemplateField[]; onChange: (blocks: TemplateBlock[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  function move(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id); const target = index + direction;
    if (index < 0 || target < 0 || target >= blocks.length) return;
    const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]]; onChange(next);
  }
  function drop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = blocks.findIndex((block) => block.id === dragId); const to = blocks.findIndex((block) => block.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...blocks]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); onChange(next); setDragId(null);
  }
  return <div className="space-y-2.5">{blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setDragId(block.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(block.id)} onDragEnd={() => setDragId(null)} className={dragId === block.id ? "rounded-[16px] ring-2 ring-[#f3b8c0]" : ""}><BlockEditor block={block} fields={fields} index={index} count={blocks.length} onChange={(patch) => onChange(updateBlock(blocks, block.id, patch))} onMove={(direction) => move(block.id, direction)} onRemove={() => onChange(blocks.filter((item) => item.id !== block.id))} /></div>)}</div>;
}

function FieldsEditor({ fields, onChange }: { fields: TemplateField[]; onChange: (fields: TemplateField[]) => void }) {
  function update(id: string, patch: Partial<TemplateField>) { onChange(fields.map((field) => field.id === id ? { ...field, ...patch } : field)); }
  return <div className="space-y-2.5">{fields.map((field) => <div className="rounded-[14px] border border-[#e3ddd4] bg-white p-3" key={field.id}><div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_150px]">
    <div className="grid gap-2.5 sm:grid-cols-2"><Field label="Label" value={field.label} onChange={(label) => update(field.id, { label })} /><Field label="Key" value={field.key} onChange={(key) => update(field.id, { key: key.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="party_name" /></div>
    <label className={labelClass}>Input type<select className={`${inputClass} mt-1.5`} value={field.type} onChange={(event) => update(field.id, { type: event.target.value as TemplateFieldType, options: event.target.value === "select" ? field.options.length ? field.options : [{ value: "option_1", label: "Option 1" }] : [] })}><option value="text">Short text</option><option value="textarea">Long text</option><option value="date">Date</option><option value="number">Number</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option></select></label>
  </div><div className="mt-2.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><Field label="Placeholder" value={field.placeholder} onChange={(placeholder) => update(field.id, { placeholder })} /><div className="flex items-center justify-between gap-3"><Toggle label="Required" checked={field.required} onChange={(required) => update(field.id, { required })} /><button className="rounded-full px-2 py-1 text-[12px] font-semibold text-[#b13c53] hover:bg-[#fff0f2]" type="button" onClick={() => onChange(fields.filter((item) => item.id !== field.id))}>Remove</button></div></div>{field.type === "select" ? <label className={`${labelClass} mt-2.5 block`}>Options — value | label per line<textarea className={`${areaClass} mt-1.5 min-h-16`} value={field.options.map((option) => `${option.value} | ${option.label}`).join("\n")} onChange={(event) => update(field.id, { options: parseOptions(event.target.value) })} /></label> : null}</div>)}</div>;
}

function SectionCard({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="rounded-[18px] border border-[#e1dcd4] bg-[#fcfbf8] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-brand text-[19px] font-bold tracking-[-0.025em] text-[#17151c]">{title}</h2>{description ? <p className="mt-1 max-w-[700px] text-[12px] leading-[1.5] text-[#817a72]">{description}</p> : null}</div>{action}</div><div className="mt-4">{children}</div></section>;
}

function Editor({ template, onChange, onSave, onPublish, onUnpublish, busy, isNew, isPublished }: { template: DocumentTemplateDraft; onChange: (template: DocumentTemplateDraft) => void; onSave: () => void; onPublish: () => void; onUnpublish: () => void; busy: boolean; isNew: boolean; isPublished: boolean }) {
  const previewValues = useMemo(() => Object.fromEntries(template.fields.map((field) => [field.key, field.placeholder || field.label])), [template.fields]);
  function patch(patch: Partial<DocumentTemplateDraft>) { onChange({ ...template, ...patch }); }
  return <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
    <div className="min-w-0 space-y-5">
      <SectionCard title="Template details" description="Give the template a clear name and stable public link."><div className="grid gap-3 sm:grid-cols-2"><Field label="Title" value={template.title} onChange={(title) => patch({ title })} /><Field label="Public slug" value={template.slug} onChange={(slug) => patch({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /><div className="sm:col-span-2"><Area label="Description" value={template.description} onChange={(description) => patch({ description })} /></div></div></SectionCard>
      <SectionCard title="Page setup" description="A page break block starts a new printed page. Stamp space adds extra room above every page."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className={labelClass}>Paper size<select className={`${inputClass} mt-1.5`} value={template.settings.paperSize} onChange={(event) => patch({ settings: { ...template.settings, paperSize: event.target.value as "A4" | "LEGAL" } })}><option value="A4">A4</option><option value="LEGAL">Legal</option></select></label><Field label="Top margin (mm)" type="number" value={String(template.settings.marginTop)} onChange={(value) => patch({ settings: { ...template.settings, marginTop: Number(value) } })} /><Field label="Stamp gap (mm)" type="number" value={String(template.settings.stampGap)} onChange={(value) => patch({ settings: { ...template.settings, stampGap: Number(value) } })} /><Field label="Right margin (mm)" type="number" value={String(template.settings.marginRight)} onChange={(value) => patch({ settings: { ...template.settings, marginRight: Number(value) } })} /><Field label="Bottom margin (mm)" type="number" value={String(template.settings.marginBottom)} onChange={(value) => patch({ settings: { ...template.settings, marginBottom: Number(value) } })} /><Field label="Left margin (mm)" type="number" value={String(template.settings.marginLeft)} onChange={(value) => patch({ settings: { ...template.settings, marginLeft: Number(value) } })} /></div><div className="mt-3"><Toggle label="Show page numbers" checked={template.settings.showPageNumbers} onChange={(showPageNumbers) => patch({ settings: { ...template.settings, showPageNumbers } })} /></div></SectionCard>
      <SectionCard title="Input fields" description="These become the user-facing form fields. Insert their tokens into text blocks or add a dynamic field block." action={<button className="rounded-full bg-[#17151c] px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#e44762]" type="button" onClick={() => patch({ fields: [...template.fields, makeField("text", template.fields.length)] })}>+ Add field</button>}><FieldsEditor fields={template.fields} onChange={(fields) => patch({ fields })} /></SectionCard>
      <SectionCard title="Document blocks" description="Drag blocks to reorder them. Use page breaks to build a multi-page contract." action={<div className="flex flex-wrap gap-1.5">{(["heading", "paragraph", "field", "spacer", "pageBreak", "signature"] as const).map((type) => <button className="rounded-full border border-[#ddd6cd] bg-white px-2.5 py-2 text-[10px] font-bold text-[#625c55] transition-colors hover:border-[#17151c] hover:text-[#17151c] disabled:cursor-not-allowed disabled:opacity-40" type="button" key={type} disabled={type === "field" && !template.fields.length} onClick={() => patch({ blocks: [...template.blocks, makeBlock(type, template.fields, template.blocks.length)] })}>{type === "pageBreak" ? "+ New page" : `+ ${type}`}</button>)}</div>}><BlockList blocks={template.blocks} fields={template.fields} onChange={(blocks) => patch({ blocks })} /></SectionCard>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#d9d3ca] bg-white/95 p-3 shadow-[0_12px_30px_rgba(44,36,31,0.1)] backdrop-blur"><p className="text-[11px] font-semibold text-[#817970]">{isNew ? "New draft" : isPublished ? "Changes stay private until published." : "Draft"}</p><div className="flex flex-wrap gap-2"><button className="min-h-10 rounded-full border border-[#d8d1c8] px-4 text-[12px] font-bold text-[#514c47] transition-colors hover:border-[#17151c]" type="button" onClick={onSave} disabled={busy}>{busy ? "Saving…" : isNew ? "Create draft" : "Save draft"}</button>{!isNew && isPublished ? <button className="min-h-10 rounded-full bg-[#e44762] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#c83c55]" type="button" onClick={onUnpublish} disabled={busy}>Unpublish</button> : null}<button className="min-h-10 rounded-full bg-[#17151c] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#e44762]" type="button" onClick={onPublish} disabled={busy || isNew}>{busy ? "Working…" : "Publish"}</button></div></div>
    </div>
    <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start"><SectionCard title="Live preview" description="This is the same page structure users will fill and print."><DocumentTemplatePaper template={template} values={previewValues} showLabels /></SectionCard></aside>
  </div>;
}

export function TemplateBuilderModule() {
  const [templates, setTemplates] = useState<AdminDocumentTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DocumentTemplateDraft | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function handleError(value: unknown) {
    if (value instanceof ApiError && value.status === 401) { window.location.assign("/admin/login"); return; }
    setError(value instanceof Error ? value.message : "Unable to load templates.");
  }

  function selectTemplate(template: AdminDocumentTemplate) {
    setSelectedId(template.id); setDraft({ title: template.title, slug: template.slug, description: template.description, settings: template.settings, fields: template.fields, blocks: template.blocks }); setRevision(template.revision); setIsPublished(template.status === "PUBLISHED"); setIsNew(false); setNotice(""); setError("");
  }

  useEffect(() => {
    let active = true;
    void getAdminTemplates().then((items) => { if (!active) return; setTemplates(items); if (items[0]) selectTemplate(items[0]); }).catch((value) => { if (active) handleError(value); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function startNew() { setSelectedId(null); setDraft(createBlankTemplate()); setRevision(null); setIsPublished(false); setIsNew(true); setNotice(""); setError(""); }

  async function save() {
    if (!draft || busy) return;
    setBusy(true); setNotice(""); setError("");
    try {
      const saved = isNew ? await createAdminTemplate(draft) : await updateAdminTemplate(selectedId!, draft, revision!);
      setTemplates((current) => isNew ? [saved, ...current] : current.map((item) => item.id === saved.id ? saved : item));
      selectTemplate(saved); setNotice(isNew ? "Draft created." : "Draft saved.");
    } catch (value) { handleError(value); } finally { setBusy(false); }
  }

  async function publish() {
    if (!selectedId || revision === null || !draft || busy) return;
    setBusy(true); setNotice(""); setError("");
    try {
      // Publish the current editor state, including changes made after the last save.
      const savedDraft = await updateAdminTemplate(selectedId, draft, revision);
      setTemplates((current) => current.map((item) => item.id === savedDraft.id ? savedDraft : item));
      selectTemplate(savedDraft);
      const saved = await publishAdminTemplate(savedDraft.id, savedDraft.revision);
      setTemplates((current) => current.map((item) => item.id === saved.id ? saved : item));
      selectTemplate(saved);
      setNotice("Template published.");
    }
    catch (value) { handleError(value); } finally { setBusy(false); }
  }

  async function unpublish() {
    if (!selectedId || revision === null || busy) return;
    setBusy(true); setNotice(""); setError("");
    try { const saved = await unpublishAdminTemplate(selectedId, revision); setTemplates((current) => current.map((item) => item.id === saved.id ? saved : item)); selectTemplate(saved); setNotice("Template unpublished."); }
    catch (value) { handleError(value); } finally { setBusy(false); }
  }

  if (loading) return <div className="grid min-h-[360px] place-items-center rounded-[22px] border border-[#e1dcd4] bg-white text-[13px] font-semibold text-[#817970]">Loading templates…</div>;
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e44762]">Business tools / templates</p><h2 className="mt-1 font-brand text-[30px] font-bold tracking-[-0.04em] text-[#17151c]">Build documents once.</h2><p className="mt-1 max-w-[640px] text-[13px] leading-[1.5] text-[#817970]">Create reusable legal-document drafts with dynamic fields, page setup and a controlled publish flow.</p></div><button className="min-h-11 rounded-full bg-[#17151c] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#e44762]" type="button" onClick={startNew}>+ New template</button></div>
    {error ? <p className="rounded-[12px] border border-[#f0c7ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] font-semibold text-[#c53e59]" role="alert">{error}</p> : null}
    {notice ? <p className="rounded-[12px] border border-[#c7dfce] bg-[#eff8f1] px-3.5 py-3 text-[12px] font-semibold text-[#2d7650]" role="status">{notice}</p> : null}
    <div className="grid min-w-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="min-w-0 rounded-[18px] border border-[#e1dcd4] bg-white p-3"><div className="mb-2 flex items-center justify-between px-2"><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8a8178]">Templates</span><span className="text-[11px] text-[#a09991]">{templates.length}</span></div><div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">{templates.map((template) => <button className={`min-w-[210px] rounded-[12px] p-3 text-left transition-colors lg:block lg:w-full ${selectedId === template.id ? "bg-[#17151c] text-white" : "bg-[#faf8f4] text-[#423d38] hover:bg-[#f3eee8]"}`.trim()} type="button" key={template.id} onClick={() => selectTemplate(template)}><span className="block truncate text-[13px] font-bold">{template.title}</span><span className={`mt-1 block truncate text-[10px] ${selectedId === template.id ? "text-white/60" : "text-[#8e867e]"}`.trim()}>{template.status === "PUBLISHED" ? "Published" : "Draft"} · {template.paperSize}</span></button>)}</div></aside><div className="min-w-0">{draft ? <Editor template={draft} onChange={setDraft} onSave={() => void save()} onPublish={() => void publish()} onUnpublish={() => void unpublish()} busy={busy} isNew={isNew} isPublished={isPublished} /> : <div className="rounded-[18px] border border-dashed border-[#d5cec4] bg-white p-8 text-center text-[13px] text-[#817970]">Choose a template or create a new one.</div>}</div></div>
  </div>;
}
