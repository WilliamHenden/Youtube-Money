import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { glide, lerp, pop, useT } from "../lib/anim";
import { Burst, Rays } from "../components/ui";
import { C, F, Flag, Heading, Kicker, Template, clamp01, ease, headingSpace, ink, prog, sub, useL, when } from "./kit";
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

/* =====================================================================================
   TANK AND TAP         props: title, kicker, inLabel, tankLabel, outLabel, rate (the big figure on the tap, e.g. "3%"),
                               fillCue (money starts arriving), tapCue (the tap opens), startLevel, endLevel (0..1)
   A pot that keeps filling while only a thin stream is let out: saving the capital and spending the return.
   ===================================================================================== */
export const Tank: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const p = s.props;
  const fillAt = p.fillCue ? when(s, p.fillCue) : s.t0 + 0.6;
  const tapAt = p.tapCue ? when(s, p.tapCue) : s.t0 + Math.max((s.t1 - s.t0) * 0.5, 1.5);
  const dur = Math.max(s.t1 - fillAt, 2);
  const level = lerp(p.startLevel ?? 0.18, p.endLevel ?? 0.78, clamp01((t - fillAt) / dur));
  const open = glide(t, fps, tapAt);
  const top = headingSpace(s, l);
  const W = l.tall ? 500 : 540, H = l.tall ? 430 : 430;
  const cx = l.tall ? l.cx : l.cx - 40, y0 = l.y0 + top + (l.tall ? 110 : 50);
  const x0 = cx - W / 2, liquidH = (H - 24) * level;
  const wave = Math.sin(t * 2.2) * 5;
  const drops = [0, 1, 2, 3, 4];
  const tapY = y0 + H - 70, tapX = x0 + W;
  return (
    <AbsoluteFill>
      <Heading s={s} />
      {/* money arriving */}
      <div style={{ position: "absolute", left: x0 + W * 0.3 - 330, top: y0 - (l.tall ? 76 : 70), width: 270, textAlign: "right", opacity: prog(t, fillAt - 0.2, 0.4) }}>
        <Kicker size={l.tall ? 32 : 30}>{p.inLabel ?? "Money in"}</Kicker>
      </div>
      {t >= fillAt && drops.map((k) => {
        const f = ((t - fillAt) * 0.9 + k / drops.length) % 1;
        const yy = lerp(y0 - 90, y0 + H - 24 - liquidH, f * f);
        return <div key={k} style={{ position: "absolute", left: x0 + W * 0.3 + Math.sin(k * 2.4) * 26 - 17, top: yy - 17, width: 34, height: 34, borderRadius: "50%", background: C.yellow, border: `4px solid ${C.amber}`, boxSizing: "border-box", opacity: f < 0.92 ? 1 : 0 }} />;
      })}
      {/* the tank */}
      <div style={{ position: "absolute", left: x0, top: y0, width: W, height: H, borderRadius: "0 0 44px 44px", border: `12px solid ${ink(s.tone)}`, borderTop: "none", boxSizing: "border-box", overflow: "hidden", background: s.tone === "navy" ? "rgba(14,26,43,0.5)" : "rgba(255,255,255,0.5)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: liquidH, background: `linear-gradient(180deg, ${C.yellow}, ${C.amber})` }}>
          <svg width={W} height={30} style={{ position: "absolute", top: -14, left: 0 }}><path d={`M0,15 Q${W * 0.25},${15 - wave} ${W * 0.5},15 T${W},15 V30 H0 Z`} fill={C.yellow} /></svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.36, textAlign: "center", fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 64 : 68, color: C.navy, textShadow: "0 2px 0 rgba(255,255,255,0.35)" }}>{p.tankLabel ?? "The fund"}</div>
      </div>
      {/* the tap */}
      <div style={{ position: "absolute", left: tapX - 6, top: tapY, width: l.tall ? 110 : 150, height: 30, background: ink(s.tone), borderRadius: "0 10px 10px 0" }} />
      <div style={{ position: "absolute", left: tapX + (l.tall ? 74 : 112), top: tapY - 40, width: 22, height: 44, background: C.red, borderRadius: 8, transform: `rotate(${open * 80}deg)`, transformOrigin: "50% 100%" }} />
      {open > 0.05 && <div style={{ position: "absolute", left: tapX + (l.tall ? 84 : 122), top: tapY + 30, width: 9 * open, height: (y0 + H + 40 - tapY - 30) * clamp01((t - tapAt) * 2.4), background: C.yellow, borderRadius: 5 }} />}
      <div style={{ position: "absolute", left: l.tall ? x0 : tapX + 190, top: l.tall ? y0 + H + 56 : tapY - 200, width: l.tall ? W : 470, textAlign: l.tall ? "center" : "left", opacity: clamp01((t - tapAt - 0.2) * 5), transform: `scale(${0.8 + 0.2 * pop(t, fps, tapAt + 0.2)})`, transformOrigin: l.tall ? "center" : "left center" }}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 190 : 230, lineHeight: 0.95, color: C.yellow, letterSpacing: -6 }}>{p.rate ?? "3%"}</div>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: l.tall ? 48 : 52, color: ink(s.tone), lineHeight: 1.1, marginTop: 10 }}>{p.outLabel ?? "let out each year"}</div>
      </div>
    </AbsoluteFill>
  );
};

export { glide };
