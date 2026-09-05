import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ToolsDirectory } from "./tools-directory";

export function BusinessToolsPage() {
  return <main className={pageLayoutClass}><section className={pageShellClass} id="top"><SiteHeader fullBleed /><div className={pageContentClass}><ToolsDirectory /></div></section><SiteFooter /></main>;
}
