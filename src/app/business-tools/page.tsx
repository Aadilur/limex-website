import type { Metadata } from "next";

import { BusinessToolsPage } from "@/components/limex/business-tools-page";

export const metadata: Metadata = {
  title: "Business Tools | Limex",
  description: "Estimate limited company registration costs, personal income tax and VAT invoice totals with Limex tools.",
};

export default function BusinessToolsRoute() {
  return <BusinessToolsPage />;
}
