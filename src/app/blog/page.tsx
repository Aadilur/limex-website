import type { Metadata } from "next";

import { BlogIndexPage } from "@/components/limex/blog-page";

export const metadata: Metadata = {
  title: "Blog | Limex",
  description: "Practical guidance on registration, tax, compliance and building your business with confidence.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog | Limex",
    description: "Practical guidance on registration, tax, compliance and building your business with confidence.",
    url: "/blog",
  },
};

export default function BlogRoute() {
  return <BlogIndexPage />;
}
