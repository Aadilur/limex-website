import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetailPage } from "@/components/limex/service-detail-page";
import { getPublicServiceServer } from "@/lib/service-server";

type ServiceRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicServiceServer(slug);

  return service
    ? {
      title: `${service.title} | Limex`,
      description: service.description,
      alternates: { canonical: `/services/${service.slug}` },
      openGraph: { type: "website", title: `${service.title} | Limex`, description: service.description, url: `/services/${service.slug}` },
    }
    : { title: "Service | Limex" };
}

export default async function ServiceRoute({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = await getPublicServiceServer(slug);

  if (!service) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.category,
    url: `${baseUrl}/services/${service.slug}`,
    provider: { "@type": "Organization", name: "Limex" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <ServiceDetailPage service={service} />
    </>
  );
}
