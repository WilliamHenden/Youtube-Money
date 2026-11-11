import React from "react";
import { Composition } from "remotion";
import { Timings } from "./lib/timings";
import { H, W } from "./lib/theme";
import { CostcoDemo } from "./projects/costco-demo";

// Register each video project here. The render script passes that project's timings.json as props.
const PROJECTS: Record<string, React.FC<{ timings: Timings }>> = {
  "costco-demo": CostcoDemo,
};

const Video: React.FC<{ timings: Timings }> = ({ timings }) => {
  const Comp = PROJECTS[timings.project];
  if (!Comp) throw new Error(`No video registered for project "${timings.project}"`);
  return <Comp timings={timings} />;
};

const placeholder: Timings = { project: "costco-demo", title: "", fps: 30, duration: 10, scenes: [], lines: [], cues: {} };

export const Root: React.FC = () => (
  <Composition
    id="video"
    component={Video}
    width={W}
    height={H}
    fps={30}
    durationInFrames={300}
    defaultProps={{ timings: placeholder }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(props.timings.duration * props.timings.fps), fps: props.timings.fps })}
  />
);
