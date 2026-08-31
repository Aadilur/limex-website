import { AboutContactCta, AboutHero, AboutReelsSection, AboutTeamSection, AboutTrustStrip } from "./about-sections";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AboutPage() {
  return (
    <main className="mx-auto grid min-w-0 grid-cols-1 gap-3 py-3 pb-4 lg:w-[min(1440px,calc(100%-40px))] lg:gap-8 lg:py-7 lg:pb-8 xl:w-[min(1440px,calc(100%-88px))]">
      <section className="relative overflow-visible rounded-[20px] bg-page px-5 pb-5 lg:rounded-[28px] lg:px-[42px] lg:pb-[42px]">
        <SiteHeader />
        <div className="pt-[104px] lg:pt-[112px]">
          <AboutHero />
          <AboutTrustStrip />
          <AboutTeamSection />
          <AboutReelsSection />
          <AboutContactCta />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
