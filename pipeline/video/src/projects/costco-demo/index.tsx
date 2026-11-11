import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../../lib/theme";
import { clamp01, ease, glide, lerp, pop, prog, rnd, useT } from "../../lib/anim";
import { Timings, useScene, useTimings } from "../../lib/timings";
import { Big, Burst, Check, Donut, Icon, Label, Pill, Pop, Rays, Sfx, SourceNote, Stamp, useCount } from "../../components/ui";
import { Cart, Coin, MembershipCard, Peep, PriceTag, Warehouse } from "../../components/art";
import { VideoShell } from "../../components/shell";

/* All on-screen figures: Costco fiscal 2026 (52 weeks to 30 Aug 2026). See projects/costco-demo/sources.md */
const FACTS = { netSalesB: 297, feesB: 5.9, feesExact: 5.907, profitB: 9.2, profitExact: 9.226, membersM: 84, renewal: 89.8, fee: 65 };

/* ============ 1. HOOK ============ */
const Hook: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const shift = glide(t, fps, c.inflation - 0.3);
  const dogX = lerp(610, 400, shift), tagX = lerp(1310, 1000, shift), ghostX = 1545;
  const title = glide(t, fps, c.title - 0.25);
  const year = Math.round(lerp(1985, 2026, prog(t, c.today - 0.05, 0.85, ease.inOut)));
  const infl = lerp(1.5, 4.0, prog(t, c.inflation + 0.35, c.four + 0.3 - (c.inflation + 0.35), ease.inOut));
  const inflDone = t >= c.four + 0.3;
  const stamped = prog(t, c.refused, 0.3);
  const yearMove = glide(t, fps, c.hotdog - 0.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: lerp(1, 0.1, title), transform: `scale(${lerp(1, 0.93, title)})`, filter: title > 0.02 ? `blur(${title * 7}px)` : undefined }}>
        {/* year */}
        <Pop at={0.2} x={lerp(960, dogX, yearMove)} y={lerp(450, 215, yearMove)} scale={lerp(2.1, 1, yearMove)}>
          <Big size={150} color={C.cream}>{year}</Big>
          <div style={{ height: 10, borderRadius: 5, background: C.yellow, marginTop: 10, transform: `scaleX(${prog(t, 0.45, 0.5)})`, transformOrigin: "left" }} />
        </Pop>
        {/* hot dog + soda */}
        <Pop at={c.hotdog - 0.18} x={dogX} y={560}>
          <div style={{ width: 430, height: 430, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #2B4A78, #1B3154)", border: `5px dashed rgba(245,184,61,0.7)`, transform: `rotate(${t * 8}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }} />
        </Pop>
        <Pop at={c.hotdog} x={dogX - 20} y={545} float={7} rot={-8}><Icon name="hot-dog" size={330} /></Pop>
        <Pop at={c.hotdog + 0.5} x={dogX + 150} y={650} float={6} seed={3} rot={8}><Icon name="cup-with-straw" size={190} /></Pop>
        <Pop at={c.hotdog + 0.8} x={dogX} y={822}><Pill bg={C.navy3} color={C.cream} size={26}>Hot dog + soda combo</Pill></Pop>
        {/* the real price */}
        <PriceTag x={tagX} holeY={190} at={c.price - 0.16} label="PRICE" value="$1.50" pulseAt={c.still} />
        <Burst at={c.still} x={tagX} y={420} size={620} />
        <Pop at={c.still + 0.1} x={tagX} y={705}><Pill bg={C.green} color={C.navy} size={30}><Check size={30} />Same price</Pill></Pop>
        <Pop at={c.forty} x={tagX} y={790}><Pill bg={C.yellow} color={C.navy} size={30}>40+ years</Pill></Pop>
        {/* what inflation says */}
        <PriceTag x={ghostX} holeY={190} at={c.inflation - 0.1} label="WITH INFLATION" ghost baseRot={5} value={inflDone ? "$4+" : `$${infl.toFixed(2)}`} dim={stamped * 0.45} />
        <Stamp at={c.refused} x={ghostX} y={556} text="REFUSED" size={66} />
      </AbsoluteFill>
      {/* title card */}
      {t > c.title - 0.25 && (
        <AbsoluteFill>
          <Pop at={c.title - 0.2} x={960} y={270} float={8}><Icon name="hot-dog" size={150} /></Pop>
          <Pop at={c.title - 0.12} x={960} y={440} from="up" dist={60}><Big size={112}>HOW COSTCO</Big></Pop>
          <Pop at={c.title + 0.05} x={960} y={580} from="up" dist={60}>
            <Big size={112}>
              <span style={{ color: C.yellow, position: "relative" }}>
                ACTUALLY
                <span style={{ position: "absolute", left: 0, right: 0, bottom: -16, height: 12, borderRadius: 6, background: C.red, transform: `scaleX(${prog(t, c.title + 0.4, 0.45)})`, transformOrigin: "left" }} />
              </span>{" "}
              MAKES MONEY
            </Big>
          </Pop>
        </AbsoluteFill>
      )}
      <Sfx at={0.2} name="pop_low" volume={0.45} />
      <Sfx at={c.hotdog - 0.4} name="swish" volume={0.4} />
      <Sfx at={c.hotdog} name="pop" volume={0.5} />
      <Sfx at={c.hotdog + 0.5} name="pop_low" volume={0.4} />
      <Sfx at={c.price - 0.2} name="swish" volume={0.5} />
      <Sfx at={c.price + 0.05} name="chaching" volume={0.35} />
      <Sfx at={c.today - 0.05} name="roll_short" volume={0.55} />
      <Sfx at={c.still} name="ding" volume={0.3} />
      <Sfx at={c.inflation - 0.15} name="swish" volume={0.45} />
      <Sfx at={c.inflation + 0.35} name="roll" volume={0.5} />
      <Sfx at={c.refused} name="thud" volume={0.5} />
      <Sfx at={c.forty} name="pop" volume={0.4} />
      <Sfx at={c.title - 0.45} name="whoosh" volume={0.45} />
      <Sfx at={c.title + 0.02} name="impact" volume={0.4} />
    </AbsoluteFill>
  );
};

/* ============ 2. REVENUE vs PROFIT ============ */
const Revenue: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const s = useScene("revenue");
  const out = glide(t, fps, c.strange - 0.25);
  const sales = useCount(0, FACTS.netSalesB, c.num - 0.1, 1.3);
  const hi = prog(t, c.cents, 0.35);
  const one = prog(t, c.cents - 0.12, 0.3, ease.in);
  const cell = 58, gx = 1040, gy = 222;
  const cartX = lerp(-140, 900, ((t - s.start) * 0.16) % 1);
  return (
    <AbsoluteFill>
      {/* beat A: the store and the sales number */}
      {out < 0.99 && (
        <AbsoluteFill style={{ opacity: 1 - out, transform: `translateX(${-out * 220}px)` }}>
          <Pop at={s.start + 0.12} x={540} y={490} from="left" dist={140}>
            <div style={{ width: 800, height: 580, borderRadius: 44, background: "linear-gradient(180deg,#1D3B6B 0%,#2A538F 62%,#22385A 62%,#1A2C48 100%)", position: "relative", overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.4), inset 0 0 0 4px rgba(244,239,230,0.08)" }}>
              <div style={{ position: "absolute", left: 590, top: 54, width: 110, height: 110, borderRadius: "50%", background: "#FFD983", opacity: 0.9 }} />
              {[[80 + ((t * 12) % 900) - 100, 70, 1], [420 + ((t * 8) % 900) - 300, 130, 0.7]].map(([x, y, sc], i) => (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: 150 * sc, height: 44 * sc, borderRadius: 30, background: "rgba(244,239,230,0.22)" }} />
              ))}
              <div style={{ position: "absolute", left: 40, top: 96 }}><Warehouse at={s.start + 0.35} width={720} /></div>
              <div style={{ position: "absolute", left: cartX, top: 448, transform: `rotate(${Math.sin(t * 9) * 2}deg)` }}><Cart size={96} /></div>
              <div style={{ position: "absolute", left: (cartX + 420) % 1040 - 140, top: 456, transform: `rotate(${Math.sin(t * 9 + 2) * 2}deg)` }}><Cart size={86} items={["package", "roll-of-paper", "banana"]} /></div>
            </div>
          </Pop>
          <Pop at={c.sold} x={1040} y={318} anchor="left" from="right" dist={50}><Label size={34}>Costco sold</Label></Pop>
          <Pop at={c.num - 0.12} x={1032} y={470} anchor="left"><Big size={236}>${Math.round(sales)}</Big></Pop>
          <Pop at={c.num + 0.45} x={1040} y={640} anchor="left" from="up" dist={40}><Big size={96} color={C.yellow}>BILLION</Big></Pop>
          <Pop at={c.num + 0.8} x={1042} y={738} anchor="left" from="up" dist={30}>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.muted }}>of goods in its last financial year</div>
          </Pop>
        </AbsoluteFill>
      )}
      {/* beat B: 100 cents, 3 kept */}
      {t > c.strange - 0.2 && (
        <AbsoluteFill>
          <Pop at={c.strange + 0.05} x={170} y={300} anchor="left" from="right" dist={50}><Label size={36}>For every $1 in sales</Label></Pop>
          {one < 1 && (
            <Pop at={c.strange + 0.3} x={170} y={500} anchor="left" opacity={1 - one} scale={1 - one * 0.4}><Big size={220}>$1.00</Big></Pop>
          )}
          <Pop at={c.cents} x={170} y={490} anchor="left">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
              <Big size={110} color={C.muted} style={{ paddingBottom: 22 }}>≈</Big>
              <Big size={270} color={C.green}>3¢</Big>
            </div>
          </Pop>
          <Pop at={c.cents + 0.45} x={174} y={690} anchor="left" from="up" dist={40}><Big size={62}>KEPT AS PROFIT</Big></Pop>
          <div style={{ position: "absolute", left: gx, top: gy }}>
            {Array.from({ length: 100 }).map((_, i) => {
              const r = Math.floor(i / 10), col = i % 10;
              const at = c.strange + 0.3 + (r + col) * 0.04;
              const isHi = r === 9 && col < 3;
              const p = pop(t, fps, at, { damping: 12 });
              if (t < at) return null;
              return (
                <div key={i} style={{ position: "absolute", left: col * cell, top: r * cell, transform: `scale(${p * (isHi ? 1 + hi * 0.38 : 1)})`, zIndex: isHi ? 2 : 1, filter: isHi && hi > 0 ? `drop-shadow(0 0 ${hi * 16}px rgba(47,191,113,0.9))` : undefined }}>
                  <Coin size={46} color={isHi ? lerpColor(hi) : C.yellow} rim={isHi && hi > 0.5 ? "#1F9255" : C.amber} dim={isHi ? 0 : hi * 0.74} />
                </div>
              );
            })}
          </div>
          <Pop at={c.cents + 0.3} x={gx - 30} y={gy + 9.4 * cell} anchor="right" from="right" dist={30}>
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 28, color: C.green, letterSpacing: 2 }}>3 OF 100 →</div>
          </Pop>
        </AbsoluteFill>
      )}
      <SourceNote tone="navy" from={c.num + 0.3} to={c.strange - 0.3}>Net sales, fiscal 2026: $297.2 billion</SourceNote>
      <SourceNote tone="navy" from={c.cents + 0.3} to={s.end}>Net income ÷ total revenue, fiscal 2026 ≈ 3.0%</SourceNote>
      <Sfx at={s.start + 0.6} name="pop_low" volume={0.4} />
      <Sfx at={c.num - 0.1} name="roll" volume={0.6} />
      <Sfx at={c.num + 1.15} name="ding" volume={0.3} />
      <Sfx at={c.strange - 0.3} name="swish" volume={0.5} />
      <Sfx at={c.strange + 0.3} name="roll" volume={0.45} />
      <Sfx at={c.cents} name="chaching" volume={0.4} />
    </AbsoluteFill>
  );
};
const lerpColor = (p: number) => (p < 0.5 ? C.yellow : C.green);

/* ============ 3. MARKUP CAP ============ */
const Markup: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const s = useScene("markup");
  const chartOut = prog(t, c.low - 0.3, 0.3, ease.in);
  const barX = 390, costW = 940, barH = 96;
  const row = (y: number, icon: string, label: string, pct: number, color: string, costAt: number, markAt: number) => {
    const cost = prog(t, costAt, 0.6);
    const mark = prog(t, markAt, 0.5);
    const mw = costW * (pct / 100);
    return (
      <>
        <Pop at={costAt - 0.1} x={270} y={y}><Icon name={icon} size={128} /></Pop>
        <Pop at={costAt - 0.05} x={barX} y={y - 82} anchor="left" from="up" dist={24}><Label color={C.navy} size={28} spacing={4}>{label}</Label></Pop>
        <div style={{ position: "absolute", left: barX, top: y - barH / 2, width: costW * cost, height: barH, background: C.navy, borderRadius: "16px 0 0 16px", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 30, top: 0, height: barH, display: "flex", alignItems: "center", width: 600, fontFamily: F.body, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.cream, opacity: prog(t, costAt + 0.35, 0.3) }}>
            WHAT COSTCO PAYS FOR IT
          </div>
        </div>
        <div style={{ position: "absolute", left: barX + costW, top: y - barH / 2, width: mw * mark, height: barH, background: color, borderRadius: "0 16px 16px 0" }} />
        <Pop at={markAt} x={barX + costW + mw + 26} y={y} anchor="left"><Big size={112} color={color}>+{Math.round(pct * prog(t, markAt, 0.5, ease.out5))}%</Big></Pop>
      </>
    );
  };
  const units = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill>
      {/* "That's deliberate." */}
      <Pop at={c.deliberate - 0.05} out={c.cap - 0.3} x={960} y={470}>
        <div style={{ display: "flex", gap: 40 }}>
          <Big size={138} color={C.navy}>THAT'S</Big>
          <div style={{ transform: `scale(${pop(t, fps, c.deliberate + 0.28)})` }}><Big size={138} color={C.red}>DELIBERATE.</Big></div>
        </div>
      </Pop>
      {/* markup chart */}
      {t > c.cap - 0.15 && chartOut < 1 && (
        <AbsoluteFill style={{ opacity: 1 - chartOut, transform: `translateY(${-chartOut * 80}px)` }}>
          <Pop at={c.cap - 0.1} x={200} y={196} anchor="left" from="right" dist={40}><Label color={C.red} size={34}>Costco's markup cap</Label></Pop>
          <Pop at={c.cap + 0.1} x={200} y={250} anchor="left" from="right" dist={40}>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.mutedDark }}>The most it adds on top of what it pays</div>
          </Pop>
          {row(430, "television", "Brand-name products", 14, C.red, c.cap + 0.35, c.fourteen - 0.05)}
          {row(680, "package", "Kirkland Signature (own brand)", 15, C.amber, c.fourteen + 0.5, c.fifteen - 0.05)}
        </AbsoluteFill>
      )}
      {/* low prices → repeat shoppers */}
      {t > c.low - 0.1 && (
        <AbsoluteFill>
          <Pop at={c.low} x={520} y={250} rot={-3}><Pill bg={C.green} color={C.navy} size={46}><Icon name="down-arrow" size={50} />Low prices</Pill></Pop>
          <Pop at={c.back} x={1330} y={250} rot={3}>
            <Pill bg={C.navy} color={C.cream} size={46}><div style={{ transform: `rotate(${-t * 140}deg)` }}><Icon name="counterclockwise-arrows-button" size={50} /></div>Repeat shoppers</Pill>
          </Pop>
          <Pop at={c.low + 0.45} x={880} y={246}><Big size={90} color={C.navy}>→</Big></Pop>
          <div style={{ position: "absolute", left: 0, right: 0, top: 706, height: 8, background: "rgba(14,26,43,0.14)" }} />
          {units.map((i) => {
            const ux = 240 + i * 400 - (t - c.low) * 85;
            const bob = Math.abs(Math.sin(t * 6 + i * 1.3)) * 10;
            return (
              <React.Fragment key={i}>
              <Pop at={c.low + 0.08 * i} x={ux} y={712} from="up" dist={0}>
                <div style={{ width: 330, height: 26, borderRadius: "50%", background: "rgba(14,26,43,0.16)", transform: `scaleX(${1 - bob / 60})` }} />
              </Pop>
              <Pop at={c.low + 0.08 * i} x={ux} y={585 - bob}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <Peep id={i + 40} size={196} ring={C.navy} />
                  <div style={{ marginBottom: -14, transform: `rotate(${Math.sin(t * 6 + i) * 2.5}deg)` }}>
                    <Cart size={170} items={[["bread", "glass-of-milk", "package"], ["roll-of-paper", "banana", "cheese-wedge"], ["canned-food", "red-apple", "package"], ["pizza", "glass-of-milk", "teddy-bear"], ["package", "bread", "banana"]][i]} />
                  </div>
                </div>
              </Pop>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      )}
      <SourceNote tone="cream" from={c.fourteen + 0.4} to={c.low - 0.35}>Markup caps as widely reported: 14% brands, 15% Kirkland</SourceNote>
      <Sfx at={c.deliberate - 0.05} name="pop_low" volume={0.45} />
      <Sfx at={c.deliberate + 0.28} name="thud" volume={0.45} />
      <Sfx at={c.cap - 0.3} name="swish" volume={0.45} />
      <Sfx at={c.fourteen - 0.05} name="pop" volume={0.5} />
      <Sfx at={c.fifteen - 0.05} name="pop" volume={0.5} />
      <Sfx at={c.low - 0.3} name="swish" volume={0.45} />
      <Sfx at={c.low} name="ding" volume={0.3} />
      <Sfx at={c.back} name="pop" volume={0.5} />
      <span style={{ display: "none" }}>{s.id}</span>
    </AbsoluteFill>
  );
};

/* ============ 4. THE MEMBERSHIP ============ */
const Membership: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const s = useScene("membership");
  const cardIn = pop(t, fps, c.this - 0.03, { damping: 13, stiffness: 150, mass: 0.9 });
  const mv = glide(t, fps, c.members - 0.75);
  const cx = lerp(960, 480, mv), cy = lerp(480, 395, mv), cs = lerp(1.25, 0.9, mv);
  const members = useCount(0, FACTS.membersM, c.members - 0.05, 1.1);
  const fees = useCount(0, FACTS.feesB, c.fees - 0.1, 1.1);
  const cols = 7, chip = 100, gap = 18, gx = 975, gy = 305;
  const total = { x: 480, y: 728 };
  const words1 = ["WHERE", "DOES", "THE", "MONEY"], words2 = ["ACTUALLY", "COME", "FROM?"];
  const qOut = c.this - 0.14;
  const gridOut = c.nocost - 0.3;
  const bx = 1090, bw = 690, bh = 72;
  const g1 = prog(t, c.nocost + 0.2, 0.7), g2 = prog(t, c.nocost + 1.3, 0.7);
  const barText: React.CSSProperties = { position: "absolute", top: 0, height: bh, display: "flex", alignItems: "center", fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 3, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      {/* the question */}
      {t < qOut + 0.3 && (
        <AbsoluteFill>
          <Pop at={c.where - 0.1} out={qOut} x={960} y={250} float={9}><Icon name="money-bag" size={190} /></Pop>
          {[[-190, 190, -18], [185, 170, 14], [245, 300, 22]].map(([dx, yy, r], i) => (
            <Pop key={i} at={c.where + 0.5 + i * 0.22} out={qOut} x={960 + dx} y={yy} rot={r} float={6} seed={i}><Icon name="red-question-mark" size={88} /></Pop>
          ))}
          <Pop at={c.where} out={qOut} x={960} y={470}>
            <div style={{ display: "flex", gap: 38 }}>{words1.map((w, i) => <div key={i} style={{ transform: `scale(${pop(t, fps, c.where + i * 0.13, { damping: 15 })})` }}><Big size={104}>{w}</Big></div>)}</div>
          </Pop>
          <Pop at={c.where + 0.5} out={qOut} x={960} y={612}>
            <div style={{ display: "flex", gap: 38 }}>{words2.map((w, i) => <div key={i} style={{ transform: `scale(${pop(t, fps, c.where + 0.55 + i * 0.16, { damping: 15 })})` }}><Big size={104} color={i === 0 ? C.yellow : C.cream}>{w}</Big></div>)}</div>
          </Pop>
        </AbsoluteFill>
      )}
      {/* the card */}
      {t > c.this - 0.05 && (
        <>
          <div style={{ position: "absolute", left: cx - 600, top: cy - 600, opacity: clamp01((t - c.this) * 3) * lerp(1, 0.55, mv) }}><Rays size={1200} opacity={0.2} /></div>
          <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) rotate(${lerp(-16, -5, cardIn) + Math.sin(t * 1.2) * 0.8}deg) scale(${cs * lerp(2.4, 1, cardIn)})`, opacity: clamp01((t - c.this + 0.03) * 12) }}>
            <MembershipCard shineAt={c.this + 0.25} />
          </div>
          <Burst at={c.this + 0.02} x={960} y={480} size={1100} />
        </>
      )}
      <Pop at={c.need} out={c.members - 0.85} x={900} y={150} rot={-3} z={3}>
        <Pill bg={C.red} color={C.cream} size={36}><Icon name="locked" size={40} />Members only</Pill>
      </Pop>
      {/* $65 a year */}
      <Pop at={c.fee} x={cx + 302 * cs} y={cy - 203 * cs} rot={10} z={3} scale={cs / 0.9}>
        <div style={{ width: 236, height: 236, borderRadius: "50%", background: C.yellow, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.4), inset 0 0 0 10px #DB9216" }}>
          <Big size={92} color={C.navy}>${FACTS.fee}</Big>
          <Label color={C.navy} size={26} spacing={4} style={{ marginTop: 4 }}>a year</Label>
        </div>
      </Pop>
      <Pop at={c.fee + 0.4} x={cx} y={cy + 232 * cs} from="up" dist={24}>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.muted }}>Basic U.S. membership</div>
      </Pop>
      {/* 84 million members */}
      <Pop at={c.members - 0.08} out={gridOut} x={gx} y={212} anchor="left">
        <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
          <Big size={104} color={C.yellow}>{Math.round(members)}M+</Big>
          <Big size={46}>PAYING MEMBERS</Big>
        </div>
      </Pop>
      {Array.from({ length: 28 }).map((_, i) => {
        const r = Math.floor(i / cols), col = i % cols;
        const at = c.members + 0.1 + r * 0.09 + col * 0.05;
        const x = gx + col * (chip + gap) + chip / 2, y = gy + r * (chip + gap) + chip / 2;
        const pay = clamp01((t - (c.adds + i * 0.028)) / 0.75);
        const e = ease.inOut(pay);
        const arc = Math.sin(pay * Math.PI) * -130;
        return (
          <React.Fragment key={i}>
            <Pop at={at} out={gridOut + col * 0.02} x={x} y={y}><Peep id={i + 1} size={chip} /></Pop>
            {pay > 0 && pay < 1 && (
              <div style={{ position: "absolute", left: lerp(x, total.x, e) - 15, top: lerp(y, total.y, e) + arc - 15, zIndex: 4 }}><Coin size={30} /></div>
            )}
          </React.Fragment>
        );
      })}
      {/* $5.9 billion in fees */}
      <Pop at={c.fees - 0.18} x={total.x} y={total.y}><Big size={112} color={C.green}>${fees.toFixed(1)} BILLION</Big></Pop>
      <Pop at={c.fees + 0.5} x={total.x} y={818} from="up" dist={24}><Label color={C.cream} size={30}>in fees, every year</Label></Pop>
      {/* groceries vs fees: what is left after costs */}
      {t > c.nocost - 0.1 && (
        <>
          <Pop at={c.nocost} x={gx} y={236} anchor="left" from="right" dist={40}><Label size={32}>For every $1 that comes in</Label></Pop>
          <Pop at={c.nocost + 0.1} x={1022} y={410}><Icon name="shopping-cart" size={100} /></Pop>
          <Pop at={c.nocost + 0.12} x={bx} y={346} anchor="left" from="up" dist={20}><Label color={C.cream} size={27} spacing={4}>From groceries</Label></Pop>
          <div style={{ position: "absolute", left: bx, top: 410 - bh / 2, width: bw * g1, height: bh, borderRadius: 16, overflow: "hidden", background: "#3A5788" }}>
            <div style={{ ...barText, left: 26, color: C.cream, opacity: prog(t, c.nocost + 0.6, 0.3) }}>GOES ON COSTS</div>
            <div style={{ position: "absolute", left: bw * 0.97, top: 0, width: bw * 0.03, height: bh, background: C.green }} />
          </div>
          <Pop at={c.nocost + 0.85} x={bx + bw} y={478} anchor="right" from="up" dist={16}>
            <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 25, color: C.green }}>a sliver is kept ↑</div>
          </Pop>
          <Pop at={c.nocost + 1.2} x={1022} y={640}><Icon name="credit-card" size={100} /></Pop>
          <Pop at={c.nocost + 1.22} x={bx} y={576} anchor="left" from="up" dist={20}><Label color={C.cream} size={27} spacing={4}>From membership fees</Label></Pop>
          <div style={{ position: "absolute", left: bx, top: 640 - bh / 2, width: bw * g2, height: bh, borderRadius: 16, overflow: "hidden", background: C.green }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: bw * 0.08, height: bh, background: "#3A5788" }} />
            <div style={{ ...barText, left: bw * 0.08 + 26, color: C.navy, opacity: prog(t, c.nocost + 1.7, 0.3) }}>MOSTLY KEPT</div>
          </div>
          <Pop at={c.nocost + 1.9} x={bx} y={728} anchor="left"><Pill bg={C.green} color={C.navy} size={25}><Check size={26} />Very little cost to collect</Pill></Pop>
          <Pop at={c.nocost + 1.4} x={bx + bw} y={790} anchor="right" from="up" dist={16}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 22, color: C.muted }}>Illustration only, not to scale</div>
          </Pop>
        </>
      )}
      <SourceNote tone="navy" from={c.members + 0.8} to={c.nocost - 0.3}>Costco fiscal 2026: 84.1M paid members, $5.9B membership fees</SourceNote>
      <Sfx at={c.where} name="pop_low" volume={0.4} />
      <Sfx at={c.this - 0.85} name="rise" volume={0.5} />
      <Sfx at={c.this} name="impact" volume={0.45} />
      <Sfx at={c.this + 0.25} name="ding" volume={0.3} />
      <Sfx at={c.members - 0.75} name="swish" volume={0.45} />
      <Sfx at={c.fee} name="chaching" volume={0.4} />
      <Sfx at={c.members} name="roll" volume={0.55} />
      <Sfx at={c.adds} name="roll" volume={0.5} />
      <Sfx at={c.fees + 0.95} name="chaching" volume={0.45} />
      <Sfx at={c.nocost - 0.3} name="swish" volume={0.45} />
      <Sfx at={c.nocost + 0.2} name="pop_low" volume={0.45} />
      <Sfx at={c.nocost + 1.3} name="pop" volume={0.5} />
      <Sfx at={c.nocost + 1.9} name="ding" volume={0.3} />
    </AbsoluteFill>
  );
};

/* ============ 5. FEES vs PROFIT ============ */
const Compare: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const s = useScene("compare");
  const base = 782, maxH = 470, bw = 196;
  const hA = maxH * (FACTS.feesExact / FACTS.profitExact), hB = maxH;
  const xA = 214, xB = 500;
  const gA = prog(t, c.side + 0.15, 0.8), gB = prog(t, c.side + 0.6, 0.8);
  const link = prog(t, c.twothirds - 0.1, 0.55, ease.inOut);
  const renew = useCount(0, FACTS.renewal, c.nine - 0.15, 1.2);
  const pct = Math.round((FACTS.feesExact / FACTS.profitExact) * 100 * prog(t, c.twothirds, 0.6, ease.out5));
  const slide = lerp(340, 0, glide(t, fps, c.renew - 0.55));
  return (
    <AbsoluteFill>
     <AbsoluteFill style={{ transform: `translateX(${slide}px)` }}>
      <Pop at={s.start + 0.2} x={200} y={196} anchor="left" from="right" dist={40}><Label color={C.red} size={34}>Fees vs. profit</Label></Pop>
      {/* bars */}
      <div style={{ position: "absolute", left: 190, top: base, width: 540, height: 8, borderRadius: 4, background: C.navy, opacity: prog(t, s.start + 0.2, 0.3) }} />
      <div style={{ position: "absolute", left: xA, top: base - hA * gA, width: bw, height: hA * gA, background: C.amber, borderRadius: "14px 14px 0 0" }} />
      <div style={{ position: "absolute", left: xB, top: base - hB * gB, width: bw, height: hB * gB, background: C.green, borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: bw * link, height: hA, background: `repeating-linear-gradient(135deg, ${C.amber} 0 18px, #E9A93A 18px 36px)`, borderTop: `5px solid ${C.navy}` }} />
      </div>
      <Pop at={c.side + 0.45} x={xA + bw / 2} y={base - hA - 48}><Big size={62} color={C.navy}>${(FACTS.feesB * gA).toFixed(1)}B</Big></Pop>
      <Pop at={c.side + 0.9} x={xB + bw / 2} y={base - hB - 48}><Big size={62} color={C.navy}>${(FACTS.profitB * gB).toFixed(1)}B</Big></Pop>
      <Pop at={c.side + 0.2} x={xA + bw / 2} y={base + 44} from="up" dist={20}><Label color={C.navy} size={23} spacing={2}>Membership fees</Label></Pop>
      <Pop at={c.side + 0.65} x={xB + bw / 2} y={base + 44} from="up" dist={20}><Label color={C.navy} size={23} spacing={2}>Total profit</Label></Pop>
      {/* dashed link from fee bar across the profit bar */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <line x1={xA + bw} y1={base - hA} x2={lerp(xA + bw, xB, link)} y2={base - hA} stroke={C.navy} strokeWidth={5} strokeDasharray="14 12" />
      </svg>
      {/* callout */}
      <Pop at={c.twothirds} x={740} y={468} anchor="left"><Big size={170} color={C.red}>{pct}%</Big></Pop>
      <Pop at={c.twothirds + 0.4} x={746} y={598} anchor="left" from="up" dist={24}>
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 36, color: C.navy, lineHeight: 1.25, whiteSpace: "normal", width: 380 }}>of Costco's entire annual profit</div>
      </Pop>
     </AbsoluteFill>
      {/* renewals */}
      {t > c.renew - 0.1 && (
        <>
          <Pop at={c.renew} x={1490} y={440}>
            <div style={{ position: "relative" }}>
              <Donut value={renew / 100} r={160} stroke={46} color={C.green} track={C.cream3} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Big size={78} color={C.navy}>{renew.toFixed(1)}%</Big></div>
            </div>
          </Pop>
          <Pop at={c.renew + 0.35} x={1490} y={690} from="up" dist={24}><Label color={C.navy} size={30}>of members renew</Label></Pop>
          {Array.from({ length: 10 }).map((_, i) => (
            <Pop key={i} at={c.nine + 0.1 + i * 0.06} x={1490 - 4.5 * 62 + i * 62} y={778}><Peep id={i + 60} size={52} ring={C.navy} gray={i === 9} /></Pop>
          ))}
        </>
      )}
      <SourceNote tone="cream" from={c.side + 1.2} to={s.end}>Fiscal 2026: fees $5.9B (revenue) vs net income $9.2B · worldwide renewal rate</SourceNote>
      <Sfx at={c.side + 0.15} name="swish" volume={0.4} />
      <Sfx at={c.side + 0.6} name="swish" volume={0.4} />
      <Sfx at={c.twothirds} name="chaching" volume={0.4} />
      <Sfx at={c.renew - 0.55} name="swish" volume={0.45} />
      <Sfx at={c.renew} name="pop_low" volume={0.45} />
      <Sfx at={c.nine - 0.15} name="roll" volume={0.5} />
      <Sfx at={c.nine + 1.0} name="ding" volume={0.3} />
    </AbsoluteFill>
  );
};

/* ============ 6. PAYOFF ============ */
const Payoff: React.FC = () => {
  const { t, fps } = useT();
  const { cues: c } = useTimings();
  const up = glide(t, fps, c.membership - 0.3);
  const items: [number, string, string, number][] = [
    [520, "shopping-cart", "Cheap groceries", c.groc],
    [960, "fuel-pump", "Cheap fuel", c.fuel],
    [1400, "hot-dog", "$1.50 hot dog", c.dog],
  ];
  const wig = (i: number) => Math.exp(-3 * Math.max(0, t - c.bait)) * Math.sin((t - c.bait) * 22 + i) * (t > c.bait ? 7 : 0);
  const cardIn = pop(t, fps, c.membership - 0.1, { damping: 13, stiffness: 140, mass: 0.9 });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateY(${-up * 90}px) scale(${lerp(1, 0.42, up)})`, transformOrigin: "50% 16%", opacity: lerp(1, 0.7, up) }}>
        {items.map(([x, icon, label, at], i) => (
          <React.Fragment key={i}>
            <Pop at={at} x={x} y={500} rot={wig(i)}>
              <div style={{ width: 270, height: 270, borderRadius: "50%", background: C.navy2, boxShadow: `inset 0 0 0 6px ${C.navy3}, 0 24px 50px rgba(0,0,0,0.35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={icon} size={160} />
              </div>
            </Pop>
            <Pop at={at + 0.15} x={x} y={690} from="up" dist={24}><Label color={C.cream} size={30} spacing={4}>{label}</Label></Pop>
            <Sfx at={at} name="pop" volume={0.5} />
          </React.Fragment>
        ))}
        <Pop at={c.bait + 0.12} x={960} y={230} rot={-3}>
          <Pill bg={C.red} color={C.cream} size={76} style={{ fontFamily: F.head, fontWeight: 900 }}>
            <div style={{ transform: `rotate(${Math.sin(t * 4) * 14}deg)`, transformOrigin: "50% 0%" }}><Icon name="hook" size={84} /></div>
            The bait
          </Pill>
        </Pop>
      </AbsoluteFill>
      {t > c.membership - 0.15 && (
        <>
          <div style={{ position: "absolute", left: 960 - 650, top: 575 - 650, opacity: clamp01((t - c.business) * 3) }}><Rays size={1300} opacity={0.24} /></div>
          <div style={{ position: "absolute", left: 960, top: 575, transform: `translate(-50%,-50%) translateY(${(1 - cardIn) * 520}px) rotate(${-4 + Math.sin(t * 1.3) * 0.8}deg) scale(0.98)` }}>
            <MembershipCard shineAt={c.business + 0.1} />
          </div>
          <Burst at={c.business} x={960} y={575} size={1150} />
          {Array.from({ length: 16 }).map((_, i) => {
            const p = clamp01((t - c.business) / (0.9 + rnd(`cd${i}`) * 0.5));
            if (p <= 0 || p >= 1) return null;
            const a = (i / 16) * Math.PI * 2 + rnd(`ca${i}`);
            const dist = ease.out(p) * (420 + rnd(`cr${i}`) * 260);
            return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * dist - 20, top: 590 + Math.sin(a) * dist * 0.7 + p * p * 160 - 20, opacity: 1 - p * p, zIndex: 3 }}><Coin size={40} /></div>;
          })}
          <Pop at={c.business + 0.05} x={960} y={812} rot={-3} z={4}>
            <Pill bg={C.yellow} color={C.navy} size={76} style={{ fontFamily: F.head, fontWeight: 900 }}>The business</Pill>
          </Pop>
        </>
      )}
      <Sfx at={c.bait + 0.12} name="thud" volume={0.48} />
      <Sfx at={c.membership - 0.35} name="whoosh" volume={0.45} />
      <Sfx at={c.business + 0.02} name="impact" volume={0.45} />
      <Sfx at={c.business + 0.12} name="chaching" volume={0.5} />
    </AbsoluteFill>
  );
};

export const CostcoDemo: React.FC<{ timings: Timings }> = ({ timings }) => (
  <VideoShell
    timings={timings}
    channel="MONEY MECHANICS"
    scenes={{
      hook: { tone: "navy", Comp: Hook },
      revenue: { tone: "navy", Comp: Revenue },
      markup: { tone: "cream", Comp: Markup },
      membership: { tone: "navy", Comp: Membership },
      compare: { tone: "cream", Comp: Compare },
      payoff: { tone: "navy", Comp: Payoff },
    }}
  />
);
