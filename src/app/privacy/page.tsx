import type { Metadata } from "next";

import { LegalPageView } from "@/components/limex/legal-page-view";
import { getPublicLegalPageServer } from "@/lib/legal-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Limex Consultancy Firm",
  description:
    "Learn how Limex protects and manages personal and corporate information submitted for corporate filings, company registration, tax advisory, and compliance in Bangladesh.",
};

export default async function PrivacyRoute() {
  const page = await getPublicLegalPageServer("privacy");
  return <LegalPageView page={page} />;
}
