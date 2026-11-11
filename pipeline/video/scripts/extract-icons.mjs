// Copies only the icons named in src/icons/list.json out of the big emoji set,
// so the video bundle stays small. Run after editing the list: node scripts/extract-icons.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const set = require("@iconify-json/fluent-emoji-flat/icons.json");
const list = JSON.parse(fs.readFileSync(new URL("../src/icons/list.json", import.meta.url)));
const out = {}, missing = [];
for (const n of list) set.icons[n] ? (out[n] = set.icons[n].body) : missing.push(n);
fs.writeFileSync(new URL("../src/icons/icons.generated.json", import.meta.url), JSON.stringify(out));
console.log(`icons: ${Object.keys(out).length} written`, missing.length ? `missing: ${missing.join(", ")}` : "");
