import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetailPage } from "@/components/limex/service-detail-page";
import { getPublicServiceServer } from "@/lib/service-server";
import { generatedServices } from "@/lib/service-content";

type ServiceRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return generatedServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicServiceServer(slug, "bn");

  return service
    ? {
      title: `${service.title} | Limex`,
      description: service.description,
      alternates: { canonical: `/bn/services/${service.slug}` },
      openGraph: { type: "website", title: `${service.title} | Limex`, description: service.description, url: `/bn/services/${service.slug}` },
    }
    : { title: "সেবা | Limex" };
}

export default async function BanglaServiceRoute({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = await getPublicServiceServer(slug, "bn");

  if (!service) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.category,
    inLanguage: "bn-BD",
    url: `${baseUrl}/bn/services/${service.slug}`,
    provider: { "@type": "Organization", name: "Limex" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <ServiceDetailPage service={service} locale="bn" />
    </>
  );
}
