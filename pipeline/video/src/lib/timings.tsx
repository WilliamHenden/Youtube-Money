import React, { createContext, useContext } from "react";

export type Chunk = { show: string; start: number; end: number };
export type Line = { id: string; scene: string; text: string; start: number; end: number; chunks: Chunk[] };
export type SceneT = { id: string; start: number; end: number; firstWord: number; lastWord: number; template?: string; tone?: "navy" | "cream"; props?: any; major?: boolean; enter?: "wipe" | "fade" | "cut"; tag?: string; bugIn?: boolean };
export type Timings = {
  project: string;
  title: string;
  fps: number;
  duration: number;
  scenes: SceneT[];
  lines: Line[];
  cues: Record<string, number>;
  cut?: string;
  channel?: string;
  width?: number;
  height?: number;
  beats?: { start: number; end: number }[];
  photos?: Record<string, { credit: string; title: string }>;
};

const Ctx = createContext<Timings | null>(null);
export const TimingsProvider: React.FC<{ value: Timings; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);
export const useTimings = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("No timings in context");
  return v;
};
/** Scene start/end in seconds. */
export const useScene = (id: string) => {
  const s = useTimings().scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};
