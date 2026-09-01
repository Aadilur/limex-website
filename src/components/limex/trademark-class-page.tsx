import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { TrademarkExplainer, TrademarkFilingNote, TrademarkFinder, TrademarkHero } from "./trademark-class-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";

export function TrademarkClassPage() {
  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader />
        <div className={pageContentClass}>
          <TrademarkHero />
          <TrademarkExplainer />
          <TrademarkFinder />
          <TrademarkFilingNote />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
