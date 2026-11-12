// Draws the three mascot options as one review sheet. Run: node design/mascots/make.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const C = { navy: "#0E1A2B", navy2: "#15243A", navy3: "#22385A", cream: "#F4EFE6", cream2: "#E2D8C4", red: "#E3463B", redD: "#B9342B", blue: "#2F6FDB", green: "#2FBF71", yellow: "#F5B83D", amber: "#DB9216", muted: "#8FA0B8", glass: "#CFE0FF" };

function face({ cx, cy, s = 1, expr = "happy", gap = 32, lid = C.cream, ink = C.navy }) {
  const ew = 12.5 * s, eh = (expr === "shock" ? 21 : 17) * s, my = cy + 33 * s;
  let o = "";
  for (const side of [-1, 1]) {
    const ex = cx + side * gap * s;
    o += `<ellipse cx="${ex}" cy="${cy}" rx="${ew}" ry="${eh}" fill="${ink}"/><circle cx="${ex + 4 * s}" cy="${cy - 6 * s}" r="${4.6 * s}" fill="#fff"/>`;
    if (expr === "skeptic") o += `<rect x="${ex - ew - 2}" y="${cy - eh - 2}" width="${2 * ew + 4}" height="${eh * 0.78}" fill="${lid}"/>`;
  }
  const brow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="${6 * s}" stroke-linecap="round"/>`;
  const lx = cx - gap * s, rx = cx + gap * s;
  if (expr === "shock") o += brow(lx - 13 * s, cy - eh - 12 * s, lx + 11 * s, cy - eh - 17 * s) + brow(rx - 11 * s, cy - eh - 17 * s, rx + 13 * s, cy - eh - 12 * s);
  if (expr === "skeptic") o += brow(lx - 14 * s, cy - eh * 0.36, lx + 13 * s, cy - eh * 0.3) + brow(rx - 12 * s, cy - eh - 9 * s, rx + 14 * s, cy - eh - 17 * s);
  if (expr === "happy") {
    o += `<path d="M${cx - 17 * s},${my} Q${cx},${my + 25 * s} ${cx + 17 * s},${my} Z" fill="${ink}"/>`;
    for (const side of [-1, 1]) o += `<circle cx="${cx + side * (gap + 21) * s}" cy="${cy + 19 * s}" r="${10 * s}" fill="${C.red}" opacity="0.32"/>`;
  }
  if (expr === "shock") o += `<ellipse cx="${cx}" cy="${my + 6 * s}" rx="${9 * s}" ry="${12 * s}" fill="${ink}"/>`;
  if (expr === "skeptic") o += `<path d="M${cx - 14 * s},${my + 8 * s} Q${cx},${my + 2 * s} ${cx + 15 * s},${my + 1 * s}" stroke="${ink}" stroke-width="${6 * s}" fill="none" stroke-linecap="round"/>`;
  return o;
}

function hat(kind, x, y) {
  if (kind === "crown") return `<g transform="translate(${x},${y}) rotate(-8)"><path d="M-42,2 L-46,-38 L-22,-16 L0,-46 L22,-16 L46,-38 L42,2 Z" fill="${C.yellow}" stroke="${C.amber}" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="-12" r="6" fill="${C.red}"/><circle cx="-24" cy="-8" r="4.5" fill="${C.blue}"/><circle cx="24" cy="-8" r="4.5" fill="${C.blue}"/></g>`;
  if (kind === "tophat") return `<g transform="translate(${x},${y}) rotate(9)"><rect x="-34" y="-72" width="68" height="68" rx="7" fill="${C.blue}"/><rect x="-34" y="-28" width="68" height="13" fill="${C.red}"/><rect x="-54" y="-10" width="108" height="16" rx="8" fill="${C.blue}"/></g>`;
  if (kind === "bicorne") return `<g transform="translate(${x},${y})"><path d="M-74,4 Q0,-86 74,4 Q0,-22 -74,4 Z" fill="${C.navy3}" stroke="${C.yellow}" stroke-width="6" stroke-linejoin="round"/><circle cx="0" cy="-28" r="9" fill="${C.red}" stroke="${C.cream}" stroke-width="3"/></g>`;
  return "";
}
const shadow = `<ellipse cx="150" cy="326" rx="78" ry="10" fill="#000" opacity="0.28"/>`;

function ghost({ expr = "happy", h } = {}) {
  const body = "M50,130 A100,100 0 0 1 250,130 L250,272 Q230,300 210,272 Q190,246 170,272 Q150,300 130,272 Q110,246 90,272 Q70,300 50,272 Z";
  const up = expr === "shock";
  const arm = (side) => `<ellipse cx="${150 + side * 104}" cy="${up ? 150 : 192}" rx="22" ry="13" fill="${C.cream}" transform="rotate(${side * (up ? -55 : 28)} ${150 + side * 104} ${up ? 150 : 192})"/>`;
  return `${shadow}${arm(-1)}${arm(1)}<clipPath id="gb"><path d="${body}"/></clipPath><path d="${body}" fill="${C.cream}"/>
  <ellipse cx="238" cy="210" rx="52" ry="150" fill="${C.cream2}" opacity="0.75" clip-path="url(#gb)"/>
  ${face({ cx: 150, cy: 122, expr })}
  <g transform="translate(150,203)"><path d="M0,0 L-27,-15 L-27,15 Z M0,0 L27,-15 L27,15 Z" fill="${C.red}"/><circle r="7.5" fill="${C.redD}"/></g>
  ${hat(h, 150, 40)}`;
}

function clock({ expr = "happy", h } = {}) {
  let ticks = "";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, big = i % 3 === 0, r0 = big ? 68 : 72, r1 = 79; ticks += `<line x1="${150 + Math.sin(a) * r0}" y1="${165 - Math.cos(a) * r0}" x2="${150 + Math.sin(a) * r1}" y2="${165 - Math.cos(a) * r1}" stroke="${C.navy}" stroke-width="${big ? 6 : 3}" stroke-linecap="round" opacity="${big ? 0.85 : 0.4}"/>`; }
  const up = expr === "shock";
  const armL = up ? [58, 150, 14, 96] : [56, 186, 14, 226], armR = expr === "skeptic" ? [244, 186, 286, 226] : [244, 150, 292, 92];
  const arm = (a) => `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" stroke="${C.red}" stroke-width="13" stroke-linecap="round"/><circle cx="${a[2]}" cy="${a[3]}" r="13" fill="${C.cream}"/>`;
  return `${shadow}<line x1="124" y1="258" x2="118" y2="300" stroke="${C.red}" stroke-width="13" stroke-linecap="round"/><line x1="176" y1="258" x2="182" y2="300" stroke="${C.red}" stroke-width="13" stroke-linecap="round"/>
  <ellipse cx="108" cy="306" rx="22" ry="11" fill="${C.redD}"/><ellipse cx="192" cy="306" rx="22" ry="11" fill="${C.redD}"/>
  ${arm(armL)}${arm(armR)}
  ${h ? "" : `<circle cx="150" cy="36" r="14" fill="none" stroke="${C.yellow}" stroke-width="8"/><rect x="137" y="46" width="26" height="22" rx="5" fill="${C.amber}"/>`}
  <circle cx="150" cy="165" r="105" fill="${C.yellow}"/><circle cx="150" cy="165" r="105" fill="none" stroke="${C.amber}" stroke-width="9"/>
  <circle cx="150" cy="165" r="85" fill="${C.cream}"/>${ticks}
  ${face({ cx: 150, cy: 152, expr, gap: 28, s: 0.95 })}${hat(h, 150, 68)}`;
}

function hourglass({ expr = "happy", h } = {}) {
  const glass = "M88,54 L212,54 C212,128 164,150 159,172 C164,194 212,216 212,288 L88,288 C88,216 136,194 141,172 C136,150 88,128 88,54 Z";
  const up = expr === "shock";
  const armL = up ? [84, 150, 40, 104] : [84, 158, 42, 196], armR = expr === "skeptic" ? [216, 158, 258, 196] : [216, 150, 262, 100];
  const arm = (a) => `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" stroke="${C.cream}" stroke-width="10" stroke-linecap="round"/><circle cx="${a[2]}" cy="${a[3]}" r="12" fill="${C.cream}"/>`;
  return `${shadow}${arm(armL)}${arm(armR)}
  <rect x="74" y="46" width="9" height="250" rx="4" fill="${C.amber}"/><rect x="217" y="46" width="9" height="250" rx="4" fill="${C.amber}"/>
  <clipPath id="hg"><path d="${glass}"/></clipPath><path d="${glass}" fill="${C.glass}"/>
  <g clip-path="url(#hg)"><rect x="80" y="136" width="140" height="40" fill="${C.yellow}"/><path d="M80,290 L220,290 L220,268 Q150,214 80,268 Z" fill="${C.yellow}"/><rect x="147.5" y="172" width="5" height="70" fill="${C.yellow}"/>
  <path d="M100,60 Q96,110 124,140" stroke="#fff" stroke-width="7" fill="none" opacity="0.55" stroke-linecap="round"/></g>
  <rect x="62" y="30" width="176" height="26" rx="13" fill="${C.red}"/><rect x="62" y="286" width="176" height="26" rx="13" fill="${C.red}"/>
  ${face({ cx: 150, cy: 88, expr, gap: 27, s: 0.86, lid: C.glass })}${hat(h, 150, 34)}`;
}

const draw = { ghost, clock, hourglass };
const svg = (kind, w, opts) => `<svg viewBox="-20 -60 340 400" width="${w}" height="${(w * 400) / 340}">${draw[kind](opts)}</svg>`;
const options = [
  { kind: "ghost", letter: "A", name: "The Ghost", idea: "A friendly ghost who was there when it happened.", hat: "crown",
    notes: ["Simplest shape, strongest silhouette", "Floats, so it moves well with no walking", "Easy to dress for any era"] },
  { kind: "clock", letter: "B", name: "The Pocket Watch", idea: "A time-keeper whose arms are the clock hands.", hat: "tophat",
    notes: ["Says “time” and “history” at a glance", "Warm colour stands out in thumbnails", "More parts, so slightly busier when small"] },
  { kind: "hourglass", letter: "C", name: "The Hourglass", idea: "Time running out: built-in drama and countdowns.", hat: "bicorne",
    notes: ["Most unusual of the three", "Sand can drain as a video timer", "Small face, weakest at tiny sizes"] },
];
const card = (o) => `<div class="card"><div class="head"><div class="badge">${o.letter}</div><div><div class="name">${o.name}</div><div class="idea">${o.idea}</div></div></div>
  <div class="hero">${svg(o.kind, 330, {})}</div>
  <div class="row">${[["Shocked", { expr: "shock" }], ["Sceptical", { expr: "skeptic" }], ["In costume", { h: o.hat }]].map(([l, p]) => `<div class="v">${svg(o.kind, 172, p)}<div class="vl">${l}</div></div>`).join("")}</div>
  <div class="small"><span>At small sizes</span>${svg(o.kind, 84, {})}${svg(o.kind, 52, {})}${svg(o.kind, 34, {})}</div>
  <ul>${o.notes.map((n) => `<li>${n}</li>`).join("")}</ul></div>`;
const font = (f, w) => `@font-face{font-family:${f.includes("mont") ? "Montserrat" : "Inter"};font-weight:${w};src:url("file://${path.resolve(here, "../../pipeline/video/node_modules/@fontsource", f, `files/${f}-latin-${w}-normal.woff2`)}") format("woff2");}`;
const html = `<html><head><style>${font("montserrat", 900)}${font("montserrat", 800)}${font("inter", 600)}${font("inter", 800)}
body{margin:0;width:2400px;height:1290px;background:radial-gradient(1800px 1200px at 30% 15%,#1A2E4C,#0E1A2B 60%,#09121E);font-family:Inter;color:${C.cream};}
h1{font-family:Montserrat;font-weight:900;font-size:64px;margin:0;padding:54px 80px 4px;letter-spacing:-1px}h1 span{color:${C.yellow}}
.sub{padding:0 80px;font-size:28px;color:${C.muted};font-weight:600}
.cards{display:flex;gap:36px;padding:34px 80px}.card{flex:1;background:rgba(34,56,90,.45);border-radius:36px;padding:34px 36px;box-shadow:inset 0 0 0 3px rgba(244,239,230,.07)}
.head{display:flex;gap:22px;align-items:center}.badge{width:74px;height:74px;border-radius:20px;background:${C.yellow};color:${C.navy};font-family:Montserrat;font-weight:900;font-size:46px;display:flex;align-items:center;justify-content:center;flex:none}
.name{font-family:Montserrat;font-weight:900;font-size:42px}.idea{font-size:23px;color:${C.muted};font-weight:600;margin-top:4px}
.hero{display:flex;justify-content:center;margin:6px 0 0}.row{display:flex;justify-content:space-between;margin-top:-8px}.v{text-align:center}
.vl{font-weight:800;font-size:20px;letter-spacing:3px;text-transform:uppercase;color:${C.muted};margin-top:-6px}
.small{display:flex;align-items:flex-end;gap:26px;margin-top:26px;padding:16px 24px;background:rgba(9,18,30,.5);border-radius:20px}.small span{font-weight:800;font-size:19px;letter-spacing:3px;text-transform:uppercase;color:${C.muted};align-self:center;margin-right:auto}
ul{margin:22px 0 0;padding-left:26px;font-size:24px;font-weight:600;line-height:1.5}li::marker{color:${C.yellow}}
</style></head><body><h1>MASCOT <span>OPTIONS</span></h1><div class="sub">First sketches, drawn in code so the character is identical in every video and thumbnail. Names are placeholders.</div>
<div class="cards">${options.map(card).join("")}</div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2400, height: 1290 }, deviceScaleFactor: 1 });
const tmp = path.join(here, "_sheet.html");
fs.writeFileSync(tmp, html);
await page.goto("file://" + tmp, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(here, "mascot-options.png") });
await browser.close();
fs.unlinkSync(tmp);
console.log("written mascot-options.png");
