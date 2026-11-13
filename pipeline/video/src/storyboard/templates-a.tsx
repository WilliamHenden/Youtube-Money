import React from "react";
import { AbsoluteFill } from "remotion";
import { glide, lerp, pop, useT } from "../lib/anim";
import { Burst, Icon, Rays } from "../components/ui";
import {
  Accent, Body, C, Card, F, Flag, Head, Heading, Kicker, Rise, SceneCtx, Source, Stage, Template, clamp01, colour, ease, fmt, headingSpace, ink, prog, sub, useL, when,
} from "./kit";

/* =====================================================================================
   1. TITLE CARD        props: lines[], accent (index of the line to make big), kicker
   ===================================================================================== */
export const TitleCard: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const lines: string[] = s.props.lines ?? [s.props.title];
  const hi: number = s.props.accent ?? -1;
  const base = l.tall ? 62 : 80, big = l.tall ? 150 : 190;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.cx, top: l.cy, transform: "translate(-50%,-50%)", opacity: prog(t, s.t0 + 0.2, 0.8) }}>
        <Rays size={l.tall ? 1500 : 1700} opacity={0.1} />
      </div>
      <Stage style={{ gap: l.tall ? 26 : 20, textAlign: "center" }}>
        {s.props.kicker && <Rise at={s.t0 + 0.15} from="down"><Kicker>{s.props.kicker}</Kicker></Rise>}
        {lines.map((line, i) => {
          const at = s.t0 + 0.2 + i * 0.28;
          const isBig = i === hi;
          return (
            <Rise key={i} at={at} from={isBig ? "scale" : "up"}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: isBig ? big : base, lineHeight: 1.02, letterSpacing: isBig ? -4 : -1, color: isBig ? C.yellow : ink(s.tone), textTransform: "uppercase", position: "relative", whiteSpace: l.tall ? "normal" : "nowrap" }}>
                {line}
                {isBig && <div style={{ position: "absolute", left: "4%", right: "4%", bottom: -14, height: 14, borderRadius: 7, background: C.red, transform: `scaleX(${prog(t, at + 0.45, 0.5)})`, transformOrigin: "left" }} />}
              </div>
            </Rise>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   1b. CHAPTER CARD     props: number, title, kicker
   ===================================================================================== */
export const ChapterCard: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const n = String(s.props.number ?? "").padStart(2, "0");
  return (
    <Stage style={{ flexDirection: l.tall ? "column" : "row", gap: l.tall ? 30 : 70, alignItems: "center" }}>
      <Rise at={s.t0 + 0.15} from="scale">
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 300 : 340, lineHeight: 0.9, color: "transparent", WebkitTextStroke: `7px ${C.yellow}`, letterSpacing: 6 }}>{n}</div>
      </Rise>
      <div style={{ width: l.tall ? 300 : 10, height: l.tall ? 10 : 300, borderRadius: 5, background: C.red, transform: l.tall ? `scaleX(${prog(t, s.t0 + 0.4, 0.5)})` : `scaleY(${prog(t, s.t0 + 0.4, 0.5)})` }} />
      <div style={{ textAlign: l.tall ? "center" : "left", maxWidth: l.tall ? l.w : 900 }}>
        <Rise at={s.t0 + 0.5} from="down" dist={20}><Kicker>{s.props.kicker ?? "Part " + (s.props.number ?? "")}</Kicker></Rise>
        <Rise at={s.t0 + 0.62} style={{ marginTop: 18 }}><Head tone={s.tone} size={l.tall ? 84 : 96}>{s.props.title}</Head></Rise>
      </div>
    </Stage>
  );
};

/* =====================================================================================
   2. BIG NUMBER        props: label, value, prefix, suffix, unit, decimals, from, caption, color, cue
   The counter is silent unless the script asks for a "tick" sound.
   ===================================================================================== */
export const BigNumber: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const p = s.props;
  const at = p.at !== undefined ? s.t0 + p.at : when(s, p.cue); // "at": seconds into the scene, for a number that must be there from the first frame
  const dur = p.countDur ?? 1.6;
  const v = lerp(p.from ?? 0, p.value, prog(t, at, dur, ease.out5));
  const done = t >= at + dur;
  const size = l.tall ? 250 : 330;
  const col = colour(p.color, C.yellow);
  return (
    <AbsoluteFill>
      <Stage style={{ gap: l.tall ? 34 : 22, textAlign: "center" }}>
        {p.label && <Rise at={s.t0 + 0.25} from="down"><Kicker color={sub(s.tone)} size={l.tall ? 40 : 38}>{p.label}</Kicker></Rise>}
        <Rise at={at - 0.1} from="scale">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 24, flexWrap: l.tall ? "wrap" : "nowrap" }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.03, color: col, fontVariantNumeric: "tabular-nums", transform: `scale(${1 + Math.sin(clamp01((t - at - dur) / 0.4) * Math.PI) * 0.045})` }}>
              {p.prefix ?? ""}{fmt(done ? p.value : v, p.decimals ?? 0)}{p.suffix ?? ""}
            </div>
            {p.unit && <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: size * 0.34, color: ink(s.tone), letterSpacing: -1 }}>{p.unit}</div>}
          </div>
        </Rise>
        <div style={{ width: l.tall ? 420 : 520, height: 10, borderRadius: 5, background: C.red, transform: `scaleX(${prog(t, at + dur * 0.6, 0.6)})` }} />
        {p.caption && <Rise at={at + dur * 0.7}><Body tone={s.tone} size={l.tall ? 46 : 44} style={{ maxWidth: l.tall ? 860 : 1300 }}>{p.caption}</Body></Rise>}
      </Stage>
      <Source s={s} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   3. BAR COMPARISON    props: title, kicker, bars[{label, value, display, color, highlight, cue}], note
   Upright bars on a wide screen, sideways bars on a tall one.
   ===================================================================================== */
export const Bars: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const bars: any[] = s.props.bars;
  const max = Math.max(...bars.map((b) => b.value));
  const top = headingSpace(s, l);
  const areaH = l.h - top - (s.props.note ? 70 : 20);
  return (
    <AbsoluteFill>
      <Heading s={s} />
      <div style={{ position: "absolute", left: l.x0, top: l.y0 + top, width: l.w, height: areaH, display: "flex", flexDirection: l.tall ? "column" : "row", alignItems: l.tall ? "stretch" : "flex-end", justifyContent: "center", gap: l.tall ? 40 : 90 }}>
        {bars.map((b, i) => {
          const at = when(s, b.cue, i, bars.length);
          const g = glide(t, fps, at, { damping: 20, stiffness: 90 });
          const col = colour(b.color, b.highlight ? C.yellow : s.tone === "navy" ? C.navy3 : C.cream3);
          const shown = b.display ?? fmt(b.value * clamp01(g), b.decimals ?? 0);
          const frac = (b.value / max) * g;
          if (l.tall)
            return (
              <div key={i} style={{ opacity: clamp01((t - at + 0.1) * 6) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <Body tone={s.tone} size={40} style={{ color: ink(s.tone), fontWeight: 700 }}>{b.label}</Body>
                  <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 62, color: b.highlight ? C.yellow : ink(s.tone), fontVariantNumeric: "tabular-nums" }}>{shown}</div>
                </div>
                <div style={{ height: 76, borderRadius: 22, background: s.tone === "navy" ? "rgba(244,239,230,0.08)" : "rgba(14,26,43,0.07)" }}>
                  <div style={{ height: "100%", width: `${Math.max(frac * 100, 1.5)}%`, borderRadius: 22, background: col, boxShadow: b.highlight ? `0 0 44px ${col}66` : undefined }} />
                </div>
              </div>
            );
          const barH = (areaH - 190) * frac;
          return (
            <div key={i} style={{ width: Math.min(300, (l.w - 90 * (bars.length - 1)) / bars.length), display: "flex", flexDirection: "column", alignItems: "center", opacity: clamp01((t - at + 0.1) * 6) }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 76, color: b.highlight ? C.yellow : ink(s.tone), fontVariantNumeric: "tabular-nums", marginBottom: 14 }}>{shown}</div>
              <div style={{ width: "100%", height: Math.max(barH, 6), borderRadius: "22px 22px 6px 6px", background: col, boxShadow: b.highlight ? `0 0 50px ${col}66` : "0 14px 30px rgba(0,0,0,0.2)" }} />
              <Body tone={s.tone} size={34} style={{ marginTop: 18, color: ink(s.tone), fontWeight: 700, textAlign: "center", height: 86 }}>{b.label}</Body>
            </div>
          );
        })}
      </div>
      {s.props.note && <div style={{ position: "absolute", left: l.x0, width: l.w, top: l.y1 - 40, textAlign: "center" }}><Body tone={s.tone} size={l.tall ? 30 : 27}>{s.props.note}</Body></div>}
      <Source s={s} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   4. LINE / AREA CHART props: title, kicker, points[[x, y]], xTicks[], yTicks[], yPrefix, ySuffix,
                               area, color, cue (when the line starts drawing), drawDur,
                               annotations[{x, label, cue}]
   ===================================================================================== */
export const Chart: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const p = s.props;
  const pts: [number, number][] = p.points;
  const top = headingSpace(s, l);
  const w = l.w, h = l.h - top;
  const m = { l: l.tall ? 120 : 150, r: l.tall ? 50 : 90, t: 40, b: 80 };
  const xs = pts.map((d) => d[0]), ys = pts.map((d) => d[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), yMax = p.yMax ?? Math.max(...ys) * 1.12, yMin = p.yMin ?? 0;
  const X = (x: number) => m.l + ((x - x0) / (x1 - x0)) * (w - m.l - m.r);
  const Y = (y: number) => h - m.b - ((y - yMin) / (yMax - yMin)) * (h - m.t - m.b);
  const at = when(s, p.cue), dur = p.drawDur ?? Math.min(3.2, Math.max(s.t1 - at - 1.5, 1.2));
  const d = prog(t, at, dur, ease.inOut);
  const xNow = lerp(x0, x1, d);
  const yAt = (x: number) => {
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
    return pts[pts.length - 1][1];
  };
  const line = "M" + pts.map((q) => `${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join(" L");
  const col = colour(p.color, C.green);
  const yTicks: number[] = p.yTicks ?? [yMax * 0.25, yMax * 0.5, yMax * 0.75].map((v) => Math.round(v));
  const axis = s.tone === "navy" ? "rgba(244,239,230,0.16)" : "rgba(14,26,43,0.13)";
  const id = `clip-${s.id}`;
  return (
    <AbsoluteFill>
      <Heading s={s} />
      <svg width={w} height={h} style={{ position: "absolute", left: l.x0, top: l.y0 + top, overflow: "visible" }}>
        <defs>
          <clipPath id={id}><rect x={0} y={0} width={X(xNow)} height={h} /></clipPath>
          <linearGradient id={`g-${s.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="0.42" /><stop offset="1" stopColor={col} stopOpacity="0.02" /></linearGradient>
        </defs>
        {yTicks.map((v) => (
          <g key={v} opacity={prog(t, s.t0 + 0.4, 0.5)}>
            <line x1={m.l} x2={w - m.r} y1={Y(v)} y2={Y(v)} stroke={axis} strokeWidth={2} strokeDasharray="6 10" />
            <text x={m.l - 18} y={Y(v) + 10} textAnchor="end" fontFamily={F.body} fontWeight={600} fontSize={l.tall ? 30 : 28} fill={sub(s.tone)}>{p.yPrefix ?? ""}{fmt(v)}{p.ySuffix ?? ""}</text>
          </g>
        ))}
        <line x1={m.l} x2={w - m.r} y1={h - m.b} y2={h - m.b} stroke={axis} strokeWidth={3} />
        {(p.xTicks ?? [x0, x1]).map((v: number) => (
          <text key={v} x={X(v)} y={h - m.b + 48} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={l.tall ? 32 : 30} fill={sub(s.tone)} opacity={prog(t, s.t0 + 0.5, 0.5)}>{v}</text>
        ))}
        <g clipPath={`url(#${id})`}>
          {p.area !== false && <path d={`${line} L${X(x1)},${h - m.b} L${X(x0)},${h - m.b} Z`} fill={`url(#g-${s.id})`} />}
          <path d={line} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {d > 0 && d < 1 && <circle cx={X(xNow)} cy={Y(yAt(xNow))} r={15} fill={col} stroke={ink(s.tone)} strokeWidth={5} />}
        {(p.annotations ?? []).map((a: any, i: number) => {
          const ta = a.cue ? when(s, a.cue) : at + dur * ((a.x - x0) / (x1 - x0));
          const g = pop(t, fps, ta);
          if (t < ta) return null;
          const ax = X(a.x), ay = Y(yAt(a.x));
          const above = a.below ? 1 : -1;
          return (
            <g key={i} opacity={clamp01((t - ta) * 6)}>
              <line x1={ax} x2={ax} y1={ay} y2={ay + above * 70} stroke={ink(s.tone)} strokeWidth={3} opacity={0.5} />
              <circle cx={ax} cy={ay} r={13 * g} fill={C.yellow} stroke={s.tone === "navy" ? C.navy : C.cream} strokeWidth={5} />
              <text x={ax} y={ay + above * 86 + (a.below ? 22 : 0)} textAnchor={a.anchor ?? "middle"} fontFamily={F.body} fontWeight={800} fontSize={l.tall ? 34 : 32} fill={ink(s.tone)}>{a.label}</text>
            </g>
          );
        })}
      </svg>
      <Source s={s} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   5. TIMELINE          props: title, kicker, events[{label, text, cue, highlight}]
   Runs left to right on a wide screen, top to bottom on a tall one.
   ===================================================================================== */
export const Timeline: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const ev: any[] = s.props.events;
  const n = ev.length;
  const times = ev.map((e, i) => when(s, e.cue, i, n, 0.7));
  const top = headingSpace(s, l);
  // how far the line has grown: it reaches each event as that event appears
  let reach = 0;
  for (let i = 0; i < n; i++) reach = Math.max(reach, (i + glide(t, fps, times[i] - 0.25, { damping: 26, stiffness: 70 })) / n - 0.5 / n);
  const track = s.tone === "navy" ? "rgba(244,239,230,0.14)" : "rgba(14,26,43,0.12)";
  const dot = (i: number, on: boolean, hi: boolean) => (
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: on ? (hi ? C.red : C.yellow) : s.tone === "navy" ? C.navy3 : C.cream3, border: `7px solid ${s.tone === "navy" ? C.navy : C.cream}`, boxShadow: on ? `0 0 0 5px ${hi ? C.red : C.yellow}55` : undefined, transform: `scale(${on ? 0.6 + 0.4 * pop(t, fps, times[i]) : 0.7})` }} />
  );
  if (l.tall) {
    const rowH = (l.h - top) / n;
    return (
      <AbsoluteFill>
        <Heading s={s} align="left" />
        <div style={{ position: "absolute", left: l.x0 + 30, top: l.y0 + top + rowH * 0.5 - 4, width: 10, height: rowH * (n - 1) + 8, borderRadius: 5, background: track }} />
        <div style={{ position: "absolute", left: l.x0 + 30, top: l.y0 + top + rowH * 0.5 - 4, width: 10, height: Math.max(0, Math.min(reach * n - 0.5 + 0.5, n - 1)) * rowH, borderRadius: 5, background: C.yellow }} />
        {ev.map((e, i) => {
          const on = t >= times[i];
          return (
            <div key={i} style={{ position: "absolute", left: l.x0 + 13, top: l.y0 + top + rowH * i, height: rowH, width: l.w - 13, display: "flex", alignItems: "center", gap: 44 }}>
              {dot(i, on, e.highlight)}
              <Rise at={times[i]} from="right" dist={40} style={{ flex: 1 }}>
                <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 104, color: e.highlight ? C.red : ink(s.tone), lineHeight: 1 }}>{e.label}</div>
                <Body tone={s.tone} size={46} style={{ marginTop: 10, color: ink(s.tone), opacity: 0.86 }}>{e.text}</Body>
              </Rise>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const colW = l.w / n, lineY = l.y0 + top + (l.h - top) * 0.5;
  return (
    <AbsoluteFill>
      <Heading s={s} />
      <div style={{ position: "absolute", left: l.x0 + colW * 0.5, top: lineY - 5, width: colW * (n - 1), height: 10, borderRadius: 5, background: track }} />
      <div style={{ position: "absolute", left: l.x0 + colW * 0.5, top: lineY - 5, width: Math.max(0, Math.min(reach * n, n - 1)) * colW, height: 10, borderRadius: 5, background: C.yellow }} />
      {ev.map((e, i) => {
        const on = t >= times[i];
        return (
          <div key={i} style={{ position: "absolute", left: l.x0 + colW * i, width: colW, top: lineY - 22, height: 44, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {dot(i, on, e.highlight)}
            <Rise at={times[i]} from="down" dist={30} style={{ position: "absolute", top: -34, width: colW, textAlign: "center" }}><div style={{ transform: "translateY(-100%)" }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: e.label.length > 6 ? 84 : 120, color: e.highlight ? C.red : ink(s.tone), lineHeight: 1, letterSpacing: -2 }}>{e.label}</div></div>
            </Rise>
            <Rise at={times[i] + 0.15} style={{ marginTop: 34, width: colW - 70, textAlign: "center", flexShrink: 0 }}>
              <Body tone={s.tone} size={44} style={{ color: ink(s.tone), opacity: 0.88 }}>{e.text}</Body>
            </Rise>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   8. SPLIT SCREEN      props: kicker, left{...}, right{...}, source
        each side: flag, label, value + prefix/suffix/unit/decimals (counts up) or text, caption, cue, color
   Side by side on a wide screen, one above the other on a tall one.
   ===================================================================================== */
const Side: React.FC<{ s: SceneCtx; d: any; i: number }> = ({ s, d, i }) => {
  const l = useL();
  const { t } = useT();
  const at = when(s, d.cue, i, 2);
  const col = d.color === "muted" ? sub(s.tone) : colour(d.color, C.yellow);
  const big = l.tall ? 160 : 220;
  const v = d.value !== undefined ? lerp(0, d.value, prog(t, at + 0.1, 1.4, ease.out5)) : 0;
  const lit = clamp01((t - at + 0.15) * 4);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: l.tall ? 18 : 24, opacity: 0.32 + 0.68 * lit, transform: `scale(${0.96 + 0.04 * lit})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {d.flag && <Flag country={d.flag} w={l.tall ? 100 : 124} />}
        <Kicker color={ink(s.tone)} size={l.tall ? 38 : 42}>{d.label}</Kicker>
      </div>
      <div style={{ minHeight: big * 1.02, display: "flex", alignItems: "center" }}>
        {t >= at - 0.05 && (
          <Rise at={at} from="scale">
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: d.text && d.text.length > 8 ? big * 0.8 : big, lineHeight: 1, letterSpacing: -4, color: col, fontVariantNumeric: "tabular-nums", textAlign: "center", whiteSpace: "nowrap" }}>
              {d.text ?? `${d.prefix ?? ""}${fmt(v, d.decimals ?? 0)}${d.suffix ?? ""}`}
            </div>
          </Rise>
        )}
      </div>
      <div style={{ minHeight: 60, textAlign: "center" }}>
        {d.unit && <Rise at={at + 0.2}><div style={{ fontFamily: F.head, fontWeight: 800, fontSize: l.tall ? 60 : 76, color: ink(s.tone), lineHeight: 1 }}>{d.unit}</div></Rise>}
        {d.caption && <Rise at={at + 0.35} style={{ marginTop: d.unit ? 14 : 0 }}><Body tone={s.tone} size={l.tall ? 40 : 42}>{d.caption}</Body></Rise>}
      </div>
    </div>
  );
};
export const Split: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const top = headingSpace(s, l);
  const grow = prog(t, s.t0 + 0.3, 0.7, ease.inOut);
  return (
    <AbsoluteFill>
      <Heading s={s} />
      <div style={{ position: "absolute", left: l.x0, top: l.y0 + top, width: l.w, height: l.h - top, display: "flex", flexDirection: l.tall ? "column" : "row", alignItems: "stretch" }}>
        <Side s={s} d={s.props.left} i={0} />
        <div style={{ alignSelf: "center", width: l.tall ? "86%" : 0, height: l.tall ? 0 : "86%", borderLeft: l.tall ? undefined : `7px dashed ${C.yellow}`, borderTop: l.tall ? `7px dashed ${C.yellow}` : undefined, opacity: 0.9, transform: l.tall ? `scaleX(${grow})` : `scaleY(${grow})` }} />
        <Side s={s} d={s.props.right} i={1} />
      </div>
      <Source s={s} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   9. ICON ROW          props: title, kicker, items[{icon, label, text, cue}]  (2 to 4 items)
   ===================================================================================== */
export const Icons: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const items: any[] = s.props.items;
  const n = items.length;
  const top = headingSpace(s, l);
  const times = items.map((it, i) => when(s, it.cue, i, n, 0.8));
  const newest = times.reduce((best, tm, i) => (t >= tm ? i : best), -1);
  return (
    <AbsoluteFill>
      <Heading s={s} />
      <div style={{ position: "absolute", left: l.x0, top: l.y0 + top, width: l.w, height: l.h - top, display: "flex", flexDirection: l.tall ? "column" : "row", alignItems: "center", justifyContent: "center", gap: l.tall ? 34 : 46 }}>
        {items.map((it, i) => {
          const at = times[i];
          const g = pop(t, fps, at);
          const isNew = i === newest;
          if (t < at - 0.02) return <div key={i} style={l.tall ? { width: "100%", height: 230 } : { flex: 1, maxWidth: 500, height: 470 }} />;
          return (
            <Card key={i} tone={s.tone} style={{
              ...(l.tall ? { width: "100%", height: 230, flexDirection: "row", padding: "0 44px", gap: 40, textAlign: "left" } : { flex: 1, maxWidth: 500, height: 470, flexDirection: "column", padding: "0 34px", gap: 22, textAlign: "center" }),
              display: "flex", alignItems: "center", justifyContent: l.tall ? "flex-start" : "center", boxSizing: "border-box",
              transform: `translateY(${(1 - g) * 50}px) scale(${0.9 + 0.1 * g})`, opacity: clamp01((t - at) * 7),
              outline: isNew ? `5px solid ${C.yellow}` : "5px solid transparent",
            }}>
              <div style={{ width: l.tall ? 150 : 190, height: l.tall ? 150 : 190, flexShrink: 0, borderRadius: "50%", background: s.tone === "navy" ? "rgba(14,26,43,0.55)" : "rgba(14,26,43,0.06)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t * 1.3 + i) * 3}deg)` }}>
                <Icon name={it.icon} size={l.tall ? 96 : 120} />
              </div>
              <div>
                <Kicker size={l.tall ? 32 : 28}>{it.label}</Kicker>
                <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: l.tall ? 50 : 44, color: ink(s.tone), lineHeight: 1.12, marginTop: 12 }}>{it.text}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   10. QUESTION CARD    props: kicker, text, accent, cue
   The question stays on screen through the beat that follows it.
   ===================================================================================== */
export const Question: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const at = when(s, s.props.cue);
  const words: string[] = s.props.text.split(" ");
  const size = l.tall ? 104 : 116;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.tall ? l.cx : l.x1 - 250, top: l.cy, transform: `translate(-50%,-50%) rotate(${8 + Math.sin(t * 0.9) * 4}deg) scale(${1 + Math.sin(t * 1.4) * 0.03})`, fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 1100 : 900, lineHeight: 1, color: s.tone === "navy" ? "rgba(244,239,230,0.06)" : "rgba(14,26,43,0.06)" }}>?</div>
      <Stage style={{ alignItems: l.tall ? "center" : "flex-start", textAlign: l.tall ? "center" : "left", gap: 34, paddingLeft: l.tall ? 0 : 30 }}>
        {s.props.kicker && <Rise at={s.t0 + 0.3} from="down"><Kicker color={C.red} size={l.tall ? 38 : 36}>{s.props.kicker}</Kicker></Rise>}
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1.06, letterSpacing: -3, color: ink(s.tone), maxWidth: l.tall ? l.w : 1380 }}>
          {words.map((w, i) => {
            const wa = at + i * 0.09;
            const hit = s.props.accent && w.replace(/[^\w']/g, "") === s.props.accent;
            return (
              <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, opacity: clamp01((t - wa) * 8), transform: `translateY(${(1 - prog(t, wa, 0.35)) * 26}px)`, color: hit ? C.red : undefined }}>{w}</span>
            );
          })}
        </div>
        <div style={{ height: 12, width: l.tall ? 300 : 360, borderRadius: 6, background: C.yellow, transform: `scaleX(${prog(t, at + words.length * 0.09, 0.6)})`, transformOrigin: l.tall ? "center" : "left" }} />
      </Stage>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   10b. ANSWER CARD     props: kicker, text, sub, accent, cue
   ===================================================================================== */
export const Answer: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const at = when(s, s.props.cue, 0, 1, 0.15);
  const size = l.tall ? 170 : 210;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.cx, top: l.cy, transform: "translate(-50%,-50%)", opacity: prog(t, at, 0.6) }}><Rays size={l.tall ? 1500 : 1600} opacity={0.13} /></div>
      <Burst at={at + 0.05} x={l.cx} y={l.cy} size={l.tall ? 900 : 1000} />
      <Stage style={{ gap: 30, textAlign: "center" }}>
        {s.props.kicker && <Rise at={s.t0 + 0.1} from="down"><Kicker color={sub(s.tone)} size={l.tall ? 38 : 36}>{s.props.kicker}</Kicker></Rise>}
        <Rise at={at} from="scale">
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: s.props.text.length > 14 ? size * 0.62 : size, lineHeight: 1.02, letterSpacing: -4, color: C.yellow, maxWidth: l.w }}>
            <Accent text={s.props.text} accent={s.props.accent} color={ink(s.tone)} />
          </div>
        </Rise>
        <div style={{ height: 14, width: l.tall ? 440 : 560, borderRadius: 7, background: C.red, transform: `scaleX(${prog(t, at + 0.35, 0.5)})` }} />
        {s.props.sub && <Rise at={when(s, s.props.subCue, 0, 1, 0) > at ? when(s, s.props.subCue) : at + 0.8}><Body tone={s.tone} size={l.tall ? 48 : 46} style={{ color: ink(s.tone), maxWidth: l.tall ? 880 : 1300 }}>{s.props.sub}</Body></Rise>}
      </Stage>
    </AbsoluteFill>
  );
};
