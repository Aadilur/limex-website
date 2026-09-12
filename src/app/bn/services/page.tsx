import type { Metadata } from "next";

import { ServicesPage } from "@/components/limex/services-page";

export const metadata: Metadata = {
  title: "সেবা | Limex",
  description: "কোম্পানি গঠন, কর, ট্রেডমার্ক, কমপ্লায়েন্স ও ব্যবসায়িক সহায়তার পরিষ্কার পথ।",
  alternates: { canonical: "/bn/services" },
  openGraph: {
    type: "website",
    title: "সেবা | Limex",
    description: "কোম্পানি গঠন, কর, ট্রেডমার্ক, কমপ্লায়েন্স ও ব্যবসায়িক সহায়তার পরিষ্কার পথ।",
    url: "/bn/services",
  },
};

export default async function BanglaServicesRoute() {
  return <ServicesPage locale="bn" />;
}
