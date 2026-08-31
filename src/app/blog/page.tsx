import type { Metadata } from "next";

import { BlogIndexPage } from "@/components/limex/blog-page";

export const metadata: Metadata = {
  title: "Blog | Limex",
  description: "Practical guidance on registration, tax, compliance and building your business with confidence.",
};

export default function BlogRoute() {
  return <BlogIndexPage />;
}
