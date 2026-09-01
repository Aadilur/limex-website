"use client";

import { useMemo, useState } from "react";

import { ActionButton, WaveLabel } from "./ui";

const moneyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

function formatTaka(value: number) {
  return `৳ ${moneyFormatter.format(Math.max(0, Math.round(value)))}`;
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function StepBadge({ number }: { number: string }) {
  return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#c74d63] text-nav-compact font-bold text-white">{number}</span>;
}

function CalculatorHeading({
  eyebrow,
  title,
  description,
  chip,
}: {
  eyebrow: string;
  title: string;
  description: string;
  chip?: string;
}) {
  return (
    <div className="flex flex-col gap-cluster-sm">
      <div className="flex flex-wrap items-center justify-between gap-cluster-sm">
        <p className="text-overline text-pink">{eyebrow}</p>
        {chip ? <WaveLabel className="text-muted">{chip}</WaveLabel> : null}
      </div>
      <h2 className="max-w-[620px] font-brand text-section-title text-[#171a26]">{title}</h2>
      <p className="max-w-[620px] text-body-xs text-[#6b7487]">{description}</p>
    </div>
  );
}

function StepHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-cluster-sm">
      <StepBadge number={number} />
      <div className="min-w-0">
        <h3 className="text-body-xs font-semibold text-[#171a26]">{title}</h3>
        <p className="mt-0.5 text-meta text-[#6e6b66]">{description}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-cluster border-b border-[#eeeae3] py-1.5 last:border-b-0">
      <span className="min-w-0 text-meta text-[#575757]">{label}</span>
      <span className={`shrink-0 text-right text-meta font-semibold ${accent ? "text-pink" : "text-[#1f1f1f]"}`.trim()}>{value}</span>
    </div>
  );
}

function MoneyInput({
  id,
  label,
  helper,
  value,
  onChange,
  compact = false,
}: {
  id: string;
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className={`${compact ? "text-micro" : "text-body-xs"} font-semibold text-[#171a26]`.trim()}>{label}</span>
      {helper ? <span className="mt-1 block text-micro text-[#6b7487]">{helper}</span> : null}
      <span className={`mt-cluster-sm flex items-center gap-cluster-sm rounded-control border border-[#e5e0d6] bg-white px-3.5 transition-colors focus-within:border-pink focus-within:ring-2 focus-within:ring-pink/10 ${compact ? "h-control-sm" : "h-control"}`.trim()}>
        <span className="shrink-0 text-body-xs font-semibold text-[#6b7487]">৳</span>
        <input
          className={`${compact ? "text-micro" : "text-body-sm"} min-w-0 flex-1 bg-transparent font-semibold text-[#171a26] outline-none placeholder:text-[#a7aab4]`.trim()}
          id={id}
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          type="number"
          value={value}
        />
      </span>
    </label>
  );
}

function DetailAmountInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-cluster-sm rounded-control border border-[#e5e0d6] bg-white px-2.5 py-2.5" htmlFor={id}>
      <span className="text-micro font-medium text-[#6b7487]">{label}</span>
      <span className="flex items-center gap-cluster-sm">
        <span className="text-micro font-semibold text-[#6b7487]">৳</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-right text-micro font-semibold text-[#171a26] outline-none placeholder:text-[#a7aab4]"
          id={id}
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          type="number"
          value={value}
        />
      </span>
    </label>
  );
}

function ChoiceButton({
  children,
  selected,
  onClick,
  className = "",
}: {
  children: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`inline-flex min-h-9 items-center justify-center rounded-control border px-3 text-center text-button font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${selected ? "border-[#121729] bg-[#121729] text-white" : "border-[#e5e0d6] bg-white text-[#171a26] hover:border-[#c74d63]"} ${className}`.trim()}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

const capitalOptions = [
  { value: "1000000", label: "10 Lakh (১০ লক্ষ)", fee: 22158 },
  { value: "5000000", label: "50 Lakh (৫০ লক্ষ)", fee: 32158 },
  { value: "10000000", label: "1 Crore (১ কোটি)", fee: 47158 },
  { value: "50000000", label: "5 Crore (৫ কোটি)", fee: 72158 },
];

const paidUpOptions = [
  { value: "500000", label: "Up to 5 Lakh (৫ লক্ষ)", fee: 8000 },
  { value: "2500000", label: "10 to 25 Lakh (১০ to ২৫ লক্ষ)", fee: 13000 },
  { value: "5000000", label: "25 to 50 Lakh (২৫ to ৫০ লক্ষ)", fee: 18000 },
];

export function LimitedCompanyCostCalculator() {
  const [authorizedCapital, setAuthorizedCapital] = useState("10000000");
  const [paidUpCapital, setPaidUpCapital] = useState("2500000");
  const [location, setLocation] = useState<"dhaka" | "outside">("dhaka");
  const [trademark, setTrademark] = useState(false);
  const [bin, setBin] = useState(false);

  const selectedCapital = capitalOptions.find((option) => option.value === authorizedCapital) ?? capitalOptions[2];
  const selectedPaidUp = paidUpOptions.find((option) => option.value === paidUpCapital) ?? paidUpOptions[1];
  const tradeLicenseFee = location === "dhaka" ? selectedPaidUp.fee : Math.round(selectedPaidUp.fee * 0.62);
  const documentationFee = 10000;
  const trademarkFee = trademark ? 10000 : 0;
  const binFee = bin ? 4000 : 0;
  const total = selectedCapital.fee + documentationFee + tradeLicenseFee + trademarkFee + binFee;

  return (
    <section className="scroll-mt-[120px] overflow-hidden rounded-panel border border-[#e3ded4] bg-[#fbfaf6]" id="limited-company-calculator" aria-labelledby="limited-company-title">
      <div className="grid gap-section-gap bg-[#f9f8f5] px-page-gutter py-section-y sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)] lg:items-stretch lg:px-12 lg:py-9">
        <div className="flex flex-col justify-center gap-cluster-sm">
          <p className="text-overline text-[#c74d63]">BUSINESSBOX / LIMITED COMPANY</p>
          <h2 className="max-w-[820px] font-brand text-page-title font-semibold text-[#1a1a1a] max-lg:text-page-title-mobile" id="limited-company-title">Calculate your limited company registration cost</h2>
          <p className="max-w-[700px] text-body-xs text-[#6e6b66]">Set your capital, location, and optional services to get a clear estimate before you apply.</p>
          <p className="text-micro font-medium text-[#6e6b66]">Government fee, documentation charge, Trade License, and add-ons shown separately.</p>
        </div>
        <aside className="flex min-h-[174px] flex-col justify-between gap-section-gap rounded-card bg-[#173838] px-card-pad py-card-pad text-white sm:px-[22px]">
          <div>
            <p className="text-overline text-[#c7e5e0]">CALCULATOR SCOPE</p>
            <h3 className="mt-1 font-brand text-subheading">One transparent estimate</h3>
            <p className="mt-cluster-sm max-w-[390px] text-micro text-[#c7e5e0]">RJSC fee, documentation, Trade License, and optional services in one view.</p>
          </div>
          <div className="grid grid-cols-2 gap-cluster-sm">
            <div className="rounded-control bg-[#1f4a4a] px-2.5 py-1.5">
              <strong className="block text-body-sm">15</strong>
              <span className="block text-nav-compact text-[#c7e5e0]">authorized capital options</span>
            </div>
            <div className="rounded-control bg-[#1f4a4a] px-2.5 py-1.5">
              <strong className="block text-body-sm">2</strong>
              <span className="block text-nav-compact text-[#c7e5e0]">trademark and BIN add-ons</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-[#e3ded4] bg-[#fbfaf6] px-page-gutter py-section-y sm:px-8 lg:px-12 lg:py-section-y">
        <div className="flex flex-col gap-cluster-xs sm:flex-row sm:items-end sm:justify-between sm:gap-cluster">
          <div>
            <h3 className="font-brand text-subheading text-[#1a1a1a]">Build your estimate</h3>
            <p className="mt-1 text-meta text-[#6e6b66]">Choose each value to refresh the estimate.</p>
          </div>
          <span className="text-overline text-[#c74d63]">LIVE CALCULATION</span>
        </div>

        <div className="mt-section-gap-lg grid gap-cluster lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.9fr)] lg:items-start lg:gap-cluster-lg">
          <div className="flex flex-col gap-cluster-sm rounded-nav border border-[#e5e0d6] bg-white p-card-pad-sm sm:p-card-pad">
            <div className="rounded-control border border-[#f0d7da] bg-white p-cluster">
              <StepHeader number="01" title="Authorized Capital" description="Future share issue limit. This sets the RJSC government registration fee." />
              <div className="mt-cluster-sm flex flex-col gap-cluster-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="min-w-0 flex-1" htmlFor="authorized-capital">
                  <span className="sr-only">Authorized capital</span>
                  <select className="h-control-sm w-full rounded-control border border-[#ebc4c9] bg-[#fbfaf6] px-3 text-button font-medium text-[#1a1a1a] outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/10" id="authorized-capital" onChange={(event) => setAuthorizedCapital(event.target.value)} value={authorizedCapital}>
                    {capitalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <span className="flex items-center justify-between gap-cluster-sm text-micro text-[#6e6b66] sm:min-w-[170px] sm:justify-end">
                  RJSC fee <strong className="text-meta font-semibold text-[#c74d63]">{formatTaka(selectedCapital.fee)}</strong>
                </span>
              </div>
            </div>

            <div className="rounded-control border border-[#e5e0d6] bg-white p-cluster">
              <StepHeader number="02" title="Paid-Up Capital" description="Shareholder investment at launch. This sets the Dhaka Trade License fee." />
              <div className="mt-cluster-sm flex flex-col gap-cluster-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="min-w-0 flex-1" htmlFor="paid-up-capital">
                  <span className="sr-only">Paid-up capital</span>
                  <select className="h-control-sm w-full rounded-control border border-[#ebc4c9] bg-[#fbfaf6] px-3 text-button font-medium text-[#1a1a1a] outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/10" id="paid-up-capital" onChange={(event) => setPaidUpCapital(event.target.value)} value={paidUpCapital}>
                    {paidUpOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <span className="flex items-center justify-between gap-cluster-sm text-micro text-[#6e6b66] sm:min-w-[170px] sm:justify-end">
                  Trade License <strong className="text-meta font-semibold text-[#c74d63]">{formatTaka(tradeLicenseFee)}</strong>
                </span>
              </div>
            </div>

            <div className="rounded-control border border-[#e5e0d6] bg-white p-cluster">
              <StepHeader number="03" title="Business Location" description="Location changes how the Trade License fee is handled." />
              <div className="mt-cluster-sm grid gap-cluster-sm sm:grid-cols-2">
                <button aria-pressed={location === "dhaka"} className={`flex min-h-14 items-center gap-cluster-sm rounded-control border px-3 text-left transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${location === "dhaka" ? "border-[#ebc4c9] bg-[#fbeced]" : "border-[#e3ded4] bg-white hover:border-[#c74d63]"}`.trim()} onClick={() => setLocation("dhaka")} type="button">
                  <span className={`grid size-4 shrink-0 place-items-center rounded-[8px] border ${location === "dhaka" ? "border-[#c74d63] bg-[#c74d63]" : "border-[#ebc4c9] bg-white"}`.trim()}>{location === "dhaka" ? <span className="size-1.5 rounded-[3px] bg-white" /> : null}</span>
                  <span><strong className={`block text-micro font-semibold ${location === "dhaka" ? "text-[#c74d63]" : "text-[#1a1a1a]"}`.trim()}>Inside Dhaka City Corporation</strong><span className="mt-0.5 block text-nav-compact text-[#6e6b66]">Trade License fee: {formatTaka(selectedPaidUp.fee)}</span></span>
                </button>
                <button aria-pressed={location === "outside"} className={`flex min-h-14 items-center gap-cluster-sm rounded-control border px-3 text-left transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${location === "outside" ? "border-[#ebc4c9] bg-[#fbeced]" : "border-[#e3ded4] bg-white hover:border-[#c74d63]"}`.trim()} onClick={() => setLocation("outside")} type="button">
                  <span className={`grid size-4 shrink-0 place-items-center rounded-[8px] border ${location === "outside" ? "border-[#c74d63] bg-[#c74d63]" : "border-[#ebc4c9] bg-white"}`.trim()}>{location === "outside" ? <span className="size-1.5 rounded-[3px] bg-white" /> : null}</span>
                  <span><strong className={`block text-micro font-semibold ${location === "outside" ? "text-[#c74d63]" : "text-[#1a1a1a]"}`.trim()}>Outside Dhaka City Corporation</strong><span className="mt-0.5 block text-nav-compact text-[#6e6b66]">Estimated fee: {formatTaka(tradeLicenseFee)}</span></span>
                </button>
              </div>
            </div>

            <div className="rounded-control border border-[#e5e0d6] bg-white p-cluster">
              <StepHeader number="04" title="Optional Add-ons" description="Add extra protection or registration support when you need it." />
              <div className="mt-cluster-sm grid gap-cluster-sm sm:grid-cols-2">
                <label className={`flex min-h-14 cursor-pointer items-center gap-cluster-sm rounded-control border px-3 transition-colors ${trademark ? "border-[#ebc4c9] bg-[#fbeced]" : "border-[#e3ded4] bg-white hover:border-[#c74d63]"}`.trim()} htmlFor="trademark-addon">
                  <input checked={trademark} className="peer sr-only" id="trademark-addon" onChange={(event) => setTrademark(event.target.checked)} type="checkbox" />
                  <span className={`grid size-4 shrink-0 place-items-center rounded-[4px] border text-nav-compact font-bold text-white transition-colors ${trademark ? "border-[#c74d63] bg-[#c74d63]" : "border-[#e3ded4] bg-white"}`.trim()}>{trademark ? "✓" : null}</span>
                  <span><strong className="block text-micro font-semibold text-[#1a1a1a]">Trademark Registration</strong><span className="mt-0.5 block text-nav-compact text-[#6e6b66]">Optional · {formatTaka(10000)}</span></span>
                </label>
                <label className={`flex min-h-14 cursor-pointer items-center gap-cluster-sm rounded-control border px-3 transition-colors ${bin ? "border-[#ebc4c9] bg-[#fbeced]" : "border-[#e3ded4] bg-white hover:border-[#c74d63]"}`.trim()} htmlFor="bin-addon">
                  <input checked={bin} className="peer sr-only" id="bin-addon" onChange={(event) => setBin(event.target.checked)} type="checkbox" />
                  <span className={`grid size-4 shrink-0 place-items-center rounded-[4px] border text-nav-compact font-bold text-white transition-colors ${bin ? "border-[#c74d63] bg-[#c74d63]" : "border-[#e3ded4] bg-white"}`.trim()}>{bin ? "✓" : null}</span>
                  <span><strong className="block text-micro font-semibold text-[#1a1a1a]">BIN / VAT Certificate</strong><span className="mt-0.5 block text-nav-compact text-[#6e6b66]">Optional · {formatTaka(4000)}</span></span>
                </label>
              </div>
            </div>
          </div>

          <aside className="flex flex-col rounded-nav border border-[#e5e0d6] bg-white p-card-pad sm:p-card-pad">
            <p className="text-overline text-[#575757]">LIVE ESTIMATE</p>
            <h3 className="mt-1 font-brand text-section-title text-[#1f1f1f]">Your package summary</h3>
            <p className="mt-1 text-micro text-[#575757]">Change any field to recalculate.</p>
            <div className="mt-cluster">
              <SummaryRow label="RJSC Government Fee" value={formatTaka(selectedCapital.fee)} />
              <SummaryRow label="Documentation & Service" value={formatTaka(documentationFee)} />
              <SummaryRow label="Trade License Fee" value={formatTaka(tradeLicenseFee)} />
              <SummaryRow label="Trademark Registration" value={trademark ? formatTaka(trademarkFee) : "Not included"} />
              <SummaryRow label="BIN / VAT Certificate" value={bin ? formatTaka(binFee) : "Not included"} />
            </div>
            <div className="mt-cluster-sm flex items-end justify-between gap-cluster-sm border-t border-[#e5e0d6] pt-4">
              <span className="text-button font-semibold text-[#1f1f1f]">Estimated total</span>
              <strong className="font-brand text-section-title text-[#1f1f1f]">{formatTaka(total)}</strong>
            </div>
            <p className="mt-cluster-sm text-micro text-[#575757]">Based on {selectedCapital.label}, {selectedPaidUp.label}, and {location === "dhaka" ? "inside Dhaka" : "outside Dhaka"} selection.</p>
            <ActionButton href="/#contact" variant="dark" arrow="none" className="mt-section-gap-lg min-h-[46px] w-full justify-center text-body-xs">Continue with this estimate</ActionButton>
            <p className="mt-cluster-sm text-center text-micro font-medium text-[#575757]">Need help choosing the right capital? Talk to an expert.</p>
          </aside>
        </div>
      </div>

      <div className="border-t border-[#e3ded4] bg-white px-page-gutter py-card-pad-sm sm:px-8 lg:px-12">
        <h3 className="font-brand text-body text-[#1a1a1a]">Know what changes the final estimate</h3>
        <div className="mt-cluster grid gap-cluster-sm sm:grid-cols-3">
          <div className="rounded-control border border-[#e3ded4] bg-[#fbfaf6] px-3.5 py-3.5"><strong className="block text-meta font-semibold text-[#1a1a1a]">RJSC Government Fee</strong><p className="mt-1 text-nav-compact text-[#6e6b66]">Authorized Capital sets the filing fee. Brackets can change the government charge.</p></div>
          <div className="rounded-control border border-[#e3ded4] bg-[#fbfaf6] px-3.5 py-3.5"><strong className="block text-meta font-semibold text-[#1a1a1a]">Trade License Fee</strong><p className="mt-1 text-nav-compact text-[#6e6b66]">Paid-Up Capital and location affect the city corporation fee.</p></div>
          <div className="rounded-control border border-[#e3ded4] bg-[#fbfaf6] px-3.5 py-3.5"><strong className="block text-meta font-semibold text-[#1a1a1a]">Optional Add-ons</strong><p className="mt-1 text-nav-compact text-[#6e6b66]">Trademark registration is ৳10,000. BIN / VAT Certificate is ৳4,000.</p></div>
        </div>
        <p className="mt-cluster text-nav-compact text-[#6e6b66]">Final government costs may vary if the authority or case requirements change.</p>
      </div>
    </section>
  );
}

type TaxCategory = "general" | "female" | "senior" | "disability" | "freedom";

const taxCategories: Array<{ value: TaxCategory; label: string; exemption: number }> = [
  { value: "general", label: "General / male", exemption: 400000 },
  { value: "female", label: "Female", exemption: 450000 },
  { value: "senior", label: "Senior 65+", exemption: 450000 },
  { value: "disability", label: "Disability / third gender", exemption: 475000 },
  { value: "freedom", label: "Freedom fighter", exemption: 500000 },
];

const investmentFields = [
  ["dps", "DPS"],
  ["securities", "Govt. securities"],
  ["fund", "Mutual / unit fund"],
  ["stocks", "Stock market"],
  ["insurance", "Life insurance"],
  ["provident", "Provident fund"],
] as const;

function calculateProgressiveTax(taxableIncome: number) {
  const slabs = [
    { amount: 100000, rate: 0.05 },
    { amount: 400000, rate: 0.1 },
    { amount: 500000, rate: 0.15 },
    { amount: 500000, rate: 0.2 },
    { amount: Number.POSITIVE_INFINITY, rate: 0.25 },
  ];
  let remaining = taxableIncome;
  let tax = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxableAtThisRate = Math.min(remaining, slab.amount);
    tax += taxableAtThisRate * slab.rate;
    remaining -= taxableAtThisRate;
  }

  return tax;
}

export function TaxCalculator() {
  const [category, setCategory] = useState<TaxCategory>("general");
  const [grossIncome, setGrossIncome] = useState("1200000");
  const [investment, setInvestment] = useState("150000");
  const [sourceTax, setSourceTax] = useState("60000");
  const [investmentDetails, setInvestmentDetails] = useState<Record<string, string>>({
    dps: "120000",
    securities: "0",
    fund: "20000",
    stocks: "0",
    insurance: "10000",
    provident: "0",
  });

  const calculation = useMemo(() => {
    const selectedCategory = taxCategories.find((option) => option.value === category) ?? taxCategories[0];
    const gross = parseAmount(grossIncome);
    const exempted = Math.min(gross, selectedCategory.exemption);
    const taxable = Math.max(gross - exempted, 0);
    const beforeRebate = calculateProgressiveTax(taxable);
    const rebate = Math.min(beforeRebate * 0.1, parseAmount(investment) * 0.05);
    const netTax = Math.max(beforeRebate - rebate, 0);
    const deducted = parseAmount(sourceTax);
    const payable = Math.max(netTax - deducted, 0);
    const refund = Math.max(deducted - netTax, 0);

    return { gross, exempted, taxable, beforeRebate, rebate, netTax, payable, refund };
  }, [category, grossIncome, investment, sourceTax]);

  const updateInvestmentDetail = (key: string, value: string) => {
    const nextDetails = { ...investmentDetails, [key]: value };
    setInvestmentDetails(nextDetails);
    setInvestment(String(Object.values(nextDetails).reduce((total, item) => total + parseAmount(item), 0)));
  };

  const reset = () => {
    setCategory("general");
    setGrossIncome("1200000");
    setInvestment("150000");
    setSourceTax("60000");
    setInvestmentDetails({ dps: "120000", securities: "0", fund: "20000", stocks: "0", insurance: "10000", provident: "0" });
  };

  return (
    <section className="scroll-mt-[120px] rounded-panel border border-[#e5e0d6] bg-[#fcfbf7] p-card-pad-sm sm:p-section-y lg:p-9" id="tax-calculator" aria-labelledby="tax-calculator-title">
      <CalculatorHeading chip="TAX YEAR · CURRENT" eyebrow="BANGLADESH / TAX TOOL" title="Personal income tax calculator" description="A clear estimate for your annual return, rebate and source tax." />

      <div className="mt-section-y flex items-end justify-between gap-cluster border-b border-[#e5e0d6] pb-3">
        <div>
          <h3 className="font-brand text-subheading text-[#171a26]">Calculation details</h3>
          <p className="mt-0.5 text-meta text-[#6b7487]">Annual amounts in ৳</p>
        </div>
        <span className="hidden text-right text-overline text-pink sm:block">AUTO-CALCULATED FIELDS</span>
      </div>

      <div className="mt-section-gap-lg grid gap-section-gap lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.56fr)] lg:gap-cluster-lg">
        <div className="flex min-w-0 flex-col gap-section-gap">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-cluster-sm">
              <h3 className="text-body-xs font-semibold text-[#171a26]">1. Taxpayer category</h3>
              <span className="text-meta text-[#6b7487]">Select one category</span>
            </div>
            <div className="mt-cluster-sm flex flex-wrap gap-cluster-sm">
              {taxCategories.map((option) => <ChoiceButton className="flex-1 sm:flex-none" key={option.value} onClick={() => setCategory(option.value)} selected={category === option.value}>{option.label}</ChoiceButton>)}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-cluster-sm">
              <h3 className="text-body-xs font-semibold text-[#171a26]">2. Annual income</h3>
              <span className="text-meta text-[#6b7487]">Salary, bonus &amp; benefits</span>
            </div>
            <div className="mt-cluster-sm">
              <MoneyInput id="gross-income" label="Gross salary with bonus and other benefits" helper="Annual amount before exemptions" onChange={setGrossIncome} value={grossIncome} />
            </div>
            <div className="mt-cluster-sm grid gap-cluster-sm sm:grid-cols-2">
              <div className="flex min-h-11 items-center justify-between gap-cluster-sm rounded-control bg-[#f7f7f9] px-3"><span className="text-meta text-[#6b7487]">Exempted income</span><strong className="text-button text-[#171a26]">{formatTaka(calculation.exempted)}</strong></div>
              <div className="flex min-h-11 items-center justify-between gap-cluster-sm rounded-control bg-[#f7f7f9] px-3"><span className="text-meta text-[#6b7487]">Total taxable income</span><strong className="text-button text-pink">{formatTaka(calculation.taxable)}</strong></div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-cluster-sm">
              <h3 className="text-body-xs font-semibold text-[#171a26]">3. Investment &amp; source tax</h3>
              <span className="text-meta text-[#6b7487]">Affects rebate and return settlement</span>
            </div>
            <div className="mt-cluster-sm grid gap-cluster sm:grid-cols-2">
              <MoneyInput compact id="actual-investment" label="Actual investment" onChange={setInvestment} value={investment} />
              <MoneyInput compact id="source-tax" label="Source tax / TDS" onChange={setSourceTax} value={sourceTax} />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-cluster-sm">
              <h3 className="text-button font-semibold text-[#171a26]">Detailed investment</h3>
              <span className="text-micro text-[#6b7487]">Optional rebate detail · syncs total</span>
            </div>
            <div className="mt-cluster-sm grid grid-cols-2 gap-cluster-sm sm:grid-cols-3">
              {investmentFields.map(([key, label]) => <DetailAmountInput id={`investment-${key}`} key={key} label={label} onChange={(value) => updateInvestmentDetail(key, value)} value={investmentDetails[key] ?? "0"} />)}
            </div>
          </div>

          <div className="flex flex-col gap-cluster-sm sm:flex-row">
            <ActionButton arrow="none" className="min-h-11 flex-1 justify-center rounded-control text-body-xs" onClick={() => undefined}>Calculate tax</ActionButton>
            <ActionButton arrow="none" className="min-h-11 justify-center rounded-control border-[#e5e0d6] bg-[#fcfbf7] px-6 text-body-xs" onClick={reset} variant="light">Reset</ActionButton>
          </div>
        </div>

        <aside className="min-w-0 rounded-card bg-[#fcfbf7] p-card-pad-sm">
          <div>
            <h3 className="text-body font-semibold text-[#171a26]">Live summary</h3>
            <p className="mt-0.5 text-micro text-[#6b7487]">Updates as you type</p>
          </div>
          <div className="mt-cluster rounded-control bg-[#121729] p-card-pad-sm text-white">
            <p className="text-overline text-white/60">ESTIMATE</p>
            <p className="mt-1 text-meta text-white/75">Net tax payable</p>
            <p className="mt-0.5 font-brand text-section-title">{formatTaka(calculation.payable)}</p>
            <div className="my-2 h-px bg-white/15" />
            <div className="flex items-center justify-between gap-cluster-sm text-micro"><span className="text-white/60">Refund indicator</span><strong>{formatTaka(calculation.refund)}</strong></div>
          </div>
          <h4 className="mt-cluster text-button font-semibold text-[#171a26]">Calculation breakdown</h4>
          <div className="mt-cluster-sm rounded-control border border-[#e5e0d6] bg-white p-3">
            <SummaryRow label="Gross income" value={formatTaka(calculation.gross)} />
            <SummaryRow label="Exempted income" value={formatTaka(calculation.exempted)} />
            <SummaryRow label="Taxable income" value={formatTaka(calculation.taxable)} accent />
            <SummaryRow label="Tax before rebate" value={formatTaka(calculation.beforeRebate)} />
            <SummaryRow label="Tax rebate" value={`– ${formatTaka(calculation.rebate)}`} accent />
            <SummaryRow label="Source tax" value={formatTaka(parseAmount(sourceTax))} />
            <div className="flex items-center justify-between gap-cluster-sm pt-2 text-micro font-semibold text-[#171a26]"><span>Payable with return</span><strong>{formatTaka(calculation.payable)}</strong></div>
          </div>
          <div className="mt-cluster-sm flex gap-cluster-sm rounded-control border border-[#e5e0d6] bg-white p-1">
            <span className="flex min-h-7 flex-1 items-center justify-center rounded-control bg-[#121729] text-micro font-semibold text-white">Summary</span>
            <a className="flex min-h-7 flex-1 items-center justify-center rounded-control text-micro font-medium text-[#6b7487] transition-colors hover:bg-[#f7f7f9] hover:text-[#171a26]" href="#tax-rules">Rules</a>
          </div>
        </aside>
      </div>

      <p className="mt-section-gap-lg text-nav-compact text-[#6b7487]" id="tax-rules">Estimate only. Verify current NBR rules, exemptions and rebate limits before filing.</p>
    </section>
  );
}

type VatBasis = "exclusive" | "inclusive";
type VatRate = "15" | "7.5" | "5" | "custom";

export function VatCalculator() {
  const [basis, setBasis] = useState<VatBasis>("exclusive");
  const [amountValue, setAmountValue] = useState("100000");
  const [taxYear, setTaxYear] = useState("current");
  const [supplyType, setSupplyType] = useState("general");
  const [ratePreset, setRatePreset] = useState<VatRate>("15");
  const [customRate, setCustomRate] = useState("15");

  const rate = ratePreset === "custom" ? parseAmount(customRate) : Number(ratePreset);
  const amount = parseAmount(amountValue);
  const calculation = useMemo(() => {
    const vatAmount = basis === "exclusive" ? amount * (rate / 100) : amount - amount / (1 + rate / 100);
    const netValue = basis === "exclusive" ? amount : amount - vatAmount;
    const totalValue = basis === "exclusive" ? amount + vatAmount : amount;
    return { vatAmount, netValue, totalValue };
  }, [amount, basis, rate]);

  const reset = () => {
    setBasis("exclusive");
    setAmountValue("100000");
    setTaxYear("current");
    setSupplyType("general");
    setRatePreset("15");
    setCustomRate("15");
  };

  return (
    <section className="scroll-mt-[120px] rounded-panel border border-[#e5e0d6] bg-[#fcfbf7] p-card-pad-sm sm:p-section-y lg:p-section-y" id="vat-calculator" aria-labelledby="vat-calculator-title">
      <CalculatorHeading chip="TAX YEAR · CURRENT" eyebrow="BANGLADESH / VAT TOOL" title="VAT calculator" description="Calculate VAT-inclusive or VAT-exclusive invoice totals." />

      <div className="mt-section-gap-lg rounded-card border border-[#e5e0d6] bg-white p-card-pad-sm sm:p-card-pad">
        <h3 className="font-brand text-subheading text-[#171a26]" id="vat-calculator-title">Invoice estimate</h3>
        <p className="mt-1 text-body-xs text-[#6b7487]">Set the amount basis, supply type and applicable rate.</p>

        <div className="mt-section-gap-lg grid grid-cols-2 gap-1 rounded-control border border-[#e5e0d6] bg-[#fcfbf7] p-1">
          <button aria-pressed={basis === "exclusive"} className={`min-h-9 rounded-control text-button font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${basis === "exclusive" ? "bg-pink text-white" : "text-[#171a26] hover:bg-white"}`.trim()} onClick={() => setBasis("exclusive")} type="button">VAT exclusive</button>
          <button aria-pressed={basis === "inclusive"} className={`min-h-9 rounded-control text-button font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${basis === "inclusive" ? "bg-pink text-white" : "text-[#171a26] hover:bg-white"}`.trim()} onClick={() => setBasis("inclusive")} type="button">VAT inclusive</button>
        </div>

        <div className="mt-cluster-sm grid gap-cluster sm:grid-cols-2">
          <label className="flex min-h-[52px] items-center gap-cluster-sm rounded-control border border-[#e5e0d6] bg-white px-3 py-2" htmlFor="vat-tax-year">
            <span className="min-w-0 flex-1"><span className="block text-overline text-[#6b7487]">TAX YEAR</span><select className="mt-0.5 w-full bg-transparent text-body-xs font-semibold text-[#171a26] outline-none" id="vat-tax-year" onChange={(event) => setTaxYear(event.target.value)} value={taxYear}><option value="current">Current (2026)</option><option value="2025-26">2025–26</option></select></span>
            <span className="text-body font-semibold text-[#6b7487]" aria-hidden="true">⌄</span>
          </label>
          <label className="flex min-h-[52px] items-center gap-cluster-sm rounded-control border border-[#e5e0d6] bg-white px-3 py-2" htmlFor="vat-supply-type">
            <span className="min-w-0 flex-1"><span className="block text-overline text-[#6b7487]">SUPPLY / SERVICE</span><select className="mt-0.5 w-full bg-transparent text-body-xs font-semibold text-[#171a26] outline-none" id="vat-supply-type" onChange={(event) => setSupplyType(event.target.value)} value={supplyType}><option value="general">General supply</option><option value="service">Professional service</option><option value="zero">Zero-rated supply</option></select></span>
            <span className="text-body font-semibold text-[#6b7487]" aria-hidden="true">⌄</span>
          </label>
        </div>

        <div className="mt-section-gap-lg">
          <MoneyInput id="vat-base-value" label="Base value" helper={basis === "exclusive" ? "Enter the amount before VAT" : "Enter the VAT-inclusive invoice total"} onChange={setAmountValue} value={amountValue} />
        </div>

        <div className="mt-section-gap-lg">
          <div className="flex flex-wrap items-center justify-between gap-cluster-sm"><h4 className="text-body-xs font-semibold text-[#171a26]">VAT rate</h4><span className="text-meta text-[#6b7487]">Select applicable rate</span></div>
          <div className="mt-cluster-sm grid grid-cols-2 gap-cluster-sm sm:grid-cols-4">
            {(["15", "7.5", "5", "custom"] as VatRate[]).map((option) => <ChoiceButton key={option} onClick={() => setRatePreset(option)} selected={ratePreset === option}>{option === "custom" ? "Custom" : `${option}%`}</ChoiceButton>)}
          </div>
          {ratePreset === "custom" ? <div className="mt-cluster-sm max-w-[240px]"><MoneyInput compact id="vat-custom-rate" label="Custom VAT rate" onChange={setCustomRate} value={customRate} /></div> : null}
          <p className="mt-cluster-sm text-meta text-[#6b7487]">Rates may vary by service or supply type.</p>
        </div>

        <div className="mt-section-gap-lg rounded-control bg-[#121729] px-4 py-3.5 text-white">
          <p className="text-overline text-white/70">CALCULATION BREAKDOWN</p>
          <div className="mt-cluster-sm space-y-1.5">
            <div className="flex items-center justify-between gap-cluster-sm text-body-xs"><span>Base value</span><strong className="text-white/85">{formatTaka(calculation.netValue)}</strong></div>
            <div className="flex items-center justify-between gap-cluster-sm text-body-xs"><span>VAT amount ({rate}%)</span><strong>{formatTaka(calculation.vatAmount)}</strong></div>
            <div className="mt-cluster-sm flex items-center justify-between gap-cluster-sm border-t border-white/15 pt-2 text-body-sm font-semibold"><span>Total value</span><strong className="text-body">{formatTaka(calculation.totalValue)}</strong></div>
          </div>
        </div>
        <p className="mt-cluster text-micro text-[#6b7487]">Confirm the applicable rate and Mushak-6.3 invoice requirements before issuing an invoice.</p>
        <div className="mt-cluster flex justify-end"><button className="text-meta font-semibold text-pink transition-colors hover:text-[#b83652]" onClick={reset} type="button">Reset calculator ↺</button></div>
      </div>
    </section>
  );
}
