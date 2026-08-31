import type { Metadata } from "next";

import { CalculatorsPage } from "@/components/limex/calculators-page";

export const metadata: Metadata = {
  title: "Business calculators | Limex",
  description: "Estimate limited company registration, tax and VAT amounts with practical Bangladesh-focused tools.",
};

export default function ToolsRoute() {
  return <CalculatorsPage />;
}
