import React from "react";
import { Composition } from "remotion";
import { Timings } from "./lib/timings";
import { CostcoDemo } from "./projects/costco-demo";
import { Storyboard } from "./storyboard/Storyboard";

// Videos built from a storyboard (script.json with a template on every scene) need nothing here.
// Only a video with hand-written scenes is registered below.
const CUSTOM: Record<string, React.FC<{ timings: Timings }>> = {
  "costco-demo": CostcoDemo,
};

const Video: React.FC<{ timings: Timings }> = ({ timings }) => {
  if (timings.scenes.some((s) => s.template)) return <Storyboard timings={timings} />;
  const Comp = CUSTOM[timings.project];
  if (!Comp) throw new Error(`"${timings.project}" has no templates in its script and no custom video registered.`);
  return <Comp timings={timings} />;
};

const placeholder: Timings = { project: "costco-demo", title: "", fps: 30, duration: 10, scenes: [], lines: [], cues: {} };

export const Root: React.FC = () => (
  <Composition
    id="video"
    component={Video}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={300}
    defaultProps={{ timings: placeholder }}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.ceil(props.timings.duration * props.timings.fps), fps: props.timings.fps,
      width: props.timings.width ?? 1920, height: props.timings.height ?? 1080,
    })}
  />
);
