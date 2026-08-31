"use client";

import { useMemo, useState } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });
const formatMoney = (value: number) => money.format(Math.max(0, Math.round(value))).replace("BDT", "৳");

const capitalOptions = [
  { label: "৳10 lakh (10,00,000)", value: 1_000_000, fee: 9_000 },
  { label: "৳50 lakh (50,00,000)", value: 5_000_000, fee: 24_000 },
  { label: "৳1 crore (1,00,00,000)", value: 10_000_000, fee: 47_158 },
  { label: "৳5 crore (5,00,00,000)", value: 50_000_000, fee: 119_000 },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-semibold uppercase tracking-[0.7px] text-muted">{children}</span>;
}

function NumberInput({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 flex h-11 items-center rounded-xl border border-border bg-cream px-3 focus-within:border-pink focus-within:ring-2 focus-within:ring-pink/10">
        <span className="mr-2 text-sm text-muted">৳</span>
        <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} />
        {suffix ? <span className="text-[10px] text-muted">{suffix}</span> : null}
      </div>
    </label>
  );
}

function LimitedCompanyCalculator() {
  const [capital, setCapital] = useState(capitalOptions[2].value);
  const [paidUp, setPaidUp] = useState(1_000_000);
  const [insideDhaka, setInsideDhaka] = useState(true);
  const [trademark, setTrademark] = useState(false);
  const [bin, setBin] = useState(false);
  const selectedCapital = capitalOptions.find((option) => option.value === capital) ?? capitalOptions[2];
  const tradeLicense = insideDhaka ? 5_000 : 3_000;
  const documentation = 10_000;
  const total = selectedCapital.fee + tradeLicense + documentation + (trademark ? 12_000 : 0) + (bin ? 4_000 : 0);

  return (
    <section className="overflow-hidden rounded-[28px] border border-warm bg-[#f9f8f5]" id="limited-company">
      <div className="grid gap-8 bg-[#f9f8f5] p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div className="flex flex-col justify-center">
          <p className="text-label text-[#c74d63]">BUSINESSBOX / LIMITED COMPANY</p>
          <h1 className="mt-3 max-w-[720px] text-[clamp(34px,4vw,54px)] font-bold leading-[1.05] tracking-[-2px] text-ink">Calculate your limited company registration cost</h1>
          <p className="mt-4 max-w-[640px] text-[16px] leading-6 text-muted">Set your capital, location and optional services to get a clear estimate before you apply.</p>
          <p className="mt-4 text-[12px] font-medium text-muted">Government fee, documentation charge, Trade License and add-ons shown separately.</p>
        </div>
        <div className="rounded-[24px] bg-[#173838] p-6 text-white">
          <p className="text-[10px] font-bold tracking-[1.3px] text-[#c7e5e0]">CALCULATOR SCOPE</p>
          <h2 className="mt-3 text-[22px] font-bold">One transparent estimate</h2>
          <p className="mt-2 text-[12px] leading-5 text-[#c7e5e0]">RJSC fee, documentation, Trade License and optional services in one view.</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[#1f4a4a] p-3"><strong className="block text-xl">{capitalOptions.length}</strong><span className="text-[10px] text-[#c7e5e0]">capital brackets</span></div>
            <div className="rounded-xl bg-[#1f4a4a] p-3"><strong className="block text-xl">2</strong><span className="text-[10px] text-[#c7e5e0]">optional add-ons</span></div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 bg-[#fbfaf6] p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="rounded-[24px] bg-white p-5 sm:p-6">
          <p className="text-label text-[#c74d63]">LIVE COST BUILDER</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Build your estimate</h2>
          <p className="mt-1 text-[12px] text-muted">Choose each value to refresh the estimate.</p>
          <div className="mt-6 space-y-5">
            <div>
              <FieldLabel>01 / Authorized capital</FieldLabel>
              <select className="mt-2 h-11 w-full rounded-xl border border-[#ebc4c9] bg-cream px-3 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-pink/10" value={capital} onChange={(event) => setCapital(Number(event.target.value))}>
                {capitalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="mt-1.5 text-[10px] text-muted">RJSC government fee: <strong className="text-[#c74d63]">{formatMoney(selectedCapital.fee)}</strong></p>
            </div>
            <NumberInput label="02 / Paid-up capital" value={paidUp} onChange={setPaidUp} suffix="optional" />
            <div>
              <FieldLabel>03 / Business location</FieldLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[true, false].map((value) => <button className={`rounded-xl border px-3 py-3 text-left text-[12px] font-semibold transition-colors ${insideDhaka === value ? "border-[#ebc4c9] bg-[#fbeced] text-ink" : "border-border bg-white text-muted"}`} key={String(value)} type="button" onClick={() => setInsideDhaka(value)}><span className={`mr-2 inline-block size-3 rounded-full border align-[-1px] ${insideDhaka === value ? "border-[#c74d63] bg-[#c74d63] ring-2 ring-white ring-inset" : "border-border"}`} />{value ? "Inside Dhaka City Corporation" : "Outside Dhaka City Corporation"}</button>)}
              </div>
            </div>
            <div>
              <FieldLabel>04 / Optional add-ons</FieldLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[{ label: "Trademark registration", value: trademark, set: setTrademark, price: 12_000 }, { label: "BIN registration", value: bin, set: setBin, price: 4_000 }].map((option) => <button className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-3 text-left text-[12px] font-semibold text-ink" key={option.label} type="button" onClick={() => option.set(!option.value)}><span><span className={`mr-2 inline-grid size-4 place-items-center rounded border text-[11px] ${option.value ? "border-[#c74d63] bg-[#c74d63] text-white" : "border-border"}`}>{option.value ? "✓" : ""}</span>{option.label}</span><span className="text-[10px] text-muted">+ {formatMoney(option.price)}</span></button>)}
              </div>
            </div>
          </div>
        </div>
        <aside className="rounded-[24px] bg-white p-5 sm:p-6">
          <p className="text-label text-[#c74d63]">ESTIMATE SUMMARY</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Your estimate</h2>
          <dl className="mt-6 divide-y divide-border text-[13px]">
            <div className="flex justify-between py-3"><dt className="text-muted">RJSC government fee</dt><dd className="font-bold text-ink">{formatMoney(selectedCapital.fee)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-muted">Documentation &amp; service</dt><dd className="font-bold text-ink">{formatMoney(documentation)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-muted">Trade License fee</dt><dd className="font-bold text-ink">{formatMoney(tradeLicense)}</dd></div>
            {trademark ? <div className="flex justify-between py-3"><dt className="text-muted">Trademark add-on</dt><dd className="font-bold text-ink">{formatMoney(12_000)}</dd></div> : null}
            {bin ? <div className="flex justify-between py-3"><dt className="text-muted">BIN add-on</dt><dd className="font-bold text-ink">{formatMoney(4_000)}</dd></div> : null}
          </dl>
          <div className="mt-4 rounded-2xl bg-[#121729] p-5 text-white"><p className="text-[10px] uppercase tracking-[1px] text-[#c7e5e0]">Estimated total</p><p className="mt-2 text-3xl font-bold">{formatMoney(total)}</p><p className="mt-2 text-[10px] text-[#c7e5e0]">Paid-up capital: {formatMoney(paidUp)}</p></div>
          <a className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#121729] text-sm font-bold text-white transition-transform hover:-translate-y-0.5" href="#contact">Talk to an advisor <span className="ml-2 text-pink">↗</span></a>
        </aside>
      </div>
      <p className="bg-white px-5 py-4 text-[11px] leading-5 text-muted sm:px-12">Estimates are indicative and may vary by authority, document complexity and current government schedules. Confirm the final amount with an advisor before filing.</p>
    </section>
  );
}

function TaxCalculator() {
  const [income, setIncome] = useState(1_200_000);
  const [investment, setInvestment] = useState(100_000);
  const taxable = Math.max(0, income - 350_000 - Math.min(investment, income * 0.2));
  const tax = useMemo(() => taxable <= 350_000 ? 0 : taxable <= 650_000 ? (taxable - 350_000) * 0.05 : 15_000 + (taxable - 650_000) * 0.1, [taxable]);
  return <section className="rounded-[28px] border border-warm bg-[#fcfbf7] p-5 sm:p-7" id="tax"><div className="flex items-start justify-between gap-4"><div><p className="text-label text-pink">BANGLADESH / TAX TOOL</p><h2 className="mt-2 text-2xl font-bold text-ink">Income tax calculator</h2><p className="mt-1 text-[12px] text-muted">A quick estimate for planning your next filing.</p></div><span className="rounded-lg border border-border bg-white px-3 py-2 text-[9px] font-bold tracking-[0.6px] text-muted">TAX YEAR · CURRENT</span></div><div className="mt-6 grid gap-5 md:grid-cols-2"><div className="space-y-4 rounded-2xl bg-white p-4"><NumberInput label="Annual income" value={income} onChange={setIncome} /><NumberInput label="Eligible investment" value={investment} onChange={setInvestment} /><button className="h-11 w-full rounded-xl bg-[#121729] text-sm font-bold text-white" type="button">Calculate tax →</button></div><div className="rounded-2xl bg-[#121729] p-5 text-white"><p className="text-[10px] uppercase tracking-[1px] text-[#c7e5e0]">Estimated net tax</p><p className="mt-2 text-3xl font-bold">{formatMoney(tax)}</p><div className="mt-5 space-y-3 border-t border-white/20 pt-3 text-[12px]"><div className="flex justify-between"><span className="text-[#c7e5e0]">Taxable income</span><strong>{formatMoney(taxable)}</strong></div><div className="flex justify-between"><span className="text-[#c7e5e0]">Tax-free threshold</span><strong>{formatMoney(350_000)}</strong></div></div></div></div></section>;
}

function VatCalculator() {
  const [amount, setAmount] = useState(100_000);
  const [rate, setRate] = useState(15);
  const vat = amount * rate / 100;
  return <section className="rounded-[28px] border border-warm bg-[#fcfbf7] p-5 sm:p-7" id="vat"><div className="flex items-start justify-between gap-4"><div><p className="text-label text-pink">BANGLADESH / VAT TOOL</p><h2 className="mt-2 text-2xl font-bold text-ink">VAT calculator</h2><p className="mt-1 text-[12px] text-muted">Choose a rate and see the VAT amount instantly.</p></div><span className="rounded-lg border border-border bg-white px-3 py-2 text-[9px] font-bold tracking-[0.6px] text-muted">TAX YEAR · CURRENT</span></div><div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]"><div className="space-y-4 rounded-2xl bg-white p-4"><div className="grid gap-4 sm:grid-cols-2"><NumberInput label="Base value" value={amount} onChange={setAmount} /><label><FieldLabel>VAT rate</FieldLabel><select className="mt-2 h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm font-semibold text-ink outline-none" value={rate} onChange={(event) => setRate(Number(event.target.value))}><option value="15">15%</option><option value="7.5">7.5%</option><option value="0">0%</option></select></label></div><button className="h-11 w-full rounded-xl bg-[#121729] text-sm font-bold text-white" type="button">Calculate VAT →</button></div><div className="rounded-2xl bg-[#121729] p-5 text-white"><p className="text-[10px] uppercase tracking-[1px] text-[#c7e5e0]">VAT breakdown</p><div className="mt-4 space-y-3 text-[13px]"><div className="flex justify-between"><span className="text-[#c7e5e0]">Base value</span><strong>{formatMoney(amount)}</strong></div><div className="flex justify-between"><span className="text-[#c7e5e0]">VAT amount ({rate}%)</span><strong>{formatMoney(vat)}</strong></div><div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-base"><span>Total value</span><strong>{formatMoney(amount + vat)}</strong></div></div></div></div></section>;
}

export function CalculatorsPage() {
  return <main className="mx-auto grid min-w-0 grid-cols-1 gap-3 py-3 pb-4 lg:w-[min(1440px,calc(100%-40px))] lg:gap-8 lg:py-7 lg:pb-8 xl:w-[min(1440px,calc(100%-88px))]"><section className="relative overflow-visible rounded-[20px] bg-page px-5 pb-5 lg:rounded-[28px] lg:px-[42px] lg:pb-[42px]"><SiteHeader /><div className="pt-[104px] lg:pt-[112px]"><div className="mb-8"><p className="text-[12px] font-medium text-muted">Home <span className="px-1">/</span> Business tools</p><p className="mt-6 text-label text-pink">SMART TOOLS</p><h1 className="mt-2 max-w-[800px] text-[clamp(42px,5vw,68px)] font-bold leading-[1.02] tracking-[-3px] text-ink">Make the next decision easier.</h1><p className="mt-4 max-w-[680px] text-[17px] leading-7 text-muted">Practical Bangladesh-focused calculators for company formation, tax and VAT planning.</p></div><div className="space-y-6"><LimitedCompanyCalculator /><TaxCalculator /><VatCalculator /></div></div></section><SiteFooter /></main>;
}
