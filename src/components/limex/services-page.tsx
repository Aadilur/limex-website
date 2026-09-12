import { ServiceDirectoryContent } from "./services-directory";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { getPublicServicesServer } from "@/lib/service-server";

export async function ServicesPage() {
  const initialData = await getPublicServicesServer();

  return (
    <main className={pageLayoutClass}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <ServiceDirectoryContent initialData={initialData} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
