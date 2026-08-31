"use client";

import { useState, type FormEvent } from "react";

import { ActionButton } from "./ui";

type ContactValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const initialValues: ContactValues = { name: "", phone: "", email: "", message: "" };

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
    <section className="flex min-h-0 flex-col gap-3.5 bg-page p-5 lg:grid lg:min-h-[620px] lg:grid-cols-[510px_minmax(0,1fr)] lg:gap-8 lg:rounded-[28px] lg:px-[42px] lg:py-10" id="contact" aria-labelledby="contact-title">
      <div className="min-h-0 rounded-[26px] bg-navy p-6 text-white lg:min-h-[540px] lg:p-[30px]">
        <p className="text-[11px] font-bold tracking-[1.4px] text-[#fac7cc]">LET&apos;S TALK</p>
        <h2 className="mt-[19px] max-w-[400px] text-[30px] font-bold leading-9 tracking-[-0.6px] lg:mt-[22px] lg:text-[34px] lg:leading-10">Tell us what you need next.</h2>
        <p className="mt-4 max-w-[388px] text-[15px] leading-[22px] text-[#bdc2d6]">Share a little context and we will guide you from there.</p>
        <div className="mt-10 h-px bg-[#383d52] lg:mt-[62px]" />
        <p className="mt-[30px] text-[11px] font-[550] text-[#bdc2d6]">Prefer a direct line?</p>
        <ActionButton href="#contact-form" variant="white" className="mt-4 w-[216px] min-h-11">Chat on WhatsApp</ActionButton>
        <div className="mt-[33px] flex flex-col gap-1.5">
          <span className="text-[9px] font-bold tracking-[1px] text-[#bdc2d6]">WHATSAPP</span>
          <strong className="text-[13px] font-semibold text-white">+880 1XXX XXXXXX</strong>
        </div>
        <div className="mt-7 flex flex-col gap-1.5">
          <span className="text-[9px] font-bold tracking-[1px] text-[#bdc2d6]">EMAIL</span>
          <strong className="text-[13px] font-semibold text-white">hello@yourbrand.com</strong>
        </div>
      </div>

      <form className="flex min-h-0 flex-col rounded-[26px] border border-border bg-white p-[22px] lg:min-h-[540px] lg:p-[27px]" id="contact-form" onSubmit={handleSubmit}>
        <h3 className="text-[23px] font-bold leading-7 text-ink">Start a conversation</h3>
        <p className="mt-[7px] text-[13px] leading-[18px] text-muted">We will get back to you with the next best step.</p>

        <label className="mt-[23px] flex min-h-[58px] flex-col gap-1 rounded-[14px] border border-border bg-cream px-3.5 pb-[7px] pt-2">
          <span className="text-[9px] font-[750] leading-3 tracking-[0.55px] text-muted">Your name</span>
          <input className="w-full min-w-0 bg-transparent p-0 text-[13px] leading-[17px] text-ink outline-none placeholder:text-ink" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="e.g. Ayesha Rahman" required />
        </label>
        <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-5">
          <label className="flex min-h-[58px] flex-col gap-1 rounded-[14px] border border-border bg-cream px-3.5 pb-[7px] pt-2">
            <span className="text-[9px] font-[750] leading-3 tracking-[0.55px] text-muted">WhatsApp or phone</span>
            <input className="w-full min-w-0 bg-transparent p-0 text-[13px] leading-[17px] text-ink outline-none placeholder:text-ink" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="+880" required />
          </label>
          <label className="flex min-h-[58px] flex-col gap-1 rounded-[14px] border border-border bg-cream px-3.5 pb-[7px] pt-2">
            <span className="text-[9px] font-[750] leading-3 tracking-[0.55px] text-muted">Email address</span>
            <input className="w-full min-w-0 bg-transparent p-0 text-[13px] leading-[17px] text-ink outline-none placeholder:text-ink" type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="you@example.com" required />
          </label>
        </div>
        <label className="mt-3.5 flex min-h-[108px] flex-col gap-1 rounded-[14px] border border-border bg-cream px-3.5 pb-[7px] pt-2">
          <span className="text-[9px] font-[750] leading-3 tracking-[0.55px] text-muted">What can we help with?</span>
          <textarea className="min-h-[58px] w-full min-w-0 resize-y bg-transparent p-0 text-[13px] leading-[17px] text-ink outline-none placeholder:text-ink" value={values.message} onChange={(event) => updateValue("message", event.target.value)} placeholder="Tell us briefly about your business or request." required />
        </label>
        <ActionButton type="submit" variant="dark" className="mt-[30px] min-h-[50px] w-full justify-center text-[13px]">{submitted ? "Inquiry sent" : "Send inquiry"}</ActionButton>
        <p className="mt-[25px] text-[11px] leading-[15px] text-muted">{submitted ? "Thanks — your details are ready for our team. We usually reply within one business day." : "Your details stay private. We usually reply within one business day."}</p>
      </form>
    </section>
  );
}
