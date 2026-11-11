import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { C, Tone } from "../lib/theme";
import { loadFonts } from "../lib/fonts";
import { prog, useT } from "../lib/anim";
import { Timings, TimingsProvider } from "../lib/timings";
import { Background, Captions, ChannelBug, Grain, Sfx, Wipe } from "./ui";

export type SceneDef = { tone: Tone; Comp: React.FC };

/**
 * The frame every video shares: narration + music, per-scene background and slow camera
 * drift, wipes between scenes, captions, channel bug, grain, and the final fade.
 * A video only has to supply its scene components.
 */
export const VideoShell: React.FC<{ timings: Timings; channel: string; scenes: Record<string, SceneDef>; music?: boolean }> = ({
  timings, channel, scenes, music = true,
}) => {
  loadFonts();
  const { t } = useT();
  const cur = timings.scenes.find((s) => t >= s.start && t < s.end) ?? timings.scenes[timings.scenes.length - 1];
  const def = cur ? scenes[cur.id] : undefined;
  const fadeOut = prog(t, timings.duration - 0.6, 0.55);
  return (
    <TimingsProvider value={timings}>
      <AbsoluteFill style={{ background: C.navy }}>
        {cur && def && (
          <AbsoluteFill key={cur.id}>
            <Background tone={def.tone} />
            <AbsoluteFill style={{ transform: `scale(${1 + 0.035 * ((t - cur.start) / (cur.end - cur.start))})`, transformOrigin: "50% 46%" }}>
              <def.Comp />
            </AbsoluteFill>
          </AbsoluteFill>
        )}
        {timings.scenes.slice(1).map((s, i) => (
          <React.Fragment key={s.id}>
            <Wipe at={s.start} colors={i % 2 === 0 ? [C.red, C.yellow] : [C.blue, C.yellow]} />
            <Sfx at={s.start - 0.3} name="whoosh" volume={0.5} />
          </React.Fragment>
        ))}
        {def && <ChannelBug tone={def.tone} name={channel} />}
        <Captions />
        <Grain />
        <AbsoluteFill style={{ background: C.navy, opacity: fadeOut, zIndex: 60 }} />
        <Audio src={staticFile("narration.wav")} />
        {music && <Audio src={staticFile("music.wav")} />}
      </AbsoluteFill>
    </TimingsProvider>
  );
};
