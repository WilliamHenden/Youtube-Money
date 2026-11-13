import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { C, Tone } from "../lib/theme";
import { loadFonts } from "../lib/fonts";
import { prog, useT } from "../lib/anim";
import { SceneT, Timings, TimingsProvider } from "../lib/timings";
import { Background, Captions, ChannelBug, Grain, Wipe } from "../components/ui";
import { SceneCtx, Template, useL } from "./kit";
import { Answer, Bars, BigNumber, ChapterCard, Chart, Icons, Question, Split, Timeline, TitleCard } from "./templates-a";
import { EndCard, Flow, MapScene, NameWall, Photo, Quote, Subscribe } from "./templates-b";
import { Ident, Mark, Tank, Thumb } from "./templates-c";
import { F } from "../lib/theme";
import { ease, lerp } from "../lib/anim";

/** Every template a storyboard can name. To add one, write the component and list it here. */
export const TEMPLATES: Record<string, Template> = {
  title: TitleCard, chapter: ChapterCard, number: BigNumber, bars: Bars, chart: Chart, timeline: Timeline, map: MapScene,
  photo: Photo, split: Split, icons: Icons, question: Question, answer: Answer, quote: Quote, names: NameWall, flow: Flow,
  subscribe: Subscribe, end: EndCard, clip: Photo, ident: Ident, thumb: Thumb, tank: Tank,
};
const FULL_BLEED = new Set(["photo", "clip", "map", "thumb"]);
const NO_BUG = new Set(["ident", "thumb"]); // these fill the frame, so the slow camera drift is left to them

const SceneView: React.FC<{ sc: SceneT; timings: Timings; opacity?: number }> = ({ sc, timings, opacity = 1 }) => {
  const { t } = useT();
  const l = useL();
  const Comp = TEMPLATES[sc.template ?? ""];
  if (!Comp) throw new Error(`Scene "${sc.id}" uses the template "${sc.template}", which doesn't exist. Templates: ${Object.keys(TEMPLATES).join(", ")}`);
  const tone: Tone = sc.tone ?? "navy";
  const props = { ...(sc.props ?? {}), ...(l.tall ? sc.props?.tall ?? {} : {}) };
  const ctx: SceneCtx = { id: sc.id, t0: sc.start, t1: sc.end, tone, props, cues: timings.cues, photos: timings.photos ?? {} };
  const drift = FULL_BLEED.has(sc.template!) ? 1 : 1 + 0.035 * ((t - sc.start) / (sc.end - sc.start));
  return (
    <AbsoluteFill style={{ opacity }}>
      <Background tone={tone} />
      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: "50% 46%" }}>
        <Comp s={ctx} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Plays a whole video from timings.json alone: the scenes, their templates, captions and the mixed soundtrack. */
export const Storyboard: React.FC<{ timings: Timings }> = ({ timings }) => {
  loadFonts();
  const { t } = useT();
  const scenes = timings.scenes;
  const i = Math.max(0, scenes.findIndex((s) => t >= s.start && t < s.end));
  const cur = scenes[i] ?? scenes[scenes.length - 1];
  const prev = i > 0 ? scenes[i - 1] : undefined;
  const FADE = 0.55;
  const fading = cur.enter === "fade" && prev && t < cur.start + FADE;
  const fadeOut = prog(t, timings.duration - 0.7, 0.6);
  const tone: Tone = cur.tone ?? "navy";
  const l = useL();
  // "bugIn": the channel mark starts large in the middle and travels to its corner as the scene opens
  const fly = cur.bugIn ? prog(t, cur.start + 0.55, 0.6, ease.inOut) : 1;
  const flying = !!cur.bugIn && fly < 1;
  return (
    <TimingsProvider value={timings}>
      <AbsoluteFill style={{ background: C.navy }}>
        {fading && <SceneView key={prev!.id} sc={prev!} timings={timings} />}
        <SceneView key={cur.id} sc={cur} timings={timings} opacity={fading ? prog(t, cur.start, FADE) : 1} />
        {scenes.slice(1).map((s, k) => (s.enter ?? "wipe") === "wipe" && <Wipe key={s.id} at={s.start} colors={k % 2 === 0 ? [C.red, C.yellow] : [C.blue, C.yellow]} />)}
        {timings.channel && !NO_BUG.has(cur.template ?? "") && !flying && <ChannelBug tone={tone} name={timings.channel} light={cur.template === "photo" || cur.template === "clip"} />}
        {flying && (
          <div style={{ position: "absolute", left: lerp(l.cx, l.tall ? l.cx - 150 : 80, fly), top: lerp(l.cy, l.tall ? 170 : 68, fly), transform: "translate(-50%,-50%)", zIndex: 30, opacity: prog(t, cur.start, 0.2) }}>
            <Mark size={lerp(l.tall ? 300 : 340, 40, fly)} />
          </div>
        )}
        {cur.tag && (
          <div style={{ position: "absolute", right: l.tall ? undefined : 56, left: l.tall ? 0 : undefined, width: l.tall ? l.W : undefined, textAlign: "center", top: l.tall ? 210 : 40, zIndex: 45 }}>
            <span style={{ fontFamily: F.body, fontWeight: 800, fontSize: 30, color: C.navy, background: C.cream, border: `3px solid ${C.navy}`, borderRadius: 14, padding: "8px 20px" }}>{cur.tag}</span>
          </div>
        )}
        <Captions />
        <Grain />
        <AbsoluteFill style={{ background: C.navy, opacity: fadeOut, zIndex: 60 }} />
        <Audio src={staticFile("audio.wav")} />
      </AbsoluteFill>
    </TimingsProvider>
  );
};
