import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Limex Consultancy Firm",
    short_name: "Limex",
    description:
      "Company registration, tax, trademark and compliance support for ambitious businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#eeece7",
    theme_color: "#071b3d",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "maskable",
      },
    ],
  };
}
