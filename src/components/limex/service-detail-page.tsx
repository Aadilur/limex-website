import type { ServicePageContent } from "./service-page-data";
import type { PublicServiceDetail } from "@/lib/service-types";
import type { PublicContactSettings } from "@/lib/contact-types";
import { ServiceContactSection, ServiceFaqSection, ServiceHeroSection, ServiceOverviewSection, ServicePricingSection } from "./service-page-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

function toPageContent(service: ServicePageContent | PublicServiceDetail, locale: "en" | "bn"): ServicePageContent {
  if (!("detail" in service)) return { ...service, locale };

  return {
    ...service.detail,
    slug: service.slug,
    serviceKey: service.serviceKey,
    locale,
    breadcrumb: locale === "bn" ? `হোম / সেবাসমূহ / ${service.title}` : `Home / Services / ${service.title}`,
    breadcrumbItems: [
      { label: locale === "bn" ? "হোম" : "Home", href: "/" },
      { label: locale === "bn" ? "সেবাসমূহ" : "Services", href: locale === "bn" ? "/bn/services" : "/services" },
      { label: service.title },
    ],
    category: locale === "bn" ? service.category : service.category.toUpperCase(),
    title: service.title,
    description: service.description,
    destination: service.destination,
    relatedLinks: service.children,
    relatedOptions: service.detail.relatedOptions,
    relatedOptionsLabel: service.detail.relatedOptionsLabel,
    relatedOptionsTitle: service.detail.relatedOptionsTitle,
    relatedOptionsDescription: service.detail.relatedOptionsDescription,
  };
}

export function ServiceDetailPage({ service, locale = "en", contact }: { service: ServicePageContent | PublicServiceDetail; locale?: "en" | "bn"; contact?: PublicContactSettings | null }) {
  const pageContent = toPageContent(service, locale);

  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <ServiceHeroSection service={pageContent} />
          <ServiceOverviewSection service={pageContent} />
          <ServicePricingSection service={pageContent} contact={contact} />
          <ServiceFaqSection service={pageContent} />
          <ServiceContactSection service={pageContent} contact={contact} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
