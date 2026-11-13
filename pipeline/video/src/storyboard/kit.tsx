import React from "react";
import { useVideoConfig } from "remotion";
import { C, F, Tone, ink, sub } from "../lib/theme";
import { clamp01, ease, glide, pop, prog, useT } from "../lib/anim";

/* ---------- What every template receives ---------- */
export type SceneCtx = {
  id: string;
  t0: number; // scene start, seconds
  t1: number; // scene end
  tone: Tone;
  props: any;
  cues: Record<string, number>;
  photos: Record<string, { credit: string; title: string }>;
};
export type Template = React.FC<{ s: SceneCtx }>;

/* ---------- Layout: one set of numbers for 16:9, another for 9:16 ---------- */
export const useL = () => {
  const { width: W, height: H } = useVideoConfig();
  const tall = H > W;
  // The safe area for content. Tall videos keep clear of the Shorts title (bottom) and buttons (right).
  const x0 = tall ? 70 : 130, x1 = tall ? 1010 : 1790;
  const y0 = tall ? 270 : 150, y1 = tall ? 1330 : 850;
  return { W, H, tall, x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: W / 2, cy: (y0 + y1) / 2 };
};
export type L = ReturnType<typeof useL>;

/** Time a thing appears: its cue if it has one, otherwise spread evenly through the scene. */
export const when = (s: SceneCtx, cue: string | undefined, i = 0, n = 1, lead = 0.5) => {
  if (cue && s.cues[cue] !== undefined) return s.cues[cue];
  const span = Math.max(s.t1 - s.t0 - lead - 1.2, 0.5);
  return s.t0 + lead + (n <= 1 ? 0 : (i * Math.min(span / n, 1.4)));
};

export const colour = (name: string | undefined, fallback: string = C.yellow): string =>
  name ? ((C as Record<string, string>)[name] ?? name) : fallback;

/* ---------- Entrance wrapper for things laid out with flexbox ---------- */
export const Rise: React.FC<{
  at: number; from?: "up" | "down" | "left" | "right" | "scale" | "fade"; dist?: number; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ at, from = "up", dist = 46, style, children }) => {
  const { t, fps } = useT();
  const g = glide(t, fps, at);
  const p = pop(t, fps, at);
  const o = clamp01((t - at) * 7);
  let tr = "";
  if (from === "up") tr = `translateY(${(1 - g) * dist}px)`;
  if (from === "down") tr = `translateY(${-(1 - g) * dist}px)`;
  if (from === "left") tr = `translateX(${-(1 - g) * dist}px)`;
  if (from === "right") tr = `translateX(${(1 - g) * dist}px)`;
  if (from === "scale") tr = `scale(${p})`;
  return <div style={{ opacity: t < at - 0.02 ? 0 : o, transform: tr, ...style }}>{children}</div>;
};

/** The whole safe area, as a flex column. Templates put their content inside. */
export const Stage: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  const l = useL();
  return (
    <div style={{ position: "absolute", left: l.x0, top: l.y0, width: l.w, height: l.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...style }}>
      {children}
    </div>
  );
};

/* ---------- Text ---------- */
export const Kicker: React.FC<{ color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ color = C.yellow, size, children, style }) => {
  const l = useL();
  const fs = size ?? (l.tall ? 34 : 30);
  return <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: fs, letterSpacing: fs * 0.18, textTransform: "uppercase", color, lineHeight: 1.15, ...style }}>{children}</div>;
};
export const Head: React.FC<{ tone: Tone; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ tone, size, children, style }) => {
  const l = useL();
  const fs = size ?? (l.tall ? 64 : 68);
  return <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: fs, letterSpacing: -fs * 0.015, color: ink(tone), lineHeight: 1.08, textWrap: "balance" as any, ...style }}>{children}</div>;
};
export const Body: React.FC<{ tone: Tone; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ tone, size = 36, children, style }) => (
  <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: size, color: sub(tone), lineHeight: 1.25, textWrap: "balance" as any, ...style }}>{children}</div>
);

/** Scene heading: optional small label and a title, pinned to the top of the safe area. */
export const Heading: React.FC<{ s: SceneCtx; align?: "center" | "left" }> = ({ s, align = "center" }) => {
  const l = useL();
  const { kicker, title } = s.props;
  if (!kicker && !title) return null;
  return (
    <div style={{ position: "absolute", left: l.x0, top: l.y0, width: l.w, textAlign: align }}>
      {kicker && <Rise at={s.t0 + 0.25} from="down" dist={24}><Kicker>{kicker}</Kicker></Rise>}
      {title && <Rise at={s.t0 + 0.35} dist={30} style={{ marginTop: kicker ? 14 : 0 }}><Head tone={s.tone} size={l.tall ? 58 : 62}>{title}</Head></Rise>}
    </div>
  );
};
/** Height the heading takes, so content can sit below it. */
export const headingSpace = (s: SceneCtx, l: L) => (s.props.kicker ? 52 : 0) + (s.props.title ? (l.tall ? 150 : 86) : 0) + (s.props.kicker || s.props.title ? 34 : 0);

/** Splits text around an accent phrase so it can be coloured. */
export const Accent: React.FC<{ text: string; accent?: string; color?: string }> = ({ text, accent, color = C.red }) => {
  if (!accent || !text.includes(accent)) return <>{text}</>;
  const i = text.indexOf(accent);
  return <>{text.slice(0, i)}<span style={{ color }}>{accent}</span>{text.slice(i + accent.length)}</>;
};

export const Card: React.FC<{ tone: Tone; style?: React.CSSProperties; children: React.ReactNode }> = ({ tone, style, children }) => (
  <div
    style={{
      background: tone === "navy" ? "rgba(34,56,90,0.72)" : "rgba(255,255,255,0.78)", borderRadius: 34,
      border: `2px solid ${tone === "navy" ? "rgba(244,239,230,0.14)" : "rgba(14,26,43,0.08)"}`,
      boxShadow: tone === "navy" ? "0 24px 50px rgba(0,0,0,0.32)" : "0 22px 44px rgba(90,60,20,0.16)", ...style,
    }}
  >
    {children}
  </div>
);

export const Source: React.FC<{ s: SceneCtx }> = ({ s }) => {
  const l = useL();
  const { t } = useT();
  if (!s.props.source) return null;
  return (
    <div style={{ position: "absolute", right: l.W - l.x1, top: l.tall ? l.y1 - 6 : 56, fontFamily: F.body, fontWeight: 500, fontSize: l.tall ? 26 : 23, color: sub(s.tone), opacity: prog(t, s.t0 + 0.8, 0.5) * 0.95, textAlign: "right" }}>
      {s.props.source}
    </div>
  );
};

/** Number formatted for the screen: 2.3, 1,234, with optional prefix and suffix. */
export const fmt = (v: number, decimals = 0) => v.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/* ---------- Flags, drawn here so they match the flat style ---------- */
export const Flag: React.FC<{ country: string; w: number }> = ({ country, w }) => {
  const h = Math.round(w * 0.66);
  const frame: React.CSSProperties = { width: w, height: h, borderRadius: w * 0.08, overflow: "hidden", boxShadow: "0 12px 26px rgba(0,0,0,0.3)", display: "block" };
  if (country === "norway")
    return (
      <svg viewBox="0 0 22 16" style={frame} preserveAspectRatio="none">
        <rect width="22" height="16" fill="#D8343A" />
        <rect x="6" width="4" height="16" fill="#fff" /><rect y="6" width="22" height="4" fill="#fff" />
        <rect x="7" width="2" height="16" fill="#1F3F8F" /><rect y="7" width="22" height="2" fill="#1F3F8F" />
      </svg>
    );
  if (country === "uk")
    return (
      <svg viewBox="0 0 60 40" style={frame} preserveAspectRatio="none">
        <rect width="60" height="40" fill="#1F3F8F" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#D8343A" strokeWidth="3" />
        <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
        <path d="M30,0 V40 M0,20 H60" stroke="#D8343A" strokeWidth="7" />
      </svg>
    );
  if (country === "usa")
    return (
      <svg viewBox="0 0 38 26" style={frame} preserveAspectRatio="none">
        <rect width="38" height="26" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} y={i * 2} width="38" height="2" fill="#D8343A" />)}
        <rect width="16" height="14" fill="#1F3F8F" />
      </svg>
    );
  return <div style={{ ...frame, background: C.navy3 }} />;
};

/** A drop of oil. */
export const OilDrop: React.FC<{ size: number; color?: string }> = ({ size, color = C.navy }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block" }}>
    <path d="M12 2.5 C8.5 8 5.5 11.3 5.5 15 a6.5 6.5 0 0 0 13 0 C18.5 11.3 15.5 8 12 2.5 Z" fill={color} />
    <path d="M9 15.2 a3.2 3.2 0 0 0 2.6 3.1" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export { C, F, ink, sub, clamp01, ease, prog };
