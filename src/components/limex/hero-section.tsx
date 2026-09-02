import { ActionButton } from "./ui";
import { TopServices } from "./top-services";

export function HeroSection() {
  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-page lg:min-h-hero-home lg:rounded-[28px]" id="top" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          className="absolute left-[10%] top-[168px] block size-[360px] animate-hero-float lg:left-[33.4%] lg:top-[142px] lg:size-[441px]"
          src="/figma/warm-glow.svg"
          alt=""
        />
        <img
          className="absolute left-[42%] top-[208px] block size-[250px] animate-hero-float-reverse lg:left-[48.7%] lg:top-[184px] lg:size-[307px]"
          src="/figma/cool-glow.svg"
          alt=""
        />
        <img
          className="absolute left-[24%] top-[246px] block size-[280px] animate-hero-float-slow lg:left-[39.1%] lg:top-[223px] lg:size-[331px]"
          src="/figma/center-glow.svg"
          alt=""
        />
      </div>

      <div className="relative z-[1] shrink-0 px-5 pt-hero-content-top-separated text-center max-[560px]:pt-hero-content-top-separated-sm lg:absolute lg:left-1/2 lg:top-hero-content-top-separated-lg lg:w-[min(930px,calc(100%-48px))] lg:-translate-x-1/2 lg:px-0 lg:pt-0">
        <p className="mx-auto max-w-[500px] text-overline text-[#52545c] max-[560px]:hidden lg:max-w-none lg:text-kicker">
          BUSINESS REGISTRATION <span>·</span> <strong className="text-accent">TRADEMARK</strong> <span>·</span> LICENSE <span>·</span>{" "}
          <strong className="text-accent">VAT</strong> <span>·</span> STARTUP <span>·</span> <strong className="text-accent">TAX</strong>
        </p>
        <p className="mx-auto hidden max-w-[320px] text-meta font-display uppercase tracking-[0.1em] text-[#2b5e8c] max-[560px]:block">
          ONE PLACE FOR THE IMPORTANT WORK
        </p>
        <h1 className="my-5 flex flex-col font-brand text-hero-mobile text-ink max-[560px]:my-4 sm:text-hero-tablet wide:text-hero lg:my-hero-title-gap lg:mb-[22px]" id="hero-title">
          <span className="text-accent">Fastest Processing</span>
          <em className="font-normal not-italic text-[#576378] underline decoration-wavy decoration-[1px] underline-offset-[5px]">Guaranteed</em>
        </h1>
        <p className="mx-auto max-w-[520px] text-body-sm text-[#52545c] lg:max-w-[620px] lg:text-body">
          Company registration, VAT, tax, trademark and compliance support for ambitious businesses.
        </p>
        <div className="mt-hero-action-gap grid w-full max-w-[338px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 max-[380px]:grid-cols-1 lg:flex lg:max-w-none lg:items-center lg:justify-center lg:gap-nav lg:mt-hero-action-gap-lg">
          <ActionButton href="#services" variant="dark" arrow="text" className="min-h-control w-full min-w-0 justify-center gap-2 whitespace-nowrap border-[#14131a] bg-[#14131a] px-3 text-button text-white shadow-[0_10px_22px_rgba(20,19,26,0.12)] hover:border-[#25222e] hover:bg-[#25222e] hover:shadow-[0_14px_28px_rgba(20,19,26,0.16)] lg:h-button-lg lg:w-[185px] lg:gap-cluster-sm lg:px-[22px] lg:shadow-[0_12px_26px_rgba(20,19,26,0.14)] lg:hover:bg-[#25222e] lg:hover:shadow-[0_16px_32px_rgba(20,19,26,0.18)]">
            Explore services
          </ActionButton>
          <ActionButton href="#contact" variant="outline" arrow="none" className="min-h-control w-full min-w-0 justify-center whitespace-nowrap border-[#c9c0c4] bg-white/55 px-3 text-button text-ink shadow-none hover:border-accent hover:bg-white/75 hover:shadow-none lg:h-button-lg lg:w-[170px] lg:bg-white/85 lg:px-4 lg:shadow-[0_8px_20px_rgba(67,56,65,0.06)] lg:hover:bg-white lg:hover:shadow-[0_12px_24px_rgba(67,56,65,0.1)]">
            Talk to an expert
          </ActionButton>
        </div>
      </div>

      <div className="absolute right-[14px] top-[327px] z-[1] hidden h-[127px] w-[19px] items-center justify-center lg:flex" aria-hidden="true">
        <span className="whitespace-nowrap text-body font-strong text-[#52545c] [transform:rotate(-90deg)]">Connect with us</span>
      </div>

      <div className="relative z-[1] mx-5 mt-hero-lower-gap mb-hero-lower-bottom-sm min-w-0 lg:absolute lg:bottom-[12px] lg:left-[78px] lg:right-[78px] lg:mx-0 lg:mb-0 lg:mt-0">
        <TopServices />
      </div>
    </section>
  );
}
