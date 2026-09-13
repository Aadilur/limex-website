import { formatCapitalReference, money, type ToolsSettings } from "@/lib/business-tools";

type Props = {
  settings: Pick<ToolsSettings, "companyRegistration" | "fees">;
  selectedCapital?: string;
  compact?: boolean;
};

export function CompanyFeeReferenceTable({ settings, selectedCapital, compact = false }: Props) {
  const rows = settings.companyRegistration.rjscReferenceRows;
  const serviceFee = settings.fees["limited-company"].serviceFee;

  return (
    <section className={`${compact ? "mt-7" : "mt-6"} min-w-0`} aria-labelledby="rjsc-reference-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">RJSC fee reference</p>
          <h2 className="mt-1 font-brand text-[20px] font-semibold tracking-[-.025em] text-[#071b3d]" id="rjsc-reference-title">Government fee by authorised capital</h2>
        </div>
        <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-bold text-[#006dce]">{rows.length} capital points</span>
      </div>
      <p className="mt-2 max-w-[700px] text-[12px] leading-6 text-[#667166]">Use this Limex planning reference for the minimum company setup view. The service charge is pulled from the editable fee setting above.</p>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#dfe5dc] bg-white [scrollbar-width:thin]">
        <table className="w-full min-w-[620px] border-collapse text-left text-[12px] text-[#26332c]">
          <thead className="bg-[#071b3d] text-[11px] font-semibold text-white">
            <tr>
              <th className="px-3.5 py-3" scope="col">Authorised capital</th>
              <th className="px-3.5 py-3 text-right" scope="col">Govt. RJSC fee</th>
              <th className="px-3.5 py-3 text-right" scope="col">Service charge</th>
              <th className="px-3.5 py-3 text-right" scope="col">Minimum total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isSelected = selectedCapital === String(row.capital);
              const total = serviceFee === null ? null : row.governmentFee + serviceFee;
              return (
                <tr className={`${isSelected ? "bg-[#edf6ff]" : index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} border-b border-[#e8ece7] last:border-b-0`.trim()} key={row.capital}>
                  <th className="whitespace-nowrap px-3.5 py-2.5 text-left font-medium" scope="row">{formatCapitalReference(row.capital)}</th>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-right font-semibold text-[#0055ff]">{money(row.governmentFee)}</td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-right text-[#68736b]">{serviceFee === null ? "To confirm" : money(serviceFee)}</td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 text-right font-bold text-[#26332c]">{total === null ? "To confirm" : money(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#7b857c]">Trade licence, trademark and BIN certificate costs are additional. Confirm the applicable authority assessment before filing.</p>
    </section>
  );
}
