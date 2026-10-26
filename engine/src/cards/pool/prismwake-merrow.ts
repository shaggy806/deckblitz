import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Shadowmoor (SHM). EDHREC rank 30527.
//
// Prismatic Lace's choice until end of turn: the colours are chosen as the
// trigger resolves — an unannounced `modal`, one mode for each of the 31
// non-empty combinations of the five colours (never colorless — the rulings).
// The permanent's colours become exactly those (layer 5 — `become-color`).
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
    effect: { kind: "become-color", target: 0, colors: picked.map(([color]) => color), duration: "end-of-turn" },
  }));

const TEXT = "When this creature enters, target permanent becomes the color or colors of your choice until end of turn.";

export default defineCard({
  name: "Prismwake Merrow",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
