import Link from "next/link";
import { ActionButton, SectionTitle } from "./ui";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { ToolsContent } from "@/lib/landing-types";
import { businessTools, type ToolDefinition } from "@/lib/business-tools";
import { ToolCard } from "./tools-directory";
import styles from "./tools.module.css";

type HomeTool = ToolDefinition & { href: string; id: string; isVisible?: boolean };

export function ToolsSection({ content = defaultLandingContent.tools }: { content?: ToolsContent }) {
  const seen = new Set<string>();
  const items = [
    ...content.items.flatMap((item) => {
      const definition = businessTools.find((tool) => item.id === `tool-${tool.slug}` || item.href === `/business-tools/${tool.slug}`);
      if (!definition || seen.has(definition.slug)) return [];
      seen.add(definition.slug);
      return [{ ...definition, ...item, slug: definition.slug, group: definition.group, href: item.href?.startsWith("/business-tools/") ? item.href : `/business-tools/${definition.slug}` } as HomeTool];
    }),
    ...businessTools.filter((tool) => !seen.has(tool.slug)).map((tool) => ({ ...tool, id: `tool-${tool.slug}`, href: `/business-tools/${tool.slug}`, isVisible: true }) as HomeTool),
  ].filter((tool) => tool.isVisible !== false);
  return <section className="bg-page px-page-gutter py-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg" id="tools" aria-labelledby="tools-title">
    <div className="flex flex-col gap-section-gap lg:flex-row lg:items-center lg:justify-between"><SectionTitle id="tools-title" title={content.title} description={content.description} /><ActionButton href={content.ctaHref} variant="light" className="w-max">{content.ctaLabel}</ActionButton></div>
    <div className={styles.sectionTop}><h3 className={styles.groupTitle}>Essential calculators</h3><Link className={styles.textLink} href="/business-tools">All calculators ↗</Link></div>
    <div className={styles.grid}>{items.filter((tool) => tool.group === "calculator").map((tool) => <ToolCard tool={tool} key={tool.id} />)}</div>
    <div className={styles.sectionTop}><h3 className={styles.groupTitle}>Document builders</h3></div>
    <div className={styles.builderGrid}>{items.filter((tool) => tool.group === "builder").map((tool) => <ToolCard tool={tool} builder key={tool.id} />)}</div>
  </section>;
}
