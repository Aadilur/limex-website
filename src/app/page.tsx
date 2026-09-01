import { ContactSection } from "@/components/limex/contact-section";
import { FaqSection } from "@/components/limex/faq-section";
import { HowItWorksSection, TrustedClientsSection, TrustMetricsSection } from "@/components/limex/foundations";
import { HeroSection } from "@/components/limex/hero-section";
import { pageLayoutClass } from "@/components/limex/layout";
import { BlogSection, VideoReelsSection } from "@/components/limex/media-sections";
import { PackagesSection } from "@/components/limex/packages-section";
import { ServicesSection } from "@/components/limex/services-section";
import { SiteFooter } from "@/components/limex/site-footer";
import { ToolsSection } from "@/components/limex/tools-section";

export default function Home() {
  return (
    <main className={pageLayoutClass}>
      <HeroSection />
      <TrustedClientsSection />
      <TrustMetricsSection />
      <ServicesSection />
      <HowItWorksSection />
      <VideoReelsSection />
      <PackagesSection />
      <ToolsSection />
      <BlogSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
