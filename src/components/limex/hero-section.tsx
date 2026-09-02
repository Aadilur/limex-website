import { ActionButton } from "./ui";

export function HeroSection() {
  return (
    <section className="relative flex min-h-hero-home-mobile flex-col overflow-hidden rounded-[20px] bg-page lg:min-h-hero-home lg:rounded-[28px]" id="top" aria-labelledby="hero-title">
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
        <div className="mt-hero-action-gap grid w-full max-w-[338px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 lg:flex lg:max-w-none lg:items-center lg:justify-center lg:gap-nav lg:mt-hero-action-gap-lg">
          <ActionButton href="#services" variant="ghost" arrow="text" className="min-h-control w-full min-w-0 gap-1.5 whitespace-nowrap border-[#14131a]/35 px-2.5 text-button text-ink shadow-none hover:border-[#14131a] hover:bg-transparent hover:shadow-none lg:h-button-lg lg:w-[185px] lg:gap-cluster-sm lg:border-[#14131a] lg:bg-[#14131a] lg:px-[22px] lg:text-button lg:text-white lg:shadow-[0_12px_26px_rgba(20,19,26,0.14)] lg:hover:bg-[#25222e] lg:hover:shadow-[0_16px_32px_rgba(20,19,26,0.18)]">
            Explore services
          </ActionButton>
          <ActionButton href="#contact" variant="ghost-muted" arrow="none" className="min-h-control w-full min-w-0 justify-center whitespace-nowrap px-2.5 text-button shadow-none hover:border-accent hover:bg-transparent hover:shadow-none lg:h-button-lg lg:w-[170px] lg:border-[#c9c0c4] lg:bg-white/85 lg:px-4 lg:text-button lg:shadow-[0_8px_20px_rgba(67,56,65,0.06)] lg:hover:bg-white lg:hover:shadow-[0_12px_24px_rgba(67,56,65,0.1)]">
            Talk to an expert
          </ActionButton>
        </div>
      </div>

      <div className="absolute right-[14px] top-[327px] z-[1] hidden h-[127px] w-[19px] items-center justify-center lg:flex" aria-hidden="true">
        <span className="whitespace-nowrap text-body font-strong text-[#52545c] [transform:rotate(-90deg)]">Connect with us</span>
      </div>

      <div className="relative z-[1] mx-5 mt-auto mb-hero-lower-bottom-sm grid min-w-0 grid-cols-2 items-end gap-section-gap max-[900px]:flex max-[900px]:justify-end max-[900px]:gap-0 lg:absolute lg:bottom-[12px] lg:left-[78px] lg:right-[78px] lg:mx-0 lg:mb-0 lg:mt-0 lg:grid-cols-3 lg:gap-section-gap-xl">
        <div className="flex min-w-0 max-w-none flex-col gap-cluster-sm max-[900px]:hidden lg:max-w-[360px]">
          <p className="text-micro font-bold text-[#78787d]">ONE PLACE FOR THE IMPORTANT WORK</p>
          <p className="text-body font-text text-ink">From company setup to brand protection, get clear guidance at every step.</p>
        </div>
        <p className="min-w-0 pb-1 text-center text-meta text-[#52545c] max-[900px]:hidden">Clear process. Practical support. No unnecessary complexity.</p>
        <a className="group flex min-w-0 shrink-0 items-center justify-start gap-cluster-sm text-ink transition-all duration-200 hover:-translate-y-0.5 hover:text-[#1b805c] max-[900px]:justify-self-end max-[900px]:gap-2 max-[900px]:rounded-none max-[900px]:border-0 max-[900px]:bg-transparent max-[900px]:px-0 max-[900px]:py-0 max-[900px]:shadow-none max-[900px]:hover:bg-transparent max-[900px]:hover:shadow-none lg:justify-self-end" href="#contact-form" aria-label="Open the contact form">
          <span className="order-2 flex min-w-0 max-w-[128px] flex-col gap-cluster-sm text-left max-[900px]:max-w-none lg:order-1 lg:items-end lg:text-right">
            <strong className="whitespace-nowrap text-body-sm font-bold max-[900px]:text-button">Contact us</strong>
            <span className="text-meta text-[#52545c] max-[900px]:hidden">Start a conversation</span>
          </span>
          <span className="relative order-1 block size-[46px] shrink-0 transition-transform duration-200 group-hover:rotate-2 group-hover:scale-[1.04] lg:order-2 lg:size-[68px]">
            <img className="absolute inset-0 size-full" src="/figma/contact-circle.svg" alt="" aria-hidden="true" />
            <span className="absolute inset-0 m-auto grid size-6 place-items-center lg:size-[30px]">
              <img className="absolute inset-0 size-full" src="/figma/contact-dot.svg" alt="" aria-hidden="true" />
              <span className="relative z-[1] text-icon-action font-bold text-white">↗</span>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
