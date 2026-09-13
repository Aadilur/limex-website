"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createBlankTemplate,
  createTemplateId,
  isTemplateFieldManagedByRepeater,
  templateFontScaleMax,
  templateFontScaleMin,
  templateFontScaleDefault,
  templatePaperSizeLabels,
  templateRepeaterFieldValueKey,
  type AdminDocumentTemplate,
  type DocumentTemplateDraft,
  type DocumentTemplateSummary,
  type TemplateBlock,
  type TemplateField,
  type TemplateFieldType,
  type TemplateFontSize,
  type TemplatePage,
  type TemplatePageSettings,
  type TemplateRepeater,
  type TemplateRepeaterField,
} from "@/lib/document-templates";
import {
  checkTemplateSlug,
  createAdminTemplate,
  getAdminTemplate,
  getAdminTemplates,
  publishAdminTemplate,
  reorderAdminTemplates,
  unpublishAdminTemplate,
  updateAdminTemplate,
} from "@/lib/template-api";
import { ApiError, getAdminMenu, type AdminMenuSection } from "@/lib/menu-api";
import { DocumentTemplatePaper } from "@/components/limex/document-template-paper";

const inputClass = "h-10 w-full rounded-[9px] border border-[#d8d2c8] bg-white px-3 text-[12.5px] font-medium text-[#242129] outline-none transition-[border-color,box-shadow] placeholder:text-[#a29b92] hover:border-[#bdb4aa] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";
const areaClass = "min-h-20 w-full resize-y rounded-[9px] border border-[#d8d2c8] bg-white px-3 py-2.5 text-[12.5px] font-medium leading-[1.5] text-[#242129] outline-none transition-[border-color,box-shadow] placeholder:text-[#a29b92] hover:border-[#bdb4aa] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";
const labelClass = "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#756e66]";
const fontSizeOptions: Array<[TemplateFontSize, string]> = [["small", "Small"], ["body", "Body"], ["subtitle", "Subtitle"], ["title", "Title"], ["large", "Title (legacy)"]];

type ServiceOption = { href: string; label: string; category: string };

const fallbackServiceOptions: ServiceOption[] = [{
  href: "/services/trademark-registration",
  label: "Trademark registration",
  category: "IP & Trademark",
}];

function serviceOptionsFromMenu(sections: AdminMenuSection[]): ServiceOption[] {
  const options = sections.flatMap((section) => section.groups.flatMap((group) => group.items
    .filter((item) => item.isVisible && item.href.startsWith("/services/"))
    .map((item) => ({ href: item.href, label: item.label, category: section.label }))));
  return Array.from(new Map(options.map((option) => [option.href, option])).values());
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className={labelClass}>{label}<input className={`${inputClass} mt-1.5`} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className={labelClass}>{label}<textarea className={`${areaClass} mt-1.5`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#5d5852]"><input className="peer sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="relative h-5 w-9 rounded-full bg-[#d7d1c8] transition-colors peer-checked:bg-[#0055ff] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" aria-hidden="true" />{label}</label>;
}

function DisclosureSection({ title, description, children, action, meta, defaultOpen = false }: { title: string; description?: string; children: ReactNode; action?: ReactNode; meta?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="overflow-hidden rounded-[15px] bg-white shadow-[0_1px_0_rgba(44,36,31,0.04)]"><div className="flex items-center gap-3 px-3.5 py-3 sm:px-4"><button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[14px] transition-colors ${open ? "bg-[#071b3d] text-white" : "bg-[#f4eee8] text-[#746b61]"}`.trim()} aria-hidden="true">{open ? "−" : "+"}</span><span className="min-w-0"><span className="block font-brand text-[16px] font-bold tracking-[-0.02em] text-[#071b3d]">{title}</span>{description ? <span className="mt-0.5 block truncate text-[11px] leading-[1.4] text-[#817970]">{description}</span> : null}</span></button>{meta ? <span className="hidden shrink-0 text-[11px] text-[#948b82] sm:block">{meta}</span> : null}{action}</div>{open ? <div className="border-t border-[#eee9e2] px-3.5 py-3.5 sm:px-4">{children}</div> : null}</section>;
}

function isFormattedBlock(block: TemplateBlock): block is Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" | "field" }> {
  return block.type === "title" || block.type === "heading" || block.type === "paragraph" || block.type === "field";
}

function makeField(type: TemplateFieldType, index: number): TemplateField {
  const key = `field_${index + 1}`;
  return { id: createTemplateId("field"), key, label: "New field", type, required: false, placeholder: "", options: type === "select" ? [{ value: "option_1", label: "Option 1" }] : [] };
}

type EditableBlockType = Exclude<TemplateBlock["type"], "pageBreak">;

function makeBlock(type: EditableBlockType, fields: TemplateField[], index: number, defaultFontSize: TemplateFontSize): TemplateBlock {
  if (type === "field") return { id: createTemplateId("block"), type, fieldKey: fields[0]?.key ?? "field_1", align: "left", bold: false, italic: false, fontSize: defaultFontSize };
  if (type === "spacer") return { id: createTemplateId("block"), type, height: 24 };
  if (type === "signature") return { id: createTemplateId("block"), type, label: "Signature — {{party_a}}" };
  return { id: createTemplateId("block"), type, text: type === "title" ? "DOCUMENT TITLE" : type === "heading" ? `${index + 1}. New section` : "Write the document text here. Use {{field_key}} for dynamic values.", align: type === "title" ? "center" : "left", bold: type !== "paragraph", italic: false, fontSize: type === "title" ? "title" : type === "heading" ? "subtitle" : defaultFontSize };
}

function makePage(index: number, defaultFontSize: TemplateFontSize): TemplatePage {
  return { id: createTemplateId("page"), title: `Page ${index + 1}`, settings: {}, blocks: [makeBlock("paragraph", [], 0, defaultFontSize)] };
}

function updateBlock(blocks: TemplateBlock[], id: string, patch: Partial<TemplateBlock>) {
  return blocks.map((block) => block.id === id ? { ...block, ...patch } as TemplateBlock : block);
}

type SelectOption = TemplateField["options"][number];

function MoveControls({ index, count, onMove, onRemove, removeLabel = "Remove", removeDisabled = false }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove?: () => void; removeLabel?: string; removeDisabled?: boolean }) {
  return <div className="flex shrink-0 items-center gap-0.5"><button className="grid size-7 place-items-center rounded-full text-[13px] text-[#817970] transition-colors hover:bg-white hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-25" type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</button><button className="grid size-7 place-items-center rounded-full text-[13px] text-[#817970] transition-colors hover:bg-white hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-25" type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>↓</button>{onRemove ? <button className="grid size-7 place-items-center rounded-full text-[15px] text-[#a59d94] transition-colors hover:bg-[#fff0f2] hover:text-[#c63d58] disabled:cursor-not-allowed disabled:opacity-30" type="button" aria-label={removeLabel} disabled={removeDisabled} onClick={onRemove}>×</button> : null}</div>;
}

function OptionsEditor({ options, onChange }: { options: SelectOption[]; onChange: (options: SelectOption[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const incomplete = options.some((option) => !option.value.trim() || !option.label.trim());
  const duplicateValues = new Set(options.map((option) => option.value.trim()).filter(Boolean)).size !== options.filter((option) => option.value.trim()).length;

  function update(index: number, patch: Partial<SelectOption>) {
    onChange(options.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function drop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...options];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) return;
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  function add() {
    if (options.length >= 30) return;
    let suffix = options.length + 1;
    while (options.some((option) => option.value === `option_${suffix}`)) suffix += 1;
    onChange([...options, { value: `option_${suffix}`, label: `Option ${suffix}` }]);
  }

  return <div className="mt-2.5 rounded-[11px] bg-[#f7f4ef] p-2.5 sm:p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#756e66]">Dropdown options</p><p className="mt-0.5 text-[10px] leading-[1.4] text-[#958c82]">Value is stored; label is shown to the user.</p></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#817970]">{options.length} / 30</span></div><div className="mt-2 space-y-1.5">{options.length ? options.map((option, index) => <div className={`flex items-start gap-2 rounded-[10px] bg-white/75 p-2 transition-opacity ${dragIndex === index ? "opacity-50" : ""}`.trim()} key={index} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={() => drop(index)}><span className="mt-6 cursor-grab select-none px-0.5 text-[16px] leading-none text-[#aaa198]" title="Drag to reorder option" aria-label="Drag to reorder option" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; setDragIndex(index); }} onDragEnd={() => setDragIndex(null)}>⠿</span><span className="mt-6 grid size-5 shrink-0 place-items-center rounded-full bg-[#f4eee8] text-[9px] font-bold text-[#817970]">{index + 1}</span><div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2"><label className={labelClass}>Value<input className={`${inputClass} mt-1`} value={option.value} placeholder="option_value" onChange={(event) => update(index, { value: event.target.value })} /></label><label className={labelClass}>Label<input className={`${inputClass} mt-1`} value={option.label} placeholder="Option label" onChange={(event) => update(index, { label: event.target.value })} /></label></div><MoveControls index={index} count={options.length} onMove={(direction) => move(index, direction)} onRemove={() => onChange(options.filter((_, optionIndex) => optionIndex !== index))} removeLabel={`Remove option ${index + 1}`} /></div>) : <p className="rounded-[10px] bg-white/70 px-3 py-2.5 text-[11px] text-[#817970]">No options yet. Add the first choice below.</p>}</div><button className="mt-2.5 rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#29634d] transition-colors hover:bg-[#eaf5ed] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={add} disabled={options.length >= 30}>+ Add option</button>{incomplete ? <p className="mt-2 text-[10px] font-semibold text-[#b13c53]">Complete both value and label before saving.</p> : duplicateValues ? <p className="mt-2 text-[10px] font-semibold text-[#b13c53]">Each option value should be unique.</p> : null}</div>;
}

function blockSummary(block: TemplateBlock, fields: TemplateField[], repeaters: TemplateRepeater[] = []) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") return block.text.trim() || "Empty text section";
  if (block.type === "field") {
    const repeater = block.repeat ? repeaters.find((item) => item.key === block.repeat?.repeaterKey) : undefined;
    return [...(repeater?.fields ?? []), ...fields].find((field) => field.key === block.fieldKey)?.label ?? block.fieldKey;
  }
  if (block.type === "signature") return block.label || "Signature";
  if (block.type === "spacer") return `${block.height}px of space`;
  return "Page break";
}

function SortButtons({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex shrink-0 items-center gap-1"><button className="grid size-7 place-items-center rounded-md text-[13px] text-[#706860] transition-colors hover:bg-[#f5eee8] hover:text-[#071b3d] disabled:opacity-30" type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</button><button className="grid size-7 place-items-center rounded-md text-[13px] text-[#706860] transition-colors hover:bg-[#f5eee8] hover:text-[#071b3d] disabled:opacity-30" type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>↓</button><button className="grid size-7 place-items-center rounded-md text-[15px] text-[#a59d94] transition-colors hover:bg-[#fff0f2] hover:text-[#c63d58]" type="button" aria-label="Remove element" onClick={onRemove}>×</button></div>;
}

function BlockEditor({ block, fields, repeaters, index, count, expanded, onToggle, onChange, onMove, onRemove, onDragStart, onDragEnd }: { block: TemplateBlock; fields: TemplateField[]; repeaters: TemplateRepeater[]; index: number; count: number; expanded: boolean; onToggle: () => void; onChange: (patch: Partial<TemplateBlock>) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void; onDragStart: () => void; onDragEnd: () => void }) {
  const formatted = isFormattedBlock(block);
  const textBlock = block.type === "title" || block.type === "heading" || block.type === "paragraph";
  const text = textBlock ? block.text : "";
  const label = block.type === "paragraph" ? "Text" : block.type === "heading" ? "Heading" : block.type === "title" ? "Title" : block.type === "field" ? "Dynamic input" : block.type === "signature" ? "Signature" : "Spacer";
  const selectedRepeater = repeaters.find((repeater) => repeater.key === block.repeat?.repeaterKey);
  const insertFields: Array<TemplateField | TemplateRepeaterField> = selectedRepeater ? [...selectedRepeater.fields, ...fields] : fields;
  const blockFields: Array<TemplateField | TemplateRepeaterField> = selectedRepeater ? [...selectedRepeater.fields, ...fields] : fields;

  return <article className={`border-b border-[#eee9e2] bg-white transition-colors last:border-b-0 ${expanded ? "bg-[#fbfaf7]" : ""}`.trim()} onDragOver={(event) => event.preventDefault()}><div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5"><span className="cursor-grab select-none px-1 text-[17px] leading-none text-[#aaa198]" title="Drag to reorder" aria-label="Drag section to reorder" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>⠿</span><button type="button" className="min-w-0 flex-1 text-left" onClick={onToggle}><span className="flex min-w-0 items-center gap-2"><span className="rounded-full bg-[#f4eee8] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#776c61]">{label}</span><span className="truncate text-[12px] font-semibold text-[#38332e]">{blockSummary(block, fields, repeaters)}{selectedRepeater ? <span className="ml-1 text-[10px] font-medium text-[#938a80]">· {selectedRepeater.label}</span> : null}</span></span></button><SortButtons index={index} count={count} onMove={onMove} onRemove={onRemove}/></div>{expanded ? <div className="space-y-2.5 border-t border-[#eee9e2] px-3.5 pb-3.5 pt-3 sm:pl-12 sm:pr-3.5">{textBlock ? (block.type === "paragraph" ? <textarea className={areaClass} value={text} onChange={(event) => onChange({ text: event.target.value })} /> : <input className={inputClass} value={text} onChange={(event) => onChange({ text: event.target.value })} />) : null}{formatted ? <div className="flex flex-wrap items-center gap-1.5"><button className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors ${block.bold ? "bg-[#071b3d] text-white" : "bg-[#f4eee8] text-[#69635c] hover:bg-[#e9e1d8]"}`.trim()} type="button" onClick={() => onChange({ bold: !block.bold })}>Bold</button><button className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold italic transition-colors ${block.italic ? "bg-[#071b3d] text-white" : "bg-[#f4eee8] text-[#69635c] hover:bg-[#e9e1d8]"}`.trim()} type="button" onClick={() => onChange({ italic: !block.italic })}>Italic</button><select className="h-8 rounded-full border border-[#ddd6cd] bg-white px-2.5 text-[11px] font-semibold text-[#69635c]" value={block.align} onChange={(event) => onChange({ align: event.target.value as "left" | "center" | "right" })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><select className="h-8 rounded-full border border-[#ddd6cd] bg-white px-2.5 text-[11px] font-semibold text-[#69635c]" value={block.fontSize} onChange={(event) => onChange({ fontSize: event.target.value as TemplateFontSize })}>{fontSizeOptions.map(([value, optionLabel]) => <option value={value} key={value}>{value === "body" ? "Body · global" : optionLabel}</option>)}</select></div> : null}<div className="grid gap-2.5 border-t border-[#eee9e2] pt-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><label className={labelClass}>Repeat with group<select className={`${inputClass} mt-1.5`} value={block.repeat?.repeaterKey ?? ""} onChange={(event) => onChange({ repeat: event.target.value ? { repeaterKey: event.target.value } : undefined })}><option value="">Do not repeat</option>{repeaters.map((repeater) => <option value={repeater.key} key={repeater.id}>{repeater.label}</option>)}</select></label>{selectedRepeater ? <div className="grid grid-cols-2 gap-2"><Field label="First item" type="number" value={String(block.repeat?.from ?? 1)} onChange={(value) => onChange({ repeat: { ...block.repeat, repeaterKey: selectedRepeater.key, from: value ? Number(value) : undefined } })} /><Field label="Last item" type="number" value={String(block.repeat?.to ?? selectedRepeater.maxItems)} onChange={(value) => onChange({ repeat: { ...block.repeat, repeaterKey: selectedRepeater.key, to: value ? Number(value) : undefined } })} /></div> : null}</div>{textBlock && insertFields.length ? <div className="flex flex-wrap items-center gap-1.5 border-t border-[#eee9e2] pt-2.5"><span className="mr-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#978e84]">Insert</span>{insertFields.slice(0, 12).map((field) => <button className="rounded-full bg-[#f2f7f3] px-2.5 py-1.5 text-[10px] font-semibold text-[#29634d] transition-colors hover:bg-[#dff0e5]" type="button" key={field.id} onClick={() => onChange({ text: `${text}${text && !text.endsWith(" ") ? " " : ""}{{${field.key}}}` })}>{field.label}</button>)}</div> : null}{block.type === "field" ? <label className={labelClass}>Dynamic input<select className={`${inputClass} mt-1.5`} value={block.fieldKey} onChange={(event) => onChange({ fieldKey: event.target.value })}><option value="">Choose an input</option>{blockFields.map((field) => <option value={field.key} key={field.id}>{field.label} · {field.key}</option>)}</select></label> : null}{block.type === "spacer" ? <label className={labelClass}>Space height (px)<input className={`${inputClass} mt-1.5`} type="number" min={4} max={240} value={block.height} onChange={(event) => onChange({ height: Number(event.target.value) })} /></label> : null}{block.type === "signature" ? <Field label="Signature label" value={block.label} onChange={(value) => onChange({ label: value })} placeholder="Signature — {{party_a}}" /> : null}<p className="text-[10px] leading-[1.4] text-[#958c82]">{textBlock ? <>Use <code className="rounded bg-[#f0ece6] px-1">{'{{field_key}}'}</code> to place a user value in this section. Select a repeatable group to use its item fields.</> : "Drag from the handle to change the order."}</p></div> : null}</article>;
}

function BlockList({ blocks, fields, repeaters, onChange }: { blocks: TemplateBlock[]; fields: TemplateField[]; repeaters: TemplateRepeater[]; onChange: (blocks: TemplateBlock[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(blocks[0]?.id ?? null);
  useEffect(() => { if (expandedId && !blocks.some((block) => block.id === expandedId)) setExpandedId(blocks[0]?.id ?? null); }, [blocks, expandedId]);
  function move(id: string, direction: -1 | 1) { const index = blocks.findIndex((block) => block.id === id); const target = index + direction; if (index < 0 || target < 0 || target >= blocks.length) return; const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); }
  function drop(targetId: string) { if (!dragId || dragId === targetId) return; const from = blocks.findIndex((block) => block.id === dragId); const to = blocks.findIndex((block) => block.id === targetId); if (from < 0 || to < 0) return; const next = [...blocks]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); onChange(next); setDragId(null); }
  return <div className="overflow-hidden rounded-[12px] bg-white">{blocks.length ? blocks.map((block, index) => <div key={block.id} onDrop={() => drop(block.id)}><BlockEditor block={block} fields={fields} repeaters={repeaters} index={index} count={blocks.length} expanded={expandedId === block.id} onToggle={() => setExpandedId((current) => current === block.id ? null : block.id)} onChange={(patch) => onChange(updateBlock(blocks, block.id, patch))} onMove={(direction) => move(block.id, direction)} onRemove={() => onChange(blocks.filter((item) => item.id !== block.id))} onDragStart={() => setDragId(block.id)} onDragEnd={() => setDragId(null)} /></div>) : <p className="px-3.5 py-5 text-[12px] text-[#817970]">This page has no sections yet. Add one above.</p>}</div>;
}

function ElementPicker({ fields, defaultFontSize, onAdd }: { fields: TemplateField[]; defaultFontSize: TemplateFontSize; onAdd: (type: EditableBlockType) => void }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top?: number; bottom?: number }>({ left: 12, top: 12 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("mousedown", close); document.addEventListener("keydown", escape); return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); }; }, [open]);
  const options: Array<{ type: EditableBlockType; label: string; hint: string; disabled?: boolean }> = [{ type: "title", label: "Title", hint: "Document heading" }, { type: "heading", label: "Heading", hint: "Section label" }, { type: "paragraph", label: "Text", hint: "Body content" }, { type: "field", label: "Input", hint: "User-provided value", disabled: fields.length === 0 }, { type: "signature", label: "Signature", hint: "Signing area" }, { type: "spacer", label: "Spacer", hint: "Quiet breathing room" }];
  function toggle() {
    if (!open && ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      const menuWidth = 230;
      const menuHeight = 300;
      const gap = 8;
      const left = Math.min(Math.max(12, bounds.right - menuWidth), Math.max(12, window.innerWidth - menuWidth - 12));
      const openUp = window.innerHeight - bounds.bottom < menuHeight + gap && bounds.top > menuHeight + gap;
      if (openUp) {
        setMenuPosition({ left, bottom: Math.max(12, window.innerHeight - bounds.top + gap) });
      } else {
        setMenuPosition({ left, top: Math.min(bounds.bottom + gap, Math.max(12, window.innerHeight - menuHeight - 12)) });
      }
    }
    setOpen((value) => !value);
  }
  return <div className="relative" ref={ref}><button type="button" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#071b3d] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#0055ff]" onClick={toggle} aria-expanded={open}>+ Add element <span className="text-[13px]">⌄</span></button>{open ? <div className="fixed z-50 max-h-[calc(100vh-24px)] w-[230px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[13px] bg-white p-1.5 shadow-[0_18px_45px_rgba(44,36,31,0.18)] ring-1 ring-[#e5dfd7]" style={menuPosition}><p className="px-2.5 pb-1.5 pt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9a9187]">Page element</p>{options.map((option) => <button key={option.type} type="button" disabled={option.disabled} className="flex w-full items-center justify-between gap-3 rounded-[9px] px-2.5 py-2 text-left transition-colors hover:bg-[#f7f3ed] disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { onAdd(option.type); setOpen(false); }}><span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-[#302b27]">{option.label}</span><span className="block whitespace-normal text-[10px] leading-[1.35] text-[#928980]">{option.hint}</span></span><span className="shrink-0 text-[15px] text-[#0055ff]">›</span></button>)}</div> : null}</div>;
}

function FieldsEditor({ fields, onChange }: { fields: TemplateField[]; onChange: (fields: TemplateField[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);

  function update(id: string, patch: Partial<TemplateField>) {
    onChange(fields.map((field) => field.id === id ? { ...field, ...patch } : field));
  }

  function move(id: string, direction: -1 | 1) {
    const index = fields.findIndex((field) => field.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function drop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = fields.findIndex((field) => field.id === dragId);
    const to = fields.findIndex((field) => field.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...fields];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
    setDragId(null);
  }

  return <div className="space-y-1.5">{fields.length ? fields.map((field, index) => <div className={`rounded-[12px] bg-[#faf8f4] p-3 transition-opacity ${dragId === field.id ? "opacity-50" : ""}`.trim()} key={field.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={() => drop(field.id)}>
    <div className="flex items-start gap-2.5">
      <span className="mt-1 cursor-grab select-none px-0.5 text-[17px] leading-none text-[#aaa198]" title="Drag to reorder shared input" aria-label="Drag to reorder shared input" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; setDragId(field.id); }} onDragEnd={() => setDragId(null)}>⠿</span>
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-[9px] font-bold text-[#817970]">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><p className="truncate text-[13px] font-bold text-[#2d2824]">{field.label || "Untitled input"}</p><span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#817970]">{field.type === "textarea" ? "Long text" : field.type === "select" ? "Dropdown" : field.type === "checkbox" ? "Checkbox" : field.type === "date" ? "Date" : field.type === "number" ? "Number" : "Short text"}</span></div>
        <p className="mt-0.5 truncate text-[10px] text-[#958c82]">{field.key || "Key needed"} · {field.required ? "Required" : "Optional"}</p>
      </div>
      <MoveControls index={index} count={fields.length} onMove={(direction) => move(field.id, direction)} onRemove={() => onChange(fields.filter((item) => item.id !== field.id))} removeLabel={`Remove ${field.label || "input"}`} />
    </div>
    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px]">
      <Field label="Label" value={field.label} onChange={(label) => update(field.id, { label })} />
      <Field label="Key" value={field.key} onChange={(key) => update(field.id, { key: key.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="party_name" />
      <label className={labelClass}>Input type<select className={`${inputClass} mt-1.5`} value={field.type} onChange={(event) => update(field.id, { type: event.target.value as TemplateFieldType, options: event.target.value === "select" && !field.options.length ? [{ value: "option_1", label: "Option 1" }] : field.options })}><option value="text">Short text</option><option value="textarea">Long text</option><option value="date">Date</option><option value="number">Number</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option></select></label>
    </div>
    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><Field label="Placeholder" value={field.placeholder} onChange={(placeholder) => update(field.id, { placeholder })} /><Toggle label="Required" checked={field.required} onChange={(required) => update(field.id, { required })} /></div>
    {field.type === "select" ? <OptionsEditor options={field.options} onChange={(options) => update(field.id, { options })} /> : null}
  </div>) : <p className="rounded-[11px] bg-[#faf8f4] px-3 py-2.5 text-[12px] text-[#817970]">No user inputs yet. Add one when someone needs to fill this document.</p>}</div>;
}

function TemplateInputsCard({ fields, onChange, onAdd }: { fields: TemplateField[]; onChange: (fields: TemplateField[]) => void; onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; document.addEventListener("keydown", closeOnEscape); return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); }; }, [open]);
  return <><button className="group w-full rounded-[13px] bg-[#f5faf6] px-3.5 py-3 text-left transition-colors hover:bg-[#eef7f0] focus:outline-none focus:ring-4 focus:ring-[#dcefe0]" type="button" onClick={() => setOpen(true)}><span className="flex items-center justify-between gap-3"><span><span className="block text-[13px] font-bold text-[#254d39]">{fields.length ? `${fields.length} shared input${fields.length === 1 ? "" : "s"}` : "No shared inputs"}</span><span className="mt-0.5 block text-[11px] text-[#668171]">Document-wide · drag inside to set form order</span></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[16px] text-[#347054] shadow-[0_1px_4px_rgba(44,36,31,0.08)] transition-transform group-hover:translate-x-0.5">→</span></span></button>{open ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#071b3d]/30 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Shared document inputs" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}><div className="flex max-h-[min(720px,calc(100vh-24px))] w-full max-w-[760px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_25px_80px_rgba(44,36,31,0.24)]"><header className="flex items-center justify-between gap-3 border-b border-[#eee9e2] px-4 py-3.5"><div><p className="font-brand text-[17px] font-bold tracking-[-0.02em] text-[#071b3d]">Shared inputs</p><p className="mt-0.5 text-[11px] text-[#817970]">Document-wide fields appear in this order in the user form.</p></div><button type="button" className="grid size-8 place-items-center rounded-full bg-[#f5eee8] text-[18px] text-[#71685f] hover:bg-[#eee4da]" onClick={() => setOpen(false)} aria-label="Close inputs">×</button></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5"><FieldsEditor fields={fields} onChange={onChange} /></div><footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e2] px-4 py-3"><button type="button" className="rounded-full bg-[#f2f7f3] px-3.5 py-2 text-[11px] font-bold text-[#29634d] hover:bg-[#dff0e5]" onClick={onAdd}>+ Add input</button><button type="button" className="rounded-full bg-[#071b3d] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#0055ff]" onClick={() => setOpen(false)}>Done</button></footer></div></div> : null}</>;
}

function makeRepeaterField(index: number): TemplateRepeaterField {
  return { id: createTemplateId("repeat-field"), key: `item_field_${index + 1}`, label: `Item field ${index + 1}`, type: "text", required: false, placeholder: "", options: [] };
}

function makeRepeater(index: number, countFieldKey: string): TemplateRepeater {
  return { id: createTemplateId("repeater"), key: `group_${index + 1}`, label: "Repeatable group", itemLabel: "Item", description: "Add one set of fields for each item.", countFieldKey, minItems: 1, maxItems: 8, fields: [makeRepeaterField(0)] };
}

function RepeaterFieldsEditor({ repeater, usedFieldKeys, onChange }: { repeater: TemplateRepeater; usedFieldKeys: Set<string>; onChange: (repeater: TemplateRepeater) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);

  function updateField(id: string, patch: Partial<TemplateRepeaterField>) {
    onChange({ ...repeater, fields: repeater.fields.map((field) => field.id === id ? { ...field, ...patch } : field) });
  }

  function move(id: string, direction: -1 | 1) {
    const index = repeater.fields.findIndex((field) => field.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= repeater.fields.length) return;
    const next = [...repeater.fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...repeater, fields: next });
  }

  function drop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = repeater.fields.findIndex((field) => field.id === dragId);
    const to = repeater.fields.findIndex((field) => field.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...repeater.fields];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange({ ...repeater, fields: next });
    setDragId(null);
  }

  function addField() {
    if (repeater.fields.length >= 20) return;
    onChange({ ...repeater, fields: [...repeater.fields, makeRepeaterField(repeater.fields.length)] });
  }

  return <div><div className="space-y-1.5">{repeater.fields.map((field, index) => <div className={`rounded-[11px] bg-white/70 p-3 transition-opacity ${dragId === field.id ? "opacity-50" : ""}`.trim()} key={field.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={() => drop(field.id)}>
    <div className="flex items-start gap-2.5">
      <span className="mt-1 cursor-grab select-none px-0.5 text-[17px] leading-none text-[#aaa198]" title="Drag to reorder item field" aria-label="Drag to reorder item field" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; setDragId(field.id); }} onDragEnd={() => setDragId(null)}>⠿</span>
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#f7f4ef] text-[9px] font-bold text-[#817970]">{index + 1}</span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-[13px] font-bold text-[#2d2824]">{field.label || "Untitled item field"}</p><span className="rounded-full bg-[#f7f4ef] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#817970]">{field.type === "textarea" ? "Long text" : field.type === "select" ? "Dropdown" : field.type === "checkbox" ? "Checkbox" : field.type === "date" ? "Date" : field.type === "number" ? "Number" : "Short text"}</span></div><p className="mt-0.5 truncate text-[10px] text-[#958c82]">{field.key || "Key needed"} · {field.required ? "Required" : "Optional"}</p></div>
      <MoveControls index={index} count={repeater.fields.length} onMove={(direction) => move(field.id, direction)} onRemove={() => onChange({ ...repeater, fields: repeater.fields.filter((item) => item.id !== field.id) })} removeDisabled={repeater.fields.length === 1 || usedFieldKeys.has(field.key)} removeLabel={usedFieldKeys.has(field.key) ? "This field is used on a page" : `Remove ${field.label || "item field"}`} />
    </div>
    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px]"><Field label="Field label" value={field.label} onChange={(label) => updateField(field.id, { label })} /><Field label="Item key" value={field.key} onChange={(key) => updateField(field.id, { key: key.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="member_name" /><label className={labelClass}>Input type<select className={`${inputClass} mt-1.5`} value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value as TemplateFieldType, options: event.target.value === "select" && !field.options.length ? [{ value: "option_1", label: "Option 1" }] : field.options })}><option value="text">Short text</option><option value="textarea">Long text</option><option value="date">Date</option><option value="number">Number</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option></select></label></div>
    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><Field label="Placeholder" value={field.placeholder} onChange={(placeholder) => updateField(field.id, { placeholder })} /><Field label="Saved key pattern (optional)" value={field.sourceKeyPattern ?? ""} onChange={(sourceKeyPattern) => updateField(field.id, { sourceKeyPattern: sourceKeyPattern || undefined })} placeholder="member_{index}_name" /></div>
    <div className="mt-2.5"><Toggle label="Required" checked={field.required} onChange={(required) => updateField(field.id, { required })} /></div>
    {field.type === "select" ? <OptionsEditor options={field.options} onChange={(options) => updateField(field.id, { options })} /> : null}
    <p className="mt-2 text-[10px] leading-[1.4] text-[#958c82]">Use <code className="rounded bg-[#f0ece6] px-1">{'member_{index}_name'}</code> only when this group must read existing flat values.</p>
  </div>)}</div><button className="mt-2.5 rounded-full bg-[#f2f7f3] px-3.5 py-2 text-[11px] font-bold text-[#29634d] transition-colors hover:bg-[#dff0e5] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={addField} disabled={repeater.fields.length >= 20}>+ Add item field</button></div>;
}

function RepeatersEditor({ repeaters, countFields, usedRepeaterKeys, usedFieldKeysByRepeater, onChange }: { repeaters: TemplateRepeater[]; countFields: TemplateField[]; usedRepeaterKeys: Set<string>; usedFieldKeysByRepeater: Map<string, Set<string>>; onChange: (repeaters: TemplateRepeater[]) => void }) {
  function update(id: string, patch: Partial<TemplateRepeater>) { onChange(repeaters.map((repeater) => repeater.id === id ? { ...repeater, ...patch } : repeater)); }
  function add() { if (countFields[0]) onChange([...repeaters, makeRepeater(repeaters.length, countFields[0].key)]); }
  return <div>{repeaters.length ? <div className="divide-y divide-[#eee9e2]">{repeaters.map((repeater) => <section className="py-3 first:pt-0 last:pb-0" key={repeater.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[13px] font-bold text-[#2d2824]">{repeater.label || "Untitled group"}</p><p className="mt-0.5 text-[10px] text-[#817970]">{repeater.key} · {repeater.minItems}–{repeater.maxItems} {repeater.itemLabel || "items"} · {repeater.fields.length} fields</p></div><button className="rounded-full px-2 py-1 text-[11px] font-semibold text-[#b13c53] hover:bg-[#fff0f2] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={usedRepeaterKeys.has(repeater.key)} onClick={() => onChange(repeaters.filter((item) => item.id !== repeater.id))}>{usedRepeaterKeys.has(repeater.key) ? "Used in pages" : "Remove group"}</button></div><div className="mt-3 grid gap-2.5 sm:grid-cols-2"><Field label="Group label" value={repeater.label} onChange={(label) => update(repeater.id, { label })} /><Field label="Group key" value={repeater.key} onChange={(key) => update(repeater.id, { key: key.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="members" /><Field label="Item label" value={repeater.itemLabel} onChange={(itemLabel) => update(repeater.id, { itemLabel })} placeholder="Member" /><label className={labelClass}>Count field<select className={`${inputClass} mt-1.5`} value={repeater.countFieldKey} onChange={(event) => update(repeater.id, { countFieldKey: event.target.value })}><option value="">Choose a count field</option>{countFields.map((field) => <option value={field.key} key={field.id}>{field.label} · {field.key}</option>)}</select></label><Field label="Minimum items" type="number" value={String(repeater.minItems)} onChange={(value) => update(repeater.id, { minItems: Math.max(1, Math.min(80, Number(value) || 1)) })} /><Field label="Maximum items" type="number" value={String(repeater.maxItems)} onChange={(value) => update(repeater.id, { maxItems: Math.max(1, Math.min(80, Number(value) || 1)) })} /><div className="sm:col-span-2"><Area label="Description" value={repeater.description} onChange={(description) => update(repeater.id, { description })} placeholder="Explain how items are used." /></div></div><div className="mt-3 rounded-[11px] bg-[#faf8f4] p-3"><div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold text-[#514c47]">Item fields</p><p className="mt-0.5 text-[10px] text-[#958c82]">Each active item receives these fields.</p></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#817970]">{repeater.fields.length}</span></div><RepeaterFieldsEditor repeater={repeater} usedFieldKeys={usedFieldKeysByRepeater.get(repeater.key) ?? new Set()} onChange={(next) => update(repeater.id, next)} /></div></section>)}</div> : <p className="rounded-[11px] bg-[#faf8f4] px-3.5 py-3 text-[12px] text-[#817970]">No repeatable groups. Add one when a document has a variable number of people, members or selections.</p>}{countFields.length ? <button className="mt-3 rounded-full bg-[#f2f7f3] px-3.5 py-2 text-[11px] font-bold text-[#29634d] hover:bg-[#dff0e5]" type="button" onClick={add}>+ Add repeatable group</button> : <p className="mt-3 text-[11px] font-semibold text-[#b13c53]">Add a number or dropdown input first so the group can know how many items to show.</p>}</div>;
}

function RepeatersCard({ repeaters, countFields, usedRepeaterKeys, usedFieldKeysByRepeater, onChange }: { repeaters: TemplateRepeater[]; countFields: TemplateField[]; usedRepeaterKeys: Set<string>; usedFieldKeysByRepeater: Map<string, Set<string>>; onChange: (repeaters: TemplateRepeater[]) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; document.addEventListener("keydown", closeOnEscape); return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); }; }, [open]);
  const summary = repeaters.map((repeater) => `${repeater.label} · ${repeater.minItems}–${repeater.maxItems} ${repeater.itemLabel}`).join(" · ");
  return <><button className="group w-full rounded-[13px] bg-[#f5faf6] px-3.5 py-3 text-left transition-colors hover:bg-[#eef7f0] focus:outline-none focus:ring-4 focus:ring-[#dcefe0]" type="button" onClick={() => setOpen(true)}><span className="flex items-center justify-between gap-3"><span className="min-w-0"><span className="block truncate text-[13px] font-bold text-[#254d39]">{summary || "No repeatable groups"}</span><span className="mt-0.5 block truncate text-[11px] text-[#668171]">Count fields control active items · click to manage</span></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[16px] text-[#347054] shadow-[0_1px_4px_rgba(44,36,31,0.08)] transition-transform group-hover:translate-x-0.5">→</span></span></button>{open ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#071b3d]/30 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Repeatable groups" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}><div className="flex max-h-[min(780px,calc(100vh-24px))] w-full max-w-[860px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_25px_80px_rgba(44,36,31,0.24)]"><header className="flex items-center justify-between gap-3 border-b border-[#eee9e2] px-4 py-3.5"><div><p className="font-brand text-[17px] font-bold tracking-[-0.02em] text-[#071b3d]">Repeatable groups</p><p className="mt-0.5 text-[11px] text-[#817970]">Define reusable item fields once, then repeat blocks for every active item.</p></div><button type="button" className="grid size-8 place-items-center rounded-full bg-[#f5eee8] text-[18px] text-[#71685f] hover:bg-[#eee4da]" onClick={() => setOpen(false)} aria-label="Close repeatable groups">×</button></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5"><RepeatersEditor repeaters={repeaters} countFields={countFields} usedRepeaterKeys={usedRepeaterKeys} usedFieldKeysByRepeater={usedFieldKeysByRepeater} onChange={onChange} /></div><footer className="flex justify-end border-t border-[#eee9e2] px-4 py-3"><button type="button" className="rounded-full bg-[#071b3d] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#0055ff]" onClick={() => setOpen(false)}>Done</button></footer></div></div> : null}</>;
}

function RepeatableGroupsCard({ template, onChange }: { template: DocumentTemplateDraft; onChange: (template: DocumentTemplateDraft) => void }) {
  const usedRepeaterKeys = new Set(template.pages.flatMap((page) => page.blocks.flatMap((block) => block.repeat?.repeaterKey ? [block.repeat.repeaterKey] : [])));
  const usedFieldKeysByRepeater = new Map<string, Set<string>>();
  for (const page of template.pages) for (const block of page.blocks) {
    const repeaterKey = block.repeat?.repeaterKey;
    if (!repeaterKey) continue;
    const fieldKeys = usedFieldKeysByRepeater.get(repeaterKey) ?? new Set<string>();
    const text = block.type === "title" || block.type === "heading" || block.type === "paragraph" ? block.text : block.type === "signature" ? block.label : block.type === "field" ? block.fieldKey : "";
    for (const match of text.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/gi)) fieldKeys.add(match[1]);
    if (block.visibleWhen) fieldKeys.add(block.visibleWhen.fieldKey);
    usedFieldKeysByRepeater.set(repeaterKey, fieldKeys);
  }

  function remapRepeaterBlock(block: TemplateBlock, previous: TemplateRepeater, next: TemplateRepeater) {
    const fieldKeyMap = new Map(previous.fields.map((field) => [field.key, next.fields.find((candidate) => candidate.id === field.id)?.key ?? field.key]));
    const remapText = (text: string) => Array.from(fieldKeyMap.entries()).reduce((current, [from, to]) => from === to ? current : current.replace(new RegExp(`\\{\\{\\s*${from}\\s*\\}\\}`, "g"), `{{${to}}}`), text);
    let nextBlock = (block.repeat?.repeaterKey === next.key ? block : { ...block, repeat: { ...block.repeat!, repeaterKey: next.key } }) as TemplateBlock;
    if (nextBlock.type === "title" || nextBlock.type === "heading" || nextBlock.type === "paragraph") nextBlock = { ...nextBlock, text: remapText(nextBlock.text) } as TemplateBlock;
    if (nextBlock.type === "signature") nextBlock = { ...nextBlock, label: remapText(nextBlock.label) } as TemplateBlock;
    if (nextBlock.type === "field") nextBlock = { ...nextBlock, fieldKey: fieldKeyMap.get(nextBlock.fieldKey) ?? nextBlock.fieldKey } as TemplateBlock;
    if (nextBlock.visibleWhen && fieldKeyMap.has(nextBlock.visibleWhen.fieldKey)) nextBlock = { ...nextBlock, visibleWhen: { ...nextBlock.visibleWhen, fieldKey: fieldKeyMap.get(nextBlock.visibleWhen.fieldKey)! } } as TemplateBlock;
    return nextBlock;
  }

  function changeRepeaters(repeaters: TemplateRepeater[]) {
    const nextById = new Map(repeaters.map((repeater) => [repeater.id, repeater]));
    const previousByKey = new Map(template.settings.repeaters.map((repeater) => [repeater.key, repeater]));
    const pages = template.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (!block.repeat) return block;
        const previous = previousByKey.get(block.repeat.repeaterKey);
        const next = previous ? nextById.get(previous.id) : repeaters.find((repeater) => repeater.key === block.repeat?.repeaterKey);
        if (!next) return { ...block, repeat: undefined } as TemplateBlock;
        return previous ? remapRepeaterBlock(block, previous, next) : block;
      }),
    }));
    onChange({ ...template, settings: { ...template.settings, repeaters }, pages });
  }
  return <RepeatersCard repeaters={template.settings.repeaters} countFields={template.fields.filter((field) => field.type === "select" || field.type === "number")} usedRepeaterKeys={usedRepeaterKeys} usedFieldKeysByRepeater={usedFieldKeysByRepeater} onChange={changeRepeaters} />;
}

function PageNavigator({ pages, activeId, onSelect, onChange, onAdd, onRemove }: { pages: TemplatePage[]; activeId: string; onSelect: (id: string) => void; onChange: (pages: TemplatePage[]) => void; onAdd: () => void; onRemove: (id: string) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  function move(id: string, direction: -1 | 1) { const index = pages.findIndex((page) => page.id === id); const target = index + direction; if (index < 0 || target < 0 || target >= pages.length) return; const next = [...pages]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); }
  function drop(targetId: string) { if (!dragId || dragId === targetId) return; const from = pages.findIndex((page) => page.id === dragId); const to = pages.findIndex((page) => page.id === targetId); if (from < 0 || to < 0) return; const next = [...pages]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); onChange(next); setDragId(null); }
  return <section className="overflow-hidden rounded-[15px] bg-white shadow-[0_1px_0_rgba(44,36,31,0.04)]"><div className="flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4"><div><p className="font-brand text-[16px] font-bold tracking-[-0.02em] text-[#071b3d]">Pages</p><p className="mt-0.5 text-[11px] text-[#817970]">Select a page to edit its elements.</p></div><button type="button" className="rounded-full bg-[#f4eee8] px-3 py-2 text-[11px] font-bold text-[#514c47] transition-colors hover:bg-[#e9e1d8]" onClick={onAdd}>+ Page</button></div><div className="flex gap-1.5 overflow-x-auto border-t border-[#eee9e2] p-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-2">{pages.map((page, index) => <div key={page.id} className="min-w-[172px] sm:min-w-0" onDragOver={(event) => event.preventDefault()} onDrop={() => drop(page.id)}><button type="button" draggable onDragStart={() => setDragId(page.id)} onDragEnd={() => setDragId(null)} onClick={() => onSelect(page.id)} className={`group flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2.5 text-left transition-colors ${activeId === page.id ? "bg-[#071b3d] text-white" : "bg-[#faf8f4] text-[#423d38] hover:bg-[#f3eee8]"} ${dragId === page.id ? "opacity-60" : ""}`.trim()}><span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${activeId === page.id ? "bg-white/15 text-white" : "bg-white text-[#8b8177]"}`.trim()}>{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold">{page.title}</span><span className={`mt-0.5 block text-[9px] ${activeId === page.id ? "text-white/60" : "text-[#968d84]"}`.trim()}>{page.blocks.length} element{page.blocks.length === 1 ? "" : "s"}</span></span><span className={`text-[13px] ${activeId === page.id ? "text-white/50" : "text-[#aaa198]"}`.trim()} title="Drag to reorder">⠿</span></button><div className="mt-1 flex justify-end gap-1 pr-1"><button type="button" className="rounded px-1.5 text-[11px] text-[#8f867d] hover:bg-[#f4eee8] hover:text-[#071b3d] disabled:opacity-30" aria-label="Move page left" disabled={index === 0} onClick={() => move(page.id, -1)}>←</button><button type="button" className="rounded px-1.5 text-[11px] text-[#8f867d] hover:bg-[#f4eee8] hover:text-[#071b3d] disabled:opacity-30" aria-label="Move page right" disabled={index === pages.length - 1} onClick={() => move(page.id, 1)}>→</button><button type="button" className="rounded px-1.5 text-[11px] text-[#b13c53] hover:bg-[#fff0f2] disabled:opacity-30" aria-label={`Remove ${page.title}`} disabled={pages.length === 1} onClick={() => onRemove(page.id)}>Remove</button></div></div>)}</div></section>;
}

function PageSettingsEditor({ template, page, onChange }: { template: DocumentTemplateDraft; page: TemplatePage; onChange: (page: TemplatePage) => void }) {
  const [custom, setCustom] = useState(Object.keys(page.settings).length > 0); useEffect(() => { setCustom(Object.keys(page.settings).length > 0); }, [page.id, page.settings]);
  function updateSettings(patch: Partial<TemplatePageSettings>) { onChange({ ...page, settings: { ...page.settings, ...patch } }); }
  function reset() { onChange({ ...page, settings: {} }); setCustom(false); }
  return <div className="border-b border-[#eee9e2] px-3.5 py-3.5 sm:px-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">Selected page</p><p className="mt-1 text-[13px] font-bold text-[#2b2723]">{page.title}</p><p className="mt-0.5 text-[11px] text-[#817970]">Global {templatePaperSizeLabels[template.settings.paperSize]} settings apply unless you add an override.</p></div><div className="flex items-center gap-2"><Toggle label="Custom page settings" checked={custom} onChange={(value) => { setCustom(value); if (!value) reset(); }} />{custom ? <button type="button" className="rounded-full px-2 py-1 text-[10px] font-semibold text-[#8d8379] hover:bg-[#f4eee8]" onClick={reset}>Reset</button> : null}</div></div><div className="mt-3 max-w-[320px]"><Field label="Page name" value={page.title} onChange={(title) => onChange({ ...page, title })} /></div>{custom ? <div className="mt-3 grid gap-2.5 rounded-[10px] bg-[#faf8f4] p-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Top margin (mm)" type="number" value={String(page.settings.marginTop ?? template.settings.marginTop)} onChange={(value) => updateSettings({ marginTop: Number(value) })} /><Field label="Bottom margin (mm)" type="number" value={String(page.settings.marginBottom ?? template.settings.marginBottom)} onChange={(value) => updateSettings({ marginBottom: Number(value) })} /><label className={labelClass}>Body text size override<select className={`${inputClass} mt-1.5`} value={page.settings.defaultFontSize ?? template.settings.defaultFontSize} onChange={(event) => updateSettings({ defaultFontSize: event.target.value as TemplateFontSize })}>{fontSizeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><Field label="Stamp gap (mm)" type="number" value={String(page.settings.stampGap ?? template.settings.stampGap)} onChange={(value) => updateSettings({ stampGap: Number(value) })} /><label className={labelClass}>Font family<select className={`${inputClass} mt-1.5`} value={page.settings.fontFamily ?? template.settings.fontFamily} onChange={(event) => updateSettings({ fontFamily: event.target.value as "serif" | "sans" })}><option value="serif">Classic serif</option><option value="sans">Clean sans</option></select></label><Toggle label="Show page number" checked={page.settings.showPageNumbers ?? template.settings.showPageNumbers} onChange={(showPageNumbers) => updateSettings({ showPageNumbers })} /></div> : <p className="mt-3 border-l-2 border-[#e7ddd2] pl-2.5 text-[11px] leading-[1.45] text-[#958c82]">Using global margins, typography and page-number settings.</p>}</div>;
}

function PreviewPanel({ template, values }: { template: DocumentTemplateDraft; values: Record<string, string> }) {
  return <aside className="min-w-0 xl:sticky xl:top-[92px] xl:h-[calc(100vh-116px)]"><section className="flex h-[min(760px,calc(100vh-128px))] min-h-[420px] flex-col overflow-hidden rounded-[18px] bg-[#f7f3ed] shadow-[0_1px_0_rgba(44,36,31,0.04)]" aria-label="Live document preview"><header className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3 sm:px-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0055ff]">Live preview</p><p className="mt-0.5 text-[13px] font-bold text-[#2d2824]">{templatePaperSizeLabels[template.settings.paperSize]} document · {template.pages.length} page{template.pages.length === 1 ? "" : "s"}</p></div><span className="rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-bold text-[#817970]">Fit to width</span></header><div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#eee9e2] p-2.5 sm:p-4" tabIndex={0} role="region" aria-label="Scrollable live document pages"><div className="mx-auto w-full max-w-[820px]"><DocumentTemplatePaper template={template} values={values} showLabels={false} /></div></div><footer className="px-3.5 py-2.5 text-[10px] leading-[1.4] text-[#817970] sm:px-4"><code className="rounded bg-white/80 px-1">{'{{field_key}}'}</code> shows dynamic content · Scroll to review every page</footer></section></aside>;
}

type BusyAction = "save" | "publish" | "unpublish" | null;

function Editor({ template, onChange, onSave, onPublish, onUnpublish, busy, busyAction, isNew, isPublished, isDirty, savedSlug, slugStatus, slugBusy, onCheckSlug, serviceOptions, canMutate }: { template: DocumentTemplateDraft; onChange: (template: DocumentTemplateDraft) => void; onSave: () => void; onPublish: () => void; onUnpublish: () => void; busy: boolean; busyAction: BusyAction; isNew: boolean; isPublished: boolean; isDirty: boolean; savedSlug: string; slugStatus: "unchecked" | "checking" | "available" | "taken" | "invalid"; slugBusy: boolean; onCheckSlug: () => void; serviceOptions: ServiceOption[]; canMutate: boolean }) {
  const [activePageId, setActivePageId] = useState(template.pages[0]?.id ?? "");
  const activePage = template.pages.find((page) => page.id === activePageId) ?? template.pages[0];
  const editableFields = useMemo(() => template.fields.filter((field) => !isTemplateFieldManagedByRepeater(field, template.settings.repeaters)), [template.fields, template.settings.repeaters]);
  const previewValues = useMemo(() => {
    const values: Record<string, string> = Object.fromEntries(template.fields.map((field) => [field.key, field.defaultValue ?? (field.key === "partner_count" ? field.options[0]?.value ?? "" : `{{${field.key}}}`)]));
    for (const repeater of template.settings.repeaters) {
      const count = Math.min(repeater.maxItems, Math.max(repeater.minItems, Number(values[repeater.countFieldKey]) || repeater.minItems));
      values[repeater.countFieldKey] = String(count);
      for (let index = 1; index <= count; index += 1) {
        for (const field of repeater.fields) {
          const valueKey = templateRepeaterFieldValueKey(repeater, index, field);
          values[valueKey] = field.defaultValue ?? `[${repeater.itemLabel} ${index} · ${field.label}]`;
        }
      }
    }
    return values;
  }, [template.fields, template.settings.repeaters]);
  const statusLabel = isNew ? "Local draft" : isPublished ? (isDirty ? "Live · edits pending" : "Published") : isDirty ? "Unsaved changes" : "Draft saved";
  const statusDescription = isNew ? "Create this draft to unlock its preview URL." : isPublished ? (isDirty ? "Your edits are private until you publish them." : "This version is live on the public page.") : isDirty ? "Changes are local until you save the draft." : "Saved privately. Publish when ready.";
  const statusClass = isNew ? "bg-[#f4eee8] text-[#85796d]" : isPublished && !isDirty ? "bg-[#e5f3e8] text-[#2d7650]" : isPublished ? "bg-[#fff3dc] text-[#94651f]" : isDirty ? "bg-[#fff0f2] text-[#b13c53]" : "bg-[#eef0f3] text-[#626a73]";
  const serviceOptionsWithCurrent = template.settings.serviceCta.href && !serviceOptions.some((option) => option.href === template.settings.serviceCta.href)
    ? [...serviceOptions, { href: template.settings.serviceCta.href, label: "Current service link", category: "Saved value" }]
    : serviceOptions;
  const publishDisabled = busy || !canMutate || isNew || (isPublished && !isDirty);
  useEffect(() => { if (!template.pages.some((page) => page.id === activePageId)) setActivePageId(template.pages[0]?.id ?? ""); }, [activePageId, template.pages]);
  function patch(patchValue: Partial<DocumentTemplateDraft>) { onChange({ ...template, ...patchValue }); }
  function patchPage(nextPage: TemplatePage) { patch({ pages: template.pages.map((page) => page.id === nextPage.id ? nextPage : page) }); }
  function patchEditableFields(nextFields: TemplateField[]) {
    const editableIds = new Set(editableFields.map((field) => field.id));
    const nextById = new Map(nextFields.map((field) => [field.id, field]));
    const merged = template.fields.flatMap((field) => editableIds.has(field.id) ? (nextById.has(field.id) ? [nextById.get(field.id)!] : []) : [field]);
    for (const field of nextFields) if (!template.fields.some((current) => current.id === field.id)) merged.push(field);
    patch({ fields: merged });
  }
  function addPage() { const page = makePage(template.pages.length, activePage?.settings.defaultFontSize ?? template.settings.defaultFontSize); patch({ pages: [...template.pages, page] }); setActivePageId(page.id); }
  function removePage(id: string) { if (template.pages.length === 1) return; const index = template.pages.findIndex((page) => page.id === id); const pages = template.pages.filter((page) => page.id !== id); patch({ pages }); if (id === activePage?.id) setActivePageId(pages[Math.max(0, index - 1)]?.id ?? pages[0].id); }
  function addBlock(type: EditableBlockType) { if (!activePage) return; patchPage({ ...activePage, blocks: [...activePage.blocks, makeBlock(type, template.fields, activePage.blocks.length, activePage.settings.defaultFontSize ?? template.settings.defaultFontSize)] }); }

  return <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]"><div className="min-w-0 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[#f7f3ed] px-3.5 py-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8178]">Template URL</p><p className="mt-1 truncate text-[12px] text-[#817970]">{savedSlug ? `/business-tools/templates/${savedSlug}` : "Save this draft to create its public page."}</p></div>{savedSlug ? <div className="flex flex-wrap gap-1.5"><a className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#514c47] transition-colors hover:text-[#0055ff]" href={`/business-tools/templates/${encodeURIComponent(savedSlug)}?preview=1`} target="_blank" rel="noreferrer">Preview ↗</a>{isPublished ? <a className="rounded-full bg-[#071b3d] px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-[#0055ff]" href={`/business-tools/templates/${encodeURIComponent(savedSlug)}`} target="_blank" rel="noreferrer">Open live ↗</a> : null}</div> : <span className="rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#85796d]">Local only</span>}</div><DisclosureSection title="Template details" description="Name and identify this document." defaultOpen meta="Required"><div className="grid gap-3 sm:grid-cols-2"><Field label={isNew ? "Draft name" : "Template name"} value={template.title} onChange={(title) => patch({ title })} placeholder="Untitled template" /><div><span className={labelClass}>Public slug</span><div className="mt-1.5 flex gap-2"><input className={inputClass} value={template.slug} placeholder="office-rental-deed" onChange={(event) => patch({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /><button className="h-10 shrink-0 rounded-[9px] bg-[#f4eee8] px-3 text-[11px] font-bold text-[#514c47] transition-colors hover:bg-[#e9e1d8] disabled:opacity-50" type="button" onClick={onCheckSlug} disabled={slugBusy}>{slugBusy ? "…" : "Check"}</button></div>{slugStatus === "available" ? <p className="mt-1.5 text-[11px] font-semibold text-[#2c7450]">Slug is available.</p> : slugStatus === "taken" ? <p className="mt-1.5 text-[11px] font-semibold text-[#c53e59]">Slug is already in use.</p> : slugStatus === "invalid" ? <p className="mt-1.5 text-[11px] font-semibold text-[#c53e59]">Use lowercase letters, numbers and hyphens.</p> : <p className="mt-1.5 text-[11px] text-[#958c82]">This becomes the public URL.</p>}</div><div className="sm:col-span-2"><Area label="Description" value={template.description} onChange={(description) => patch({ description })} placeholder="Explain what users can create with this template." /></div></div></DisclosureSection><DisclosureSection title="Global document settings" description="Paper, margins and typography for every page." meta={`${template.settings.paperSize} · ${template.settings.fontFamily === "serif" ? "Serif" : "Sans"} · ${template.settings.defaultFontSize === "body" ? "Body" : template.settings.defaultFontSize} · ${template.settings.fontScale ?? templateFontScaleDefault}%`}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className={labelClass}>Paper size<select className={`${inputClass} mt-1.5`} value={template.settings.paperSize} onChange={(event) => patch({ settings: { ...template.settings, paperSize: event.target.value as "A4" | "LEGAL" | "DEED" } })}><option value="A4">A4</option><option value="LEGAL">Legal</option><option value="DEED">Deed sheet · 8.5 × 13.5 in</option></select></label><Field label="Top margin (mm)" type="number" value={String(template.settings.marginTop)} onChange={(value) => patch({ settings: { ...template.settings, marginTop: Number(value) } })} /><Field label="Right margin (mm)" type="number" value={String(template.settings.marginRight)} onChange={(value) => patch({ settings: { ...template.settings, marginRight: Number(value) } })} /><Field label="Bottom margin (mm)" type="number" value={String(template.settings.marginBottom)} onChange={(value) => patch({ settings: { ...template.settings, marginBottom: Number(value) } })} /><Field label="Left margin (mm)" type="number" value={String(template.settings.marginLeft)} onChange={(value) => patch({ settings: { ...template.settings, marginLeft: Number(value) } })} /><Field label="Stamp gap (mm)" type="number" value={String(template.settings.stampGap)} onChange={(value) => patch({ settings: { ...template.settings, stampGap: Number(value) } })} /><label className={labelClass}>Font family<select className={`${inputClass} mt-1.5`} value={template.settings.fontFamily} onChange={(event) => patch({ settings: { ...template.settings, fontFamily: event.target.value as "serif" | "sans" } })}><option value="serif">Classic serif</option><option value="sans">Clean sans</option></select></label><label className={labelClass}>Body text size<select className={`${inputClass} mt-1.5`} value={template.settings.defaultFontSize} onChange={(event) => patch({ settings: { ...template.settings, defaultFontSize: event.target.value as TemplateFontSize }})}>{fontSizeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="sm:col-span-2"><span className={labelClass}>Global font scale</span><div className="mt-1.5 flex items-center gap-3"><input aria-label="Global font scale" className="h-2 min-w-0 flex-1 cursor-pointer accent-[#0055ff]" type="range" min={templateFontScaleMin} max={templateFontScaleMax} step={1} value={template.settings.fontScale ?? templateFontScaleDefault} onChange={(event) => patch({ settings: { ...template.settings, fontScale: Number(event.target.value) } })} /><output className="min-w-[44px] rounded-full bg-[#f4eee8] px-2 py-1 text-center text-[11px] font-bold text-[#514c47]">{template.settings.fontScale ?? templateFontScaleDefault}%</output></div><span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-[#958c82]">Scales titles, headings, body text and signatures together.</span></div></div><p className="mt-2 max-w-[640px] text-[11px] leading-[1.45] text-[#817970]">Body text, dynamic inputs and signatures follow this size. Individual elements can override it.</p><div className="mt-3"><Toggle label="Show page numbers by default" checked={template.settings.showPageNumbers} onChange={(showPageNumbers) => patch({ settings: { ...template.settings, showPageNumbers } })} /></div></DisclosureSection><DisclosureSection title="Service CTA" description="Send users to the service page this document supports." meta={template.settings.serviceCta.enabled ? "Enabled" : "Optional"}><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Service page<select className={`${inputClass} mt-1.5`} value={template.settings.serviceCta.href} onChange={(event) => { const href = event.target.value; patch({ settings: { ...template.settings, serviceCta: { ...template.settings.serviceCta, href, enabled: Boolean(href) } } }); }}><option value="">No service page</option>{serviceOptionsWithCurrent.map((option) => <option value={option.href} key={option.href}>{option.category} · {option.label}</option>)}</select></label><Field label="Button label" value={template.settings.serviceCta.linkLabel} onChange={(linkLabel) => patch({ settings: { ...template.settings, serviceCta: { ...template.settings.serviceCta, linkLabel } } })} placeholder="View service page" /><Field label="CTA title" value={template.settings.serviceCta.title} onChange={(title) => patch({ settings: { ...template.settings, serviceCta: { ...template.settings.serviceCta, title } } })} placeholder="Need help with this service?" /><Area label="Supporting text" value={template.settings.serviceCta.description} onChange={(description) => patch({ settings: { ...template.settings, serviceCta: { ...template.settings.serviceCta, description } } })} placeholder="Explain how the service can help." /></div><div className="mt-3 flex flex-wrap items-center gap-3"><Toggle label="Show service link on user page" checked={template.settings.serviceCta.enabled} onChange={(enabled) => patch({ settings: { ...template.settings, serviceCta: { ...template.settings.serviceCta, enabled } } })} /><span className="text-[11px] text-[#817970]">The link appears above the document form.</span></div></DisclosureSection><RepeatableGroupsCard template={template} onChange={onChange} /><section><div className="mb-2 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2d7650]">Document-wide</p><h2 className="mt-0.5 font-brand text-[17px] font-bold tracking-[-0.02em] text-[#071b3d]">Shared inputs</h2></div><span className="text-[10px] text-[#817970]">Not page-specific</span></div><TemplateInputsCard fields={editableFields} onChange={patchEditableFields} onAdd={() => patchEditableFields([...editableFields, makeField("text", template.fields.length)])} /></section><PageNavigator pages={template.pages} activeId={activePage?.id ?? ""} onSelect={setActivePageId} onChange={(pages) => patch({ pages })} onAdd={addPage} onRemove={removePage} />{activePage ? <section className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_0_rgba(44,36,31,0.04)]"><PageSettingsEditor template={template} page={activePage} onChange={patchPage} /><div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3 sm:px-4"><div><p className="font-brand text-[16px] font-bold tracking-[-0.02em] text-[#071b3d]">Page elements</p><p className="mt-0.5 text-[11px] text-[#817970]">Keep related content together. Select an element to edit it.</p></div><ElementPicker fields={editableFields} defaultFontSize={activePage.settings.defaultFontSize ?? template.settings.defaultFontSize} onAdd={addBlock} /></div><BlockList blocks={activePage.blocks} fields={template.fields} repeaters={template.settings.repeaters} onChange={(blocks) => patchPage({ ...activePage, blocks })} /></section> : null}<div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-[15px] bg-white/95 p-3 shadow-[0_12px_30px_rgba(44,36,31,0.1)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`.trim()}>{statusLabel}</span>{isDirty && !isNew ? <span className="text-[11px] font-semibold text-[#817970]">Not yet published</span> : null}</div><p className="mt-1 text-[11px] leading-[1.4] text-[#817970]">{statusDescription}</p></div><div className="flex flex-wrap items-center gap-2 sm:justify-end"><button className="min-h-10 rounded-full bg-[#f4eee8] px-4 text-[12px] font-bold text-[#514c47] transition-colors hover:bg-[#e9e1d8] disabled:cursor-not-allowed disabled:opacity-45" type="button" onClick={onSave} disabled={busy || !canMutate || (!isNew && !isDirty)}>{busyAction === "save" ? "Saving…" : isNew ? "Create draft" : "Save draft"}</button>{!isNew && isPublished ? <button className="min-h-10 rounded-full px-3 text-[12px] font-bold text-[#b13c53] transition-colors hover:bg-[#fff0f2] disabled:cursor-not-allowed disabled:opacity-45" type="button" onClick={onUnpublish} disabled={busy || !canMutate}>{busyAction === "unpublish" ? "Unpublishing…" : "Unpublish"}</button> : null}{!isNew ? <button className="min-h-10 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:cursor-not-allowed disabled:opacity-45" type="button" onClick={onPublish} disabled={publishDisabled}>{busyAction === "publish" ? "Publishing…" : isPublished ? (isDirty ? "Publish changes" : "Published") : "Publish draft"}</button> : null}</div></div></div><PreviewPanel template={template} values={previewValues} /></div>;
}

type SlugStatus = "unchecked" | "checking" | "available" | "taken" | "invalid";

function templateSummaryFromAdmin(template: AdminDocumentTemplate): DocumentTemplateSummary {
  return {
    id: template.id,
    slug: template.slug,
    title: template.title,
    description: template.description,
    paperSize: template.settings.paperSize,
    status: template.status,
    revision: template.revision,
    publishedRevision: template.publishedRevision,
    publishedAt: template.publishedAt,
    sortOrder: template.sortOrder,
    updatedAt: template.updatedAt,
  };
}

type TemplateBuilderViewProps = {
  templates: DocumentTemplateSummary[];
  selectedId: string | null;
  loadingTemplateId: string | null;
  draggingTemplateId: string | null;
  reorderingTemplates: boolean;
  busy: boolean;
  error: string;
  notice: string;
  editor: ReactNode;
  onStartNew: () => void;
  onReloadSelected: () => void;
  onSelectTemplate: (template: DocumentTemplateSummary) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (sourceId: string, targetId: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
};

function TemplateBuilderView({ templates, selectedId, loadingTemplateId, draggingTemplateId, reorderingTemplates, busy, error, notice, editor, onStartNew, onReloadSelected, onSelectTemplate, onDragStart, onDragEnd, onDrop, onMove }: TemplateBuilderViewProps) {
  function handleDrop(event: React.DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingTemplateId;
    if (sourceId) onDrop(sourceId, targetId);
  }

  return <div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0055ff]">Business tools / templates</p><h2 className="mt-1 font-brand text-[28px] font-bold tracking-[-0.04em] text-[#071b3d]">Build documents once.</h2><p className="mt-1 max-w-[620px] text-[12px] leading-[1.5] text-[#817970]">Arrange pages and elements in one focused workspace, then publish a polished form for users to complete.</p></div><button className="min-h-10 rounded-full bg-[#071b3d] px-5 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={onStartNew} disabled={busy || reorderingTemplates || loadingTemplateId !== null}>+ New template</button></div>{error ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] bg-[#fff4f5] px-3.5 py-3" role="alert"><p className="text-[12px] font-semibold text-[#c53e59]">{error}</p>{selectedId ? <button className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#a83b51] transition-colors hover:bg-[#ffe8ec] disabled:opacity-50" type="button" onClick={onReloadSelected} disabled={busy || reorderingTemplates || loadingTemplateId !== null}>Reload server copy</button> : null}</div> : null}{notice ? <p className="rounded-[11px] bg-[#eff8f1] px-3.5 py-3 text-[12px] font-semibold text-[#2d7650]" role="status">{notice}</p> : null}<div className="grid min-w-0 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="min-w-0 rounded-[16px] bg-white/60 p-2.5"><div className="mb-2 flex items-center justify-between px-2"><div><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8178]">Templates</span><span className="mt-0.5 block text-[10px] text-[#a09991]">Drag to set the order</span></div><span className="text-[10px] text-[#a09991]">{templates.length}</span></div>{templates.length ? <div className="flex gap-1.5 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible">{templates.map((template, index) => <div className={`min-w-[200px] rounded-[11px] transition-opacity sm:min-w-0 ${draggingTemplateId === template.id ? "opacity-55" : ""}`.trim()} key={template.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => handleDrop(event, template.id)}><button className={`flex w-full items-center gap-2 rounded-[11px] px-3 py-2.5 text-left transition-colors lg:block lg:w-full ${selectedId === template.id ? "bg-[#071b3d] text-white" : "bg-[#f7f3ed] text-[#423d38] hover:bg-[#eee7df]"}`.trim()} type="button" draggable={!busy && !reorderingTemplates} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", template.id); onDragStart(template.id); }} onDragEnd={onDragEnd} onClick={() => onSelectTemplate(template)} disabled={busy || reorderingTemplates || loadingTemplateId !== null}><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{template.title}</span><span className={`mt-1 block truncate text-[10px] ${selectedId === template.id ? "text-white/60" : "text-[#8e867e]"}`.trim()}>{loadingTemplateId === template.id ? "Loading…" : `${template.status === "PUBLISHED" ? "Published" : "Draft"} · ${template.paperSize}`}</span></span><span className={`shrink-0 text-[14px] ${selectedId === template.id ? "text-white/50" : "text-[#aaa198]"}`.trim()} title="Drag to reorder" aria-hidden="true">⠿</span></button><div className="flex items-center justify-between gap-2 px-2 pt-1 lg:px-1"><span className="truncate text-[9px] text-[#a09991]">{reorderingTemplates ? "Saving order…" : `Position ${index + 1}`}</span><span className="flex shrink-0 items-center gap-0.5"><button className="grid size-6 place-items-center rounded text-[11px] text-[#8f867d] transition-colors hover:bg-[#f4eee8] hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-25" type="button" aria-label={`Move ${template.title} up`} disabled={index === 0 || busy || reorderingTemplates} onClick={() => onMove(template.id, -1)}>↑</button><button className="grid size-6 place-items-center rounded text-[11px] text-[#8f867d] transition-colors hover:bg-[#f4eee8] hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-25" type="button" aria-label={`Move ${template.title} down`} disabled={index === templates.length - 1 || busy || reorderingTemplates} onClick={() => onMove(template.id, 1)}>↓</button></span></div></div>)}</div> : <p className="px-2 py-3 text-[11px] leading-[1.45] text-[#817970]">No saved templates yet. Start a local draft.</p>}</aside><div className="min-w-0">{editor}</div></div></div>;
}

export function TemplateBuilderModule() {
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(fallbackServiceOptions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState("");
  const [draft, setDraft] = useState<DocumentTemplateDraft | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [slugBusy, setSlugBusy] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("unchecked");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [draggingTemplateId, setDraggingTemplateId] = useState<string | null>(null);
  const [reorderingTemplates, setReorderingTemplates] = useState(false);
  const loadRequestRef = useRef(0);

  function handleError(value: unknown) { if (value instanceof ApiError && value.status === 401) { window.location.assign("/admin/login"); return; } const message = value instanceof Error ? value.message : "Unable to load templates."; setError(value instanceof ApiError && [409, 502, 503].includes(value.status) ? `${message} Your current edits remain in this screen; nothing was overwritten.` : message); }
  function applyTemplate(template: AdminDocumentTemplate) { setSelectedId(template.id); setSavedSlug(template.slug); setDraft({ title: template.title, slug: template.slug, description: template.description, settings: template.settings, fields: template.fields, pages: template.pages }); setRevision(template.revision); setIsPublished(template.status === "PUBLISHED"); setIsNew(false); setIsDirty(false); setTemplatesLoaded(true); setSlugStatus("unchecked"); setNotice(""); setError(""); }
  async function selectTemplate(template: DocumentTemplateSummary) { if (template.id === selectedId && draft && !isNew) return; if (isDirty && selectedId !== template.id && !window.confirm("You have unsaved changes. Switch templates and discard them?")) return; const requestId = ++loadRequestRef.current; setLoadingTemplateId(template.id); setNotice(""); setError(""); try { const fullTemplate = await getAdminTemplate(template.id); if (requestId !== loadRequestRef.current) return; applyTemplate(fullTemplate); } catch (value) { if (requestId === loadRequestRef.current) handleError(value); } finally { if (requestId === loadRequestRef.current) setLoadingTemplateId(null); } }
  useEffect(() => { let active = true; void (async () => { try { const items = await getAdminTemplates(); if (!active) return; if (!Array.isArray(items)) throw new ApiError(502, "The template list could not be loaded. Nothing was changed."); setTemplates(items); setTemplatesLoaded(true); if (items[0]) await selectTemplate(items[0]); } catch (value) { if (active) handleError(value); } finally { if (active) setLoading(false); } })(); return () => { active = false; loadRequestRef.current += 1; }; }, []);
  useEffect(() => { let active = true; void getAdminMenu().then((sections) => { const options = serviceOptionsFromMenu(sections); if (active && options.length) setServiceOptions(options); }).catch(() => undefined); return () => { active = false; }; }, []);
  function startNew() { loadRequestRef.current += 1; setLoadingTemplateId(null); setSelectedId(null); setSavedSlug(""); setDraft(createBlankTemplate()); setRevision(null); setIsPublished(false); setIsNew(true); setIsDirty(true); setSlugStatus("unchecked"); setNotice(""); setError(""); }
  function changeDraft(next: DocumentTemplateDraft) { setIsDirty(true); setDraft((current) => { if (current?.slug !== next.slug) setSlugStatus("unchecked"); return next; }); }
  async function validateSlug(): Promise<boolean> { if (!draft) return false; if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) { setSlugStatus("invalid"); return false; } setSlugBusy(true); setSlugStatus("checking"); try { const result = await checkTemplateSlug(draft.slug, isNew ? undefined : selectedId ?? undefined); setSlugStatus(result.available ? "available" : "taken"); if (!result.available) setError("Choose another public slug before saving."); return result.available; } catch (value) { setSlugStatus("unchecked"); handleError(value); return false; } finally { setSlugBusy(false); } }
  const canMutate = isNew || (templatesLoaded && selectedId !== null && revision !== null);
  async function save() { if (!draft || busy || !canMutate) return; setBusy(true); setBusyAction("save"); setNotice(""); setError(""); try { if (!(await validateSlug())) return; const saved = isNew ? await createAdminTemplate(draft) : await updateAdminTemplate(selectedId!, draft, revision!); const summary = templateSummaryFromAdmin(saved); setTemplates((current) => isNew ? [...current, summary] : current.map((item) => item.id === saved.id ? summary : item)); applyTemplate(saved); setNotice(isNew ? "Draft created." : "Draft saved."); } catch (value) { handleError(value); } finally { setBusy(false); setBusyAction(null); } }
  async function publish() { if (!selectedId || revision === null || !draft || busy || !templatesLoaded) return; setBusy(true); setBusyAction("publish"); setNotice(""); setError(""); try { if (!(await validateSlug())) return; const savedDraft = await updateAdminTemplate(selectedId, draft, revision); const savedDraftSummary = templateSummaryFromAdmin(savedDraft); setTemplates((current) => current.map((item) => item.id === savedDraft.id ? savedDraftSummary : item)); applyTemplate(savedDraft); const saved = await publishAdminTemplate(savedDraft.id, savedDraft.revision); const savedSummary = templateSummaryFromAdmin(saved); setTemplates((current) => current.map((item) => item.id === saved.id ? savedSummary : item)); applyTemplate(saved); setNotice("Template published."); } catch (value) { handleError(value); } finally { setBusy(false); setBusyAction(null); } }
  async function unpublish() { if (!selectedId || revision === null || busy || !templatesLoaded) return; setBusy(true); setBusyAction("unpublish"); setNotice(""); setError(""); try { const saved = await unpublishAdminTemplate(selectedId, revision); const summary = templateSummaryFromAdmin(saved); setTemplates((current) => current.map((item) => item.id === saved.id ? summary : item)); applyTemplate(saved); setNotice("Template unpublished."); } catch (value) { handleError(value); } finally { setBusy(false); setBusyAction(null); } }
  async function reloadSelected() { if (!selectedId || busy || !window.confirm("Discard the local edits and load the saved server copy?")) return; setBusy(true); setNotice(""); setError(""); try { const items = await getAdminTemplates(); setTemplates(items); setTemplatesLoaded(true); const current = items.find((item) => item.id === selectedId); if (!current) throw new ApiError(404, "The saved template is no longer available."); const saved = await getAdminTemplate(current.id); applyTemplate(saved); setNotice("Loaded the saved server copy."); } catch (value) { handleError(value); } finally { setBusy(false); } }
  async function persistTemplateOrder(previous: DocumentTemplateSummary[], next: DocumentTemplateSummary[]) {
    setTemplates(next);
    setReorderingTemplates(true);
    setNotice("");
    setError("");
    try {
      const saved = await reorderAdminTemplates(next.map((template) => template.id));
      setTemplates(saved);
      setNotice("Template order saved.");
    } catch (value) {
      setTemplates(previous);
      handleError(value);
    } finally {
      setReorderingTemplates(false);
    }
  }
  function reorderTemplate(sourceId: string, targetId: string) {
    if (sourceId === targetId || busy || reorderingTemplates) return;
    const from = templates.findIndex((template) => template.id === sourceId);
    const target = templates.findIndex((template) => template.id === targetId);
    if (from < 0 || target < 0) return;
    const previous = [...templates];
    const next = [...templates];
    const [moved] = next.splice(from, 1);
    next.splice(next.findIndex((template) => template.id === targetId), 0, moved);
    void persistTemplateOrder(previous, next);
  }
  function moveTemplate(id: string, direction: -1 | 1) {
    if (busy || reorderingTemplates) return;
    const index = templates.findIndex((template) => template.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= templates.length) return;
    const previous = [...templates];
    const next = [...templates];
    [next[index], next[target]] = [next[target], next[index]];
    void persistTemplateOrder(previous, next);
  }

  if (loading) return <div className="grid min-h-[360px] place-items-center rounded-[20px] bg-white text-[13px] font-semibold text-[#817970]">Loading templates…</div>;
  const editor = draft ? <Editor template={draft} onChange={changeDraft} onSave={() => void save()} onPublish={() => void publish()} onUnpublish={() => void unpublish()} busy={busy || reorderingTemplates || loadingTemplateId !== null} busyAction={busyAction} isNew={isNew} isPublished={isPublished} isDirty={isDirty} savedSlug={savedSlug} slugStatus={slugStatus} slugBusy={slugBusy} onCheckSlug={() => void validateSlug()} serviceOptions={serviceOptions} canMutate={canMutate} /> : <div className="grid min-h-[300px] place-items-center rounded-[16px] bg-white p-8 text-center text-[13px] text-[#817970]">Choose a template or create a new one.</div>;
  return <TemplateBuilderView templates={templates} selectedId={selectedId} loadingTemplateId={loadingTemplateId} draggingTemplateId={draggingTemplateId} reorderingTemplates={reorderingTemplates} busy={busy} error={error} notice={notice} editor={editor} onStartNew={startNew} onReloadSelected={() => void reloadSelected()} onSelectTemplate={(template) => void selectTemplate(template)} onDragStart={setDraggingTemplateId} onDragEnd={() => setDraggingTemplateId(null)} onDrop={reorderTemplate} onMove={moveTemplate} />;
}
