import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { geoBounds, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-50m.json";
import { glide, lerp, pop, rnd, useT } from "../lib/anim";
import { Icon } from "../components/ui";
import {
  Accent, Body, C, Card, F, Head, Heading, Kicker, OilDrop, Rise, SceneCtx, Source, Stage, Template, clamp01, colour, ease, headingSpace, ink, prog, sub, useL, when,
} from "./kit";

/* =====================================================================================
   6. MAP               props: kicker, title, center [lon, lat], span (degrees of longitude across the frame),
                               countries[{name, label, color, labelAt [lon, lat]}],
                               lines[{points [[lon, lat]...], cue, label, labelAt 0..1}],
                               points[{lon, lat, label, cue, kind "oil" | "dot", big, delay}],
                               zoomTo {center, span, at (seconds into the scene) or cue, dur}
   Country shapes: Natural Earth (public domain), 1:50m.
   ===================================================================================== */
type Feat = { properties: { name: string }; bounds: [[number, number], [number, number]]; geometry: any; type: "Feature" };
const FEATURES: Feat[] = (feature(world as any, (world as any).objects.countries) as any).features.map((f: any) => ({ ...f, bounds: geoBounds(f) }));

export const MapScene: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const p = s.props;
  const z = p.zoomTo;
  const zAt = z ? (z.cue ? when(s, z.cue) : s.t0 + (z.at ?? 0.3)) : 0;
  const zp = z ? prog(t, zAt, z.dur ?? 2, ease.inOut) : 0;
  const center: [number, number] = z ? [lerp(p.center[0], z.center[0], zp), lerp(p.center[1], z.center[1], zp)] : p.center;
  const span = z ? Math.exp(lerp(Math.log(p.span), Math.log(z.span), zp)) : p.span;
  const still = !z || zp <= 0 || zp >= 1;
  const key = still ? `${center}-${span}-${l.W}` : `${t}`;
  const { proj, shapes } = useMemo(() => {
    const k = l.W / ((span * Math.PI) / 180);
    const pr = geoMercator().center(center).scale(k).translate([l.W / 2, l.tall ? l.H * 0.44 : l.H * 0.5]).clipExtent([[-80, -80], [l.W + 80, l.H + 80]]);
    const path = geoPath(pr);
    const halfLon = span * 0.75, halfLat = span * (l.H / l.W) * 0.6;
    const near = FEATURES.filter((f) => f.bounds[0][0] < center[0] + halfLon && f.bounds[1][0] > center[0] - halfLon && f.bounds[0][1] < center[1] + halfLat && f.bounds[1][1] > center[1] - halfLat);
    return { proj: pr, shapes: near.map((f) => ({ name: f.properties.name, d: path(f as any) ?? "" })) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const chosen: Record<string, any> = Object.fromEntries((p.countries ?? []).map((c: any) => [c.name, c]));
  const land = s.tone === "navy" ? "#243B60" : "#DCD3C0", edge = s.tone === "navy" ? "#0B1524" : "#F4EFE6";
  const xy = (lon: number, lat: number) => proj([lon, lat]) as [number, number];
  const ls = l.tall ? 1.15 : 1;
  return (
    <AbsoluteFill>
      <svg width={l.W} height={l.H} style={{ position: "absolute" }}>
        {shapes.map((sh) => {
          const c = chosen[sh.name];
          const on = c ? prog(t, s.t0 + 0.35 + (p.countries.indexOf(c)) * 0.25, 0.6) : 0;
          return (
            <g key={sh.name}>
              <path d={sh.d} fill={land} stroke={edge} strokeWidth={2.5} strokeLinejoin="round" />
              {c && <path d={sh.d} fill={colour(c.color, C.blue)} opacity={on * 0.92} stroke={edge} strokeWidth={2.5} strokeLinejoin="round" />}
            </g>
          );
        })}
        {(p.lines ?? []).map((ln: any, i: number) => {
          const at = ln.cue ? when(s, ln.cue) : s.t0 + 0.1;
          const d = ln.cue ? prog(t, at, ln.dur ?? 1.5, ease.inOut) : 1;
          const pts = ln.points.map((q: [number, number]) => xy(q[0], q[1]));
          const path = "M" + pts.map((q: number[]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" L");
          if (d <= 0.001) return null;
          return (
            <g key={i}>
              <path d={path} fill="none" stroke="rgba(245,184,61,0.28)" strokeWidth={22 * ls} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${d} 1`} />
              <path d={path} fill="none" stroke={C.yellow} strokeWidth={8 * ls} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${d} 1`} />
            </g>
          );
        })}
      </svg>
      {(p.countries ?? []).filter((c: any) => c.label && c.labelAt).map((c: any, i: number) => {
        let [x, y] = xy(c.labelAt[0], c.labelAt[1]);
        const half = c.label.length * 19 * ls + 20; // keep the name on screen when the map zooms
        x = Math.max(l.x0 - 40 + half, Math.min(l.W - (l.x0 - 40) - half, x));
        y = Math.max(l.y0 + (l.tall ? 110 : 60), Math.min(l.y1 - 40, y));
        return (
          <div key={c.name} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: prog(t, s.t0 + 0.6 + i * 0.25, 0.5), fontFamily: F.head, fontWeight: 900, fontSize: 44 * ls, letterSpacing: 6, color: C.white, textShadow: "0 4px 18px rgba(0,0,0,0.55)" }}>{c.label}</div>
        );
      })}
      {(p.lines ?? []).filter((ln: any) => ln.label).map((ln: any, i: number) => {
        const at = (ln.cue ? when(s, ln.cue) + (ln.dur ?? 1.5) * 0.7 : s.t0 + 0.5);
        if (t < at) return null;
        const f = (ln.labelAt ?? 0.5) * (ln.points.length - 1), a = Math.floor(f), b = Math.min(a + 1, ln.points.length - 1);
        let [x, y] = xy(lerp(ln.points[a][0], ln.points[b][0], f - a), lerp(ln.points[a][1], ln.points[b][1], f - a));
        y = Math.max(l.y0 + (l.tall ? 120 : 40), Math.min(l.y1 - 40, y));
        const g = pop(t, fps, at);
        return (
          <div key={i} style={{ position: "absolute", left: x + 26, top: y, transform: `translate(0,-50%) scale(${g})`, transformOrigin: "left center", background: C.yellow, color: C.navy, fontFamily: F.body, fontWeight: 800, fontSize: 30 * ls, padding: "10px 22px", borderRadius: 30, whiteSpace: "nowrap", boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>{ln.label}</div>
        );
      })}
      {(p.points ?? []).map((pt: any, i: number) => {
        const at = when(s, pt.cue, i, p.points.length) + (pt.delay ?? 0);
        if (t < at) return null;
        const [x, y] = xy(pt.lon, pt.lat);
        const g = pop(t, fps, at);
        const size = (pt.big ? 96 : 76) * ls;
        const ring = ((t - at) % 1.8) / 1.8;
        const side = pt.labelSide ?? (x > l.W * 0.58 ? "left" : "right"); // keep the label on screen
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y }}>
            <div style={{ position: "absolute", left: -size, top: -size, width: size * 2, height: size * 2, borderRadius: "50%", border: `5px solid ${C.yellow}`, opacity: (1 - ring) * 0.8, transform: `scale(${0.4 + ring * 0.75})` }} />
            <div style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: "50%", background: pt.kind === "oil" ? C.cream : C.yellow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${g})`, boxShadow: "0 10px 26px rgba(0,0,0,0.4)", border: `5px solid ${C.navy}`, boxSizing: "border-box" }}>
              {pt.kind === "oil" && <OilDrop size={size * 0.58} />}
            </div>
            {pt.label && (
              <div style={{ position: "absolute", left: side === "left" ? undefined : size * 0.72, right: side === "left" ? size * 0.72 : undefined, top: 0, transform: `translate(0,-50%) scale(${pop(t, fps, at + 0.15)})`, transformOrigin: side === "left" ? "right center" : "left center", background: C.navy, color: C.cream, fontFamily: F.head, fontWeight: 800, fontSize: 42 * ls, padding: "10px 26px", borderRadius: 16, whiteSpace: "nowrap", border: `3px solid ${C.yellow}`, boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>{pt.label}</div>
            )}
          </div>
        );
      })}
      <Heading s={s} align={l.tall ? "center" : "left"} />
      <Source s={s} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   7. PHOTO SCENE       props: photo (key from the script's "photos"), kicker, title, titleCue, caption,
                               move "in" | "out" | "left" | "right", focus [x, y] 0..1
   The photo drifts slowly; the title and a soft foreground haze move at a different rate, which gives depth.
   The credit comes from the photo's licence record automatically.
   ===================================================================================== */
export const Photo: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const p = s.props;
  const dur = Math.max(s.t1 - s.t0, 1);
  const k = clamp01((t - s.t0 + 0.4) / (dur + 0.8));
  const [fx, fy] = p.focus ?? [0.5, 0.5];
  const move = p.move ?? "in";
  const sc = move === "in" ? lerp(1.06, 1.2, k) : move === "out" ? lerp(1.2, 1.06, k) : 1.14;
  const dx = move === "left" ? lerp(3, -3, k) : move === "right" ? lerp(-3, 3, k) : 0;
  const credit = s.photos[p.photo]?.credit;
  const titleAt = p.titleCue ? when(s, p.titleCue) : s.t0 + 0.5;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <Img src={staticFile(`photos/${p.photo}.jpg`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%`, transform: `scale(${sc}) translateX(${dx}%)`, transformOrigin: `${fx * 100}% ${fy * 100}%`, filter: "saturate(0.92) contrast(1.04)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(9,18,30,0.55) 0%, rgba(9,18,30,0) 26%, rgba(9,18,30,0) 46%, rgba(9,18,30,0.88) 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(900px 700px at ${20 + k * 18}% ${l.tall ? 30 : 24}%, rgba(245,184,61,0.14), transparent 70%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(0,0,0,0.55)" }} />
      <div style={{ position: "absolute", left: l.x0, width: l.w, bottom: l.tall ? l.H - l.y1 + 20 : 230, transform: `translateX(${lerp(-14, 14, k)}px)`, textAlign: l.tall ? "center" : "left" }}>
        {p.kicker && <Rise at={s.t0 + 0.4} from="down" dist={20}><Kicker size={l.tall ? 38 : 34}>{p.kicker}</Kicker></Rise>}
        {p.title && (
          <Rise at={titleAt} style={{ marginTop: 14 }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: p.title.length > 14 ? (l.tall ? 78 : 92) : (l.tall ? 150 : 170), lineHeight: 1.04, letterSpacing: -2, color: C.white, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{p.title}</div>
          </Rise>
        )}
      </div>
      <div style={{ position: "absolute", right: l.tall ? undefined : 60, left: l.tall ? 0 : undefined, width: l.tall ? l.W : undefined, top: l.tall ? 200 : 50, textAlign: l.tall ? "center" : "right", opacity: prog(t, s.t0 + 0.7, 0.5) * 0.92, fontFamily: F.body, fontWeight: 600, fontSize: l.tall ? 26 : 23, color: "rgba(255,255,255,0.86)", textShadow: "0 2px 8px rgba(0,0,0,0.7)", lineHeight: 1.35 }}>
        {p.caption && <div>{p.caption}</div>}
        {credit && <div style={{ fontWeight: 500, opacity: 0.85 }}>Photo: {credit}</div>}
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   11. QUOTE / RULE CARD props: text, accent, by, kicker, cue
   ===================================================================================== */
export const Quote: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const at = when(s, s.props.cue, 0, 1, 0.3);
  const text: string = s.props.text, accent: string | undefined = s.props.accent;
  const size = text.length > 60 ? (l.tall ? 78 : 86) : (l.tall ? 96 : 108);
  const i = accent ? text.indexOf(accent) : -1;
  const sweep = prog(t, at + 0.9, 0.6, ease.inOut);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.x0 - 10, top: l.y0 - (l.tall ? 40 : 90), fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 420 : 520, lineHeight: 1, color: C.yellow, opacity: 0.9 * prog(t, s.t0 + 0.2, 0.5), transform: `translateY(${Math.sin(t * 1.1) * 6}px)` }}>“</div>
      <Stage style={{ alignItems: "flex-start", textAlign: "left", gap: 30, paddingLeft: l.tall ? 10 : 150, paddingTop: l.tall ? 190 : 120 }}>
        {s.props.kicker && <Rise at={s.t0 + 0.3} from="down"><Kicker color={C.red}>{s.props.kicker}</Kicker></Rise>}
        <Rise at={at} dist={40}>
          <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: size, lineHeight: 1.14, letterSpacing: -2, color: ink(s.tone), maxWidth: l.tall ? l.w - 20 : 1400 }}>
            {i < 0 ? text : (
              <>
                {text.slice(0, i)}
                <span style={{ backgroundImage: `linear-gradient(${C.yellow}, ${C.yellow})`, backgroundRepeat: "no-repeat", backgroundSize: `${sweep * 100}% 46%`, backgroundPosition: "0 82%", padding: "0 6px", margin: "0 -6px" }}>{accent}</span>
                {text.slice(i + accent!.length)}
              </>
            )}
          </div>
        </Rise>
        {s.props.by && <Rise at={at + 0.5}><Body tone={s.tone} size={l.tall ? 40 : 38}>{s.props.by}</Body></Rise>}
      </Stage>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   12. NAME WALL        props: title, names[], resolve {text, label, cue}
   Many names fill the screen, then fade back as one owner or one number lands on top.
   ===================================================================================== */
export const NameWall: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const names: string[] = s.props.names;
  const r = s.props.resolve;
  const rAt = r ? when(s, r.cue, 0, 1, Math.max((s.t1 - s.t0) * 0.55, 1.5)) : Infinity;
  const back = r ? prog(t, rAt - 0.1, 0.5) : 0;
  const start = s.t0 + 0.3, each = Math.min(0.09, Math.max(rAt === Infinity ? 3 : rAt - start - 0.6, 1) / names.length);
  const fs = (names.length > 70 ? 28 : names.length > 45 ? 34 : 42) * (l.tall ? 0.74 : 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.x0 - 30, top: l.y0 - 20, width: l.w + 60, height: l.h + 40, display: "flex", flexWrap: "wrap", gap: l.tall ? 16 : 18, alignContent: "center", justifyContent: "center", opacity: 1 - back * 0.82, filter: back > 0.02 ? `blur(${back * 5}px)` : undefined, transform: `scale(${1 - back * 0.04})` }}>
        {names.map((n, i) => {
          const at = start + rnd(`${s.id}-${i}`) * each * names.length;
          const g = pop(t, fps, at);
          const hot = rnd(`h-${i}`) < 0.16;
          return (
            <div key={i} style={{ fontFamily: F.body, fontWeight: 700, fontSize: fs, padding: `${fs * 0.36}px ${fs * 0.7}px`, borderRadius: fs, whiteSpace: "nowrap", color: hot ? C.navy : ink(s.tone), background: hot ? C.yellow : s.tone === "navy" ? "rgba(34,56,90,0.9)" : "rgba(255,255,255,0.85)", border: `2px solid ${s.tone === "navy" ? "rgba(244,239,230,0.12)" : "rgba(14,26,43,0.08)"}`, opacity: t < at ? 0 : 1, transform: `scale(${g})` }}>{n}</div>
          );
        })}
      </div>
      {r && t >= rAt - 0.05 && (
        <Stage>
          <Rise at={rAt} from="scale">
            <Card tone="navy" style={{ padding: l.tall ? "50px 60px" : "54px 90px", textAlign: "center", background: "rgba(14,26,43,0.94)", border: `4px solid ${C.yellow}` }}>
              {r.label && <Kicker size={l.tall ? 34 : 32}>{r.label}</Kicker>}
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: r.text.length > 10 ? (l.tall ? 110 : 130) : (l.tall ? 190 : 230), lineHeight: 1.02, color: C.cream, letterSpacing: -3, marginTop: 14 }}>{r.text}</div>
              {r.caption && <Body tone="navy" size={l.tall ? 40 : 38} style={{ marginTop: 16, color: C.cream }}>{r.caption}</Body>}
            </Card>
          </Rise>
        </Stage>
      )}
      {s.props.title && back < 0.5 && (
        <div style={{ position: "absolute", left: l.x0, width: l.w, top: l.y0 - (l.tall ? 70 : 78), textAlign: "center", opacity: 1 - back * 2 }}>
          <Rise at={s.t0 + 0.2} from="down"><Kicker>{s.props.title}</Kicker></Rise>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   13. SIMPLE DIAGRAM   props: title, kicker, nodes[{icon, label, sub, cue, color}], links["label", ...]
   A flow of money: source -> pot -> spending. Dots travel along each arrow once it appears.
   ===================================================================================== */
export const Flow: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const nodes: any[] = s.props.nodes, links: string[] = s.props.links ?? [];
  const n = nodes.length;
  const top = headingSpace(s, l);
  const times = nodes.map((nd, i) => when(s, nd.cue, i, n, 0.7));
  const box = l.tall ? { w: l.w * 0.78, h: 210 } : { w: Math.min(400, (l.w - 170 * (n - 1)) / n), h: 380 };
  const gap = l.tall ? ((l.h - top) - box.h * n) / Math.max(n - 1, 1) : (l.w - box.w * n) / Math.max(n - 1, 1);
  const pos = (i: number) => l.tall
    ? { x: l.x0 + (l.w - box.w) / 2, y: l.y0 + top + i * (box.h + gap) }
    : { x: l.x0 + i * (box.w + gap), y: l.y0 + top + ((l.h - top) - box.h) / 2 };
  return (
    <AbsoluteFill>
      <Heading s={s} />
      {nodes.slice(0, -1).map((_, i) => {
        const at = times[i + 1] - 0.45;
        const d = prog(t, at, 0.5, ease.inOut);
        if (t < at) return null;
        const a = pos(i), b = pos(i + 1);
        const x1 = l.tall ? a.x + box.w / 2 : a.x + box.w + 14, y1 = l.tall ? a.y + box.h + 12 : a.y + box.h / 2;
        const x2 = l.tall ? x1 : b.x - 14, y2 = l.tall ? b.y - 12 : y1;
        const len = l.tall ? y2 - y1 : x2 - x1;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: l.tall ? x1 - 6 : x1, top: l.tall ? y1 : y1 - 6, width: l.tall ? 12 : len * d, height: l.tall ? len * d : 12, borderRadius: 6, background: C.yellow, opacity: 0.9 }} />
            {d >= 1 && [0, 1, 2].map((k) => {
              const f = ((t * 0.55 + k / 3) % 1);
              return <div key={k} style={{ position: "absolute", left: (l.tall ? x1 : x1 + len * f) - 13, top: (l.tall ? y1 + len * f : y1) - 13, width: 26, height: 26, borderRadius: "50%", background: C.cream, border: `5px solid ${C.amber}`, boxSizing: "border-box", opacity: Math.sin(f * Math.PI) }} />;
            })}
            {links[i] && (
              <div style={{ position: "absolute", left: l.tall ? x1 + 34 : x1 + len / 2, top: l.tall ? y1 + len / 2 : y1 - 58, transform: l.tall ? "translate(0,-50%)" : "translate(-50%,-50%)", opacity: prog(t, at + 0.4, 0.4), fontFamily: F.body, fontWeight: 800, fontSize: l.tall ? 32 : 28, color: C.yellow, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 3 }}>{links[i]}</div>
            )}
          </React.Fragment>
        );
      })}
      {nodes.map((nd, i) => {
        const at = times[i];
        if (t < at - 0.02) return null;
        const g = pop(t, fps, at);
        const q = pos(i);
        return (
          <Card key={i} tone={s.tone} style={{ position: "absolute", left: q.x, top: q.y, width: box.w, height: box.h, boxSizing: "border-box", display: "flex", flexDirection: l.tall ? "row" : "column", alignItems: "center", justifyContent: l.tall ? "flex-start" : "center", gap: l.tall ? 34 : 18, padding: l.tall ? "0 40px" : "0 26px", textAlign: l.tall ? "left" : "center", transform: `scale(${0.85 + 0.15 * g})`, opacity: clamp01((t - at) * 7), borderBottom: `10px solid ${colour(nd.color, C.yellow)}` }}>
            {nd.icon && <Icon name={nd.icon} size={l.tall ? 120 : 150} />}
            <div>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 54 : 50, color: ink(s.tone), lineHeight: 1.08 }}>{nd.label}</div>
              {nd.sub && <Body tone={s.tone} size={l.tall ? 36 : 32} style={{ marginTop: 8 }}>{nd.sub}</Body>}
            </div>
          </Card>
        );
      })}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   14. SUBSCRIBE MOMENT props: line (optional). The same five-second design in every video.
   ===================================================================================== */
export const Subscribe: Template = ({ s }) => {
  const l = useL();
  const { t, fps } = useT();
  const press = when(s, s.props.cue, 0, 1, 1.5);
  const pressed = t >= press;
  const dip = Math.sin(clamp01((t - press) / 0.3) * Math.PI) * 0.07;
  const g = pop(t, fps, s.t0 + 0.25);
  const w = l.tall ? 620 : 700;
  return (
    <Stage style={{ gap: l.tall ? 50 : 44 }}>
      <Rise at={s.t0 + 0.15} from="down"><Head tone={s.tone} size={l.tall ? 60 : 64} style={{ textAlign: "center", maxWidth: l.tall ? 860 : 1300 }}>{s.props.line ?? "More stories like this one, every week"}</Head></Rise>
      <div style={{ width: w, height: l.tall ? 170 : 180, borderRadius: 90, background: pressed ? (s.tone === "navy" ? C.navy3 : C.cream3) : C.red, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, transform: `scale(${g * (1 - dip)})`, boxShadow: pressed ? "0 8px 20px rgba(0,0,0,0.2)" : "0 22px 50px rgba(227,70,59,0.42)" }}>
        {pressed && <svg viewBox="0 0 24 24" width={76} height={76}><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={C.green} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset={30 * (1 - prog(t, press + 0.05, 0.3))} /></svg>}
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: l.tall ? 78 : 84, color: pressed ? ink(s.tone) : C.white, letterSpacing: -1 }}>{pressed ? "Subscribed" : "Subscribe"}</div>
      </div>
      <Rise at={s.t0 + 0.6}><Body tone={s.tone} size={l.tall ? 40 : 38}>{s.props.sub ?? "It's free, and it helps the channel."}</Body></Rise>
    </Stage>
  );
};

/* =====================================================================================
   15. END CARD         props: kicker, title, line
   Leaves room for YouTube's end-screen elements: a video on the left and the subscribe circle on the right
   (they are added in YouTube Studio; the dashed frames show where they go). Same layout in every video.
   ===================================================================================== */
export const EndCard: Template = ({ s }) => {
  const l = useL();
  const { t } = useT();
  const dash = s.tone === "navy" ? "rgba(244,239,230,0.45)" : "rgba(14,26,43,0.4)";
  const vw = l.tall ? 760 : 820, vh = vw * 9 / 16, cw = l.tall ? 280 : 300;
  const march = (t * 30) % 46;
  const slot = (w: number, h: number, round: boolean, label: string, at: number) => (
    <Rise at={at} from="scale">
      <div style={{ width: w, height: h, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
          <rect x={3} y={3} width={w - 6} height={h - 6} rx={round ? h / 2 : 30} fill={s.tone === "navy" ? "rgba(34,56,90,0.5)" : "rgba(255,255,255,0.55)"} stroke={dash} strokeWidth={6} strokeDasharray="28 18" strokeDashoffset={-march} />
        </svg>
        <div style={{ position: "relative", fontFamily: F.body, fontWeight: 800, fontSize: round ? 30 : 38, color: sub(s.tone), textTransform: "uppercase", letterSpacing: 4, textAlign: "center" }}>{label}</div>
      </div>
    </Rise>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: l.x0, width: l.w, top: l.y0 - (l.tall ? 0 : 30), textAlign: "center" }}>
        <Rise at={s.t0 + 0.2} from="down"><Kicker color={C.red}>{s.props.kicker ?? "Next"}</Kicker></Rise>
        <Rise at={s.t0 + 0.35} style={{ marginTop: 14 }}><Head tone={s.tone} size={l.tall ? 64 : 66}>{s.props.title}</Head></Rise>
      </div>
      <div style={{ position: "absolute", left: l.x0, width: l.w, top: l.y0 + (l.tall ? 260 : 150), height: l.h - (l.tall ? 260 : 150), display: "flex", flexDirection: l.tall ? "column" : "row", alignItems: "center", justifyContent: "center", gap: l.tall ? 60 : 130 }}>
        {slot(vw, vh, false, "Next video", s.t0 + 0.6)}
        {slot(cw, cw, true, "Subscribe", s.t0 + 0.85)}
      </div>
    </AbsoluteFill>
  );
};

export { Accent };
