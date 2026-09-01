import type { ServicePageContent } from "./service-page-data";
import { ServiceContactSection, ServiceFaqSection, ServiceHeroSection, ServiceOverviewSection, ServicePricingSection } from "./service-page-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function ServiceDetailPage({ service }: { service: ServicePageContent }) {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader />
        <div className={pageContentClass}>
          <ServiceHeroSection service={service} />
          <ServiceOverviewSection service={service} />
          <ServicePricingSection service={service} />
          <ServiceFaqSection service={service} />
          <ServiceContactSection service={service} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
