import type { Metadata } from "next";

import { LegalPageView } from "@/components/limex/legal-page-view";
import { getPublicLegalPageServer } from "@/lib/legal-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms and Conditions | Limex Consultancy Firm",
  description:
    "Review the terms, conditions, scope of consultancy services, client obligations, and legal guidelines governing Limex services in Bangladesh.",
};

export default async function TermsRoute() {
  const page = await getPublicLegalPageServer("terms");
  return <LegalPageView page={page} />;
}
