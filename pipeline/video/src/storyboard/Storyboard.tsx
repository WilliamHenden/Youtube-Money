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

/** Every template a storyboard can name. To add one, write the component and list it here. */
export const TEMPLATES: Record<string, Template> = {
  title: TitleCard, chapter: ChapterCard, number: BigNumber, bars: Bars, chart: Chart, timeline: Timeline, map: MapScene,
  photo: Photo, split: Split, icons: Icons, question: Question, answer: Answer, quote: Quote, names: NameWall, flow: Flow,
  subscribe: Subscribe, end: EndCard,
};
const FULL_BLEED = new Set(["photo", "map"]); // these fill the frame, so the slow camera drift is left to them

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
  return (
    <TimingsProvider value={timings}>
      <AbsoluteFill style={{ background: C.navy }}>
        {fading && <SceneView key={prev!.id} sc={prev!} timings={timings} />}
        <SceneView key={cur.id} sc={cur} timings={timings} opacity={fading ? prog(t, cur.start, FADE) : 1} />
        {scenes.slice(1).map((s, k) => (s.enter ?? "wipe") === "wipe" && <Wipe key={s.id} at={s.start} colors={k % 2 === 0 ? [C.red, C.yellow] : [C.blue, C.yellow]} />)}
        {timings.channel && <ChannelBug tone={tone} name={timings.channel} light={cur.template === "photo"} />}
        <Captions />
        <Grain />
        <AbsoluteFill style={{ background: C.navy, opacity: fadeOut, zIndex: 60 }} />
        <Audio src={staticFile("audio.wav")} />
      </AbsoluteFill>
    </TimingsProvider>
  );
};
