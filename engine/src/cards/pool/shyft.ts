import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Ice Age (ICE). EDHREC rank 30911.
//
// Rulings:
//   [2004-10-04] Shyft’s ability won’t let you make it colorless. Colorless is not a color.
//   [2004-10-04] The ability’s effect has no duration. Shyft will remain the chosen color or
//     colors until the game ends, it leaves the battlefield, or some other effect (such as the
//     next time its ability resolves) changes its colors.
//
// Dream Coat's shape: one mode for each of the 31 non-empty combinations of
// the five colours (never colourless — the first ruling), behind a `may`. The
// creature's colours become exactly those, with no duration (layer 5 —
// `become-color`, "permanent").
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
    effect: { kind: "become-color", target: "source", colors: picked.map(([color]) => color), duration: "permanent" },
  }));

export default defineCard({
  name: "Shyft",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 2,
  text: "At the beginning of your upkeep, you may have this creature become the color or colors of your choice. (This effect lasts indefinitely.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Shyft become the color or colors of your choice?",
        effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may have this creature become the color or colors of your choice.",
    },
  ],
});
