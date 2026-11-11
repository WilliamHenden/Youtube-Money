import React from "react";
import { Effigy } from "@opeepsfun/open-peeps";
import { C, F } from "../lib/theme";
import { clamp01, ease, glide, lerp, pop, prog, rnd, useT } from "../lib/anim";
import { Icon } from "./ui";

/* ---------- Hanging price tag ---------- */
export const PriceTag: React.FC<{
  x: number; holeY: number; at: number; w?: number; h?: number; label: string; value: React.ReactNode; ghost?: boolean;
  baseRot?: number; valueSize?: number; dim?: number; pulseAt?: number;
}> = ({ x, holeY, at, w = 380, h = 470, label, value, ghost = false, baseRot = -5, valueSize = 104, dim = 0, pulseAt }) => {
  const { t, fps } = useT();
  if (t < at - 0.02) return null;
  const tau = Math.max(0, t - at);
  const drop = glide(t, fps, at, { damping: 16, stiffness: 150 });
  const swing = baseRot + 22 * Math.exp(-2.2 * tau) * Math.cos(7.5 * tau) + Math.sin(t * 1.3 + x) * 0.9;
  const pulse = pulseAt === undefined ? 0 : Math.sin(clamp01((t - pulseAt) / 0.45) * Math.PI);
  const cut = w * 0.27, r = 30, hy = 64;
  const d = `M${cut},0 L${w - cut},0 L${w},${cut} L${w},${h - r} Q${w},${h} ${w - r},${h} L${r},${h} Q0,${h} 0,${h - r} L0,${cut} Z`;
  const fg = ghost ? C.cream : C.red;
  return (
    <div
      style={{
        position: "absolute", left: x - w / 2, top: holeY - hy, width: w, height: h, transformOrigin: `${w / 2}px ${hy}px`,
        transform: `translateY(${(1 - drop) * -820}px) rotate(${swing}deg) scale(${1 + pulse * 0.09})`, opacity: 1 - dim,
      }}
    >
      {/* string */}
      <div style={{ position: "absolute", left: w / 2 - 3, top: hy - 900, width: 6, height: 900, background: ghost ? "rgba(244,239,230,0.35)" : C.cream3, borderRadius: 3 }} />
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible", filter: ghost ? undefined : "drop-shadow(0 26px 34px rgba(0,0,0,0.38))" }}>
        <path d={d} fill={ghost ? "rgba(34,56,90,0.55)" : C.cream} stroke={ghost ? C.cream : "none"} strokeWidth={ghost ? 6 : 0} strokeDasharray={ghost ? "20 16" : undefined} strokeLinejoin="round" />
        {!ghost && <path d={`M${cut},0 L${w - cut},0 L${w},${cut} L${w},${cut + 20} L0,${cut + 20} L0,${cut} Z`} fill={C.red} />}
        <circle cx={w / 2} cy={hy} r={21} fill={C.navy} stroke={ghost ? C.cream : C.cream2} strokeWidth={7} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.36, textAlign: "center", fontFamily: F.body, fontWeight: 800, fontSize: 27, letterSpacing: 5, color: ghost ? C.muted : C.mutedDark }}>
        {label}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.47, textAlign: "center", fontFamily: F.head, fontWeight: 900, fontSize: valueSize, letterSpacing: -2, color: fg, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
    </div>
  );
};

/* ---------- Open Peeps character in a round chip ---------- */
const SKINS = ["#F6CBA8", "#E8B58E", "#D29A6A", "#B67B4E", "#8D5A36", "#6B4226"];
const TOPS = [C.red, C.blue, C.yellow, C.green, "#8F6FE0", "#F28A4B", "#35B8C4", C.cream];
const BODIES = ["Hoodie", "Tee", "ButtonShirt", "StripedTee", "PoloSweater", "SportyTee", "SweaterDots", "TeeSelena", "ThunderTee", "ButtonPocketShirt"];
const HEADS = ["ShortOne", "MediumOne", "Bun", "Afro", "LongHair", "ShortTwo", "Pomp", "MediumBangs", "FlatTop", "BunTwo", "Wavy", "ShortFive", "LongCurly", "Twists", "MediumStraight", "Bangs", "DreadsOne", "Shaved", "Hijab", "Turban"];
const FACES = ["Smile", "BigSmile", "Calm", "Cute", "SmileTeeth", "Cheeky", "SmileLOL", "Driven"];
const CHIP_BG = [C.cream, "#FFE1A6", "#CFE0FF", "#FFD3CD", "#CDEFDC"];
const pick = <T,>(arr: T[], seed: string) => arr[Math.floor(rnd(seed) * arr.length)];

export const Peep: React.FC<{ id: number; size: number; bg?: string; ring?: string; gray?: boolean; face?: string }> = ({ id, size, bg, ring = C.cream, gray = false, face }) => {
  const skin = pick(SKINS, `skin${id}`);
  const head = pick(HEADS, `head${id}`);
  const headOpts: Record<string, string> = { skinColor: skin, outlineColor: "#16202E", hijabColor: pick(TOPS, `hj${id}`), turbanColor: pick(TOPS, `tb${id}`), hairColor: "#16202E" };
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden", background: bg ?? pick(CHIP_BG, `bg${id}`), position: "relative",
        boxShadow: `0 0 0 ${Math.max(3, size * 0.035)}px ${ring}, 0 ${size * 0.08}px ${size * 0.16}px rgba(0,0,0,0.28)`, filter: gray ? "grayscale(1) opacity(0.35)" : undefined,
      }}
    >
      <Effigy
        body={{ type: pick(BODIES, `body${id}`), options: { skinColor: skin, topColor: pick(TOPS, `top${id}`), outlineColor: "#16202E" } }}
        head={{ type: head, options: headOpts }}
        face={{ type: face ?? pick(FACES, `face${id}`), options: { outlineColor: "#16202E" } }}
        style={{ position: "absolute", width: size * 1.06, height: "auto", left: -size * 0.03, top: size * 0.07 }}
      />
    </div>
  );
};

/* ---------- Shopping cart with goods ---------- */
export const Cart: React.FC<{ size: number; items?: string[] }> = ({ size, items = ["bread", "glass-of-milk", "package"] }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {items.map((n, i) => (
      <div key={i} style={{ position: "absolute", left: size * (0.3 + i * 0.17), top: size * (0.04 + (i % 2) * 0.06), transform: `rotate(${(i - 1) * 9}deg)` }}>
        <Icon name={n} size={size * 0.36} />
      </div>
    ))}
    <Icon name="shopping-cart" size={size} style={{ position: "absolute", left: 0, top: 0 }} />
  </div>
);

/* ---------- Warehouse store (original flat illustration) ---------- */
export const Warehouse: React.FC<{ at: number; width: number; name?: string }> = ({ at, width, name = "COSTCO" }) => {
  const { t, fps } = useT();
  const g = (d: number, cfg = {}) => pop(t, fps, at + d, { damping: 13, stiffness: 150, ...cfg });
  const body = glide(t, fps, at, { damping: 18, stiffness: 140 });
  const roof = g(0.28), sign = g(0.5), door = g(0.42), bays = g(0.58), trees = g(0.7);
  const W0 = 800, H0 = 440;
  return (
    <svg viewBox={`0 0 ${W0} ${H0}`} width={width} height={(width * H0) / W0} style={{ display: "block", overflow: "visible" }}>
      {/* trees */}
      {[[36, 1], [764, 0.85]].map(([x, s], i) => (
        <g key={i} transform={`translate(${x},400) scale(${trees * (s as number)})`}>
          <rect x={-7} y={-70} width={14} height={72} rx={5} fill="#7A5A3A" />
          <circle cx={0} cy={-104} r={48} fill="#27A862" />
          <circle cx={-22} cy={-80} r={30} fill="#2FBF71" />
          <circle cx={24} cy={-84} r={28} fill="#249656" />
        </g>
      ))}
      {/* main box */}
      <g transform={`translate(0,400) scale(1,${body}) translate(0,-400)`}>
        <rect x={70} y={120} width={660} height={280} fill={C.cream} />
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={70 + 66 * (i + 1) - 1.5} y={120} width={3} height={280} fill={C.cream2} />)}
        <rect x={70} y={350} width={660} height={50} fill={C.cream2} />
      </g>
      {/* roof band */}
      <g transform={`translate(400,118) scale(${roof},${roof}) translate(-400,-118)`} opacity={clamp01(roof * 3)}>
        <rect x={56} y={92} width={688} height={52} rx={8} fill={C.red} />
        <rect x={56} y={132} width={688} height={12} fill="#B9342B" />
      </g>
      {/* loading bays */}
      {[100, 196].map((x, i) => (
        <g key={i} transform={`translate(${x + 40},400) scale(1,${bays}) translate(${-(x + 40)},-400)`}>
          <rect x={x} y={270} width={80} height={130} rx={5} fill={C.navy3} />
          {[0, 1, 2, 3, 4].map((j) => <rect key={j} x={x + 6} y={282 + j * 24} width={68} height={5} rx={2} fill="#35507C" />)}
        </g>
      ))}
      {/* entrance */}
      <g transform={`translate(545,400) scale(${door}) translate(-545,-400)`} opacity={clamp01(door * 3)}>
        <rect x={440} y={262} width={210} height={138} rx={8} fill={C.navy2} />
        <rect x={452} y={274} width={90} height={126} fill="#3A6FC4" />
        <rect x={548} y={274} width={90} height={126} fill="#4B82DB" />
        <path d="M452,274 L500,274 L452,340 Z" fill="rgba(255,255,255,0.22)" />
        <path d="M548,274 L600,274 L548,346 Z" fill="rgba(255,255,255,0.22)" />
        <path d="M424,262 L666,262 L650,232 L440,232 Z" fill={C.yellow} />
        <path d="M424,262 L666,262 L666,270 L424,270 Z" fill={C.amber} />
      </g>
      {/* sign */}
      <g transform={`translate(400,196) scale(${sign}) translate(-400,-196)`} opacity={clamp01(sign * 3)}>
        <rect x={250} y={160} width={300} height={72} rx={12} fill={C.navy} />
        <text x={400} y={212} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} letterSpacing={6} fill={C.cream}>{name}</text>
      </g>
      {/* ground */}
      <rect x={-40} y={400} width={880} height={10} rx={5} fill="#35507C" />
    </svg>
  );
};

/* ---------- Membership card (generic design) ---------- */
export const MembershipCard: React.FC<{ shineAt?: number; peepId?: number }> = ({ shineAt, peepId = 3 }) => {
  const { t } = useT();
  const w = 620, h = 390;
  const sh = shineAt === undefined ? -1 : prog(t, shineAt, 0.8, ease.inOut);
  const bars = [5, 3, 8, 3, 5, 10, 3, 6, 3, 9, 4, 3, 7, 3, 5, 9, 3, 4, 8, 3, 6, 3];
  let bx = 0;
  return (
    <div style={{ width: w, height: h, borderRadius: 34, background: "linear-gradient(160deg,#FFFDF8 0%,#F1E9DA 100%)", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.45), 0 0 0 3px rgba(255,255,255,0.5) inset" }}>
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 104, background: `linear-gradient(90deg, ${C.red}, #F0624F)` }} />
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: F.head, fontWeight: 900, fontSize: 40, letterSpacing: 7, color: C.cream }}>MEMBERSHIP</div>
      <div style={{ position: "absolute", right: 34, top: 22 }}><Icon name="star" size={60} /></div>
      <div style={{ position: "absolute", left: 40, top: 136 }}><Peep id={peepId} size={150} bg="#CFE0FF" ring={C.cream2} face="Smile" /></div>
      <div style={{ position: "absolute", left: 226, top: 150, width: 250, height: 26, borderRadius: 13, background: C.navy }} />
      <div style={{ position: "absolute", left: 226, top: 196, width: 330, height: 16, borderRadius: 8, background: C.cream3 }} />
      <div style={{ position: "absolute", left: 226, top: 228, width: 210, height: 16, borderRadius: 8, background: C.cream3 }} />
      <div style={{ position: "absolute", left: 226, top: 262, fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: C.mutedDark }}>VALID FOR 1 YEAR</div>
      <div style={{ position: "absolute", left: 40, top: 312, height: 50, display: "flex" }}>
        {bars.map((b, i) => {
          const el = <div key={i} style={{ position: "absolute", left: bx, width: b, height: 50, background: i % 2 === 0 ? C.navy : "transparent" }} />;
          bx += b + 4;
          return el;
        })}
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 30, fontFamily: F.head, fontWeight: 900, fontSize: 30, color: C.red, letterSpacing: 2 }}>MEMBER</div>
      {sh > 0 && sh < 1 && (
        <div style={{ position: "absolute", top: -60, bottom: -60, width: 150, left: lerp(-220, w + 80, sh), background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)", transform: "skewX(-20deg)" }} />
      )}
    </div>
  );
};

/* ---------- Coin ---------- */
export const Coin: React.FC<{ size: number; color?: string; rim?: string; dim?: number }> = ({ size, color = C.yellow, rim = C.amber, dim = 0 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `inset 0 0 0 ${size * 0.11}px ${rim}`, opacity: 1 - dim, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: size * 0.2, height: size * 0.46, borderRadius: size * 0.1, background: rim, opacity: 0.85 }} />
  </div>
);
