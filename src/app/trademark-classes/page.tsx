import type { Metadata } from "next";

import { TrademarkClassPage } from "@/components/limex/trademark-class-page";

export const metadata: Metadata = {
  title: "Trademark Class Finder | Limex",
  description: "Browse and search the 45 trademark classes for goods and services with Limex.",
};

export default function TrademarkClassesRoute() {
  return <TrademarkClassPage />;
}
