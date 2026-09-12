import type { Metadata } from "next";

import { ServicesPage } from "@/components/limex/services-page";

export const metadata: Metadata = {
  title: "Services | Limex",
  description: "Explore company registration, tax, trademark, compliance and business support services from Limex.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    title: "Services | Limex",
    description: "Explore company registration, tax, trademark, compliance and business support services from Limex.",
    url: "/services",
  },
};

export default async function ServicesRoute() {
  return <ServicesPage />;
}
