"use client";

import { useState, type FormEvent } from "react";

import { ActionButton, WaveLabel } from "./ui";

type ContactValues = {
  name: string;
  phone: string;
  message: string;
};

const initialValues: ContactValues = { name: "", phone: "", message: "" };
const fieldLabelClassName = "flex flex-col gap-2.5";
const fieldLabelTextClassName = "text-body-xs font-semibold text-[#34443a]";
const fieldControlClassName = "w-full min-w-0 rounded-[14px] border-2 border-[#a4a39b] bg-page text-body-sm text-[#172019] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(54,54,49,0.06)] outline-none placeholder:text-[#686a64] transition-colors hover:border-[#8f9089] focus:border-[#3f6b50] focus:bg-page focus:ring-4 focus:ring-[#d8e8dc]";

export function ContactSection() {
  const [values, setValues] = useState<ContactValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const updateValue = (field: keyof ContactValues, value: string) => {
    setSubmitted(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="flex min-h-0 flex-col gap-cluster-sm bg-page p-page-gutter lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-cluster-lg lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg" id="contact" aria-labelledby="contact-title">
      <div className="flex min-h-0 flex-col lg:min-h-[480px] lg:py-2">
        <div className="max-w-[400px]">
          <WaveLabel className="text-[#52705b]">LET&apos;S TALK</WaveLabel>
          <h2 className="mt-section-gap-lg font-brand text-section-title-mobile text-ink lg:mt-section-gap-lg lg:text-section-title" id="contact-title">Bring us the question. Leave with a plan.</h2>
          <p className="mt-cluster-lg max-w-[388px] text-body-sm text-muted">Tell us what you&apos;re building, fixing or protecting.</p>
        </div>

        <div className="relative mt-section-gap-xl max-w-[360px] border-l border-[#cfdad1] pl-4">
          <p className="text-overline text-[#52705b]">START HERE</p>
          <p className="mt-cluster-sm max-w-[270px] text-body-xs text-muted">From first question to final filing.</p>
        </div>

        <div className="relative mt-auto border-t border-[#cfdad1] pt-section-gap-lg">
          <p className="text-body-xs font-text text-muted">Prefer a direct line?</p>
          <ActionButton href="#contact-form" variant="dark" className="mt-cluster w-max min-h-11 bg-[#22372a] hover:bg-[#2d4937]">Chat on WhatsApp</ActionButton>
          <div className="mt-section-gap-lg grid grid-cols-1 gap-cluster-lg sm:grid-cols-2">
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-[#52705b]">WHATSAPP</span>
              <strong className="text-body-sm font-semibold text-ink">+880 1XXX XXXXXX</strong>
            </div>
            <div className="flex flex-col gap-cluster-sm">
              <span className="text-overline text-[#52705b]">EMAIL</span>
              <strong className="whitespace-nowrap text-body-sm font-semibold text-ink">hello@yourbrand.com</strong>
            </div>
          </div>
        </div>
      </div>

      <form className="relative flex min-h-0 flex-col rounded-[24px] border border-[#c8c6be] bg-page p-card-pad-sm shadow-[0_12px_30px_rgba(42,44,39,0.04)] lg:min-h-[480px] lg:p-[32px]" id="contact-form" aria-labelledby="contact-form-title" onSubmit={handleSubmit}>
        <span className="pointer-events-none absolute left-4 top-0 h-1 w-14 rounded-b-full bg-[#8cae95] lg:left-8" aria-hidden="true" />
        <div className="border-b border-[#d3d0c8] pb-section-gap-lg">
          <p className="text-overline text-[#52705b]">YOUR DETAILS</p>
          <h3 className="mt-2 font-brand text-subheading text-ink" id="contact-form-title">Start with the essentials.</h3>
          <p className="mt-cluster-xs text-body-xs text-muted">Share a little context and we&apos;ll guide you from there.</p>
        </div>

        <div className="mt-section-gap-lg flex flex-col gap-cluster">
          <div className="grid grid-cols-1 gap-cluster lg:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Name</span>
              <input className={`h-12 ${fieldControlClassName} px-3.5`} autoComplete="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="Your name" required />
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldLabelTextClassName}>Phone / WhatsApp</span>
              <input className={`h-12 ${fieldControlClassName} px-3.5`} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="+880 1XXX XXXXXX" required />
            </label>
          </div>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelTextClassName}>What can we help with?</span>
            <textarea className={`min-h-[104px] ${fieldControlClassName} resize-y px-3.5 py-3`} value={values.message} onChange={(event) => updateValue("message", event.target.value)} placeholder="A few words about your goal." required />
          </label>
        </div>

        <div className="mt-auto pt-section-gap-lg">
          <button className="group flex h-12 w-full items-center justify-between rounded-[14px] border border-[#22372a] bg-[#22372a] px-5 text-button font-strong text-white shadow-[0_8px_16px_rgba(34,55,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2d4937] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#6e947b] focus-visible:outline-offset-3" type="submit">
            <span>{submitted ? "Message sent" : "Send message"}</span>
            <span className="text-icon-action transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">{submitted ? "✓" : "↗"}</span>
          </button>
          <p className="mt-cluster text-body-xs text-muted/70" aria-live="polite">{submitted ? "Thanks — we’ll reply within one business day." : "Your details stay private."}</p>
        </div>
      </form>
    </section>
  );
}
