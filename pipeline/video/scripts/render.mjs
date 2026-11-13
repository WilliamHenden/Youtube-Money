// Render a project to MP4, or grab still frames for review.
//   node scripts/render.mjs <project> [--cut NAME]                 full video -> out/<project>[-<cut>]-raw.mp4
//   node scripts/render.mjs <project> --stills 1.5,4.6,12          PNG frames -> out/tmp/stills/
//   node scripts/render.mjs <project> --sheet 2                    one contact sheet, a frame every 2 seconds
//   node scripts/render.mjs <project> --range 20-30                only seconds 20..30
// Options: --scale 0.5 (stills), --out <file>, --gl angle|swangle (swangle is about ten times slower here)
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const args = process.argv.slice(2);
const project = args[0];
const opt = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? undefined : args[i + 1] ?? true; };
if (!project) throw new Error("usage: node scripts/render.mjs <project> [--cut name] [--stills t1,t2] [--sheet seconds] [--range a-b]");

const cut = opt("cut") ?? "full";
const pdir = path.join(root, "projects", project);
const storyboard = fs.existsSync(path.join(pdir, "build", cut, "timings.json"));
const build = storyboard ? path.join(pdir, "build", cut) : path.join(pdir, "build");
if (!storyboard && cut !== "full") throw new Error(`No build for the cut "${cut}". Run pipeline/build.sh ${project} --cut ${cut} first.`);
const timings = JSON.parse(fs.readFileSync(path.join(build, "timings.json"), "utf8"));
const name = cut === "full" ? project : `${project}-${cut}`;

// Assemble the public folder the video reads its sound and pictures from.
const pub = path.join(build, "public");
fs.mkdirSync(path.join(pub, "sfx"), { recursive: true });
fs.copyFileSync(path.join(root, "pipeline/video/assets/grain.png"), path.join(pub, "grain.png"));
if (storyboard) {
  fs.copyFileSync(path.join(build, "audio.wav"), path.join(pub, "audio.wav"));
  const photos = path.join(pdir, "photos");
  if (fs.existsSync(photos)) {
    fs.mkdirSync(path.join(pub, "photos"), { recursive: true });
    for (const f of fs.readdirSync(photos)) if (f.endsWith(".jpg")) fs.copyFileSync(path.join(photos, f), path.join(pub, "photos", f));
  }
  const clips = path.join(pdir, "clips");
  if (fs.existsSync(clips)) {
    fs.mkdirSync(path.join(pub, "clips"), { recursive: true });
    for (const f of fs.readdirSync(clips)) if (f.endsWith(".mp4")) fs.copyFileSync(path.join(clips, f), path.join(pub, "clips", f));
  }
} else {
  fs.copyFileSync(path.join(build, "narration.wav"), path.join(pub, "narration.wav"));
  if (fs.existsSync(path.join(build, "music.wav"))) fs.copyFileSync(path.join(build, "music.wav"), path.join(pub, "music.wav"));
  const sfxDir = path.join(root, "pipeline/audio/sfx");
  for (const f of fs.readdirSync(sfxDir)) fs.copyFileSync(path.join(sfxDir, f), path.join(pub, "sfx", f));
}

// Use the Chromium already on this machine if Remotion's own download is unavailable.
const candidates = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"];
const browserExecutable = candidates.find((p) => p && fs.existsSync(p)) ?? null;

console.log("bundling…");
const serveUrl = await bundle({ entryPoint: path.join(here, "../src/index.ts"), publicDir: pub });
const inputProps = { timings };
const composition = await selectComposition({ serveUrl, id: "video", inputProps, browserExecutable });
const gl = opt("gl") === "default" ? undefined : opt("gl") ?? "angle";
const common = { serveUrl, composition, inputProps, browserExecutable, chromiumOptions: gl ? { gl } : {} };
const frameAt = (t) => Math.max(0, Math.min(Math.round(t * timings.fps), composition.durationInFrames - 1));

if (opt("stills") || opt("sheet")) {
  const sheet = opt("sheet");
  const step = Number(sheet === true ? 2 : sheet);
  const times = sheet ? Array.from({ length: Math.ceil(timings.duration / step) }, (_, i) => Math.min(i * step + step * 0.5, timings.duration - 0.8)) : String(opt("stills")).split(",").map(Number);
  const scale = Number(opt("scale") ?? (sheet ? 0.25 : 0.5));
  const dir = path.join(root, "out/tmp/stills", sheet ? `${name}-sheet` : "");
  fs.rmSync(sheet ? dir : path.join(dir, "__none__"), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const t of times) {
    const output = path.join(dir, sheet ? `${String(n++).padStart(4, "0")}.png` : `${name}-${t.toFixed(2).padStart(6, "0")}.png`);
    await renderStill({ ...common, frame: frameAt(t), output, scale });
    if (!sheet) console.log("still", output);
  }
  if (sheet) {
    const cols = composition.height > composition.width ? 8 : 5;
    const out = path.join(root, "out/tmp", `${name}-sheet.jpg`);
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(dir, "%04d.png"), "-vf", `tile=${cols}x${Math.ceil(times.length / cols)}:padding=6:color=white`, "-frames:v", "1", "-q:v", "3", out]);
    console.log(`contact sheet (${times.length} frames, one every ${step}s): ${out}`);
  }
} else {
  const output = path.resolve(opt("out") ?? path.join(root, "out", `${name}-raw.mp4`));
  let frameRange = null;
  if (opt("range")) { const [a, b] = String(opt("range")).split("-").map(Number); frameRange = [frameAt(a), frameAt(b)]; }
  const t0 = Date.now();
  let last = 0;
  await renderMedia({
    ...common, codec: "h264", crf: 19, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "256k", outputLocation: output, frameRange,
    concurrency: Number(opt("concurrency") ?? 4), jpegQuality: 95, scale: Number(opt("scale") ?? 1),
    onProgress: ({ progress }) => { if (progress - last >= 0.1) { last = progress; console.log(`  ${(progress * 100).toFixed(0)}%  (${((Date.now() - t0) / 1000).toFixed(0)}s)`); } },
  });
  console.log(`rendered ${output} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
