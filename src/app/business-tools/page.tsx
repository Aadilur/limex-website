import type { Metadata } from "next";

import { BusinessToolsPage } from "@/components/limex/business-tools-page";

export const metadata: Metadata = {
  title: "Business Tools | Limex",
  description: "Bangladesh business calculators and document builders. Plan registration costs, estimate tax and VAT, and prepare agreements with Limex.",
};

export default function BusinessToolsRoute() {
  return <BusinessToolsPage />;
}
