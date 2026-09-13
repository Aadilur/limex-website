import { money, trademarkStageBasisLabel, type ToolsSettings } from "@/lib/business-tools";

type Props = {
  settings: Pick<ToolsSettings, "fees">;
  selectedStage?: string;
  compact?: boolean;
};

export function TrademarkFeeReferenceTable({ settings, selectedStage, compact = false }: Props) {
  const fee = settings.fees.trademark;

  return (
    <section className={`${compact ? "mt-7" : "mt-6"} min-w-0`} aria-labelledby="trademark-fee-schedule-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">DPDT reference</p>
          <h2 className="mt-1 font-brand text-[20px] font-semibold tracking-[-.025em] text-[#071b3d]" id="trademark-fee-schedule-title">Trademark fee schedule</h2>
        </div>
        <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-bold text-[#006dce]">{fee.stages.length} stages</span>
      </div>
      <p className="mt-2 max-w-[720px] text-[12px] leading-6 text-[#667166]">Use the configured DPDT amount for the selected stage. The charging basis is shown explicitly so class-based and filing-level fees are not mixed.</p>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#dfe5dc] bg-white [scrollbar-width:thin]">
        <table className="w-full min-w-[620px] border-collapse text-left text-[12px] text-[#26332c]">
          <thead className="bg-[#071b3d] text-[11px] font-semibold text-white">
            <tr>
              <th className="px-3.5 py-3" scope="col">Stage</th>
              <th className="px-3.5 py-3" scope="col">Form</th>
              <th className="px-3.5 py-3 text-right" scope="col">Government fee</th>
              <th className="px-3.5 py-3" scope="col">Basis</th>
            </tr>
          </thead>
          <tbody>
            {fee.stages.map((stage, index) => {
              const isSelected = selectedStage === stage.key || selectedStage?.toLowerCase() === stage.label.toLowerCase();
              return (
                <tr className={`${isSelected ? "bg-[#edf6ff]" : index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} border-b border-[#e8ece7] last:border-b-0`} key={stage.key}>
                  <th className="px-3.5 py-2.5 text-left font-semibold" scope="row">{stage.label}</th>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-[#667166]">{stage.form}</td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-right font-semibold text-[#0055ff]">{stage.governmentFee === null ? "To confirm" : money(stage.governmentFee)}</td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-[#667166]">{trademarkStageBasisLabel(stage.basis)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#7b857c]">Reference date: {fee.effectiveDate ?? "not set"}. Fees can change and additional VAT, notices, objections or case-specific charges may apply. Confirm the final assessment before payment.</p>
    </section>
  );
}
