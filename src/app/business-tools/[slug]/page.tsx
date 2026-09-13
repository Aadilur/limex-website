import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { businessTools, getTool } from "@/lib/business-tools";
import { pageContentClass, pageLayoutClass, pageShellClass } from "@/components/limex/layout";
import { SiteHeader } from "@/components/limex/site-header";
import { SiteFooter } from "@/components/limex/site-footer";
import { ToolWorkspace } from "@/components/limex/tool-workspace";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return businessTools.filter((tool) => tool.group === "calculator").map((tool) => ({ slug: tool.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  return { title: `${tool?.title ?? "Business tools"} | Limex`, description: tool?.description };
}
export default async function ToolPage({ params }: Props) {
  const slug = (await params).slug;
  const tool = getTool(slug); if (!tool) notFound();
  if (tool.group === "builder") redirect("/business-tools/templates");
  return <main className={pageLayoutClass}><section className={pageShellClass}><SiteHeader fullBleed /><div className={pageContentClass}><ToolWorkspace tool={tool} /></div></section><SiteFooter /></main>;
}
