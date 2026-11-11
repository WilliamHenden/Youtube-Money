// Render a project to MP4, or grab still frames for review.
//   node scripts/render.mjs <project-id>                      full video -> out/<id>-raw.mp4
//   node scripts/render.mjs <project-id> --stills 1.5,4.6,12  PNG frames -> out/tmp/stills/
//   node scripts/render.mjs <project-id> --range 20-30        only seconds 20..30
// Options: --scale 0.5 (stills), --no-music, --out <file>
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const args = process.argv.slice(2);
const project = args[0];
const opt = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? undefined : args[i + 1] ?? true; };
if (!project) throw new Error("usage: node scripts/render.mjs <project-id> [--stills t1,t2] [--range a-b]");

const build = path.join(root, "projects", project, "build");
const timings = JSON.parse(fs.readFileSync(path.join(build, "timings.json"), "utf8"));

// Assemble the public folder the video reads its audio from.
const pub = path.join(build, "public");
fs.mkdirSync(path.join(pub, "sfx"), { recursive: true });
fs.copyFileSync(path.join(build, "narration.wav"), path.join(pub, "narration.wav"));
if (fs.existsSync(path.join(build, "music.wav"))) fs.copyFileSync(path.join(build, "music.wav"), path.join(pub, "music.wav"));
const sfxDir = path.join(root, "pipeline/audio/sfx");
for (const f of fs.readdirSync(sfxDir)) fs.copyFileSync(path.join(sfxDir, f), path.join(pub, "sfx", f));
fs.copyFileSync(path.join(root, "pipeline/video/assets/grain.png"), path.join(pub, "grain.png"));

// Use the Chromium already on this machine if Remotion's own download is unavailable.
const candidates = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"];
const browserExecutable = candidates.find((p) => p && fs.existsSync(p)) ?? null;

console.log("bundling…");
const serveUrl = await bundle({ entryPoint: path.join(here, "../src/index.ts"), publicDir: pub });
const inputProps = { timings };
const composition = await selectComposition({ serveUrl, id: "video", inputProps, browserExecutable });
const gl = opt("gl") === "default" ? undefined : opt("gl") ?? "angle";
const common = { serveUrl, composition, inputProps, browserExecutable, chromiumOptions: gl ? { gl } : {} };

if (opt("stills")) {
  const scale = Number(opt("scale") ?? 0.5);
  const dir = path.join(root, "out/tmp/stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const s of String(opt("stills")).split(",")) {
    const t = Number(s);
    const output = path.join(dir, `${project}-${t.toFixed(2).padStart(6, "0")}.png`);
    await renderStill({ ...common, frame: Math.min(Math.round(t * timings.fps), composition.durationInFrames - 1), output, scale });
    console.log("still", output);
  }
} else {
  const output = path.resolve(opt("out") ?? path.join(root, "out", `${project}-raw.mp4`));
  let frameRange = null;
  if (opt("range")) { const [a, b] = String(opt("range")).split("-").map(Number); frameRange = [Math.round(a * timings.fps), Math.min(Math.round(b * timings.fps), composition.durationInFrames - 1)]; }
  const t0 = Date.now();
  let last = 0;
  await renderMedia({
    ...common, codec: "h264", crf: 19, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "256k", outputLocation: output, frameRange,
    concurrency: Number(opt("concurrency") ?? 4), jpegQuality: 95, scale: Number(opt("scale") ?? 1),
    onProgress: ({ progress }) => { if (progress - last >= 0.1) { last = progress; console.log(`  ${(progress * 100).toFixed(0)}%  (${((Date.now() - t0) / 1000).toFixed(0)}s)`); } },
  });
  console.log(`rendered ${output} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
