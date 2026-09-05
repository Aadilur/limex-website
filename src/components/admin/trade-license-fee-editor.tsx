"use client";

import type { TradeLicenseAuthoritySchedule, ToolsSettings } from "@/lib/business-tools";
import styles from "../limex/tools.module.css";

type TradeLicenseSchedules = ToolsSettings["tradeLicense"];
type AuthorityKey = keyof TradeLicenseSchedules;
const authorities: { key: AuthorityKey; label: string }[] = [
  { key: "dncc", label: "Dhaka North City Corporation (DNCC)" },
  { key: "dscc", label: "Dhaka South City Corporation (DSCC)" },
];
const numberValue = (raw: string, nullable = false) => raw === "" && nullable ? null : Number(raw);

export function TradeLicenseFeeEditor({ value, onChange, disabled }: { value: TradeLicenseSchedules; onChange: (value: TradeLicenseSchedules) => void; disabled?: boolean }) {
  function updateAuthority(key: AuthorityKey, update: (schedule: TradeLicenseAuthoritySchedule) => TradeLicenseAuthoritySchedule) {
    onChange({ ...value, [key]: update(value[key]) });
  }
  function updateTariff(authority: AuthorityKey, index: number, key: "label" | "amount", raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, tariffRows: schedule.tariffRows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === "amount" ? numberValue(raw, true) : raw } : row) }));
  }
  function addTariff(authority: AuthorityKey) {
    updateAuthority(authority, (schedule) => {
      if (schedule.tariffRows.length >= 400) return schedule;
      const key = `custom-tariff-${Date.now()}`;
      return { ...schedule, tariffRows: [...schedule.tariffRows, { key, label: "New business tariff", amount: null }] };
    });
  }
  function removeTariff(authority: AuthorityKey, index: number) {
    updateAuthority(authority, (schedule) => schedule.tariffRows.length <= 1 ? schedule : { ...schedule, tariffRows: schedule.tariffRows.filter((_, rowIndex) => rowIndex !== index) });
  }
  function updateCapitalBand(authority: AuthorityKey, index: number, key: "upto" | "amount", raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, limitedCompanyBands: schedule.limitedCompanyBands.map((band, bandIndex) => bandIndex === index ? { ...band, [key]: numberValue(raw, key === "upto") } : band) }));
  }
  function addCapitalBand(authority: AuthorityKey) {
    updateAuthority(authority, (schedule) => {
      if (schedule.limitedCompanyBands.length >= 10) return schedule;
      const last = schedule.limitedCompanyBands.at(-1)!;
      const previous = schedule.limitedCompanyBands.at(-2)?.upto ?? 0;
      return { ...schedule, limitedCompanyBands: [...schedule.limitedCompanyBands.slice(0, -1), { upto: Math.max(previous + 100000, 100000), amount: last.amount }, last] };
    });
  }
  function removeCapitalBand(authority: AuthorityKey) {
    updateAuthority(authority, (schedule) => schedule.limitedCompanyBands.length <= 1 ? schedule : { ...schedule, limitedCompanyBands: [...schedule.limitedCompanyBands.slice(0, -2), schedule.limitedCompanyBands.at(-1)!] });
  }
  function updateRate(authority: AuthorityKey, key: keyof TradeLicenseAuthoritySchedule["signboardRates"] | "vatRate" | "formFee" | "bookFee" | "otherFee" | "duplicateFee" | "amendmentFee", raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, [key]: numberValue(raw, key === "duplicateFee" || key === "amendmentFee") }));
  }
  function updateSignboardRate(authority: AuthorityKey, placement: "signboardRates" | "vehicleSignboardRates", key: keyof TradeLicenseAuthoritySchedule["signboardRates"], raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, [placement]: { ...schedule[placement], [key]: Number(raw) } }));
  }
  function updateSurcharge(authority: AuthorityKey, key: keyof TradeLicenseAuthoritySchedule["surcharge"], raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, surcharge: { ...schedule.surcharge, [key]: Number(raw) } }));
  }
  function updateAd(authority: AuthorityKey, index: number, key: "label" | "amount" | "unit", raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, advertisingRates: schedule.advertisingRates.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === "amount" ? Number(raw) : raw } : row) }));
  }
  function addAd(authority: AuthorityKey) {
    updateAuthority(authority, (schedule) => schedule.advertisingRates.length >= 30 ? schedule : { ...schedule, advertisingRates: [...schedule.advertisingRates, { key: `custom-ad-${Date.now()}`, label: "New advertisement", amount: 0, unit: "per month" }] });
  }
  function removeAd(authority: AuthorityKey, index: number) {
    updateAuthority(authority, (schedule) => schedule.advertisingRates.length <= 1 ? schedule : { ...schedule, advertisingRates: schedule.advertisingRates.filter((_, rowIndex) => rowIndex !== index) });
  }
  function updateText(authority: AuthorityKey, key: "sourceUrl" | "effectiveDate" | "note", raw: string) {
    updateAuthority(authority, (schedule) => ({ ...schedule, [key]: raw }));
  }
  const signboardFields: [keyof TradeLicenseAuthoritySchedule["signboardRates"], string][] = [
    ["identificationPerSqFt", "Business identification · per sq. ft."],
    ["illuminatedPerSqFt", "Illuminated ad · per sq. ft."],
    ["nonIlluminatedPerSqFt", "Non-illuminated ad · per sq. ft."],
    ["ledPerSqFt", "LED ad · per sq. ft."],
  ];
  return <div className="mt-7 border-t border-[#dce1d6] pt-7">
    <div className="mb-5"><h3 className={styles.panelTitle}>DNCC &amp; DSCC trade-licence schedule</h3><p className={`${styles.muted} mt-2`}>Edit the seeded city-corporation tariff and every related calculator charge here. Publish after reviewing the effective date and source. Blank tariff amounts stay pending on the public calculator.</p></div>
    <div className="grid gap-8">
      {authorities.map(({ key: authority, label }) => {
        const schedule = value[authority];
        return <details className="rounded-2xl border border-[#dce1d6] bg-[#fbfcf8] p-5" key={authority} open>
          <summary className="cursor-pointer text-[16px] font-semibold text-[#1c271f]">{label}</summary>
          <div className="mt-6 grid gap-7">
            <section><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>Business tariff rows ({schedule.tariffRows.length})</h4><p className={`${styles.muted} mt-1`}>Use stable labels for rows already referenced by published estimates. Add a row for a newly published business type.</p></div><button className={styles.quiet} type="button" disabled={disabled || schedule.tariffRows.length >= 400} onClick={() => addTariff(authority)}>Add tariff row</button></div><div className="mt-4 grid gap-3">{schedule.tariffRows.map((row, index) => <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]" key={row.key}><label className={styles.field}><span className={styles.hint}>{row.key}</span><input className={styles.control} value={row.label} maxLength={180} disabled={disabled} onChange={(event) => updateTariff(authority, index, "label", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Annual fee (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" placeholder="To confirm" value={row.amount ?? ""} disabled={disabled} onChange={(event) => updateTariff(authority, index, "amount", event.target.value)} /></label><button className={`${styles.quiet} self-end`} type="button" disabled={disabled || schedule.tariffRows.length <= 1} onClick={() => removeTariff(authority, index)}>Remove</button></div>)}</div></section>
            <section className="border-t border-[#e2e6de] pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>Limited-company paid-up-capital bands</h4><p className={`${styles.muted} mt-1`}>Used when the visitor selects a private limited or one-person company structure.</p></div><div className="flex gap-3"><button className={styles.quiet} type="button" disabled={disabled || schedule.limitedCompanyBands.length >= 10} onClick={() => addCapitalBand(authority)}>Add band</button><button className={styles.quiet} type="button" disabled={disabled || schedule.limitedCompanyBands.length <= 1} onClick={() => removeCapitalBand(authority)}>Remove band</button></div></div><div className="mt-4 grid gap-3">{schedule.limitedCompanyBands.map((band, index) => <div className="grid gap-3 sm:grid-cols-[1fr_180px]" key={`${authority}-capital-${index}`}><label className={styles.field}><span className={styles.hint}>{band.upto === null ? "Upper limit · unlimited" : `Band ${index + 1} upper limit (৳)`}</span><input className={styles.control} type="number" min={1} max={1e12} value={band.upto ?? ""} placeholder={band.upto === null ? "No upper limit" : "0"} disabled={disabled || band.upto === null} onChange={(event) => updateCapitalBand(authority, index, "upto", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Annual fee (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={band.amount} disabled={disabled} onChange={(event) => updateCapitalBand(authority, index, "amount", event.target.value)} /></label></div>)}</div></section>
            <section className="border-t border-[#e2e6de] pt-6"><h4 className={styles.label}>Related fixed charges</h4><div className={`${styles.fields} mt-4`}>
              {([["vatRate", "VAT planning rate (%)"], ["formFee", "Application form (৳)"], ["bookFee", "Licence book (৳)"], ["otherFee", "Other authority fee (৳)"], ["duplicateFee", "Duplicate fee (৳)"], ["amendmentFee", "Amendment fee (৳)"]] as const).map(([field, labelText]) => <label className={styles.field} key={field}><span className={styles.label}>{labelText}</span><input className={styles.control} type="number" min={0} max={field === "vatRate" ? 100 : 1e12} step="0.01" placeholder={field === "duplicateFee" || field === "amendmentFee" ? "To confirm" : "0"} value={schedule[field] ?? ""} disabled={disabled} onChange={(event) => updateRate(authority, field, event.target.value)} /></label>)}
            </div></section>
            <section className="border-t border-[#e2e6de] pt-6"><h4 className={styles.label}>Signboard / advertisement rates per sq. ft.</h4><div className={`${styles.fields} mt-4`}><div className={`${styles.field} ${styles.fieldWide}`}><span className={styles.hint}>On business property / private land</span></div>{signboardFields.map(([field, labelText]) => <label className={styles.field} key={`property-${field}`}><span className={styles.label}>{labelText}</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={schedule.signboardRates[field]} disabled={disabled} onChange={(event) => updateSignboardRate(authority, "signboardRates", field, event.target.value)} /></label>)}<div className={`${styles.field} ${styles.fieldWide}`}><span className={styles.hint}>Roadside or vehicle advertisement</span></div>{signboardFields.map(([field, labelText]) => <label className={styles.field} key={`vehicle-${field}`}><span className={styles.label}>{labelText}</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={schedule.vehicleSignboardRates[field]} disabled={disabled} onChange={(event) => updateSignboardRate(authority, "vehicleSignboardRates", field, event.target.value)} /></label>)}</div></section>
            <section className="border-t border-[#e2e6de] pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h4 className={styles.label}>Temporary advertisement rates</h4><p className={`${styles.muted} mt-1`}>The public calculator multiplies the selected rate by the visitor’s quantity or period.</p></div><button className={styles.quiet} type="button" disabled={disabled || schedule.advertisingRates.length >= 30} onClick={() => addAd(authority)}>Add ad rate</button></div><div className="mt-4 grid gap-3">{schedule.advertisingRates.map((row, index) => <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_140px_auto]" key={row.key}><label className={styles.field}><span className={styles.hint}>{row.key}</span><input className={styles.control} value={row.label} maxLength={180} disabled={disabled} onChange={(event) => updateAd(authority, index, "label", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Rate (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={row.amount} disabled={disabled} onChange={(event) => updateAd(authority, index, "amount", event.target.value)} /></label><label className={styles.field}><span className={styles.hint}>Unit</span><input className={styles.control} value={row.unit} maxLength={80} disabled={disabled} onChange={(event) => updateAd(authority, index, "unit", event.target.value)} /></label><button className={`${styles.quiet} self-end`} type="button" disabled={disabled || schedule.advertisingRates.length <= 1} onClick={() => removeAd(authority, index)}>Remove</button></div>)}</div></section>
            <section className="border-t border-[#e2e6de] pt-6"><h4 className={styles.label}>Late renewal rule</h4><div className={`${styles.fields} mt-4`}><label className={styles.field}><span className={styles.label}>Grace month</span><input className={styles.control} type="number" min={1} max={12} step="1" value={schedule.surcharge.graceMonth} disabled={disabled} onChange={(event) => updateSurcharge(authority, "graceMonth", event.target.value)} /></label><label className={styles.field}><span className={styles.label}>Fixed amount per month (৳)</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" value={schedule.surcharge.fixedMonthly} disabled={disabled} onChange={(event) => updateSurcharge(authority, "fixedMonthly", event.target.value)} /></label><label className={styles.field}><span className={styles.label}>Percentage of annual fee (%)</span><input className={styles.control} type="number" min={0} max={100} step="0.01" value={schedule.surcharge.percentOfAnnualLicense} disabled={disabled} onChange={(event) => updateSurcharge(authority, "percentOfAnnualLicense", event.target.value)} /></label></div></section>
            <div className={`${styles.fields} border-t border-[#e2e6de] pt-6`}><label className={styles.field}><span className={styles.label}>Schedule effective date</span><input className={styles.control} type="date" required value={schedule.effectiveDate} disabled={disabled} onChange={(event) => updateText(authority, "effectiveDate", event.target.value)} /></label><label className={styles.field}><span className={styles.label}>Authority / source URL</span><input className={styles.control} type="url" required value={schedule.sourceUrl} disabled={disabled} onChange={(event) => updateText(authority, "sourceUrl", event.target.value)} /></label><label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.label}>Schedule notes</span><textarea className={styles.control} maxLength={1600} value={schedule.note} disabled={disabled} onChange={(event) => updateText(authority, "note", event.target.value)} /></label></div>
          </div>
        </details>;
      })}
    </div>
  </div>;
}
