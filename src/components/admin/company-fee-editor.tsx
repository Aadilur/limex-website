"use client";

import type { ToolsSettings } from "@/lib/business-tools";
import styles from "../limex/tools.module.css";

type CompanyFeeSchedule = ToolsSettings["companyRegistration"];
const fixedFields = [
  ["nameClearanceFee", "Name clearance · per proposed name (৳)"],
  ["filingFee", "RJSC filing · 6 documents (৳)"],
  ["moaStamp", "MoA stamp (৳)"],
] as const;

export function CompanyFeeEditor({ value, onChange, disabled }: { value: CompanyFeeSchedule; onChange: (value: CompanyFeeSchedule) => void; disabled?: boolean }) {
  function update<K extends keyof CompanyFeeSchedule>(key: K, next: CompanyFeeSchedule[K]) {
    onChange({ ...value, [key]: next });
  }
  function updateAoa(index: number, key: "upto" | "amount", raw: string) {
    const next = raw === "" ? key === "upto" ? null : 0 : Number(raw);
    update("aoaStampBands", value.aoaStampBands.map((band, bandIndex) => bandIndex === index ? { ...band, [key]: next } : band));
  }
  function updateCapital(index: number, key: "upto" | "unit" | "feePerUnit", raw: string) {
    const next = raw === "" ? key === "upto" ? null : 0 : Number(raw);
    update("capitalFeeBands", value.capitalFeeBands.map((band, bandIndex) => bandIndex === index ? { ...band, [key]: next } : band));
  }
  function updateReference(index: number, key: "capital" | "governmentFee", raw: string) {
    const next = raw === "" ? 0 : Number(raw);
    update("rjscReferenceRows", value.rjscReferenceRows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: next } : row));
  }
  function addAoaBand() {
    if (value.aoaStampBands.length >= 6) return;
    const last = value.aoaStampBands.at(-1)!;
    const previous = value.aoaStampBands.at(-2)?.upto ?? 0;
    update("aoaStampBands", [...value.aoaStampBands.slice(0, -1), { upto: Math.max(previous + 1000000, 1000000), amount: last.amount }, last]);
  }
  function removeAoaBand() {
    if (value.aoaStampBands.length <= 1) return;
    update("aoaStampBands", [...value.aoaStampBands.slice(0, -2), value.aoaStampBands.at(-1)!]);
  }
  function addCapitalBand() {
    if (value.capitalFeeBands.length >= 6) return;
    const last = value.capitalFeeBands.at(-1)!;
    const previous = value.capitalFeeBands.at(-2)?.upto ?? 0;
    update("capitalFeeBands", [...value.capitalFeeBands.slice(0, -1), { upto: Math.max(previous + 1000000, 1000000), unit: last.unit, feePerUnit: last.feePerUnit }, last]);
  }
  function removeCapitalBand() {
    if (value.capitalFeeBands.length <= 1) return;
    update("capitalFeeBands", [...value.capitalFeeBands.slice(0, -2), value.capitalFeeBands.at(-1)!]);
  }
  function addReferenceRow() {
    if (value.rjscReferenceRows.length >= 30) return;
    const last = value.rjscReferenceRows.at(-1)!;
    update("rjscReferenceRows", [...value.rjscReferenceRows, { capital: last.capital + 1_000_000, governmentFee: last.governmentFee }]);
  }
  function removeReferenceRow() {
    if (value.rjscReferenceRows.length <= 1) return;
    update("rjscReferenceRows", value.rjscReferenceRows.slice(0, -1));
  }
  return <div className="mt-7 border-t border-[#dce1d6] pt-7">
    <div className="mb-5"><h3 className={styles.panelTitle}>RJSC company setup schedule</h3><p className={`${styles.muted} mt-2`}>These official reference values drive the company setup estimate. Edit them when the authority publishes a new schedule, then publish the new version.</p></div>
    <div className={styles.fields}>
      {fixedFields.map(([key, label]) => <label className={styles.field} key={key}><span className={styles.label}>{label}</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={value[key]} disabled={disabled} onChange={(event) => update(key, Number(event.target.value))} /></label>)}
    </div>
    <section className="mt-7 border-t border-[#e2e6de] pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>Articles of Association stamp tiers</h4><p className={`${styles.muted} mt-1`}>Each row applies up to its capital limit. The final row is the unlimited tier.</p></div><div className="flex gap-3"><button className={styles.quiet} type="button" disabled={disabled || value.aoaStampBands.length >= 6} onClick={addAoaBand}>Add tier</button><button className={styles.quiet} type="button" disabled={disabled || value.aoaStampBands.length <= 1} onClick={removeAoaBand}>Remove tier</button></div></div><div className="mt-4 grid gap-3">{value.aoaStampBands.map((band, index) => <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" key={`aoa-${index}`}><label className={styles.field}><span className={styles.hint}>{band.upto === null ? "Upper limit · unlimited" : `Tier ${index + 1} upper limit (৳)`}</span><input className={styles.control} type="number" min={1} max={1e12} value={band.upto ?? ""} placeholder={band.upto === null ? "No upper limit" : "0"} disabled={disabled || band.upto === null} onChange={(event) => updateAoa(index, "upto", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Stamp amount (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={band.amount} disabled={disabled} onChange={(event) => updateAoa(index, "amount", event.target.value)} /></label><span className="hidden sm:block" aria-hidden="true" /></div>)}</div></section>
    <section className="mt-7 border-t border-[#e2e6de] pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>Authorised capital fee bands</h4><p className={`${styles.muted} mt-1`}>The fee is charged per unit within each band; a partial unit counts as one.</p></div><div className="flex gap-3"><button className={styles.quiet} type="button" disabled={disabled || value.capitalFeeBands.length >= 6} onClick={addCapitalBand}>Add band</button><button className={styles.quiet} type="button" disabled={disabled || value.capitalFeeBands.length <= 1} onClick={removeCapitalBand}>Remove band</button></div></div><div className="mt-4 grid gap-3">{value.capitalFeeBands.map((band, index) => <div className="grid gap-3 sm:grid-cols-3" key={`capital-${index}`}><label className={styles.field}><span className={styles.hint}>{band.upto === null ? "Upper limit · unlimited" : `Band ${index + 1} upper limit (৳)`}</span><input className={styles.control} type="number" min={1} max={1e12} value={band.upto ?? ""} placeholder={band.upto === null ? "No upper limit" : "0"} disabled={disabled || band.upto === null} onChange={(event) => updateCapital(index, "upto", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Unit size (৳)</span><input className={styles.control} type="number" min={1} max={1e12} value={band.unit} disabled={disabled} onChange={(event) => updateCapital(index, "unit", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Fee per unit (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={band.feePerUnit} disabled={disabled} onChange={(event) => updateCapital(index, "feePerUnit", event.target.value)} /></label></div>)}</div></section>
    <section className="mt-7 border-t border-[#e2e6de] pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>RJSC government fee reference table</h4><p className={`${styles.muted} mt-1`}>The supplied package reference at each authorised-capital point. Service charge is managed above.</p></div><div className="flex gap-3"><button className={styles.quiet} type="button" disabled={disabled || value.rjscReferenceRows.length >= 30} onClick={addReferenceRow}>Add row</button><button className={styles.quiet} type="button" disabled={disabled || value.rjscReferenceRows.length <= 1} onClick={removeReferenceRow}>Remove row</button></div></div><div className="mt-4 overflow-x-auto rounded-[12px] border border-[#e2e6de] bg-white"><table className="w-full min-w-[560px] border-collapse text-left"><thead className="bg-[#f4f7f1] text-[10px] uppercase tracking-[0.08em] text-[#65715f]"><tr><th className="px-3 py-2.5" scope="col">Authorised capital (৳)</th><th className="px-3 py-2.5 text-right" scope="col">Govt. RJSC fee (৳)</th></tr></thead><tbody>{value.rjscReferenceRows.map((row, index) => <tr className="border-t border-[#edf0eb]" key={`reference-${index}`}><td className="px-3 py-2"><input className={`${styles.control} h-9 min-h-0`} type="number" min={1} max={1e12} value={row.capital} disabled={disabled} onChange={(event) => updateReference(index, "capital", event.target.value)} aria-label={`Reference row ${index + 1} authorised capital`} /></td><td className="px-3 py-2"><input className={`${styles.control} h-9 min-h-0 text-right`} type="number" min={0} max={1e12} step="0.01" value={row.governmentFee} disabled={disabled} onChange={(event) => updateReference(index, "governmentFee", event.target.value)} aria-label={`Reference row ${index + 1} government fee`} /></td></tr>)}</tbody></table></div><p className={`${styles.muted} mt-2`}>Rows must stay in increasing capital order. The public calculator adds the current Limex service charge and shows the minimum total.</p></section>
    <div className={`${styles.fields} mt-7 border-t border-[#e2e6de] pt-6`}>
      <label className={styles.field}><span className={styles.label}>Schedule reference date</span><input className={styles.control} type="date" required value={value.effectiveDate} disabled={disabled} onChange={(event) => update("effectiveDate", event.target.value)} /></label>
      <label className={styles.field}><span className={styles.label}>Source / authority URL</span><input className={styles.control} type="url" required value={value.sourceUrl} disabled={disabled} onChange={(event) => update("sourceUrl", event.target.value)} /></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.label}>Schedule note</span><textarea className={styles.control} maxLength={1000} value={value.note} disabled={disabled} onChange={(event) => update("note", event.target.value)} /></label>
    </div>
  </div>;
}
