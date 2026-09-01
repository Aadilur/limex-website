import { SiteHeader } from "./site-header";
import { ActionButton } from "./ui";

export function HeroSection() {
  return (
    <section className="relative min-h-[805px] overflow-hidden rounded-[20px] bg-page lg:min-h-[780px] lg:rounded-[28px]" id="top" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          className="absolute left-[10%] top-[252px] block size-[360px] animate-hero-float lg:left-[33.4%] lg:top-[209px] lg:size-[441px]"
          src="/figma/warm-glow.svg"
          alt=""
        />
        <img
          className="absolute left-[42%] top-[292px] block size-[250px] animate-hero-float-reverse lg:left-[48.7%] lg:top-[253px] lg:size-[307px]"
          src="/figma/cool-glow.svg"
          alt=""
        />
        <img
          className="absolute left-[24%] top-[330px] block size-[280px] animate-hero-float-slow lg:left-[39.1%] lg:top-[292px] lg:size-[331px]"
          src="/figma/center-glow.svg"
          alt=""
        />
      </div>

      <SiteHeader />

      <div className="absolute left-5 right-5 top-hero-rule-top h-px bg-[rgba(219,209,189,0.65)] lg:left-[42px] lg:right-[42px] lg:top-hero-rule-top-lg" aria-hidden="true" />

      <div className="relative z-[1] px-5 pt-hero-content-top text-center max-[560px]:pt-hero-content-top-sm lg:absolute lg:left-1/2 lg:top-[201px] lg:w-[min(930px,calc(100%-48px))] lg:-translate-x-1/2 lg:px-0 lg:pt-0">
        <p className="mx-auto max-w-[500px] text-overline text-[#52545c] lg:max-w-none lg:text-kicker">
          BUSINESS REGISTRATION <span>·</span> <strong className="text-[#de4d73]">TRADEMARK</strong> <span>·</span> LICENSE <span>·</span>{" "}
          <strong className="text-[#de4d73]">VAT</strong> <span>·</span> STARTUP <span>·</span> <strong className="text-[#de4d73]">TAX</strong>
        </p>
        <h1 className="my-5 flex flex-col font-brand text-hero text-ink max-[560px]:text-hero-mobile lg:my-hero-title-gap lg:mb-[22px]" id="hero-title">
          <span className="text-[#de4d73]">Fastest Processing</span>
          <em className="font-normal not-italic text-[#576378] underline decoration-wavy decoration-[1px] underline-offset-[5px]">Guaranteed</em>
        </h1>
        <p className="mx-auto max-w-[520px] text-body-sm text-[#52545c] lg:max-w-[620px] lg:text-body">
          Company registration, VAT, tax, trademark and compliance support for ambitious businesses.
        </p>
        <div className="mt-hero-action-gap flex flex-col items-center justify-center gap-nav lg:mt-hero-action-gap-lg lg:flex-row">
          <ActionButton href="#services" variant="dark" arrow="cta" className="h-[52px] w-[min(100%,250px)] pl-[22px] lg:w-[185px]">
            Explore services
          </ActionButton>
          <ActionButton href="#contact" variant="outline" arrow="none" className="h-[52px] w-[min(100%,250px)] justify-center lg:w-[170px]">
            Talk to an expert
          </ActionButton>
        </div>
      </div>

      <div className="absolute right-[14px] top-[327px] z-[1] hidden h-[127px] w-[19px] items-center justify-center lg:flex" aria-hidden="true">
        <span className="whitespace-nowrap text-body font-strong text-[#52545c] [transform:rotate(-90deg)]">Connect with us</span>
      </div>

      <div className="relative z-[1] mx-5 mt-hero-bottom grid grid-cols-2 items-end gap-section-gap max-[560px]:mt-hero-bottom-sm max-[560px]:grid-cols-1 max-[560px]:gap-section-gap-lg lg:absolute lg:bottom-[56px] lg:left-[78px] lg:right-[78px] lg:mx-0 lg:mt-0 lg:grid-cols-3 lg:gap-section-gap-xl">
        <div className="flex max-w-none flex-col gap-[14px] lg:max-w-[360px]">
          <p className="text-micro font-bold text-[#78787d]">ONE PLACE FOR THE IMPORTANT WORK</p>
          <p className="text-body font-text text-ink">From starting a company to protecting your brand, get clear guidance at every step.</p>
          <a className="text-body-xs font-bold text-ink transition-colors hover:text-pink" href="#services">
            View all services <span className="ml-[5px] text-pink" aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="pb-1 text-center text-meta text-[#52545c] max-[900px]:hidden">Clear process. Practical support. No unnecessary complexity.</p>
        <a className="flex items-center justify-start gap-nav text-ink lg:justify-end" href="#contact">
          <span className="order-2 flex flex-col gap-cluster-sm text-left max-[900px]:items-start max-[560px]:text-left lg:order-1 lg:items-end lg:text-right">
            <strong className="text-body-sm font-bold">WhatsApp</strong>
            <span className="text-meta text-[#52545c]">Start a conversation</span>
          </span>
          <span className="relative order-1 block size-[62px] transition-transform duration-200 hover:rotate-2 hover:scale-[1.04] lg:order-2 lg:size-[76px]">
            <img className="absolute inset-0 size-full" src="/figma/contact-circle.svg" alt="" aria-hidden="true" />
            <span className="absolute left-[19px] top-[19px] grid size-6 place-items-center lg:left-[23px] lg:top-[23px] lg:size-[30px]">
              <img className="absolute inset-0 size-full" src="/figma/contact-dot.svg" alt="" aria-hidden="true" />
              <span className="relative z-[1] text-nav-compact font-display text-white">WA</span>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
