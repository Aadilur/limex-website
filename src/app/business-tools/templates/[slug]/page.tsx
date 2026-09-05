import type { Metadata } from "next";

import { pageContentClass, pageLayoutClass, pageShellClass } from "@/components/limex/layout";
import { SiteFooter } from "@/components/limex/site-footer";
import { SiteHeader } from "@/components/limex/site-header";
import { TemplateWorkspace } from "@/components/limex/template-workspace";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document template | Limex",
  description: "Complete and print a Limex business document template.",
};

export default async function DocumentTemplateRoute({ params }: Props) {
  const { slug } = await params;
  return <main className={pageLayoutClass}><section className={pageShellClass}><SiteHeader fullBleed /><div className={pageContentClass}><TemplateWorkspace slug={slug} /></div></section><SiteFooter /></main>;
}
