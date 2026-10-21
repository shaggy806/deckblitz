import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Legends. EDHREC rank 27447.
//
// Rulings:
//   [2004-10-04] The color change does not wear off at end of turn.
//   [2004-10-04] You can choose any single color or combination of colors. The valid colors are
//     Black, Blue, Green, Red, and White.
//
// The colours are chosen as the ability resolves — an unannounced `modal`
// (Wash Out's "of your choice" shape), one mode for each of the 31 non-empty
// combinations of the five colours, single colours first. The creature's
// colours become exactly those, for good (layer 5 — `become-color`).
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
    effect: { kind: "become-color", target: "attached", colors: picked.map(([color]) => color), duration: "permanent" },
  }));

export default defineCard({
  name: "Dream Coat",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{0}: Enchanted creature becomes the color or colors of your choice. Activate only once each turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: "{0}: Enchanted creature becomes the color or colors of your choice. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
