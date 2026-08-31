import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetailPage } from "@/components/limex/service-detail-page";
import { getServicePage, servicePages } from "@/components/limex/service-page-data";

type ServiceRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);

  return service
    ? { title: `${service.title} | Limex`, description: service.description }
    : { title: "Service | Limex" };
}

export default async function ServiceRoute({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = getServicePage(slug);

  if (!service) notFound();

  return <ServiceDetailPage service={service} />;
}
