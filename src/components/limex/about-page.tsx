import { AboutContactCta, AboutHero, AboutReelsSection, AboutTeamSection, AboutTrustStrip } from "./about-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AboutPage() {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass}>
        <SiteHeader />
        <div className={pageContentClass}>
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
