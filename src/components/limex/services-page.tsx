import { ServiceDirectoryContent } from "./services-directory";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { getPublicServicesServer } from "@/lib/service-server";
import type { ServiceLocale } from "@/lib/service-types";

export async function ServicesPage({ locale = "en" }: { locale?: ServiceLocale } = {}) {
  const initialData = await getPublicServicesServer(locale);

  return (
    <main className={pageLayoutClass} lang={locale === "bn" ? "bn-BD" : "en-BD"}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <ServiceDirectoryContent initialData={initialData} locale={locale} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
