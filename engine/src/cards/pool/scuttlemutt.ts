import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Shadowmoor (SHM). EDHREC rank 8425.
//
// Rulings:
//   You must choose one or more of the five colors while resolving the last ability (never
//   colorless). The target has only the colors Scuttlemutt gives it.
//
// Swirling Spriggan's shape: one mode per non-empty combination of the five colours (31),
// chosen as the ability resolves, until end of turn.
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

export default defineCard({
  name: "Scuttlemutt",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: "{T}: Add one mana of any color.\n{T}: Target creature becomes the color or colors of your choice until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: "{T}: Target creature becomes the color or colors of your choice until end of turn.",
    },
  ],
});
