import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { glide, lerp, pop, useT } from "../lib/anim";
import { Burst, Rays } from "../components/ui";
import { C, F, Flag, Template, clamp01, ease, ink, prog, sub, useL } from "./kit";
import { MapScene } from "./templates-b";

/* The channel's mark: the yellow tile with a dollar sign, at any size. */
export const Mark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.27, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontWeight: 900, fontSize: size * 0.66, color: C.navy, boxShadow: `0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.35)` }}>$</div>
);

/* =====================================================================================
   CHANNEL STING        props: name, tagline. About three seconds. The mark lands, the name is spelled out,
   and the mark then travels to the corner where the channel bug lives, so the cut into the next scene is seamless.
   ===================================================================================== */
export const Ident: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const name: string = s.props.name ?? "MONEY MECHANICS";
  const at = s.t0 + 0.15;
  const g = pop(t, fps, at, { damping: 9, stiffness: 150 });
  const leave = prog(t, s.t1 - 0.6, 0.5, ease.inOut);
  const big = l.tall ? 250 : 280;
  const bug = { x: l.tall ? l.cx - 150 : 80, y: l.tall ? 170 : 68, size: 40 };
  const markY = l.cy - (l.tall ? 170 : 130);
  const x = lerp(l.cx, bug.x, leave), y = lerp(markY, bug.y, leave), size = lerp(big, bug.size, leave);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.cx, top: markY, transform: "translate(-50%,-50%)", opacity: prog(t, at, 0.5) * (1 - leave) }}><Rays size={l.tall ? 1300 : 1500} opacity={0.16} /></div>
      <Burst at={at + 0.12} x={l.cx} y={markY} size={l.tall ? 700 : 760} />
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${g}) rotate(${(1 - g) * -18}deg)` }}><Mark size={size} /></div>
      <div style={{ position: "absolute", left: 0, width: l.W, top: l.cy + (l.tall ? 40 : 60), textAlign: "center", opacity: 1 - leave, transform: `translateY(${leave * -20}px)` }}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 84 : 112, letterSpacing: l.tall ? 6 : 14, color: ink(s.tone), whiteSpace: l.tall ? "normal" : "nowrap", lineHeight: 1.05 }}>
          {name.split("").map((ch, i) => {
            const a = at + 0.35 + i * 0.035;
            return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: clamp01((t - a) * 9), transform: `translateY(${(1 - prog(t, a, 0.3)) * 34}px)` }}>{ch}</span>;
          })}
        </div>
        <div style={{ height: 12, width: l.tall ? 300 : 380, borderRadius: 6, background: C.red, margin: "26px auto 0", transform: `scaleX(${prog(t, at + 0.95, 0.45)})` }} />
        {s.props.tagline && <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: l.tall ? 40 : 42, color: sub(s.tone), marginTop: 26, letterSpacing: 2, opacity: prog(t, at + 1.15, 0.4) }}>{s.props.tagline}</div>}
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   THUMBNAIL            props: layout "flags" | "photo" | "map", plus the words. Rendered as a still, 1280x720.
   Few words, very large, readable at the size of a postage stamp.
   ===================================================================================== */
const Huge: React.FC<{ size: number; color: string; children: React.ReactNode; stroke?: boolean }> = ({ size, color, children, stroke = true }) => (
  <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.03, color, whiteSpace: "nowrap", WebkitTextStroke: stroke ? `${size * 0.035}px ${C.navy}` : undefined, paintOrder: "stroke fill" as any, textShadow: `0 ${size * 0.05}px 0 ${C.navy}, 0 ${size * 0.09}px ${size * 0.16}px rgba(0,0,0,0.5)` }}>{children}</div>
);
export const Thumb: Template = ({ s }) => {
  const p = s.props;
  if (p.layout === "flags")
    return (
      <AbsoluteFill style={{ background: C.navy }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: "56%", height: "100%", background: "linear-gradient(135deg, #1F5E3D, #123A28)", clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: "52%", height: "100%", background: "linear-gradient(135deg, #4A1F26, #1B1420)", clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", left: "49.2%", top: -40, width: 26, height: 1200, background: C.yellow, transform: "rotate(7.5deg)", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }} />
        <div style={{ position: "absolute", left: 90, top: 110, display: "flex", flexDirection: "column", gap: 50 }}>
          <Flag country="norway" w={360} />
          <div><Huge size={250} color={C.yellow}>{p.left ?? "$2.3"}</Huge><Huge size={150} color={C.white}>{p.leftUnit ?? "TRILLION"}</Huge></div>
        </div>
        <div style={{ position: "absolute", right: 110, top: 110, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 50 }}>
          <Flag country="uk" w={360} />
          <Huge size={400} color={C.white}>{p.right ?? "£0"}</Huge>
        </div>
        {p.top && <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center" }}><span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.navy, background: C.yellow, padding: "8px 34px", borderRadius: 16, letterSpacing: 4 }}>{p.top}</span></div>}
      </AbsoluteFill>
    );
  if (p.layout === "photo")
    return (
      <AbsoluteFill style={{ background: C.navy }}>
        <Img src={staticFile(`photos/${p.photo}.jpg`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% 45%", transform: "scale(1.28) translateX(12%)", filter: "saturate(1.05) contrast(1.1)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(9,18,30,0.94) 0%, rgba(9,18,30,0.8) 40%, rgba(9,18,30,0.05) 72%)" }} />
        <div style={{ position: "absolute", left: 90, top: 150, display: "flex", flexDirection: "column", gap: 34 }}>
          <Huge size={130} color={C.white}>{p.line1 ?? "THEY SAVED"}</Huge>
          <Huge size={290} color={C.yellow}>{p.big ?? "$2.3T"}</Huge>
          <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 20 }}>
            <Flag country="uk" w={170} /><Huge size={118} color={C.white}>{p.line2 ?? "SAVED £0"}</Huge>
          </div>
        </div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill>
      <MapScene s={{ ...s, t0: s.t0 - 20, props: p.map }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,10,18,0.55) 100%)" }} />
      <div style={{ position: "absolute", left: 120, top: 400 }}><Huge size={300} color={C.white}>{p.left ?? "£0"}</Huge></div>
      <div style={{ position: "absolute", right: 70, top: 250, textAlign: "right" }}><Huge size={250} color={C.yellow}>{p.right ?? "$2.3T"}</Huge></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, textAlign: "center" }}><span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 104, color: C.navy, background: C.yellow, padding: "10px 44px", borderRadius: 22, letterSpacing: 2 }}>{p.bottom ?? "SAME OIL"}</span></div>
    </AbsoluteFill>
  );
};

export { glide };
