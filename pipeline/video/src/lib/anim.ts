import { spring, useCurrentFrame, useVideoConfig, random } from "remotion";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = {
  lin: (p: number) => p,
  out: (p: number) => 1 - Math.pow(1 - p, 3),
  out5: (p: number) => 1 - Math.pow(1 - p, 5),
  in: (p: number) => p * p * p,
  inOut: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outBack: (p: number) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2),
};
/** 0→1 progress of an eased move that starts at `start` (seconds) and lasts `dur`. */
export const prog = (t: number, start: number, dur: number, e: (p: number) => number = ease.out) =>
  e(clamp01((t - start) / dur));

/** Current time. All animation in this codebase is driven by absolute seconds. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return { frame, fps, t: frame / fps, total: durationInFrames / fps };
};

type SpringCfg = { damping?: number; stiffness?: number; mass?: number };
/** Springy 0→1 (with a little overshoot) starting at `at` seconds. The house entrance move. */
export const pop = (t: number, fps: number, at: number, cfg: SpringCfg = {}) =>
  spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 170, mass: 0.7, ...cfg } });
/** Smooth 0→1 with no overshoot, for slides and layout moves. */
export const glide = (t: number, fps: number, at: number, cfg: SpringCfg = {}) =>
  spring({ frame: (t - at) * fps, fps, config: { damping: 22, stiffness: 120, mass: 0.9, ...cfg } });

export const rnd = (seed: string | number) => random(`mm-${seed}`);
