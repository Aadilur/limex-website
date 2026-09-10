import { notFound, redirect } from "next/navigation";

import { BlogDetailPage } from "@/components/limex/blog-page";
import { createBlogMetadata } from "@/lib/blog-metadata";
import { getPublicBlogPostServer } from "@/lib/blog-server";

export const dynamic = "force-dynamic";

type BanglaBlogDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BanglaBlogDetailRouteProps) {
  const { slug } = await params;
  const result = await getPublicBlogPostServer(slug, "bn");
  const article = result?.article;
  return createBlogMetadata(article, slug, "bn");
}

export default async function BanglaBlogDetailRoute({ params }: BanglaBlogDetailRouteProps) {
  const { slug } = await params;
  const result = await getPublicBlogPostServer(slug, "bn");

  if (!result) notFound();
  if (result.redirectTo && result.redirectTo !== slug) redirect(`/bn/blog/${result.redirectTo}`);

  return <BlogDetailPage article={result.article} locale="bn" />;
}
