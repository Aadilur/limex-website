import type { BlogTone } from "./blog-data";

export type ToneClasses = {
  text: string;
  surface: string;
};

const brandTones = {
  cyan: { text: "text-[#007ea6]", surface: "bg-[#e5fbff]" },
  sky: { text: "text-[#006dce]", surface: "bg-[#e8f3ff]" },
  blue: { text: "text-brand-blue", surface: "bg-[#e9efff]" },
} satisfies Record<string, ToneClasses>;

// Keep legacy values readable while old menu and landing records migrate. New
// records use the same three tones derived from the Limex logo.
const toneClasses: Record<string, ToneClasses> = {
  "#14dcff:#e9fbff": brandTones.cyan,
  "#008cff:#eaf3ff": brandTones.sky,
  "#0055ff:#e8efff": brandTones.blue,
  "#2e6b4f:#d6ebde": brandTones.cyan,
  "#2e6b4f:#edf7f0": brandTones.cyan,
  "#5c4aa6:#dedbfa": brandTones.sky,
  "#5c4aa6:#f2effb": brandTones.sky,
  "#b83652:#fcdbe0": brandTones.blue,
  "#b83652:#fff0f2": brandTones.blue,
  "#9e5726:#fae5cc": brandTones.sky,
  "#1f6e70:#d1edeb": brandTones.cyan,
  "#1f6e70:#edf9f8": brandTones.cyan,
  "#29634d:#ccebdb": brandTones.sky,
  "#594094:#dbd4fa": brandTones.sky,
  "#9e3347:#fac7cc": brandTones.blue,
  "#29664f:#d1ede0": brandTones.sky,
  "#594094:#e0d9fa": brandTones.sky,
  "#914a2b:#fae0cc": brandTones.sky,
  "#4d6958:#fbfbf7": brandTones.sky,
};

const toneByColor: Record<string, ToneClasses> = {
  "#14dcff": brandTones.cyan,
  "#008cff": brandTones.sky,
  "#0055ff": brandTones.blue,
  "#2e6b4f": brandTones.cyan,
  "#5c4aa6": brandTones.sky,
  "#b83652": brandTones.blue,
  "#9e5726": brandTones.sky,
  "#1f6e70": brandTones.cyan,
  "#29634d": brandTones.sky,
  "#594094": brandTones.sky,
  "#9e3347": brandTones.blue,
  "#29664f": brandTones.sky,
  "#914a2b": brandTones.sky,
  "#4d6958": brandTones.sky,
};

export function getToneClasses(color: string, surface: string): ToneClasses {
  const normalizedColor = color.trim().toLowerCase();
  const normalizedSurface = surface.trim().toLowerCase();
  return toneClasses[`${normalizedColor}:${normalizedSurface}`] ?? toneByColor[normalizedColor] ?? { text: "text-brand-blue", surface: "bg-brand-cloud" };
}

const blogToneClasses: Record<BlogTone, ToneClasses> = {
  mint: brandTones.cyan,
  violet: brandTones.sky,
  peach: brandTones.blue,
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
