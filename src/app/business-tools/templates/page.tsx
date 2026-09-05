import type { Metadata } from "next";

import { BusinessToolsPage } from "@/components/limex/business-tools-page";

export const metadata: Metadata = {
  title: "Document Templates | Limex",
  description: "Reusable business document templates from Limex.",
};

export default function DocumentTemplatesRoute() {
  return <BusinessToolsPage />;
}
