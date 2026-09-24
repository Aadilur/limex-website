"use client";

import { useEffect, useState } from "react";

import { AboutReelsSection } from "./about-sections";
import { ContactSection } from "./contact-section";
import { FaqSection } from "./faq-section";
import { HowItWorksSection, TrustedClientsSection, TrustMetricsSection } from "./foundations";
import { HeroSection } from "./hero-section";
import { homePageLayoutClass } from "./layout";
import { BlogSection, VideoReelsSection } from "./media-sections";
import { PackagesSection } from "./packages-section";
import { ServicesSection } from "./services-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ToolsSection } from "./tools-section";
import { SectionSeparator } from "./ui";
import { defaultLandingContent, getPublicLanding, withLandingFallback } from "@/lib/landing-api";
import type { LandingContent } from "@/lib/landing-types";

export function LandingPage() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);

  useEffect(() => {
    let cancelled = false;

    void getPublicLanding()
      .then((landing) => {
        if (!cancelled) setContent(withLandingFallback(landing));
      })
      .catch(() => {
        // Keep the bundled landing content available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sectionSeparatorClass = "mt-section-y lg:mt-section-y-xl";

  return (
    <main className={homePageLayoutClass}>
      <SiteHeader />
      <div className="min-w-0 lg:px-6 xl:px-10">
        <HeroSection content={content.hero} />
        <div className="grid min-w-0 grid-cols-1 gap-hero-to-clients pt-hero-top-space lg:gap-section-gap-lg lg:pt-hero-top-space-lg">
          <TrustedClientsSection content={content.clients} />
          <TrustMetricsSection content={content.metrics} />
          <SectionSeparator label="WHAT WE CAN HELP YOU WITH" className={sectionSeparatorClass} />
          <ServicesSection content={content.services} />
          <SectionSeparator label="HOW IT WORKS" className={sectionSeparatorClass} />
          <HowItWorksSection content={content.process} />
          <SectionSeparator label="VIDEO REELS" className={sectionSeparatorClass} />
          <VideoReelsSection content={content.testimonials} />
          {content.testimonials.showAboutReels ? (
            <AboutReelsSection hideWhenEmpty />
          ) : null}
          <SectionSeparator label="PACKAGES" className={sectionSeparatorClass} />
          <PackagesSection content={content.packages} />
          <SectionSeparator label="SMART TOOLS" className={sectionSeparatorClass} />
          <ToolsSection content={content.tools} />
          <SectionSeparator label="FROM THE JOURNAL" className={sectionSeparatorClass} />
          <BlogSection content={content.articles} />
          <SectionSeparator label="FAQ" className={sectionSeparatorClass} />
          <FaqSection content={content.faq} />
          <SectionSeparator label="LET&apos;S TALK" className={sectionSeparatorClass} />
          <ContactSection content={content.contact} />
        </div>
      </div>
      <SiteFooter content={content.footer} />
    </main>
  );
}
