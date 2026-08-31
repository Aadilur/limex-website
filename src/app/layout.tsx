import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Limex | Business, made clearer",
  description: "Company registration, tax, trademark and compliance support for ambitious businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="scroll-smooth bg-page" lang="en">
      <body className="bg-page font-sans text-ink antialiased text-[16px] leading-6">{children}</body>
    </html>
  );
}
