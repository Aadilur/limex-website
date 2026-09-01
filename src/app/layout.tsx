import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SmoothScroll } from "@/components/limex/smooth-scroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limex | Business, made clearer",
  description: "Company registration, tax, trademark and compliance support for ambitious businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="scroll-smooth bg-page" lang="en">
      <body className="bg-page font-body text-body text-ink antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
