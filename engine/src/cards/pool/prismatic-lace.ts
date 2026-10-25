import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Mirage. EDHREC rank 22326.
//
// The colours are chosen as the spell resolves — an unannounced `modal` (Dream Coat's shape),
// one mode for each of the 31 non-empty combinations of the five colours, single colours
// first. The permanent's colours become exactly those, for good (layer 5 — `become-color`).
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = Array.from({ length: 31 }, (_, i) => i + 1)
  .map((mask) => COLORS.filter((_, bit) => (mask & (1 << bit)) !== 0))
  .sort((x, y) => x.length - y.length)
  .map((picked) => ({
    text: picked.map(([, word]) => word).join(", "),
    effect: { kind: "become-color", target: 0, colors: picked.map(([color]) => color), duration: "permanent" },
  }));

export default defineCard({
  name: "Prismatic Lace",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target permanent becomes the color or colors of your choice. (This effect lasts indefinitely.)",
  targets: ["permanent"],
  effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
});
