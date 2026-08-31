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

      <div className="absolute left-5 right-5 top-[98px] h-px bg-[rgba(219,209,189,0.65)] lg:left-[42px] lg:right-[42px] lg:top-[112px]" aria-hidden="true" />

      <div className="relative z-[1] px-5 pt-[166px] text-center max-[560px]:pt-[154px] lg:absolute lg:left-1/2 lg:top-[201px] lg:w-[min(930px,calc(100%-48px))] lg:-translate-x-1/2 lg:px-0 lg:pt-0">
        <p className="mx-auto max-w-[500px] text-[11px] font-extrabold leading-4 text-[#52545c] lg:max-w-none lg:text-kicker">
          BUSINESS REGISTRATION <span>·</span> <strong className="text-[#de4d73]">TRADEMARK</strong> <span>·</span> LICENSE <span>·</span>{" "}
          <strong className="text-[#de4d73]">VAT</strong> <span>·</span> STARTUP <span>·</span> <strong className="text-[#de4d73]">TAX</strong>
        </p>
        <h1 className="my-5 flex flex-col text-display text-ink max-[560px]:text-[45px] max-[560px]:tracking-[-2.3px] lg:my-[14px] lg:mb-[22px]" id="hero-title">
          <span className="text-[#de4d73]">Fastest Processing</span>
          <em className="font-normal not-italic text-[#576378] underline decoration-wavy decoration-[1px] underline-offset-[5px]">Guaranteed</em>
        </h1>
        <p className="mx-auto max-w-[520px] text-[15px] leading-[21px] text-[#52545c] lg:max-w-[620px] lg:text-body">
          Company registration, VAT, tax, trademark and compliance support for ambitious businesses.
        </p>
        <div className="mt-[23px] flex flex-col items-center justify-center gap-[13px] lg:mt-[27px] lg:flex-row">
          <ActionButton href="#services" variant="dark" arrow="cta" className="h-[52px] w-[min(100%,250px)] pl-[22px] lg:w-[185px]">
            Explore services
          </ActionButton>
          <ActionButton href="#contact" variant="outline" arrow="none" className="h-[52px] w-[min(100%,250px)] justify-center lg:w-[170px]">
            Talk to an expert
          </ActionButton>
        </div>
      </div>

      <div className="absolute right-[14px] top-[327px] z-[1] hidden h-[127px] w-[19px] items-center justify-center lg:flex" aria-hidden="true">
        <span className="whitespace-nowrap text-[16px] font-[650] text-[#52545c] [transform:rotate(-90deg)]">Connect with us</span>
      </div>

      <div className="relative z-[1] mx-5 mt-[82px] grid grid-cols-2 items-end gap-[25px] max-[560px]:mt-[58px] max-[560px]:grid-cols-1 max-[560px]:gap-[26px] lg:absolute lg:bottom-[56px] lg:left-[78px] lg:right-[78px] lg:mx-0 lg:mt-0 lg:grid-cols-3 lg:gap-[52px]">
        <div className="flex max-w-none flex-col gap-[14px] lg:max-w-[360px]">
          <p className="text-[10px] font-bold leading-[14px] tracking-[0.2px] text-[#78787d]">ONE PLACE FOR THE IMPORTANT WORK</p>
          <p className="text-[16px] font-[540] leading-[21px] text-ink">From starting a company to protecting your brand, get clear guidance at every step.</p>
          <a className="text-[13px] font-bold text-ink transition-colors hover:text-pink" href="#services">
            View all services <span className="ml-[5px] text-pink" aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="pb-1 text-center text-[11px] leading-[15px] text-[#52545c] max-[900px]:hidden">Clear process. Practical support. No unnecessary complexity.</p>
        <a className="flex items-center justify-start gap-[13px] text-ink lg:justify-end" href="#contact">
          <span className="order-2 flex flex-col gap-[7px] text-left max-[900px]:items-start max-[560px]:text-left lg:order-1 lg:items-end lg:text-right">
            <strong className="text-[14px] font-bold leading-[18px]">WhatsApp</strong>
            <span className="text-[11px] leading-4 text-[#52545c]">Start a conversation</span>
          </span>
          <span className="relative order-1 block size-[62px] transition-transform duration-200 hover:rotate-2 hover:scale-[1.04] lg:order-2 lg:size-[76px]">
            <img className="absolute inset-0 size-full" src="/figma/contact-circle.svg" alt="" aria-hidden="true" />
            <span className="absolute left-[19px] top-[19px] grid size-6 place-items-center lg:left-[23px] lg:top-[23px] lg:size-[30px]">
              <img className="absolute inset-0 size-full" src="/figma/contact-dot.svg" alt="" aria-hidden="true" />
              <span className="relative z-[1] text-[9px] font-extrabold text-white">WA</span>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
