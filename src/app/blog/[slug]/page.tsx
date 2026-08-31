import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogDetailPage } from "@/components/limex/blog-page";
import { allBlogArticles, getBlogArticle } from "@/components/limex/blog-data";

type BlogDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allBlogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  return article
    ? { title: `${article.title} | Limex`, description: article.summary }
    : { title: "Article not found | Limex" };
}

export default async function BlogDetailRoute({ params }: BlogDetailRouteProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) notFound();

  return <BlogDetailPage article={article} />;
}
