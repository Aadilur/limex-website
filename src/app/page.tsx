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
import { SectionSeparator } from "@/components/limex/ui";

export default function Home() {
  const sectionSeparatorClass = "mt-section-y lg:mt-section-y-xl";

  return (
    <main className={pageLayoutClass}>
      <HeroSection />
      <TrustedClientsSection />
      <TrustMetricsSection />
      <SectionSeparator label="WHAT WE CAN HELP YOU WITH" className={sectionSeparatorClass} />
      <ServicesSection />
      <SectionSeparator label="HOW IT WORKS" className={sectionSeparatorClass} />
      <HowItWorksSection />
      <SectionSeparator label="VIDEO REELS" className={sectionSeparatorClass} />
      <VideoReelsSection />
      <SectionSeparator label="PACKAGES" className={sectionSeparatorClass} />
      <PackagesSection />
      <SectionSeparator label="SMART TOOLS" className={sectionSeparatorClass} />
      <ToolsSection />
      <SectionSeparator label="FROM THE JOURNAL" className={sectionSeparatorClass} />
      <BlogSection />
      <SectionSeparator label="FAQ" className={sectionSeparatorClass} />
      <FaqSection />
      <SectionSeparator label="LET&apos;S TALK" className={sectionSeparatorClass} />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
