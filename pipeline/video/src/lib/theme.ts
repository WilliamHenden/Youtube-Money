// The channel style guide, in code. Every video uses these tokens.
export const C = {
  navy: "#0E1A2B",
  navy2: "#15243A",
  navy3: "#22385A",
  cream: "#F4EFE6",
  cream2: "#E7DFCF",
  cream3: "#D6CCB8",
  red: "#E3463B",
  blue: "#2F6FDB",
  green: "#2FBF71",
  yellow: "#F5B83D",
  amber: "#DB9216",
  muted: "#8FA0B8",
  mutedDark: "#5C6B80",
  white: "#FFFFFF",
};
export const F = {
  head: "Montserrat, sans-serif",
  body: "Inter, sans-serif",
};
export const W = 1920;
export const H = 1080;
export type Tone = "navy" | "cream";
export const ink = (tone: Tone) => (tone === "navy" ? C.cream : C.navy);
export const sub = (tone: Tone) => (tone === "navy" ? C.muted : C.mutedDark);
