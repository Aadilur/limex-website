import type { BlogTone } from "./blog-data";

export type ToneClasses = {
  text: string;
  surface: string;
};

const toneClasses: Record<string, ToneClasses> = {
  "#2e6b4f:#d6ebde": { text: "text-[#2e6b4f]", surface: "bg-[#d6ebde]" },
  "#5c4aa6:#dedbfa": { text: "text-[#5c4aa6]", surface: "bg-[#dedbfa]" },
  "#b83652:#fcdbe0": { text: "text-[#b83652]", surface: "bg-[#fcdbe0]" },
  "#9e5726:#fae5cc": { text: "text-[#9e5726]", surface: "bg-[#fae5cc]" },
  "#1f6e70:#d1edeb": { text: "text-[#1f6e70]", surface: "bg-[#d1edeb]" },
  "#29634d:#ccebdb": { text: "text-[#29634d]", surface: "bg-[#ccebdb]" },
  "#594094:#dbd4fa": { text: "text-[#594094]", surface: "bg-[#dbd4fa]" },
  "#9e3347:#fac7cc": { text: "text-[#9e3347]", surface: "bg-[#fac7cc]" },
  "#29664f:#d1ede0": { text: "text-[#29664f]", surface: "bg-[#d1ede0]" },
  "#594094:#e0d9fa": { text: "text-[#594094]", surface: "bg-[#e0d9fa]" },
  "#914a2b:#fae0cc": { text: "text-[#914a2b]", surface: "bg-[#fae0cc]" },
};

export function getToneClasses(color: string, surface: string): ToneClasses {
  return toneClasses[`${color}:${surface}`] ?? { text: "text-ink", surface: "bg-soft" };
}

const blogToneClasses: Record<BlogTone, ToneClasses> = {
  mint: { text: "text-[#2e6b4f]", surface: "bg-[#dbf2e5]" },
  violet: { text: "text-[#594094]", surface: "bg-[#e5dbf2]" },
  peach: { text: "text-[#914a2b]", surface: "bg-[#ffe8db]" },
};

export function getBlogToneClasses(tone: BlogTone): ToneClasses {
  return blogToneClasses[tone];
}

export const clientTextClasses: Record<string, string> = {
  Northstar: "text-[#121f2e]",
  "Sage & Co.": "text-[#2b5e8c]",
  "Aster Labs": "text-[#a64a5c]",
  BIZNEST: "text-[#c79938]",
  Civic: "text-[#4a7563]",
  Morrow: "text-[#5e578c]",
};
