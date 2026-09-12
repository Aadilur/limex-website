import type { ServicePageContent } from "./service-page-data";
import type { PublicServiceDetail } from "@/lib/service-types";
import { ServiceContactSection, ServiceFaqSection, ServiceHeroSection, ServiceOverviewSection, ServicePricingSection } from "./service-page-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

function toPageContent(service: ServicePageContent | PublicServiceDetail): ServicePageContent {
  if (!("detail" in service)) return service;

  return {
    ...service.detail,
    slug: service.slug,
    breadcrumb: `Home / Services / ${service.title}`,
    category: service.category.toUpperCase(),
    title: service.title,
    description: service.description,
    destination: service.destination,
    relatedLinks: service.children,
  };
}

export function ServiceDetailPage({ service }: { service: ServicePageContent | PublicServiceDetail }) {
  const pageContent = toPageContent(service);

  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <ServiceHeroSection service={pageContent} />
          <ServiceOverviewSection service={pageContent} />
          <ServicePricingSection service={pageContent} />
          <ServiceFaqSection service={pageContent} />
          <ServiceContactSection service={pageContent} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
