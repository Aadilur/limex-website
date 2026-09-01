import { BlogDetailContent, BlogIndexContent } from "./blog-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { BlogArticle } from "./blog-data";

export function BlogIndexPage() {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader />
        <div className={pageContentClass}>
          <BlogIndexContent />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function BlogDetailPage({ article }: { article: BlogArticle }) {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader />
        <div className={pageContentClass}>
          <BlogDetailContent article={article} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
