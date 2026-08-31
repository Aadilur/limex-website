import type { Metadata } from "next";

import { AboutPage } from "@/components/limex/about-page";

export const metadata: Metadata = {
  title: "About Limex | Business, made clearer",
  description: "Meet the Limex team and learn how we make important business decisions feel clearer.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
