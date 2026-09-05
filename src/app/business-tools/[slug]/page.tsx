import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { businessTools, getTool } from "@/lib/business-tools";
import { pageContentClass, pageLayoutClass, pageShellClass } from "@/components/limex/layout";
import { SiteHeader } from "@/components/limex/site-header";
import { SiteFooter } from "@/components/limex/site-footer";
import { ToolWorkspace } from "@/components/limex/tool-workspace";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return businessTools.map((tool) => ({ slug: tool.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  return { title: `${tool?.title ?? "Business tools"} | Limex`, description: tool?.description };
}
export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug); if (!tool) notFound();
  return <main className={pageLayoutClass}><section className={pageShellClass}><SiteHeader fullBleed /><div className={pageContentClass}><ToolWorkspace tool={tool} /></div></section><SiteFooter /></main>;
}
