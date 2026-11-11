import { continueRender, delayRender } from "remotion";
import mont700 from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff2";
import mont800 from "@fontsource/montserrat/files/montserrat-latin-800-normal.woff2";
import mont900 from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff2";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff2";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff2";
import inter800 from "@fontsource/inter/files/inter-latin-800-normal.woff2";

const faces: [string, string, string][] = [
  ["Montserrat", "700", mont700],
  ["Montserrat", "800", mont800],
  ["Montserrat", "900", mont900],
  ["Inter", "500", inter500],
  ["Inter", "600", inter600],
  ["Inter", "700", inter700],
  ["Inter", "800", inter800],
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("fonts");
  Promise.all(
    faces.map(([family, weight, url]) => {
      const f = new FontFace(family, `url(${url}) format("woff2")`, { weight, style: "normal" });
      return f.load().then((loaded) => document.fonts.add(loaded));
    })
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error("font load failed", e);
      continueRender(handle);
    });
};
