import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { businessTools, toolHref } from "../src/lib/business-tools.js";

const prisma = new PrismaClient();
const legacyHrefs = ["/business-tools", "/business-tools#limited-company-calculator", "/business-tools#tax-calculator", "/business-tools#vat-calculator", "https://aideed.daptari.com/deeds", "#contact", "#top"];
async function main() {
  await prisma.$transaction(async (tx) => {
    for (const tool of businessTools) await tx.menuLink.updateMany({
      where: { label: tool.menuLabel, href: { in: legacyHrefs }, item: { group: { section: { key: "business-tools" } } } }, data: { href: toolHref(tool.slug) },
    });
    await tx.menuItem.updateMany({ where: { href: "https://aideed.daptari.com/deeds", group: { section: { key: "business-tools" } } }, data: { href: "/business-tools" } });
    const landing = await tx.landingPage.findUnique({ where: { id: "home" } });
    if (!landing) return;
    const content = landing.content as Record<string, any>;
    if (!content.tools || !Array.isArray(content.tools.items)) return;
    // Preserve custom cards, text and visibility. Only upgrade known legacy tool links.
    const oldSlugs: Record<string, string> = { "tool-1": "vat", "tool-2": "income-tax", "tool-3": "rental-deed" };
    const existing = content.tools.items.map((item: Record<string, any>) => {
      const tool = businessTools.find((entry) => item.id === `tool-${entry.slug}` || item.href === toolHref(entry.slug) || (oldSlugs[item.id] === entry.slug && legacyHrefs.includes(item.href)));
      return tool ? { ...item, id: `tool-${tool.slug}`, href: legacyHrefs.includes(item.href) ? toolHref(tool.slug) : item.href, tag: tool.group } : item;
    });
    const missing = businessTools.filter((tool) => !existing.some((item: Record<string, any>) => item.id === `tool-${tool.slug}` || item.href === toolHref(tool.slug))).map((tool) => ({ id: `tool-${tool.slug}`, title: tool.title, description: tool.description, href: toolHref(tool.slug), tag: tool.group, mark: tool.icon, rows: [], action: "Open tool", color: "#4d6958", surface: "#fbfbf7", isVisible: true }));
    const nextItems = [...existing, ...missing];
    const next = { ...content, tools: { ...content.tools, items: nextItems } };
    // Repair only the old tool footer destinations, never arbitrary custom links.
    if (Array.isArray(content.footer?.columns)) next.footer = { ...content.footer, columns: content.footer.columns.map((column: Record<string, any>) => ({ ...column, links: column.links.map((link: Record<string, any>) => {
      const slug = ({ "VAT calculator": "vat", "Income tax estimator": "income-tax", "Deed builder": "rental-deed" } as Record<string, string>)[link.label];
      return slug && legacyHrefs.includes(link.href) ? { ...link, href: `/business-tools/${slug}` } : link;
    }) })) };
    if (JSON.stringify(next) === JSON.stringify(content)) return;
    const saved = await tx.landingPage.updateMany({ where: { id: "home", updatedAt: landing.updatedAt }, data: { content: next as Prisma.InputJsonValue } });
    if (!saved.count) throw new Error("Landing content changed during upgrade; nothing was overwritten. Retry.");
  }, { timeout: 30000 });
  console.log("Business tool menu links and landing cards upgraded; custom content preserved.");
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Upgrade failed."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
