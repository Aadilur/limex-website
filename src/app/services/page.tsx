import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/limex/service-detail-page";
import { trademarkRegistrationService } from "@/components/limex/service-page-data";

export const metadata: Metadata = {
  title: "Trademark Registration | Limex",
  description: "A clear, guided trademark registration service from Limex.",
};

export default function ServicesRoute() {
  return <ServiceDetailPage service={trademarkRegistrationService} />;
}
