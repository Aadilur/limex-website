"use client";

import { trademarkStageBasisLabel, type ToolsSettings } from "@/lib/business-tools";
import styles from "../limex/tools.module.css";

type TrademarkFeeSetting = ToolsSettings["fees"]["trademark"];

export function TrademarkFeeEditor({ value, disabled, onChange }: { value: TrademarkFeeSetting; disabled?: boolean; onChange: (value: TrademarkFeeSetting) => void }) {
  function updateStage(index: number, key: "governmentFee" | "basis" | "label" | "form" | "note", raw: string) {
    const next = key === "governmentFee" ? raw === "" ? null : Number(raw) : raw;
    onChange({ ...value, stages: value.stages.map((stage, stageIndex) => stageIndex === index ? { ...stage, [key]: next } : stage) });
  }

  return (
    <section className="mt-7 border-t border-[#e2e6de] pt-6" aria-labelledby="trademark-stage-fees-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">DPDT schedule</p>
          <h3 id="trademark-stage-fees-title" className="mt-1 text-[17px] font-semibold tracking-[-.02em] text-[#071b3d]">Stage fees</h3>
          <p className="mt-1 max-w-[620px] text-[11px] leading-5 text-[#70796e]">Set the authority fee for each common filing stage. Use “flat” when the assessment is for the filing rather than each selected class.</p>
        </div>
        <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-bold text-[#006dce]">{value.stages.length} stages</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[13px] border border-[#e2e6de] bg-white [scrollbar-width:thin]">
        <table className="w-full min-w-[780px] border-collapse text-left text-[12px] text-[#26332c]">
          <thead className="bg-[#f4f7f1] text-[10px] uppercase tracking-[0.08em] text-[#65715f]">
            <tr>
              <th className="px-3 py-2.5" scope="col">Stage</th>
              <th className="px-3 py-2.5" scope="col">Form</th>
              <th className="px-3 py-2.5" scope="col">DPDT fee (৳)</th>
              <th className="px-3 py-2.5" scope="col">Basis</th>
              <th className="px-3 py-2.5" scope="col">Internal note</th>
            </tr>
          </thead>
          <tbody>
            {value.stages.map((stage, index) => (
              <tr className="border-t border-[#edf0eb] align-top" key={stage.key}>
                <td className="min-w-[160px] px-3 py-3">
                  <label className="sr-only" htmlFor={`trademark-stage-label-${stage.key}`}>Stage label</label>
                  <input id={`trademark-stage-label-${stage.key}`} className={`${styles.control} h-9 min-h-0`} type="text" maxLength={100} value={stage.label} disabled={disabled} onChange={(event) => updateStage(index, "label", event.target.value)} />
                </td>
                <td className="w-[96px] px-3 py-3">
                  <label className="sr-only" htmlFor={`trademark-stage-form-${stage.key}`}>Form number</label>
                  <input id={`trademark-stage-form-${stage.key}`} className={`${styles.control} h-9 min-h-0`} type="text" maxLength={30} value={stage.form} disabled={disabled} onChange={(event) => updateStage(index, "form", event.target.value)} />
                </td>
                <td className="w-[150px] px-3 py-3">
                  <label className="sr-only" htmlFor={`trademark-stage-fee-${stage.key}`}>Government fee</label>
                  <input id={`trademark-stage-fee-${stage.key}`} className={`${styles.control} h-9 min-h-0`} type="number" min={0} max={1e12} step="0.01" placeholder="To confirm" value={stage.governmentFee ?? ""} disabled={disabled} onChange={(event) => updateStage(index, "governmentFee", event.target.value)} />
                </td>
                <td className="w-[160px] px-3 py-3">
                  <label className="sr-only" htmlFor={`trademark-stage-basis-${stage.key}`}>Fee basis</label>
                  <select id={`trademark-stage-basis-${stage.key}`} className={`${styles.control} h-9 min-h-0`} value={stage.basis} disabled={disabled} onChange={(event) => updateStage(index, "basis", event.target.value as "perClass" | "flat")}>
                    <option value="perClass">{trademarkStageBasisLabel("perClass")}</option>
                    <option value="flat">{trademarkStageBasisLabel("flat")}</option>
                  </select>
                </td>
                <td className="min-w-[240px] px-3 py-3">
                  <label className="sr-only" htmlFor={`trademark-stage-note-${stage.key}`}>Internal note</label>
                  <input id={`trademark-stage-note-${stage.key}`} className={`${styles.control} h-9 min-h-0`} type="text" maxLength={500} value={stage.note} disabled={disabled} onChange={(event) => updateStage(index, "note", event.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#7a8177]">Blank DPDT fees remain “To confirm” in the public calculator. The global Limex support fee above is applied per selected class; use the optional override only for a case-specific authority assessment.</p>
    </section>
  );
}
