import { ContactSection } from "@/components/limex/contact-section";
import { FaqSection } from "@/components/limex/faq-section";
import { HowItWorksSection, TrustedClientsSection, TrustMetricsSection } from "@/components/limex/foundations";
import { HeroSection } from "@/components/limex/hero-section";
import { BlogSection, VideoReelsSection } from "@/components/limex/media-sections";
import { PackagesSection } from "@/components/limex/packages-section";
import { ServicesSection } from "@/components/limex/services-section";
import { SiteFooter } from "@/components/limex/site-footer";
import { ToolsSection } from "@/components/limex/tools-section";

export default function Home() {
  return (
    <main className="mx-auto grid min-w-0 grid-cols-1 gap-3 py-3 pb-4 lg:w-[min(1440px,calc(100%-40px))] lg:gap-8 lg:py-7 lg:pb-8 xl:w-[min(1440px,calc(100%-88px))]">
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
