"use client";

import { businessTools, type ToolsSettings } from "@/lib/business-tools";
import { CompanyFeeEditor } from "./company-fee-editor";
import { TradeLicenseFeeEditor } from "./trade-license-fee-editor";
import { TrademarkFeeEditor } from "./trademark-fee-editor";
import styles from "../limex/tools.module.css";

export const feeSlugs = ["limited-company", "rjsc", "trade-license", "trademark", "irc-erc"] as const;
export type FeeSlug = typeof feeSlugs[number];

const chargeFieldsBySlug: Partial<Record<FeeSlug, readonly [string, string][]>> = {
  rjsc: [["extras", "Other confirmed charges (৳)"]],
  "trade-license": [["signboard", "Signboard assessment (৳)"], ["sourceTax", "Income / source tax default (৳)"], ["extras", "Other assessed charges (৳)"]],
  trademark: [["extras", "Other assessed charges (৳)"]],
  "irc-erc": [["extras", "VAT / other assessed charges (৳)"]],
};

const feeTools = feeSlugs
  .map((slug) => businessTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

type Props = {
  settings: ToolsSettings;
  busy: boolean;
  slug: FeeSlug;
  onSlugChange: (slug: FeeSlug) => void;
  updateSettings: (update: (settings: ToolsSettings) => ToolsSettings) => void;
};

export function FeeSettingsEditor({ settings, busy, slug, onSlugChange, updateSettings }: Props) {
  const fee = settings.fees[slug];
  const tool = feeTools.find((item) => item.slug === slug) ?? feeTools[0]!;
  const chargeFields = chargeFieldsBySlug[slug] ?? [];

  function updateFee<K extends keyof typeof fee>(key: K, value: (typeof fee)[K]) {
    updateSettings((current) => ({
      ...current,
      fees: {
        ...current.fees,
        [slug]: { ...current.fees[slug], [key]: value },
      },
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 lg:pt-1">
        <div className="mb-3 flex items-end justify-between gap-3 lg:block">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Fee sections</p>
            <h2 className="mt-1 text-[15px] font-semibold text-[#071b3d]">Choose a service</h2>
          </div>
          <span className="text-[11px] text-[#7a8177]">{feeTools.length} sections</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:space-y-1 lg:overflow-visible lg:pb-0" aria-label="Fee settings sections">
          {feeTools.map((item, index) => {
            const active = item.slug === slug;
            return (
              <button
                className={`group flex min-w-[170px] shrink-0 items-center gap-3 rounded-[13px] px-3 py-3 text-left transition-colors lg:min-w-0 lg:w-full ${active ? "bg-[#e9f1e6] text-[#294d3f]" : "text-[#687063] hover:bg-[#eef2eb] hover:text-[#294d3f]"}`.trim()}
                type="button"
                key={item.slug}
                aria-pressed={active}
                onClick={() => onSlugChange(item.slug as FeeSlug)}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${active ? "bg-[#294d3f] text-white" : "bg-[#e3e9df] text-[#65715f]"}`.trim()}>{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#899187]">{item.group === "calculator" ? "Calculator" : "Builder"}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <p className="mt-5 hidden text-[11px] leading-6 text-[#7a8177] lg:block">Only the selected service opens for editing. Your changes stay as one safe draft until you publish settings.</p>
      </aside>

      <section className={styles.formPanel} aria-labelledby="fee-editor-title">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e2e6de] pb-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Selected service</p>
            <h2 id="fee-editor-title" className="mt-1 text-[22px] font-semibold tracking-[-.025em] text-[#071b3d]">{tool.title}</h2>
            <p className="mt-1 max-w-[620px] text-[12px] leading-6 text-[#70796e]">{tool.description} Edit only this service’s fees and rules here.</p>
          </div>
          <a className={styles.textLink} href={`/business-tools/${slug}`} target="_blank" rel="noreferrer">Open calculator ↗</a>
        </div>

        <div className={`${styles.fields} mt-6`}>
          <label className={styles.field}>
            <span className={styles.label}>{slug === "limited-company" ? "Limex professional service fee (৳)" : slug === "trademark" ? "Limex support fee per class (৳)" : "Limex support fee (৳)"}</span>
            <input className={styles.control} type="number" min={0} max={1e12} step="0.01" placeholder="To confirm" value={fee.serviceFee ?? ""} onChange={(event) => updateFee("serviceFee", event.target.value === "" ? null : Number(event.target.value))} />
          </label>
          {slug === "limited-company" ? (
            <div className="flex min-w-0 flex-col justify-center rounded-[13px] bg-[#f4f7f1] px-4 py-3">
              <span className={styles.label}>Government charges</span>
              <span className="mt-1 text-[11px] leading-5 text-[#6b7669]">Managed by the RJSC company setup schedule below.</span>
            </div>
          ) : slug === "trademark" ? (
            <div className="flex min-w-0 flex-col justify-center rounded-[13px] bg-[#f4f7f1] px-4 py-3">
              <span className={styles.label}>DPDT government charges</span>
              <span className="mt-1 text-[11px] leading-5 text-[#6b7669]">Managed by the filing-stage schedule below.</span>
            </div>
          ) : (
            <label className={styles.field}>
              <span className={styles.label}>Default government reference (৳)</span>
              <input className={styles.control} type="number" min={0} max={1e12} step="0.01" placeholder="To confirm" value={fee.governmentFee ?? ""} onChange={(event) => updateFee("governmentFee", event.target.value === "" ? null : Number(event.target.value))} />
            </label>
          )}
          <label className={styles.field}>
            <span className={styles.label}>Effective date</span>
            <input className={styles.control} type="date" value={fee.effectiveDate ?? ""} onChange={(event) => updateFee("effectiveDate", event.target.value || null)} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Source / authority URL</span>
            <input className={styles.control} type="url" required value={fee.sourceUrl} onChange={(event) => updateFee("sourceUrl", event.target.value)} />
          </label>
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.label}>Scope and fee notes</span>
            <textarea className={styles.control} maxLength={1000} value={fee.note} onChange={(event) => updateFee("note", event.target.value)} />
          </label>
        </div>

        {slug === "rjsc" ? <div className="mt-6 rounded-[13px] bg-[#f4f7f1] px-4 py-3 text-[11px] leading-5 text-[#63705f]">
          Private and one-person company registration shares the capital-based RJSC schedule shown below. Public-company and other service assessments can still vary.
        </div> : null}

        {slug === "limited-company" || slug === "rjsc" ? <CompanyFeeEditor value={settings.companyRegistration} disabled={busy} onChange={(value) => updateSettings((current) => ({ ...current, companyRegistration: value }))} /> : null}
        {slug === "trade-license" ? <TradeLicenseFeeEditor value={settings.tradeLicense} disabled={busy} onChange={(value) => updateSettings((current) => ({ ...current, tradeLicense: value }))} /> : null}
        {slug === "trademark" ? <TrademarkFeeEditor value={settings.fees.trademark} disabled={busy} onChange={(value) => updateSettings((current) => ({ ...current, fees: { ...current.fees, trademark: value } }))} /> : null}

        {chargeFields.length ? <div className={`${styles.fields} mt-6 border-t border-[#e2e6de] pt-6`}>
          <p className={`${styles.muted} ${styles.fieldWide}`}>Case-specific defaults prefill the calculator. Users can replace them with the current authority assessment.</p>
          {chargeFields.map(([key, label]) => <label className={styles.field} key={key}><span className={styles.label}>{label}</span><input className={styles.control} type="number" min={0} max={1e12} step="0.01" placeholder="To confirm" value={fee.chargeDefaults[key] ?? ""} onChange={(event) => updateFee("chargeDefaults", { ...fee.chargeDefaults, [key]: event.target.value === "" ? null : Number(event.target.value) })} /></label>)}
        </div> : null}
      </section>
    </div>
  );
}
