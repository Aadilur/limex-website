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
    <section className="flex min-h-0 flex-col gap-cluster-sm bg-page p-page-gutter lg:grid lg:min-h-[620px] lg:grid-cols-[510px_minmax(0,1fr)] lg:gap-cluster-lg lg:rounded-panel lg:px-page-gutter-lg lg:py-10" id="contact" aria-labelledby="contact-title">
      <div className="min-h-0 rounded-card bg-navy p-card-pad text-white lg:min-h-[540px] lg:p-[30px]">
        <p className="text-label text-[#fac7cc]">LET&apos;S TALK</p>
        <h2 className="mt-section-gap-lg max-w-[400px] font-brand text-page-title lg:mt-section-gap-lg">Tell us what you need next.</h2>
        <p className="mt-cluster-lg max-w-[388px] text-body-sm text-[#bdc2d6]">Share a little context and we will guide you from there.</p>
        <div className="mt-section-y h-px bg-[#383d52] lg:mt-section-gap-xl" />
        <p className="mt-section-gap-lg text-meta font-text text-[#bdc2d6]">Prefer a direct line?</p>
        <ActionButton href="#contact-form" variant="white" className="mt-4 w-[216px] min-h-11">Chat on WhatsApp</ActionButton>
        <div className="mt-section-gap-xl flex flex-col gap-cluster-sm">
          <span className="text-overline text-[#bdc2d6]">WHATSAPP</span>
          <strong className="text-body-xs font-semibold text-white">+880 1XXX XXXXXX</strong>
        </div>
        <div className="mt-section-y flex flex-col gap-cluster-sm">
          <span className="text-overline text-[#bdc2d6]">EMAIL</span>
          <strong className="text-body-xs font-semibold text-white">hello@yourbrand.com</strong>
        </div>
      </div>

      <form className="flex min-h-0 flex-col rounded-card border border-border bg-white p-card-pad-sm lg:min-h-[540px] lg:p-card-pad" id="contact-form" onSubmit={handleSubmit}>
        <h3 className="font-brand text-subheading text-ink">Start a conversation</h3>
        <p className="mt-cluster-xs text-body-xs text-muted">We will get back to you with the next best step.</p>

        <label className="mt-section-gap-lg flex min-h-[58px] flex-col gap-1 rounded-control border border-border bg-cream px-3.5 pb-[7px] pt-2">
          <span className="text-overline text-muted">Your name</span>
          <input className="w-full min-w-0 bg-transparent p-0 text-body-xs text-ink outline-none placeholder:text-ink" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="e.g. Ayesha Rahman" required />
        </label>
        <div className="mt-cluster-lg grid grid-cols-1 gap-cluster-lg lg:grid-cols-2">
          <label className="flex min-h-[58px] flex-col gap-1 rounded-control border border-border bg-cream px-3.5 pb-[7px] pt-2">
            <span className="text-overline text-muted">WhatsApp or phone</span>
            <input className="w-full min-w-0 bg-transparent p-0 text-body-xs text-ink outline-none placeholder:text-ink" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="+880" required />
          </label>
          <label className="flex min-h-[58px] flex-col gap-1 rounded-control border border-border bg-cream px-3.5 pb-[7px] pt-2">
            <span className="text-overline text-muted">Email address</span>
            <input className="w-full min-w-0 bg-transparent p-0 text-body-xs text-ink outline-none placeholder:text-ink" type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="you@example.com" required />
          </label>
        </div>
        <label className="mt-cluster-lg flex min-h-[108px] flex-col gap-1 rounded-control border border-border bg-cream px-3.5 pb-[7px] pt-2">
          <span className="text-overline text-muted">What can we help with?</span>
          <textarea className="min-h-[58px] w-full min-w-0 resize-y bg-transparent p-0 text-body-xs text-ink outline-none placeholder:text-ink" value={values.message} onChange={(event) => updateValue("message", event.target.value)} placeholder="Tell us briefly about your business or request." required />
        </label>
        <ActionButton type="submit" variant="dark" className="mt-section-gap-lg min-h-[50px] w-full justify-center text-body-xs">{submitted ? "Inquiry sent" : "Send inquiry"}</ActionButton>
        <p className="mt-section-gap-lg text-meta text-muted">{submitted ? "Thanks — your details are ready for our team. We usually reply within one business day." : "Your details stay private. We usually reply within one business day."}</p>
      </form>
    </section>
  );
}
