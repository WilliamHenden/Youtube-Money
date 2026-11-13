import React from "react";
import { C } from "../lib/theme";

/* =====================================================================================
   DRAWN ICONS: flat, in the channel's colours. Use them in the icon row as "draw:rig", "draw:contract" …
   They replace emoji where an emoji looks out of place or doesn't exist (there is no oil-rig emoji).
   ===================================================================================== */
const P = { stroke: C.navy, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const DRAWN: Record<string, React.ReactNode> = {
  rig: (
    <>
      <path d="M4 40 q6 -4 12 0 t12 0 t12 0 t12 0" fill="none" stroke={C.blue} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M14 40 V30 M38 40 V30" {...P} />
      <rect x="10" y="24" width="32" height="6" rx="1.5" fill={C.yellow} {...P} />
      <path d="M22 24 L26 6 L30 24 M23.4 18 H28.6 M24.6 12 H27.4" fill="none" {...P} />
      <rect x="32" y="17" width="8" height="7" rx="1" fill={C.cream} {...P} />
      <path d="M12 24 V18 L7 13" fill="none" {...P} />
      <circle cx="26" cy="5" r="2.2" fill={C.red} />
    </>
  ),
  contract: (
    <>
      <path d="M13 6 H33 L41 14 V46 H13 Z" fill={C.cream} {...P} />
      <path d="M33 6 V14 H41" fill={C.cream3} {...P} />
      <path d="M19 20 H35 M19 26 H35 M19 32 H29" fill="none" {...P} stroke={C.mutedDark} />
      <path d="M21 41 q3 -5 5 0 t5 -1 l4 1" fill="none" {...P} stroke={C.blue} />
      <circle cx="37" cy="40" r="5" fill={C.red} {...P} />
    </>
  ),
  fine: (
    <>
      <ellipse cx="22" cy="38" rx="13" ry="5" fill={C.amber} {...P} />
      <path d="M9 38 V31 a13 5 0 0 0 26 0 V38" fill={C.yellow} {...P} />
      <ellipse cx="22" cy="31" rx="13" ry="5" fill={C.yellow} {...P} />
      <path d="M9 31 V24 a13 5 0 0 0 26 0 V31" fill={C.yellow} {...P} />
      <ellipse cx="22" cy="24" rx="13" ry="5" fill="#FBD98A" {...P} />
      <path d="M40 8 V26 M34 20 L40 27 L46 20" fill="none" {...P} stroke={C.red} strokeWidth={3.4} />
    </>
  ),
  barrel: (
    <>
      <rect x="13" y="8" width="26" height="36" rx="4" fill={C.blue} {...P} />
      <path d="M13 18 H39 M13 34 H39" {...P} />
      <path d="M26 21 c-3 4 -4.5 6 -4.5 8 a4.5 4.5 0 0 0 9 0 c0 -2 -1.5 -4 -4.5 -8 Z" fill={C.navy} />
    </>
  ),
  bank: (
    <>
      <path d="M6 20 L26 7 L46 20 Z" fill={C.cream} {...P} />
      <path d="M12 24 V38 M21 24 V38 M31 24 V38 M40 24 V38" {...P} strokeWidth={4} stroke={C.blue} />
      <rect x="7" y="39" width="38" height="5" rx="1.5" fill={C.yellow} {...P} />
    </>
  ),
  house: (
    <>
      <path d="M8 24 L26 8 L44 24" fill="none" {...P} stroke={C.red} strokeWidth={3.4} />
      <path d="M13 22 V44 H39 V22" fill={C.cream} {...P} />
      <rect x="22" y="31" width="8" height="13" fill={C.blue} {...P} />
    </>
  ),
  clock: (
    <>
      <circle cx="26" cy="27" r="18" fill={C.cream} {...P} />
      <path d="M26 15 V27 L34 32" fill="none" {...P} stroke={C.red} strokeWidth={3.2} />
    </>
  ),
};
export const DrawnIcon: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  const body = DRAWN[name];
  if (!body) throw new Error(`No drawn icon called "${name}". Drawn icons: ${Object.keys(DRAWN).join(", ")}`);
  return <svg viewBox="0 0 52 52" width={size} height={size} style={{ display: "block" }}>{body}</svg>;
};
