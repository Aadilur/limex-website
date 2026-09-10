import { notFound, redirect } from "next/navigation";

import { BlogDetailPage } from "@/components/limex/blog-page";
import { createBlogMetadata } from "@/lib/blog-metadata";
import { getPublicBlogPostServer } from "@/lib/blog-server";

export const dynamic = "force-dynamic";

type BlogDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailRouteProps) {
  const { slug } = await params;
  const result = await getPublicBlogPostServer(slug);
  const article = result?.article;
  return createBlogMetadata(article, slug);
}

export default async function BlogDetailRoute({ params }: BlogDetailRouteProps) {
  const { slug } = await params;
  const result = await getPublicBlogPostServer(slug);

  if (!result) notFound();
  if (result.redirectTo && result.redirectTo !== slug) redirect(`/blog/${result.redirectTo}`);

  return <BlogDetailPage article={result.article} />;
}
