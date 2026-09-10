import type { Metadata } from "next";

import { BlogIndexPage } from "@/components/limex/blog-page";

export const metadata: Metadata = {
  title: "ব্লগ | Limex",
  description: "ব্যবসা নিবন্ধন, কর, কমপ্লায়েন্স এবং ব্যবসা গড়ে তোলার ব্যবহারিক নির্দেশিকা।",
  alternates: { canonical: "/bn/blog" },
  openGraph: {
    type: "website",
    title: "ব্লগ | Limex",
    description: "ব্যবসা নিবন্ধন, কর, কমপ্লায়েন্স এবং ব্যবসা গড়ে তোলার ব্যবহারিক নির্দেশিকা।",
    url: "/bn/blog",
  },
};

export default function BanglaBlogRoute() {
  return <BlogIndexPage locale="bn" />;
}
