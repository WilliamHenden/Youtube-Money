import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import icons from "../icons/icons.generated.json";
import { C, F, Tone, ink, sub } from "../lib/theme";
import { clamp01, ease, glide, lerp, pop, prog, useT } from "../lib/anim";
import { useTimings } from "../lib/timings";

/* ---------- Background ---------- */
export const Background: React.FC<{ tone: Tone }> = ({ tone }) => {
  const { t } = useT();
  const { width: W, height: H } = useVideoConfig();
  const navy = tone === "navy";
  const dot = navy ? "rgba(244,239,230,0.075)" : "rgba(14,26,43,0.085)";
  const ox = -((t * 7) % 48);
  const oy = -((t * 4) % 48);
  const b1x = 22 + Math.sin(t * 0.11) * 6;
  const b1y = 24 + Math.cos(t * 0.09) * 5;
  const b2x = 80 + Math.cos(t * 0.08) * 6;
  const b2y = 78 + Math.sin(t * 0.1) * 5;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: navy
            ? "radial-gradient(1500px 1000px at 30% 20%, #1A2E4C 0%, #0E1A2B 55%, #09121E 100%)"
            : "radial-gradient(1500px 1000px at 30% 20%, #FCF9F2 0%, #F4EFE6 55%, #E6DDCC 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(620px 620px at ${b1x}% ${b1y}%, ${navy ? "rgba(47,111,219,0.20)" : "rgba(245,184,61,0.26)"}, transparent 70%), radial-gradient(560px 560px at ${b2x}% ${b2y}%, ${navy ? "rgba(227,70,59,0.13)" : "rgba(227,70,59,0.10)"}, transparent 70%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <pattern id={`dots-${tone}`} width="48" height="48" patternUnits="userSpaceOnUse" x={ox} y={oy}>
            <circle cx="6" cy="6" r="2.2" fill={dot} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#dots-${tone})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: navy
            ? "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%)"
            : "radial-gradient(ellipse at center, transparent 60%, rgba(90,60,20,0.14) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url(${staticFile("grain.png")})`,
      backgroundSize: "480px 270px",
      opacity: 0.07,
      mixBlendMode: "overlay",
      pointerEvents: "none",
    }}
  />
);

/* ---------- Pop: the standard entrance wrapper ---------- */
type PopProps = {
  at: number;
  out?: number;
  x: number;
  y: number;
  anchor?: "center" | "left" | "right";
  from?: "scale" | "up" | "down" | "left" | "right";
  dist?: number;
  float?: number;
  rot?: number;
  scale?: number;
  opacity?: number;
  z?: number;
  seed?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};
export const Pop: React.FC<PopProps> = ({
  at, out, x, y, anchor = "center", from = "scale", dist = 70, float = 0, rot = 0, scale = 1, opacity = 1, z, seed = 0, style, children,
}) => {
  const { t, fps } = useT();
  if (t < at - 0.02) return null;
  const s = pop(t, fps, at);
  const g = glide(t, fps, at);
  const o = out === undefined ? 0 : prog(t, out, 0.22, ease.in);
  if (o >= 1) return null;
  let tx = 0, ty = 0, sc = scale;
  if (from === "scale") sc *= s;
  else {
    const d = (1 - g) * dist;
    if (from === "up") ty = d;
    if (from === "down") ty = -d;
    if (from === "left") tx = -d;
    if (from === "right") tx = d;
  }
  sc *= 1 - o * 0.25;
  const bob = float ? Math.sin((t + seed * 1.37) * 1.7) * float : 0;
  const ax = anchor === "center" ? "-50%" : anchor === "left" ? "0%" : "-100%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: z,
        opacity: clamp01((t - at) * 9) * (1 - o) * opacity,
        transform: `translate(${ax}, -50%) translate(${tx}px, ${ty + bob}px) rotate(${rot}deg) scale(${sc})`,
        transformOrigin: anchor === "center" ? "center" : anchor === "left" ? "left center" : "right center",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Icon (Fluent Emoji Flat) ---------- */
export const Icon: React.FC<{ name: keyof typeof icons | string; size: number; style?: React.CSSProperties }> = ({ name, size, style }) => {
  const body = (icons as Record<string, string>)[name];
  if (!body) throw new Error(`Icon "${name}" is not in src/icons/list.json`);
  return <svg viewBox="0 0 32 32" width={size} height={size} style={{ display: "block", ...style }} dangerouslySetInnerHTML={{ __html: body }} />;
};

export const Check: React.FC<{ size: number; color?: string }> = ({ size, color = C.navy }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block" }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Text helpers ---------- */
export const Label: React.FC<{ color?: string; size?: number; spacing?: number; weight?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color = C.yellow, size = 32, spacing = 6, weight = 800, children, style,
}) => (
  <div style={{ fontFamily: F.body, fontWeight: weight, fontSize: size, letterSpacing: spacing, color, textTransform: "uppercase", lineHeight: 1.1, ...style }}>{children}</div>
);
export const Big: React.FC<{ color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ color = C.cream, size = 120, children, style }) => (
  <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, color, lineHeight: 1, letterSpacing: -size * 0.02, fontVariantNumeric: "tabular-nums", ...style }}>{children}</div>
);
export const Pill: React.FC<{ bg?: string; color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  bg = C.yellow, color = C.navy, size = 30, children, style,
}) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.4, background: bg, color, fontFamily: F.body, fontWeight: 800, fontSize: size,
      letterSpacing: size * 0.1, textTransform: "uppercase", padding: `${size * 0.42}px ${size * 0.85}px`, borderRadius: size * 1.2,
      boxShadow: "0 10px 24px rgba(0,0,0,0.22)", lineHeight: 1, ...style,
    }}
  >
    {children}
  </div>
);

/** Eased number that counts from `from` to `to`. */
export const useCount = (from: number, to: number, start: number, dur: number) => {
  const { t } = useT();
  return lerp(from, to, prog(t, start, dur, ease.out5));
};

/* ---------- Captions ---------- */
const renderShow = (show: string) =>
  show.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("*") ? <span key={i} style={{ color: C.yellow }}>{part.slice(1, -1)}</span> : <span key={i}>{part}</span>
  );
export const Captions: React.FC = () => {
  const { t } = useT();
  const { lines } = useTimings();
  let cur: { show: string; start: number; end: number } | null = null;
  for (const l of lines) for (const c of l.chunks) if (t >= c.start - 0.04 && t < c.end + 0.12) cur = c;
  const { width: W, height: H } = useVideoConfig();
  if (!cur) return null;
  const tall = H > W;
  const p = prog(t, cur.start - 0.04, 0.14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: tall ? 1385 : 898, height: tall ? 150 : undefined, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 40 }}>
      <div
        style={{
          fontFamily: F.body, fontWeight: 700, fontSize: tall ? 54 : 48, color: C.cream, background: "rgba(7,13,22,0.86)", padding: tall ? "18px 34px 20px" : "16px 34px 18px",
          borderRadius: 20, lineHeight: 1.15, whiteSpace: tall ? "normal" : "nowrap", maxWidth: tall ? 900 : 1700, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 10}px)`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
        }}
      >
        {renderShow(cur.show)}
      </div>
    </div>
  );
};

/* ---------- Channel bug + source note ---------- */
export const ChannelBug: React.FC<{ tone: Tone; name: string; light?: boolean }> = ({ tone, name, light }) => {
  const { width: W, height: H } = useVideoConfig();
  const tall = H > W;
  return (
  <div style={{ position: "absolute", left: tall ? 0 : 60, width: tall ? W : undefined, justifyContent: tall ? "center" : undefined, top: tall ? 150 : 48, display: "flex", alignItems: "center", gap: 14, opacity: 0.92, zIndex: 30 }}>
    <div style={{ width: 40, height: 40, borderRadius: 11, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontWeight: 900, fontSize: 26, color: C.navy }}>
      $
    </div>
    <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: light ? C.white : ink(tone), textShadow: light ? "0 2px 8px rgba(0,0,0,0.6)" : undefined }}>{name}</div>
  </div>
  );
};
export const SourceNote: React.FC<{ tone: Tone; from: number; to: number; children: React.ReactNode }> = ({ tone, from, to, children }) => {
  const { t } = useT();
  if (t < from || t > to) return null;
  const o = Math.min(prog(t, from, 0.4), 1 - prog(t, to - 0.3, 0.3));
  return (
    <div style={{ position: "absolute", right: 64, top: 54, fontFamily: F.body, fontWeight: 500, fontSize: 23, color: sub(tone), opacity: o * 0.95, textAlign: "right" }}>
      {children}
    </div>
  );
};

/* ---------- Scene wipe ---------- */
export const Wipe: React.FC<{ at: number; colors?: [string, string] }> = ({ at, colors = [C.red, C.yellow] }) => {
  const { t } = useT();
  const { height: H } = useVideoConfig();
  const d = 0.7;
  const p = (t - (at - d / 2)) / d;
  if (p <= 0 || p >= 1) return null;
  const e = ease.inOut(p);
  const x1 = lerp(-185, 115, e);
  const panel = (x: number, color: string): React.CSSProperties => ({
    position: "absolute", top: -60, height: H + 120, left: `${x}%`, width: "150%", background: color, transform: `skewX(${H > 1200 ? -5 : -11}deg)`,
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", zIndex: 50 }}>
      <div style={panel(x1 + 7, colors[1])} />
      <div style={panel(x1, colors[0])} />
    </AbsoluteFill>
  );
};

/* ---------- Sound effect at a time ---------- */
export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.5 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.ceil(fps * 1.6)} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

/* ---------- Stamp ---------- */
export const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number }> = ({
  at, x, y, text, color = C.red, rot = -12, size = 70,
}) => {
  const { t } = useT();
  if (t < at) return null;
  const p = prog(t, at, 0.16, ease.in);
  const settle = prog(t, at + 0.16, 0.18, ease.out);
  const sc = lerp(2.6, 0.94, p) + settle * 0.06;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, opacity: clamp01(p * 2), zIndex: 5 }}>
      <div
        style={{
          fontFamily: F.head, fontWeight: 900, fontSize: size, letterSpacing: size * 0.08, color, border: `${size * 0.12}px solid ${color}`,
          padding: `${size * 0.14}px ${size * 0.4}px`, borderRadius: size * 0.2, background: "rgba(14,26,43,0.82)", lineHeight: 1, whiteSpace: "nowrap",
          boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------- Donut gauge ---------- */
export const Donut: React.FC<{ value: number; r: number; stroke: number; color: string; track: string }> = ({ value, r, stroke, color, track }) => {
  const size = (r + stroke) * 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circ * value} ${circ}`} />
    </svg>
  );
};

/* ---------- Rotating light rays (behind a hero object) ---------- */
export const Rays: React.FC<{ size: number; color?: string; opacity?: number; n?: number }> = ({ size, color = C.yellow, opacity = 0.16, n = 14 }) => {
  const { t } = useT();
  const r = size / 2;
  return (
    <svg width={size} height={size} style={{ display: "block", transform: `rotate(${t * 9}deg)`, opacity }}>
      <defs>
        <radialGradient id="rayfade">
          <stop offset="0.15" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + (Math.PI / n) * 0.9;
        return <path key={i} d={`M${r},${r} L${r + Math.cos(a0) * r},${r + Math.sin(a0) * r} L${r + Math.cos(a1) * r},${r + Math.sin(a1) * r} Z`} fill="url(#rayfade)" />;
      })}
    </svg>
  );
};

/* ---------- Ring burst (one-shot emphasis) ---------- */
export const Burst: React.FC<{ at: number; x: number; y: number; size: number; color?: string }> = ({ at, x, y, size, color = C.yellow }) => {
  const { t } = useT();
  const p = prog(t, at, 0.55, ease.out);
  if (t < at || p >= 1) return null;
  const n = 10;
  return (
    <svg width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: 1 - p, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r0 = (size / 2) * lerp(0.45, 0.8, p), r1 = (size / 2) * lerp(0.55, 1, p);
        return <line key={i} x1={size / 2 + Math.cos(a) * r0} y1={size / 2 + Math.sin(a) * r0} x2={size / 2 + Math.cos(a) * r1} y2={size / 2 + Math.sin(a) * r1} stroke={color} strokeWidth={7} strokeLinecap="round" />;
      })}
    </svg>
  );
};

export { Img };
